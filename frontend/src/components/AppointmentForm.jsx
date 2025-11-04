import { useState } from "react"

const initialState = {
  name: "",
  email: "",
  phone: "",
  notes: "",
  applyLoyaltyPoints: 0,
  joinWaitlistIfFull: true,
}

export const AppointmentForm = ({ onSubmit, submitting, loyaltyPoints = 0 }) => {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === "checkbox" ? checked : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = "Name is required"
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email"
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required"
    }
    if (form.applyLoyaltyPoints < 0) {
      nextErrors.applyLoyaltyPoints = "Cannot be negative"
    }
    if (form.applyLoyaltyPoints > loyaltyPoints) {
      nextErrors.applyLoyaltyPoints = "Exceeds available points"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    onSubmit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      applyLoyaltyPoints: Number(form.applyLoyaltyPoints || 0),
      joinWaitlistIfFull: form.joinWaitlistIfFull,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-md dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-100">Your details</h2>
      <div className="space-y-4">
        <Field label="Full name" id="name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" id="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
            placeholder="jane@example.com"
          />
        </Field>
        <Field label="Phone number" id="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
            placeholder="+1 555 123 4567"
          />
        </Field>
        <Field label="Notes (optional)" id="notes">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Let us know anything we should prepare."
          />
        </Field>
        <div>
          <label htmlFor="applyLoyaltyPoints" className="block text-sm font-medium text-slate-600 dark:text-slate-200">
            Apply loyalty points (available: {loyaltyPoints})
          </label>
          <input
            id="applyLoyaltyPoints"
            name="applyLoyaltyPoints"
            type="number"
            min={0}
            value={form.applyLoyaltyPoints}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900"
          />
          {errors.applyLoyaltyPoints ? (
            <p className="mt-1 text-xs text-rose-600">{errors.applyLoyaltyPoints}</p>
          ) : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            name="joinWaitlistIfFull"
            checked={form.joinWaitlistIfFull}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Join waitlist automatically if the slot gets taken
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-400"
        >
          {submitting ? "Booking..." : "Confirm appointment"}
        </button>
      </div>
    </form>
  )
}

const Field = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-200">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
  </div>
)


