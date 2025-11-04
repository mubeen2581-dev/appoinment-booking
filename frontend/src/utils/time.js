export const toMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

export const overlaps = (slotMinutes, durationMinutes, booking) => {
  const start = slotMinutes
  const end = slotMinutes + durationMinutes
  const bookingStart = toMinutes(booking.timeSlot)
  const bookingEnd = bookingStart + booking.durationMinutes
  return Math.max(start, bookingStart) < Math.min(end, bookingEnd)
}
