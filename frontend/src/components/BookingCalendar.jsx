import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "../styles/calendar.css"

const today = new Date()

export const BookingCalendar = ({ selectedDate, onChange }) => {
  return (
    <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-md transition-colors dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">Choose a date</h2>
      <Calendar
        onChange={onChange}
        value={selectedDate}
        minDate={today}
        className="react-calendar w-full border-0"
        tileDisabled={({ date }) => date.getDay() === 0}
      />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Sundays are unavailable.</p>
    </div>
  )
}


