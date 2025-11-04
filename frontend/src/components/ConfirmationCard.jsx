import { format, parseISO } from "date-fns"

export const ConfirmationCard = ({ appointment, onBookAnother }) => {
  const dateLabel = format(parseISO(`${appointment.date}T00:00:00`), "EEEE, MMMM d, yyyy")
  const serviceName = appointment.serviceSnapshot?.name ?? appointment.service?.name

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-100">
      <h2 className="text-xl font-semibold">You&apos;re all set!</h2>
      <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
        We&apos;ve sent a confirmation email with all the details. Feel free to reach out if you need to make changes.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Info label="Name" value={appointment.customer.name} />
        <Info label="Email" value={appointment.customer.email} />
        <Info label="Phone" value={appointment.customer.phone} />
        <Info label="Date" value={dateLabel} />
        <Info label="Time" value={appointment.timeSlot} />
        {serviceName ? <Info label="Service" value={serviceName} /> : null}
        {appointment.location?.name ? <Info label="Location" value={appointment.location.name} /> : null}
        {appointment.notes ? <Info label="Notes" value={appointment.notes} className="sm:col-span-2" /> : null}
      </dl>

      <button
        type="button"
        onClick={onBookAnother}
        className="mt-6 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Book another appointment
      </button>
    </div>
  )
}

const Info = ({ label, value, className }) => (
  <div className={className}>
    <dt className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{label}</dt>
    <dd className="mt-1 text-sm font-medium">{value}</dd>
  </div>
)
