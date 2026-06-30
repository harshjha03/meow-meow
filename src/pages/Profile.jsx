import { useState, useRef } from 'react'
import { useProfile, setProfile } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { loadDemoData, resetAll, isDemoLoggedIn, setDemoLoggedIn } from '../lib/demo'
import { PencilIcon, CalendarIcon } from '../components/icons'

export default function Profile() {
  const profile = useProfile()
  const { user, configured, signIn, signOut } = useAuth()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [confirming, setConfirming] = useState(null)
  const [preview, setPreview] = useState(isDemoLoggedIn())
  const timer = useRef()

  const loggedIn = !!user
  const displayName = profile.name || 'Scholar'
  const initial = (profile.name.trim()[0] || user?.email?.[0] || 'U').toUpperCase()

  function startEdit() {
    setNameInput(profile.name)
    setEditing(true)
  }
  function saveName() {
    setProfile({ name: nameInput.trim() })
    setEditing(false)
    toast('Name updated ✓', 'success')
  }
  async function login() {
    if (!configured) {
      toast('Cloud sync not configured', 'error')
      return
    }
    await signIn()
  }
  async function logout() {
    await signOut()
    toast('Signed out')
  }

  // two-tap confirm for the data actions (destructive)
  function arm(action) {
    setConfirming(action)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setConfirming(null), 3000)
  }
  function onLoad() {
    if (confirming !== 'load') return arm('load')
    setConfirming(null)
    loadDemoData()
    toast('Demo data loaded ✓', 'success')
  }
  function onReset() {
    if (confirming !== 'reset') return arm('reset')
    setConfirming(null)
    resetAll()
    setPreview(false)
    toast('All data cleared')
  }
  function togglePreview() {
    const next = !preview
    setDemoLoggedIn(next)
    setPreview(next)
    toast(next ? 'Preview: signed in' : 'Preview: signed out')
  }

  return (
    <div className="mx-auto flex max-w-[520px] animate-fade-up flex-col gap-4">
      <h1 className="text-[23px] font-bold tracking-[-.5px] text-ink md:hidden">Profile</h1>

      {/* identity */}
      <div className="card flex flex-col items-center gap-3.5 px-[22px] py-[30px] text-center">
        <div
          className="relative grid h-[88px] w-[88px] place-items-center rounded-full text-[36px] font-bold text-white"
          style={{ background: loggedIn ? '#13B981' : 'var(--accent)' }}
        >
          {initial}
          {loggedIn && <span className="absolute bottom-0.5 right-0.5 h-[18px] w-[18px] rounded-full border-[3px] border-card bg-lrdi" />}
        </div>

        {editing ? (
          <div className="flex w-full max-w-[320px] gap-2">
            <input className="mm-in flex-1" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name" autoFocus />
            <button onClick={saveName} className="rounded-[9px] bg-accent px-[18px] text-[14px] font-semibold text-white">Save</button>
          </div>
        ) : (
          <button onClick={startEdit} className="flex items-center gap-2.5">
            <span className="text-[24px] font-bold tracking-[-.4px] text-ink">{displayName}</span>
            <PencilIcon className="h-[17px] w-[17px] text-muted2" />
          </button>
        )}
        <div className="text-[13px] text-muted2">{loggedIn ? 'Signed in with Google' : 'Not signed in yet'}</div>
      </div>

      {/* google calendar status */}
      <div className="card flex items-center gap-3 px-[18px] py-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-soft">
          <CalendarIcon className="h-[19px] w-[19px] text-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink">Google Calendar</div>
          <div className="text-xs text-muted2">{loggedIn ? 'Connected — events sync automatically' : 'Not connected'}</div>
        </div>
        <span
          className="rounded-md px-2.5 py-1 text-[11px] font-bold"
          style={loggedIn ? { color: '#13B981', background: '#E2F6EE' } : { color: 'var(--muted2)', background: 'var(--soft)' }}
        >
          {loggedIn ? 'On' : 'Off'}
        </span>
      </div>

      {/* login / logout */}
      {loggedIn ? (
        <button onClick={logout} className="rounded-[11px] border border-[#E7C9C2] bg-[#FFF3F0] py-[15px] text-center text-[15px] font-semibold text-[#C9452C]">
          Log out
        </button>
      ) : (
        <button onClick={login} className="flex items-center justify-center gap-2.5 rounded-[11px] bg-accent py-[15px] text-[15px] font-semibold text-white">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[13px] font-bold text-accent">G</span>
          Log in with Google
        </button>
      )}
      {!configured && <p className="text-center text-[11px] text-muted2">Add Supabase keys to <code>.env</code> to enable Google login &amp; sync.</p>}

      {/* data tools */}
      <div className="card p-5">
        <div className="mb-1 text-[15px] font-semibold text-ink">Data</div>
        <p className="mb-3 text-[12px] text-muted2">Fill the app with a sample dataset to explore it, or clear everything to start fresh.</p>
        <div className="flex flex-col gap-2.5">
          <button onClick={onLoad} className="rounded-[10px] bg-accent-soft py-3 text-[14px] font-semibold text-accent">
            {confirming === 'load' ? 'Tap again — this replaces your data' : 'Load demo data'}
          </button>
          <button onClick={onReset} className="rounded-[10px] border border-[#E7C9C2] bg-[#FFF3F0] py-3 text-[14px] font-semibold text-[#C9452C]">
            {confirming === 'reset' ? 'Tap again — erases everything' : 'Reset all data'}
          </button>
          {import.meta.env.DEV && (
            <button onClick={togglePreview} className="mt-1 rounded-[10px] bg-soft py-2.5 text-[13px] font-semibold text-text">
              {preview ? '● Signed-in preview: on (dev)' : '○ Signed-in preview: off (dev)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
