import { useEffect, useState } from "react"

import { RescheduleDialog } from "../components/RescheduleDialog.jsx"
import { FeedbackDialog } from "../components/FeedbackDialog.jsx"
import {
  cancelAppointment,
  fetchAppointments,
  submitFeedback,
  updateAppointment,
} from "../services/api.js"
import { useNotification } from "../context/NotificationContext.jsx"

export const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeAppointment, setActiveAppointment] = useState(null)
  const [savingChange, setSavingChange] = useState(false)
  const [feedbackAppointment, setFeedbackAppointment] = useState(null)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const { showNotification } = useNotification()

  const loadAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAppointments()
      setAppointments(data.appointments ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
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

  const handleFeedbackSubmit = async ({ rating, comments }) => {
    if (!feedbackAppointment) return
    setSubmittingFeedback(true)
    try {
      await submitFeedback(feedbackAppointment.id, { rating, comments })
      showNotification({ type: "success", message: "Thanks for the feedback!" })
      setFeedbackAppointment(null)
    } catch (err) {
      showNotification({ type: "error", message: err.message })
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        Loading appointments...
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

  if (!appointments.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        No appointments yet. Book one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {appointment.serviceSnapshot?.name ?? "Appointment"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {appointment.date} at {appointment.timeSlot} {"\u2022"} {appointment.location?.name ?? "Location"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                appointment.status === "cancelled"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-200"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200"
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <div>
              <p className="font-medium">Customer</p>
              <p>{appointment.customer.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.customer.email}</p>
            </div>
            <div>
              <p className="font-medium">Price</p>
              <p>${appointment.serviceSnapshot?.price ?? 0}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {appointment.status === "scheduled" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveAppointment(appointment)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => handleCancel(appointment)}
                  className="rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-200"
                >
                  Cancel
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setFeedbackAppointment(appointment)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
            >
              Leave feedback
            </button>
          </div>
        </div>
      ))}

      {activeAppointment ? (
        <RescheduleDialog
          appointment={activeAppointment}
          onSubmit={handleRescheduleSubmit}
          onClose={() => setActiveAppointment(null)}
          submitting={savingChange}
        />
      ) : null}

      {feedbackAppointment ? (
        <FeedbackDialog
          appointment={feedbackAppointment}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setFeedbackAppointment(null)}
          submitting={submittingFeedback}
        />
      ) : null}
    </div>
  )
}
