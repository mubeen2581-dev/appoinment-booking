import { createContext, useCallback, useContext, useState } from 'react'

import { Toast } from '../components/Toast.jsx'

const NotificationContext = createContext({
  showNotification: () => {},
  dismissNotification: () => {},
})

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null)

  const dismissNotification = useCallback(() => setToast(null), [])

  const showNotification = useCallback((config) => {
    setToast({
      type: config.type ?? 'info',
      title: config.title,
      message: config.message,
      duration: config.duration,
    })
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification }}>
      {children}
      <Toast toast={toast} onClose={dismissNotification} />
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
