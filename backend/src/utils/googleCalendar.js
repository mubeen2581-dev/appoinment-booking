import dayjs from "dayjs"
import { google } from "googleapis"

let oauthClient

const getOAuthClient = () => {
  if (oauthClient) return oauthClient

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    return null
  }

  oauthClient = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  oauthClient.setCredentials({ refresh_token: refreshToken })
  return oauthClient
}

export const upsertCalendarEvent = async ({ appointment }) => {
  const client = getOAuthClient()
  if (!client) return null

  const calendar = google.calendar({ version: "v3", auth: client })
  const calendarId = appointment.user?.calendarId || process.env.GOOGLE_CALENDAR_ID || "primary"

  const start = dayjs(`${appointment.date} ${appointment.timeSlot}`)
  const end = appointment.endDateTime
    ? dayjs(appointment.endDateTime)
    : start.add(appointment.durationMinutes ?? 60, "minute")

  const eventPayload = {
    summary: `${appointment.serviceSnapshot?.name ?? "Appointment"} with ${appointment.customer.name}`,
    description: appointment.notes ?? "",
    start: {
      dateTime: start.toISOString(),
    },
    end: {
      dateTime: end.toISOString(),
    },
    attendees: [
      {
        email: appointment.customer.email,
        displayName: appointment.customer.name,
      },
    ],
  }

  if (appointment.googleEventId) {
    const response = await calendar.events.patch({
      calendarId,
      eventId: appointment.googleEventId,
      requestBody: eventPayload,
    })
    return response.data.id
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: eventPayload,
  })
  return response.data.id
}

export const deleteCalendarEvent = async (googleEventId, calendarId) => {
  const client = getOAuthClient()
  if (!client || !googleEventId) return

  const calendar = google.calendar({ version: "v3", auth: client })
  await calendar.events.delete({
    calendarId: calendarId || process.env.GOOGLE_CALENDAR_ID || "primary",
    eventId: googleEventId,
  })
}
