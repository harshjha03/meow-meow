// All date math is LOCAL-time based to avoid UTC off-by-one bugs.

/** Format a Date as local YYYY-MM-DD. */
export function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Today as YYYY-MM-DD (local). */
export function todayStr() {
  return toDateStr(new Date())
}

/** Parse YYYY-MM-DD into a local-midnight Date. */
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Return a new Date offset by n days. */
export function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Monday-of-week (local) for a given Date, as YYYY-MM-DD. */
export function weekStartStr(d = new Date()) {
  const r = new Date(d)
  const day = (r.getDay() + 6) % 7 // 0 = Monday
  r.setDate(r.getDate() - day)
  return toDateStr(r)
}

/** Whole days from a -> b (b - a), using local midnights. */
export function daysBetween(aStr, bStr) {
  const a = parseDate(aStr)
  const b = parseDate(bStr)
  return Math.round((b - a) / 86400000)
}

/** "Mon, 24 Jun" */
export function formatShort(str) {
  return parseDate(str).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

/** "24 Jun 2026" */
export function formatLong(str) {
  return parseDate(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Human relative label: Today / Tomorrow / Yesterday / weekday. */
export function relativeLabel(str) {
  const diff = daysBetween(todayStr(), str)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return formatShort(str)
}

/** Format "HH:MM" (24h) into "8:30 AM". */
export function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
