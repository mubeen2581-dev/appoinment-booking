import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

import { generateTimeSlots, DEFAULT_BUSINESS_HOURS } from "../constants/schedule.js"
import { fetchBookedSlots } from "../services/api.js"
import { BookingCalendar } from "./BookingCalendar.jsx"
import { TimeSlotPicker } from "./TimeSlotPicker.jsx"

const formatDate = (date) => format(date, "yyyy-MM-dd")

export const RescheduleDialog = ({ appointment, onSubmit, onClose, submitting }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(`${appointment.date}T00:00:00`))
  const [bookings, setBookings] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(appointment.timeSlot)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState(null)

  const locationId = appointment.location?._id ?? appointment.location
  const durationMinutes = appointment.serviceSnapshot?.durationMinutes ?? 60
  const slotInterval = appointment.location?.slotIntervalMinutes ?? 60

  const timeSlots = useMemo(
    () =>
      generateTimeSlots({
        ...DEFAULT_BUSINESS_HOURS,
        intervalMinutes: slotInterval,
      }),
    [slotInterval]
  )

  const handleDateChange = (value) => {
    const nextDate = Array.isArray(value) ? value[0] : value
    setSelectedDate(nextDate)
    setSelectedSlot(null)
    setError(null)
  }

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
    setError(null)
  }

  useEffect(() => {
    const loadSlots = async () => {
      setLoadingSlots(true)
      setError(null)
      try {
        const isoDate = formatDate(selectedDate)
        const data = await fetchBookedSlots({ date: isoDate, locationId })
        const busySlots = (data.slots ?? []).filter(
          (slot) => !(isoDate === appointment.date && slot.timeSlot === appointment.timeSlot)
        )
        setBookings(busySlots)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingSlots(false)
      }
    }

    loadSlots()
  }, [selectedDate, appointment.date, appointment.timeSlot, locationId])

  const handleConfirm = () => {
    if (!selectedSlot) {
      setError("Select a time slot before saving")
      return
    }

    onSubmit({
      date: formatDate(selectedDate),
      timeSlot: selectedSlot,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-slate-50 p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Reschedule appointment</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pick a new date and time for {appointment.customer.name}.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-transparent p-2 text-slate-400 transition hover:text-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <BookingCalendar selectedDate={selectedDate} onChange={handleDateChange} />
          <div>
            {loadingSlots ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                Loading slots...
              </div>
            ) : (
              <TimeSlotPicker
                timeSlots={timeSlots}
                selectedSlot={selectedSlot}
                onSelect={handleSlotSelect}
                bookings={bookings}
                serviceDuration={durationMinutes}
              />
            )}
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-400"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
