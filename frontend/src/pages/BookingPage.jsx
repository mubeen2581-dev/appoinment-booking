import { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import { BookingCalendar } from "../components/BookingCalendar.jsx"
import { TimeSlotPicker } from "../components/TimeSlotPicker.jsx"
import { AppointmentForm } from "../components/AppointmentForm.jsx"
import { ConfirmationCard } from "../components/ConfirmationCard.jsx"
import { ServiceSelector } from "../components/ServiceSelector.jsx"
import { LocationSelector } from "../components/LocationSelector.jsx"
import { PaymentSection, NoPaymentCard } from "../components/PaymentSection.jsx"
import { generateTimeSlots, DEFAULT_BUSINESS_HOURS } from "../constants/schedule.js"
import {
  createAppointment,
  fetchBookedSlots,
  fetchLocations,
  fetchServices,
  createPaymentIntent,
} from "../services/api.js"
import { connectSocket } from "../services/socket.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { useAuthStore } from "../store/auth.js"
import { toMinutes, overlaps } from "../utils/time.js"

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const toISODate = (date) => format(date, "yyyy-MM-dd")

export const BookingPage = () => {
  const [services, setServices] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return start
  })
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const paymentRef = useRef(null)
  const { showNotification } = useNotification()
  const loyaltyPoints = useAuthStore((state) => state.user?.loyaltyPoints ?? 0)

  const formattedDate = useMemo(() => toISODate(selectedDate), [selectedDate])

  const timeSlots = useMemo(() => {
    const interval = selectedLocation?.slotIntervalMinutes ?? 60
    return generateTimeSlots({
      ...DEFAULT_BUSINESS_HOURS,
      intervalMinutes: interval,
    })
  }, [selectedLocation])

  useEffect(() => {
    const loadCatalog = async () => {
      setLoadingCatalog(true)
      try {
        const [serviceData, locationData] = await Promise.all([fetchServices(), fetchLocations()])
        setServices(serviceData.services ?? [])
        setLocations(locationData.locations ?? [])
        setSelectedService((prev) => prev ?? serviceData.services?.[0] ?? null)
        setSelectedLocation((prev) => prev ?? locationData.locations?.[0] ?? null)
      } catch (err) {
        showNotification({ type: "error", message: err.message })
      } finally {
        setLoadingCatalog(false)
      }
    }

    loadCatalog()
  }, [showNotification])

  useEffect(() => {
    if (!selectedLocation) return

    const loadSlots = async () => {
      setLoadingSlots(true)
      setError(null)
      try {
        const data = await fetchBookedSlots({ date: formattedDate, locationId: selectedLocation._id })
        setBookings(data.slots ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingSlots(false)
      }
    }

    loadSlots()
  }, [formattedDate, selectedLocation])

  useEffect(() => {
    const socket = connectSocket()

    const refresh = async () => {
      if (!selectedLocation) return
      try {
        const data = await fetchBookedSlots({ date: formattedDate, locationId: selectedLocation._id })
        setBookings(data.slots ?? [])
      } catch (err) {
        console.warn("Failed to refresh slots", err)
      }
    }

    socket.on("appointments:created", refresh)
    socket.on("appointments:updated", refresh)
    socket.on("appointments:deleted", refresh)

    return () => {
      socket.off("appointments:created", refresh)
      socket.off("appointments:updated", refresh)
      socket.off("appointments:deleted", refresh)
    }
  }, [formattedDate, selectedLocation])

  const stripeEnabled = Boolean(stripePromise)
  const requiresOnlinePayment = stripeEnabled && (selectedService?.price ?? 0) > 0

  useEffect(() => {
    if (!requiresOnlinePayment || !selectedService) {
      setClientSecret(null)
      setPaymentError(null)
      return
    }

    const createIntent = async () => {
      setPaymentLoading(true)
      setPaymentError(null)
      try {
        const { clientSecret: secret } = await createPaymentIntent({ serviceId: selectedService._id })
        setClientSecret(secret)
      } catch (err) {
        setPaymentError(err.message)
      } finally {
        setPaymentLoading(false)
      }
    }

    createIntent()
  }, [requiresOnlinePayment, selectedService])

  const handleDateChange = (value) => {
    const nextDate = Array.isArray(value) ? value[0] : value
    setSelectedDate(nextDate)
    setSelectedSlot(null)
    setError(null)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setSelectedSlot(null)
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setSelectedSlot(null)
  }

  const handleFormSubmit = async (formData) => {
    if (!selectedService || !selectedLocation) {
      showNotification({ type: "error", message: "Select a service and location" })
      return
    }
    if (!selectedSlot) {
      showNotification({ type: "error", message: "Please select a time slot" })
      return
    }

    const startMinutes = toMinutes(selectedSlot)
    const conflicts = bookings.some((booking) => overlaps(startMinutes, selectedService.durationMinutes, booking))
    if (conflicts) {
      showNotification({ type: "error", message: "That slot has just been booked. Pick another." })
      return
    }

    try {
      setSubmitting(true)
      let paymentIntentId = null

      if (requiresOnlinePayment) {
        if (paymentLoading || !clientSecret) {
          showNotification({ type: "error", message: "Payment is still initializing" })
          return
        }
        const paymentResult = await paymentRef.current?.confirm()
        paymentIntentId = paymentResult?.paymentIntentId ?? null
      }

      const payload = {
        date: formattedDate,
        timeSlot: selectedSlot,
        serviceId: selectedService._id,
        locationId: selectedLocation._id,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        notes: formData.notes || undefined,
        applyLoyaltyPoints: formData.applyLoyaltyPoints,
        joinWaitlistIfFull: formData.joinWaitlistIfFull,
      }

      if (paymentIntentId) {
        payload.paymentIntentId = paymentIntentId
      }

      const response = await createAppointment(payload)
      if (response?.message) {
        showNotification({ type: "info", message: response.message })
        return
      }

      setConfirmation(response.appointment)
      showNotification({ type: "success", message: "Appointment booked successfully" })
    } catch (err) {
      setError(err.message)
      showNotification({ type: "error", message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const resetBooking = () => {
    setConfirmation(null)
    setSelectedSlot(null)
  }

  if (confirmation) {
    return <ConfirmationCard appointment={confirmation} onBookAnother={resetBooking} />
  }

  if (loadingCatalog) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        Loading services and locations...
      </div>
    )
  }

  const form = (
    <AppointmentForm onSubmit={handleFormSubmit} submitting={submitting} loyaltyPoints={loyaltyPoints} />
  )

  const paymentCard = requiresOnlinePayment ? (
    <>
      {paymentError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-100">
          {paymentError}
        </div>
      ) : null}
      <Elements key={(clientSecret ?? selectedService?._id ?? "noop")}
        stripe={stripePromise}
        options={{
          clientSecret: clientSecret ?? undefined,
          appearance: {
            theme: "light",
          },
        }}
      >
        <PaymentSection ref={paymentRef} clientSecret={clientSecret} />
      </Elements>
    </>
  ) : (
    <NoPaymentCard hasPrice={(selectedService?.price ?? 0) > 0} />
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Book an appointment</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Select a service, pick a location, and grab the time that works best for you.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1fr)]">
        <div className="space-y-6">
          <ServiceSelector
            services={services}
            selectedServiceId={selectedService?._id ?? null}
            onSelect={handleServiceSelect}
          />
          <LocationSelector
            locations={locations}
            selectedLocationId={selectedLocation?._id ?? null}
            onSelect={handleLocationSelect}
          />
          <BookingCalendar selectedDate={selectedDate} onChange={handleDateChange} />
          {loadingSlots ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              Loading available time slots...
            </div>
          ) : (
            <TimeSlotPicker
              timeSlots={timeSlots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              bookings={bookings}
              serviceDuration={selectedService?.durationMinutes ?? 60}
            />
          )}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        </div>
        <div className="space-y-6">
          {stripeEnabled ? paymentCard : <NoPaymentCard hasPrice={(selectedService?.price ?? 0) > 0} />}
          {form}
        </div>
      </div>
    </div>
  )
}



