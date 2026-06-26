import { useState } from 'react'
import { loadDemoData, resetAll, isDemoLoggedIn, setDemoLoggedIn } from '../lib/demo'
import { useToast } from '../context/ToastContext'

// DEV-only floating panel to seed dummy data and preview the signed-in look.
export default function DemoBar() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(isDemoLoggedIn())

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-3 z-50 rounded-full bg-ink/85 px-3 py-2 text-xs font-semibold text-white shadow-card-lg md:bottom-4"
      >
        🐾 Demo
      </button>
    )
  }

  const toggleSignIn = () => {
    const next = !signedIn
    setDemoLoggedIn(next)
    setSignedIn(next)
    toast(next ? 'Preview: signed in' : 'Preview: signed out')
  }

  return (
    <div className="fixed bottom-24 right-3 z-50 w-56 rounded-2xl border border-line bg-card p-3 shadow-card-lg md:bottom-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">Demo tools (dev)</span>
        <button onClick={() => setOpen(false)} className="text-muted2 hover:text-ink">✕</button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => { loadDemoData(); toast('Demo data loaded ✓', 'success') }}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
        >
          Load demo data
        </button>
        <button
          onClick={toggleSignIn}
          className={'rounded-lg px-3 py-2 text-sm font-semibold ' + (signedIn ? 'bg-[#E2F6EE] text-lrdi' : 'bg-soft text-text')}
        >
          {signedIn ? '● Signed-in preview: on' : '○ Signed-in preview: off'}
        </button>
        <button
          onClick={() => { resetAll(); setSignedIn(false); toast('Reset to empty') }}
          className="rounded-lg bg-[#FFF3F0] px-3 py-2 text-sm font-semibold text-[#C9452C]"
        >
          Reset all data
        </button>
      </div>
    </div>
  )
}
