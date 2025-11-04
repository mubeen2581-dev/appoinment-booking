import { formatDateLabel, formatDateTimeLabel } from "../utils/formatters.js"

export const AdminAppointmentTable = ({ appointments, onReschedule, onCancel, onDelete }) => {
  if (!appointments.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        No appointments yet.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Date & Time</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="text-sm text-slate-700 dark:text-slate-200">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800 dark:text-slate-100">{appointment.customer.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.customer.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.customer.phone}</p>
              </td>
              <td className="px-4 py-3">
                {appointment.serviceSnapshot?.name ?? appointment.service?.name ?? (
                  <span className="text-xs text-slate-400">—</span>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {appointment.serviceSnapshot?.durationMinutes ?? 0} mins • ${appointment.serviceSnapshot?.price ?? 0}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                {appointment.location?.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {formatDateTimeLabel(appointment.date, appointment.timeSlot)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Booked on {formatDateLabel(appointment.createdAt.slice(0, 10))}
                </p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    appointment.status === "cancelled"
                      ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-200"
                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200"
                  }`}
                >
                  {appointment.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onReschedule(appointment)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(appointment)}
                    className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(appointment)}
                    className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-rose-600 dark:text-slate-400"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
