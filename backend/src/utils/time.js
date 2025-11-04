import dayjs from "dayjs"

export const parseTimeSlot = (timeSlot) => {
  const [hours, minutes] = timeSlot.split(":").map(Number)
  return hours * 60 + minutes
}

export const formatTimeSlot = (minutes) => {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

export const computeEndTime = (date, timeSlot, durationMinutes) => {
  const start = dayjs(`${date} ${timeSlot}`)
  return start.add(durationMinutes, "minute")
}

export const overlaps = (appointment, startMinutes, endMinutes) => {
  const apptStart = parseTimeSlot(appointment.timeSlot)
  const apptEnd = apptStart + appointment.durationMinutes
  return Math.max(apptStart, startMinutes) < Math.min(apptEnd, endMinutes)
}
