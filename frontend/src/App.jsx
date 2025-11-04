import { useEffect } from "react"
import { NavLink, Route, Routes, Navigate } from "react-router-dom"

import { BookingPage } from "./pages/BookingPage.jsx"
import { AdminPage } from "./pages/AdminPage.jsx"
import { LoginPage } from "./pages/LoginPage.jsx"
import { RegisterPage } from "./pages/RegisterPage.jsx"
import { MyAppointmentsPage } from "./pages/MyAppointmentsPage.jsx"
import { ThemeToggle } from "./components/ThemeToggle.jsx"
import { ProtectedRoute } from "./components/ProtectedRoute.jsx"
import { getProfile } from "./services/api.js"
import { useAuthStore } from "./store/auth.js"
import { useNotification } from "./context/NotificationContext.jsx"

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-white text-brand-700 shadow dark:bg-slate-900 dark:text-brand-300"
      : "text-slate-500 hover:text-brand-700 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-900/60"
  }`

const App = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const { showNotification } = useNotification()

  useEffect(() => {
    if (!token || user) return

    const loadProfile = async () => {
      try {
        const response = await getProfile()
        setSession({ user: response.user, token })
      } catch (error) {
        clearSession()
        showNotification({ type: "error", message: "Session expired. Please log in again." })
      }
    }

    loadProfile()
  }, [token, user, setSession, clearSession, showNotification])

  const handleLogout = () => {
    clearSession()
    showNotification({ type: "success", message: "Signed out" })
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Appointment Hub</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Book and manage client appointments with ease.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Book
            </NavLink>
            {user ? (
              <NavLink to="/my-appointments" className={navLinkClass}>
                My Appointments
              </NavLink>
            ) : null}
            {user?.role === "admin" || user?.role === "staff" ? (
              <NavLink to="/admin" className={navLinkClass}>
                Admin Dashboard
              </NavLink>
            ) : null}
            <ThemeToggle />
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
              >
                Sign out
              </button>
            ) : (
              <NavLink to="/auth/login" className={navLinkClass}>
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

          <Route element={<ProtectedRoute roles={["user", "admin", "staff"]} />}>
            <Route path="/my-appointments" element={<MyAppointmentsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Appointment Hub. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App
