import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'

const typeStyles = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-700',
}

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => onClose(), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) {
    return null
  }

  const colorClass = typeStyles[toast.type] ?? typeStyles.info

  return (
    <div className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-lg bg-slate-950/90 p-4 text-white shadow-lg transition-all">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
        <span className="text-xl font-semibold">!</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold">{toast.title ?? defaultTitle(toast.type)}</p>
        {toast.message ? <p className="mt-1 text-sm text-slate-100">{toast.message}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-white/80 transition hover:text-white"
        aria-label="Close notification"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

const defaultTitle = (type) => {
  switch (type) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Something went wrong'
    default:
      return 'Notice'
  }
}
