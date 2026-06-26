// Google Calendar integration. When logged in we POST a real event; when not,
// the caller falls back to copy-paste reminder text.
import { getProviderToken } from './supabase'
import { formatLong, formatTime } from './dates'

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

/** Copy-paste text for the offline / not-logged-in case. */
export function reminderText(item) {
  const when = [formatLong(item.date), item.reminder_time ? `· ${formatTime(item.reminder_time)}` : '']
    .filter(Boolean)
    .join(' ')
  return `CAT · ${item.label} — ${when}`
}

function toISO(date, time) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = (time || '09:00').split(':').map(Number)
  const start = new Date(y, m - 1, d, hh, mm)
  const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour block
  const fmt = (dt) => {
    const p = (n) => String(n).padStart(2, '0')
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}:00`
  }
  return { start: fmt(start), end: fmt(end) }
}

/**
 * Create a Google Calendar event for a planner item.
 * @returns {Promise<{ok:boolean, eventId?:string, reason?:string}>}
 */
export async function addToCalendar(item) {
  const token = await getProviderToken()
  if (!token) return { ok: false, reason: 'no-token' }

  const { start, end } = toISO(item.date, item.reminder_time)
  const body = {
    summary: `CAT · ${item.label}`,
    description: 'Logged from Meow Meow 🐾',
    start: { dateTime: start, timeZone: TZ },
    end: { dateTime: end, timeZone: TZ },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 15 }],
    },
  }

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.warn('[calendar] event create failed:', res.status, detail)
      return { ok: false, reason: `http-${res.status}` }
    }
    const event = await res.json()
    return { ok: true, eventId: event.id }
  } catch (err) {
    console.warn('[calendar] request error:', err.message)
    return { ok: false, reason: 'network' }
  }
}
