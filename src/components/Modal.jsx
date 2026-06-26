import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { XIcon } from './icons'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full animate-pop overflow-y-auto rounded-t-3xl bg-white p-5 shadow-card-lg safe-b sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="btn-ghost px-2 py-2" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
