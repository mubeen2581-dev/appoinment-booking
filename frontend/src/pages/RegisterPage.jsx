import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { register } from "../services/api.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { useAuthStore } from "../store/auth.js"

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await register(form)
      setSession(response)
      showNotification({ type: "success", message: "Account created!" })
      navigate("/")
    } catch (error) {
      showNotification({ type: "error", message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md card-surface rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-lg dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-2xl">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Create account</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Book faster, earn loyalty points, and manage your appointments.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-brand-400"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account? <Link to="/auth/login" className="text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  )
}

