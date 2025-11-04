import { create } from "zustand"

import { clearAuthToken, setAuthToken } from "../services/api.js"

const storageKey = "appointment-app-auth"

const persist = (state) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(storageKey, JSON.stringify({
    token: state.token,
    user: state.user,
  }))
}

const load = () => {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

const restored = load()
if (restored?.token) {
  setAuthToken(restored.token)
}

export const useAuthStore = create((set) => ({
  user: restored?.user ?? null,
  token: restored?.token ?? null,
  setSession: ({ user, token }) => {
    set({ user, token })
    setAuthToken(token)
    persist({ user, token })
  },
  clearSession: () => {
    set({ user: null, token: null })
    clearAuthToken()
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey)
    }
  },
}))
