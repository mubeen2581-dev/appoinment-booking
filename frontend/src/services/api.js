const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

let authToken = null

export const setAuthToken = (token) => {
  authToken = token
}

export const clearAuthToken = () => {
  authToken = null
}

const buildHeaders = (additional = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...additional,
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  return headers
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    const message = await extractErrorMessage(response)
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

const extractErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data?.error || response.statusText
  } catch {
    return response.statusText
  }
}

export const register = (payload) =>
  request("/auth/register", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

export const login = (payload) =>
  request("/auth/login", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

export const getProfile = () =>
  request("/auth/me", {
    headers: buildHeaders(),
  })

export const fetchServices = () => request("/services")

export const fetchLocations = () => request("/locations")

export const fetchBookedSlots = ({ date, locationId }) => {
  const params = new URLSearchParams({ date })
  if (locationId) {
    params.append("locationId", locationId)
  }
  return request(`/appointments/slots?${params.toString()}`)
}

export const createAppointment = (payload) =>
  request("/appointments", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

export const fetchAppointments = () =>
  request("/appointments", {
    headers: buildHeaders(),
  })

export const updateAppointment = (id, payload) =>
  request(`/appointments/${id}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

export const cancelAppointment = (id) =>
  updateAppointment(id, { status: "cancelled" })

export const deleteAppointment = (id) =>
  request(`/appointments/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  })

export const createPaymentIntent = (payload) =>
  request("/payments/intent", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

export const submitFeedback = (appointmentId, payload) =>
  request(`/feedback/${appointmentId}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })

export const fetchFeedback = () =>
  request("/feedback", {
    headers: buildHeaders(),
  })

export const fetchAnalytics = () =>
  request("/analytics", {
    headers: buildHeaders(),
  })

export const fetchWaitlist = () =>
  request("/waitlist", {
    headers: buildHeaders(),
  })

export const removeWaitlistEntry = (id) =>
  request(`/waitlist/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  })
