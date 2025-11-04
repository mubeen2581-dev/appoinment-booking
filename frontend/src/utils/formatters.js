import { format, parseISO } from "date-fns"

export const formatDateLabel = (dateString) =>
  format(parseISO(`${dateString}T00:00:00`), "MMM d, yyyy")

export const formatDateTimeLabel = (dateString, timeString) =>
  `${formatDateLabel(dateString)} at ${timeString}`

