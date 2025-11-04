import { Navigate, Outlet } from "react-router-dom"

import { useAuthStore } from "../store/auth.js"

export const ProtectedRoute = ({ roles }) => {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
