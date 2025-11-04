import { z } from "zod"
import dayjs from "dayjs"

const dateMessage = "Date must be in YYYY-MM-DD format"
const timeMessage = "Time must be in HH:mm (24-hour) format"

const objectIdSchema = z.string({ required_error: "This field is required" }).regex(/^[0-9a-fA-F]{24}$/, "Invalid identifier")

const dateSchema = z
  .string({ required_error: "Please select a date" })
  .refine((value) => dayjs(value, "YYYY-MM-DD", true).isValid(), dateMessage)

const timeSchema = z
  .string({ required_error: "Please select a time slot" })
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, timeMessage)

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required").max(32),
})

const optionalCustomerSchema = customerSchema.partial()

const baseAppointmentSchema = {
  notes: z.string().max(1000).optional(),
  paymentIntentId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  applyLoyaltyPoints: z.number().int().min(0).optional(),
}

export const createAppointmentSchema = z
  .object({
    ...baseAppointmentSchema,
    customer: customerSchema.optional(),
    name: z.string().min(1, "Name is required").max(120).optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(6, "Phone number is required").max(32).optional(),
    date: dateSchema,
    timeSlot: timeSchema,
    serviceId: objectIdSchema,
    locationId: objectIdSchema,
    joinWaitlistIfFull: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasCustomerObject = !!data.customer
    const hasInlineCustomer = Boolean(data.name && data.email && data.phone)

    if (!hasCustomerObject && !hasInlineCustomer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer details (name, email, phone) are required",
        path: ["customer"],
      })
    }
  })

export const updateAppointmentSchema = z
  .object({
    ...baseAppointmentSchema,
    customer: optionalCustomerSchema,
    name: z.string().min(1).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(32).optional(),
    date: dateSchema.optional(),
    timeSlot: timeSchema.optional(),
    status: z.enum(["scheduled", "cancelled", "completed"]).optional(),
    serviceId: objectIdSchema.optional(),
    locationId: objectIdSchema.optional(),
    durationMinutes: z.number().int().min(15).max(480).optional(),
  })
  .refine(
    (value) =>
      value.customer ||
      value.name ||
      value.email ||
      value.phone ||
      value.date ||
      value.timeSlot ||
      value.notes ||
      value.status ||
      value.serviceId ||
      value.locationId ||
      value.durationMinutes,
    { message: "At least one field must be provided for an update" }
  )

export const serviceCreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(15).max(480),
  price: z.number().min(0),
  category: z.string().max(120).optional(),
  isActive: z.boolean().optional(),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

export const locationCreateSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().max(200).optional(),
  phone: z.string().max(32).optional(),
  slotIntervalMinutes: z.number().int().min(15).max(240).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const locationUpdateSchema = locationCreateSchema.partial()

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comments: z.string().max(1000).optional(),
})

export const normalizeCustomerPayload = (payload) => {
  if (payload.customer) {
    return payload.customer
  }

  const normalized = {}

  if (payload.name !== undefined) {
    normalized.name = payload.name
  }
  if (payload.email !== undefined) {
    normalized.email = payload.email
  }
  if (payload.phone !== undefined) {
    normalized.phone = payload.phone
  }

  return normalized
}
