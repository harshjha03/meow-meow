import { useState } from 'react'
import { usePlanner, addPlannerItem, updatePlannerItem, deletePlannerItem } from '../lib/storage'
import { relativeLabel, formatTime, parseDate } from '../lib/dates'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { addToCalendar, reminderText } from '../lib/calendar'
import CalendarGrid from '../components/CalendarGrid'
import Modal from '../components/Modal'
import { CalendarIcon, CopyIcon, TrashIcon } from '../components/icons'

export default function Planner() {
  const planner = usePlanner()
  const { user } = useAuth()
  const toast = useToast()
  const [modalDate, setModalDate] = useState(null)
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('08:30')

  const plannerDates = new Set(planner.map((p) => p.date))
  const upcoming = [...planner].sort((a, b) => a.date.localeCompare(b.date) || (a.reminder_time || '').localeCompare(b.reminder_time || ''))

  function openDay(k) {
    setModalDate(k)
    setLabel('')
    setTime('08:30')
  }

  async function save() {
    const item = addPlannerItem({ date: modalDate, label: label.trim() || 'Study block', reminder_time: time })
    setModalDate(null)
    if (user) {
      const res = await addToCalendar(item)
      if (res.ok) {
        updatePlannerItem(item.id, { google_event_id: res.eventId })
        toast('Added to Google Calendar ✓', 'success')
      } else if (res.reason === 'no-token') {
        toast('Saved — re-sign in to sync to Calendar', 'error')
      } else {
        toast('Saved locally — Calendar unavailable', 'error')
      }
    } else {
      toast('Reminder saved locally ✓', 'success')
    }
  }

  async function copy(p) {
    try {
      await navigator.clipboard.writeText(reminderText(p))
      toast('Reminder copied 📋', 'success')
    } catch {
      toast(reminderText(p))
    }
  }

  return (
    <div className="mx-auto flex max-w-[1080px] animate-fade-up flex-wrap items-start gap-4">
      <h1 className="w-full text-[23px] font-bold tracking-[-.5px] text-ink md:hidden">Planner</h1>

      <div className="card min-w-[300px] flex-[1.3] p-5">
        <CalendarGrid onSelect={openDay} plannerDates={plannerDates} />
      </div>

      <div className="flex min-w-[280px] flex-1 flex-col gap-3.5">
        <div
          className="flex items-center gap-2.5 rounded-xl px-[15px] py-[13px]"
          style={{ background: user ? '#E2F6EE' : '#FFF6E9', border: `1px solid ${user ? '#bfe9d6' : '#f3e2bf'}` }}
        >
          <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg" style={{ background: user ? '#13B981' : '#FF7A45' }}>
            <CalendarIcon className="h-[15px] w-[15px] text-white" />
          </div>
          <div className="text-[12.5px] leading-[1.35] text-[#5b5850]">
            {user
              ? 'Connected to Google Calendar. New blocks sync automatically.'
              : 'Log in to sync blocks to Google Calendar. For now, reminders save locally as copy-paste text.'}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 text-[15px] font-semibold text-ink">Upcoming reminders</div>
          {upcoming.length === 0 ? (
            <p className="py-4 text-sm text-muted2">Nothing planned yet. Tap a day to add a block.</p>
          ) : (
            upcoming.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-soft py-[11px] last:border-0">
                <div className="w-[42px] flex-shrink-0 text-center">
                  <div className="text-[11px] font-semibold text-muted2">{relativeLabel(p.date)}</div>
                  <div className="text-sm font-bold text-ink">{formatTime(p.reminder_time)}</div>
                </div>
                <div className="min-w-0 flex-1 text-sm font-medium text-ink">{p.label}</div>
                {p.google_event_id ? (
                  <span className="whitespace-nowrap rounded-md bg-[#E2F6EE] px-[7px] py-[3px] text-[10px] font-bold text-lrdi">GCal</span>
                ) : (
                  !user && (
                    <button onClick={() => copy(p)} className="text-muted2 hover:text-ink" aria-label="Copy reminder">
                      <CopyIcon className="h-4 w-4" />
                    </button>
                  )
                )}
                <button onClick={() => deletePlannerItem(p.id)} className="text-muted2/60 hover:text-[#C9452C]" aria-label="Delete">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={!!modalDate} onClose={() => setModalDate(null)} title="Plan a block">
        {modalDate && (
          <div className="-mt-3 mb-3 text-[13px] text-muted2">
            {relativeLabel(modalDate)} · {parseDate(modalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <div className="label">What's the plan?</div>
            <input className="mm-in" placeholder="e.g. QA — Geometry drill" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
          </div>
          <div>
            <div className="label">Reminder time</div>
            <input type="time" className="mm-in" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="rounded-[10px] bg-bg px-3.5 py-3 text-[12.5px] leading-[1.4] text-[#6b6860]">
            {user
              ? 'This will create an event in your Google Calendar with a 15-minute popup reminder.'
              : 'Not logged in — we’ll save a reminder you can copy into any alarm or calendar app.'}
          </div>
          <button onClick={save} className="w-full rounded-[10px] bg-accent py-[15px] text-center text-[15px] font-semibold text-white transition active:scale-[0.99]">
            {user ? 'Add to Google Calendar' : 'Save reminder'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
