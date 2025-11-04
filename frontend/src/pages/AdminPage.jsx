import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

import { AdminAppointmentTable } from "../components/AdminAppointmentTable.jsx"
import { RescheduleDialog } from "../components/RescheduleDialog.jsx"
import {
  cancelAppointment,
  deleteAppointment,
  fetchAnalytics,
  fetchAppointments,
  fetchWaitlist,
  removeWaitlistEntry,
  updateAppointment,
  fetchFeedback,
} from "../services/api.js"
import { useNotification } from "../context/NotificationContext.jsx"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export const AdminPage = () => {
  const [appointments, setAppointments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [waitlist, setWaitlist] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeAppointment, setActiveAppointment] = useState(null)
  const [savingChange, setSavingChange] = useState(false)

  const { showNotification } = useNotification()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [appointmentsRes, analyticsRes, waitlistRes, feedbackRes] = await Promise.all([
          fetchAppointments(),
          fetchAnalytics(),
          fetchWaitlist(),
          fetchFeedback(),
        ])
        setAppointments(appointmentsRes.appointments ?? [])
        setAnalytics(analyticsRes)
        setWaitlist(waitlistRes.waitlist ?? [])
        setFeedback(feedbackRes.feedback ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleRescheduleSubmit = async ({ date, timeSlot }) => {
    if (!activeAppointment) return
    setSavingChange(true)
    try {
      const response = await updateAppointment(activeAppointment.id, { date, timeSlot })
      setAppointments((prev) =>
        prev.map((item) => (item.id === response.appointment.id ? response.appointment : item))
      )
      showNotification({ type: "success", message: "Appointment updated" })
      setActiveAppointment(null)
    } catch (err) {
      showNotification({ type: "error", message: err.message })
    } finally {
      setSavingChange(false)
    }
  }

  const handleCancel = async (appointment) => {
    if (!window.confirm("Cancel this appointment?")) return
    try {
      const response = await cancelAppointment(appointment.id)
      setAppointments((prev) =>
        prev.map((item) => (item.id === response.appointment.id ? response.appointment : item))
      )
      showNotification({ type: "success", message: "Appointment cancelled" })
    } catch (err) {
      showNotification({ type: "error", message: err.message })
    }
  }

  const handleDelete = async (appointment) => {
    if (!window.confirm("Delete this appointment? This cannot be undone.")) return
    try {
      await deleteAppointment(appointment.id)
      setAppointments((prev) => prev.filter((item) => item.id !== appointment.id))
      showNotification({ type: "success", message: "Appointment deleted" })
    } catch (err) {
      showNotification({ type: "error", message: err.message })
    }
  }

  const handleRemoveWaitlist = async (entry) => {
    try {
      await removeWaitlistEntry(entry._id)
      setWaitlist((prev) => prev.filter((item) => item._id !== entry._id))
      showNotification({ type: "success", message: "Removed from waitlist" })
    } catch (err) {
      showNotification({ type: "error", message: err.message })
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        Loading admin data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/30 dark:text-rose-100">
        {error}
      </div>
    )
  }

  const serviceLabels = analytics?.services?.map((entry) => entry.name) ?? []
  const serviceTotals = analytics?.services?.map((entry) => entry.total) ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Monitor analytics, manage bookings, and keep clients informed.
        </p>
      </header>

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Total appointments" value={analytics.totals?.totalAppointments ?? 0} />
          <SummaryCard title="Upcoming" value={analytics.totals?.upcomingAppointments ?? 0} />
          <SummaryCard
            title="Avg rating"
            value={(analytics.feedback?.averageRating ?? 0).toFixed(1)}
            caption={`${analytics.feedback?.responses ?? 0} responses`}
          />
          <SummaryCard
            title="Top loyalty"
            value={analytics.loyaltyLeaders?.[0]?.loyaltyPoints ?? 0}
            caption={analytics.loyaltyLeaders?.[0]?.name ?? "No members"}
          />
        </div>
      ) : null}

      {serviceLabels.length ? (
        <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-md transition-colors dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Service popularity</h2>
          <div className="mt-4 h-64">
            <Bar
              data={{
                labels: serviceLabels,
                datasets: [
                  {
                    label: "Bookings",
                    data: serviceTotals,
                    backgroundColor: "rgba(14, 165, 233, 0.6)",
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { display: false },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Appointments</h2>
          <button
            type="button"
            onClick={async () => {
              try {
                const data = await fetchAppointments()
                setAppointments(data.appointments ?? [])
                showNotification({ type: "success", message: "Refreshed" })
              } catch (err) {
                showNotification({ type: "error", message: err.message })
              }
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
          >
            Refresh
          </button>
        </div>
        <AdminAppointmentTable
          appointments={appointments}
          onReschedule={setActiveAppointment}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Waitlist</h2>
        {waitlist.length ? (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {waitlist.map((entry) => (
              <li key={entry._id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                    {entry.customer.name} • {entry.date} at {entry.preferredTimeSlot}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.customer.email} • {entry.service?.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWaitlist(entry)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No one is waiting right now.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Recent feedback</h2>
        {feedback.length ? (
          <ul className="mt-4 space-y-3">
            {feedback.map((entry) => (
              <li key={entry._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {entry.user?.name ?? "Anonymous"} • {entry.rating}?
                </p>
                {entry.comments ? (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.comments}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No feedback yet.</p>
        )}
      </section>

      {activeAppointment ? (
        <RescheduleDialog
          appointment={activeAppointment}
          onSubmit={handleRescheduleSubmit}
          onClose={() => setActiveAppointment(null)}
          submitting={savingChange}
        />
      ) : null}
    </div>
  )
}

const SummaryCard = ({ title, value, caption }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    {caption ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{caption}</p> : null}
  </div>
)

