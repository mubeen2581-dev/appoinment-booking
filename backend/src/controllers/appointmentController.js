import dayjs from "dayjs"

import { Appointment } from "../models/Appointment.js"
import { Service } from "../models/Service.js"
import { Location } from "../models/Location.js"
import { Waitlist } from "../models/Waitlist.js"
import { normalizeCustomerPayload } from "../utils/validators.js"
import { sendAppointmentNotifications } from "../utils/notifications.js"
import { upsertCalendarEvent, deleteCalendarEvent } from "../utils/googleCalendar.js"
import {
  emitAppointmentCreated,
  emitAppointmentUpdated,
  emitAppointmentDeleted,
  emitWaitlistUpdated,
} from "../sockets/index.js"
import { parseTimeSlot, overlaps } from "../utils/time.js"

const toResponse = (appointment) => ({
  id: appointment.id,
  customer: appointment.customer,
  user: appointment.user,
  service: appointment.service,
  serviceSnapshot: appointment.serviceSnapshot,
  location: appointment.location,
  notes: appointment.notes,
  date: appointment.date,
  timeSlot: appointment.timeSlot,
  durationMinutes: appointment.durationMinutes,
  status: appointment.status,
  payment: appointment.payment,
  loyaltyPointsAwarded: appointment.loyaltyPointsAwarded,
  googleEventId: appointment.googleEventId,
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt,
})

const populateAppointment = () => [
  { path: "service", select: "name durationMinutes price" },
  { path: "location", select: "name slotIntervalMinutes" },
  { path: "user", select: "name email role" },
]

const ensureLocation = async (locationId) => {
  const location = await Location.findById(locationId)
  if (!location || !location.isActive) {
    const error = new Error("Selected location is not available")
    error.statusCode = 400
    throw error
  }
  return location
}

const ensureService = async (serviceId) => {
  const service = await Service.findById(serviceId)
  if (!service || !service.isActive) {
    const error = new Error("Selected service is not available")
    error.statusCode = 400
    throw error
  }
  return service
}

const findConflicts = async ({ date, locationId, startMinutes, durationMinutes, excludeId }) => {
  const endMinutes = startMinutes + durationMinutes

  const appointments = await Appointment.find({
    date,
    location: locationId,
    status: { $ne: "cancelled" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })

  return appointments.filter((appointment) => overlaps(appointment, startMinutes, endMinutes))
}

const applyLoyalty = async ({ user, appointment, applyPoints }) => {
  if (!user) return

  if (applyPoints && applyPoints > 0) {
    const pointsToUse = Math.min(applyPoints, user.loyaltyPoints)
    if (pointsToUse > 0) {
      user.loyaltyPoints -= pointsToUse
      appointment.payment.amount = Math.max(appointment.payment.amount - pointsToUse, 0)
    }
  }

  const earned = Math.floor((appointment.serviceSnapshot.price ?? 0) / 10)
  if (earned > 0) {
    user.loyaltyPoints += earned
    appointment.loyaltyPointsAwarded = earned
  }

  await user.save()
}

const notifyWaitlist = async ({ serviceId, locationId, date }) => {
  const next = await Waitlist.findOne({
    service: serviceId,
    location: locationId,
    date,
    notified: false,
  }).sort({ createdAt: 1 })

  if (!next) return

  next.notified = true
  await next.save()

  emitWaitlistUpdated({ service: serviceId, location: locationId, date })
}

export const createAppointment = async (req, res) => {
  const payload = req.validatedBody
  const customer = normalizeCustomerPayload(payload)

  const service = await ensureService(payload.serviceId)
  const location = await ensureLocation(payload.locationId)

  const startsInPast = dayjs(`${payload.date} ${payload.timeSlot}`).isBefore(dayjs())
  if (startsInPast) {
    const error = new Error("Cannot book an appointment in the past")
    error.statusCode = 400
    throw error
  }

  const startMinutes = parseTimeSlot(payload.timeSlot)
  const durationMinutes = service.durationMinutes

  const conflicts = await findConflicts({
    date: payload.date,
    locationId: location.id,
    startMinutes,
    durationMinutes,
  })

  if (conflicts.length > 0) {
    if (payload.joinWaitlistIfFull) {
      await Waitlist.create({
        customer,
        service: service.id,
        location: location.id,
        date: payload.date,
        preferredTimeSlot: payload.timeSlot,
      })
      emitWaitlistUpdated({ service: service.id, location: location.id, date: payload.date })
      return res.status(202).json({ message: "Slot unavailable. Added to waitlist." })
    }

    const error = new Error("Selected time slot is no longer available")
    error.statusCode = 409
    throw error
  }

  const appointment = await Appointment.create({
    customer,
    user: req.user?._id,
    service: service.id,
    serviceSnapshot: {
      name: service.name,
      durationMinutes,
      price: service.price,
    },
    location: location.id,
    notes: payload.notes,
    date: payload.date,
    timeSlot: payload.timeSlot,
    durationMinutes,
    payment: {
      status: payload.paymentIntentId ? "pending" : "not_required",
      intentId: payload.paymentIntentId,
      amount: service.price,
      currency: process.env.PAYMENT_CURRENCY ?? "usd",
    },
  })

  if (req.user) {
    await applyLoyalty({ user: req.user, appointment, applyPoints: payload.applyLoyaltyPoints })
    await appointment.save()
  }

  if (process.env.GOOGLE_CLIENT_ID) {
    try {
      const eventId = await upsertCalendarEvent({ appointment })
      appointment.googleEventId = eventId
      await appointment.save()
    } catch (error) {
      console.warn("Failed to sync calendar", error)
    }
  }

  await appointment.populate(populateAppointment())

  try {
    const smsMessage = `Appointment confirmed on ${appointment.date} at ${appointment.timeSlot} for ${service.name}.`
    await sendAppointmentNotifications({ appointment, smsMessage })
  } catch (error) {
    console.warn("Failed to send notifications", error)
  }

  emitAppointmentCreated(toResponse(appointment))

  res.status(201).json({ appointment: toResponse(appointment) })
}

export const getAppointments = async (req, res) => {
  const query = {}
  if (req.user?.role !== "admin") {
    query.user = req.user?.id
  }

  const appointments = await Appointment.find(query)
    .populate(populateAppointment())
    .sort({ date: 1, timeSlot: 1 })

  res.json({
    appointments: appointments.map(toResponse),
  })
}

export const getBookedSlots = async (req, res) => {
  const { date, locationId } = req.query

  if (!date) {
    const error = new Error('Query parameter "date" is required')
    error.statusCode = 400
    throw error
  }

  if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
    const error = new Error('Date must be in YYYY-MM-DD format')
    error.statusCode = 400
    throw error
  }

  const filter = {
    date,
    status: { $ne: "cancelled" },
  }

  if (locationId) {
    filter.location = locationId
  }

  const appointments = await Appointment.find(filter).populate("service")

  const slots = appointments.map((appointment) => ({
    id: appointment.id,
    timeSlot: appointment.timeSlot,
    durationMinutes: appointment.durationMinutes,
    serviceId: appointment.service?.id,
  }))

  res.json({ slots })
}

export const updateAppointment = async (req, res) => {
  const { id } = req.params
  const payload = req.validatedBody

  const appointment = await Appointment.findById(id)
  if (!appointment) {
    const error = new Error("Appointment not found")
    error.statusCode = 404
    throw error
  }

  if (req.user?.role !== "admin" && appointment.user?.toString() !== req.user?.id) {
    return res.status(403).json({ error: "Insufficient permissions" })
  }

  if (payload.customer || payload.name || payload.email || payload.phone) {
    const existingCustomer =
      typeof appointment.customer?.toObject === "function"
        ? appointment.customer.toObject()
        : { ...appointment.customer }

    appointment.customer = {
      ...existingCustomer,
      ...normalizeCustomerPayload(payload),
    }
  }

  if (payload.serviceId) {
    const service = await ensureService(payload.serviceId)
    appointment.service = service.id
    appointment.serviceSnapshot = {
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
    }
    appointment.durationMinutes = service.durationMinutes
  }

  if (payload.locationId) {
    const location = await ensureLocation(payload.locationId)
    appointment.location = location.id
  }

  if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
    appointment.notes = payload.notes
  }
  if (Object.prototype.hasOwnProperty.call(payload, "date")) {
    appointment.date = payload.date
  }
  if (Object.prototype.hasOwnProperty.call(payload, "timeSlot")) {
    appointment.timeSlot = payload.timeSlot
  }
  if (Object.prototype.hasOwnProperty.call(payload, "durationMinutes")) {
    appointment.durationMinutes = payload.durationMinutes
  }
  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    appointment.status = payload.status
  }

  const startMinutes = parseTimeSlot(appointment.timeSlot)
  const conflicts = await findConflicts({
    date: appointment.date,
    locationId: appointment.location,
    startMinutes,
    durationMinutes: appointment.durationMinutes,
    excludeId: appointment.id,
  })

  if (conflicts.length > 0) {
    const error = new Error("Selected time slot is no longer available")
    error.statusCode = 409
    throw error
  }

  await appointment.save()
  await appointment.populate(populateAppointment())

  if (process.env.GOOGLE_CLIENT_ID) {
    try {
      const eventId = await upsertCalendarEvent({ appointment })
      appointment.googleEventId = eventId
      await appointment.save()
    } catch (error) {
      console.warn("Failed to sync calendar", error)
    }
  }

  emitAppointmentUpdated(toResponse(appointment))

  res.json({ appointment: toResponse(appointment) })
}

export const deleteAppointment = async (req, res) => {
  const { id } = req.params

  const appointment = await Appointment.findById(id)
  if (!appointment) {
    const error = new Error("Appointment not found")
    error.statusCode = 404
    throw error
  }

  if (process.env.GOOGLE_CLIENT_ID) {
    try {
      await deleteCalendarEvent(appointment.googleEventId, appointment.user?.calendarId)
    } catch (error) {
      console.warn("Failed to delete calendar event", error)
    }
  }

  await appointment.deleteOne()

  await notifyWaitlist({
    serviceId: appointment.service,
    locationId: appointment.location,
    date: appointment.date,
  })

  emitAppointmentDeleted(id)

  res.status(204).send()
}
