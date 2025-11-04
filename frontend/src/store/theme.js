import { create } from "zustand"

const storageKey = "appointment-app-theme"

const loadTheme = () => {
  if (typeof window === "undefined") return "light"
  return window.localStorage.getItem(storageKey) ?? "light"
}

const applyTheme = (theme) => {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
}

const initialTheme = loadTheme()
applyTheme(initialTheme)

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark"
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, next)
      }
      applyTheme(next)
      return { theme: next }
    }),
}))
