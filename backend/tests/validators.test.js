import assert from "node:assert/strict"
import test from "node:test"

import {
  createAppointmentSchema,
  normalizeCustomerPayload,
  serviceCreateSchema,
} from "../src/utils/validators.js"

test("createAppointmentSchema parses valid payload", () => {
  const payload = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+15551234567",
    date: "2025-12-01",
    timeSlot: "10:00",
    serviceId: "507f1f77bcf86cd799439011",
    locationId: "507f1f77bcf86cd799439012",
    notes: "Prefers stylist A",
  }

  const result = createAppointmentSchema.parse(payload)
  assert.equal(result.date, "2025-12-01")
  assert.equal(result.timeSlot, "10:00")
})

test("createAppointmentSchema rejects missing customer details", () => {
  const payload = {
    date: "2025-12-01",
    timeSlot: "11:00",
    serviceId: "507f1f77bcf86cd799439011",
    locationId: "507f1f77bcf86cd799439012",
  }

  assert.throws(() => createAppointmentSchema.parse(payload), {
    message: /Customer details/,
  })
})

test("normalizeCustomerPayload merges inline fields", () => {
  const payload = {
    name: "Sam",
    email: "sam@example.com",
    phone: "+15550000000",
  }

  const customer = normalizeCustomerPayload(payload)
  assert.deepEqual(customer, {
    name: "Sam",
    email: "sam@example.com",
    phone: "+15550000000",
  })
})

test("serviceCreateSchema validates required fields", () => {
  const payload = {
    name: "Deep Tissue Massage",
    durationMinutes: 90,
    price: 120,
  }

  const result = serviceCreateSchema.parse(payload)
  assert.equal(result.name, "Deep Tissue Massage")
})
