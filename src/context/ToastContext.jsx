import { createContext, useContext, useCallback, useRef, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message, type = 'info') => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => dismiss(id), 3200)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{ background: t.type === 'error' ? '#C9452C' : '#41382C' }}
            className="pointer-events-auto animate-pop max-w-sm whitespace-nowrap rounded-[10px] px-[18px] py-3 text-[13.5px] font-semibold text-white shadow-card-lg"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
