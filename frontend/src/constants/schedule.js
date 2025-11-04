export const generateTimeSlots = ({
  startHour = 9,
  endHour = 18,
  intervalMinutes = 60,
} = {}) => {
  const slots = []
  const start = startHour * 60
  const end = endHour * 60
  for (let minutes = start; minutes < end; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    slots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`)
  }
  return slots
}

export const DEFAULT_BUSINESS_HOURS = {
  startHour: 9,
  endHour: 18,
}
