import clsx from "clsx"

import { overlaps, toMinutes } from "../utils/time.js"

export const TimeSlotPicker = ({
  timeSlots,
  selectedSlot,
  onSelect,
  bookings = [],
  serviceDuration,
}) => {
  return (
    <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-md transition-colors dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">Available times</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {timeSlots.map((slot) => {
          const slotMinutes = toMinutes(slot)
          const isBooked = bookings.some((booking) => overlaps(slotMinutes, serviceDuration, booking))
          const isSelected = selectedSlot === slot

          return (
            <button
              key={slot}
              type="button"
              disabled={isBooked}
              onClick={() => onSelect(slot)}
              className={clsx(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                isSelected && !isBooked
                  ? "border-brand-500 bg-brand-500 text-white shadow-lg dark:border-brand-400 dark:bg-brand-500/30 dark:text-white"
                  : "border-slate-200 bg-white/85 text-slate-700 hover:border-brand-400 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-brand-400",
                isBooked &&
                  "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
              )}
            >
              {slot}
              {isBooked ? <span className="block text-xs font-normal text-slate-400 dark:text-slate-500">Booked</span> : null}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Select an available time slot. Booked slots are shown in light gray.
      </p>
    </div>
  )
}


