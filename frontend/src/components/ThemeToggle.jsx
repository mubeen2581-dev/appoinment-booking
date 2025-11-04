import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"

import { useThemeStore } from "../store/theme.js"

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
    >
      {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  )
}
