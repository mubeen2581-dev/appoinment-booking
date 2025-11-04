import twilio from "twilio"

import { sendBookingConfirmation } from "./email.js"

let twilioClient

const resolveTwilioClient = () => {
  if (twilioClient) return twilioClient
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    return null
  }
  twilioClient = twilio(accountSid, authToken)
  return twilioClient
}

export const sendAppointmentNotifications = async ({ appointment, smsMessage }) => {
  await sendBookingConfirmation(appointment)

  const client = resolveTwilioClient()
  if (!client || !process.env.TWILIO_FROM_NUMBER) {
    return
  }

  try {
    await client.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_FROM_NUMBER,
      to: appointment.customer.phone,
    })
  } catch (error) {
    console.warn("Failed to send SMS", error)
  }
}
