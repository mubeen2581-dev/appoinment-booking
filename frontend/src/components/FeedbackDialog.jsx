import { useState } from "react"

export const FeedbackDialog = ({ appointment, onSubmit, onClose, submitting }) => {
  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ rating, comments })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Rate your visit</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Share feedback for {appointment.serviceSnapshot?.name ?? "this appointment"} on {appointment.date}.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Rating</label>
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} star{value > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Comments</label>
            <textarea
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
              placeholder="How was your experience?"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-400"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  )
}
