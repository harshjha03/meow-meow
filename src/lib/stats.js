// Aggregation helpers for the Dashboard and Progress charts.
import { todayStr, weekStartStr, parseDate, addDays, toDateStr, daysBetween } from './dates'
import { SUBJECTS } from './storage'
import { SECTION_COLORS, SECTION_LABELS, DAILY_GOAL } from './theme'

export function accuracy(attempted, correct) {
  if (!attempted) return 0
  return Math.round((correct / attempted) * 100)
}

/** Sum questions attempted per subject for the current (Mon–Sun) week. */
export function weeklyTotals(sessions, weekStart = weekStartStr()) {
  const end = toDateStr(addDays(parseDate(weekStart), 6))
  const totals = { QA: 0, VARC: 0, LRDI: 0 }
  for (const s of sessions) {
    if (s.date >= weekStart && s.date <= end && totals[s.subject] != null) {
      totals[s.subject] += Number(s.questions_attempted) || 0
    }
  }
  return totals
}

/** Today's roll-up for the dashboard header. */
export function todayStats(sessions) {
  const today = todayStr()
  const todays = sessions.filter((s) => s.date === today)
  const attempted = todays.reduce((n, s) => n + (Number(s.questions_attempted) || 0), 0)
  const correct = todays.reduce((n, s) => n + (Number(s.questions_correct) || 0), 0)
  const minutes = todays.reduce((n, s) => n + (Number(s.duration_min) || 0), 0)
  return {
    sessions: todays.length,
    attempted,
    correct,
    minutes,
    accuracy: accuracy(attempted, correct),
  }
}

// ---- time-range filtering ----
export const RANGES = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

export function rangeStart(range) {
  if (range === 'week') return weekStartStr()
  if (range === 'month') {
    const d = new Date()
    return toDateStr(new Date(d.getFullYear(), d.getMonth(), 1))
  }
  return '0000-01-01'
}

export function filterByRange(items, range, field = 'date') {
  const start = rangeStart(range)
  return items.filter((i) => i[field] >= start)
}

// ---- chart datasets ----
/** Mock score + percentile over time (sorted ascending by date). */
export function mockTrend(mocks) {
  return [...mocks]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date,
      name: m.name || m.type,
      score: Number(m.score) || 0,
      percentile: m.percentile != null ? Number(m.percentile) : null,
    }))
}

/** Daily question volume (attempted) per subject within range. */
export function volumeByDay(sessions, range) {
  const filtered = filterByRange(sessions, range)
  const map = new Map()
  for (const s of filtered) {
    const row = map.get(s.date) || { date: s.date, QA: 0, VARC: 0, LRDI: 0, total: 0 }
    const q = Number(s.questions_attempted) || 0
    if (row[s.subject] != null) row[s.subject] += q
    row.total += q
    map.set(s.date, row)
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/** Daily accuracy trend within range. */
export function accuracyByDay(sessions, range) {
  const filtered = filterByRange(sessions, range)
  const map = new Map()
  for (const s of filtered) {
    const row = map.get(s.date) || { date: s.date, attempted: 0, correct: 0 }
    row.attempted += Number(s.questions_attempted) || 0
    row.correct += Number(s.questions_correct) || 0
    map.set(s.date, row)
  }
  return [...map.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date, accuracy: accuracy(r.attempted, r.correct) }))
}

/** Headline numbers for a range: total questions, accuracy, hours, sessions. */
export function rangeSummary(sessions, range) {
  const filtered = filterByRange(sessions, range)
  const attempted = filtered.reduce((n, s) => n + (Number(s.questions_attempted) || 0), 0)
  const correct = filtered.reduce((n, s) => n + (Number(s.questions_correct) || 0), 0)
  const minutes = filtered.reduce((n, s) => n + (Number(s.duration_min) || 0), 0)
  return {
    sessions: filtered.length,
    attempted,
    correct,
    accuracy: accuracy(attempted, correct),
    hours: Math.round((minutes / 60) * 10) / 10,
  }
}

/** Count of distinct study days in the last `n` days (for a mini heat strip). */
export function recentActivity(sessions, n = 14) {
  const days = new Set(sessions.map((s) => s.date))
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = toDateStr(addDays(new Date(), -i))
    out.push({ date: d, active: days.has(d) })
  }
  return out
}

// ===== Direction-C dashboard / progress helpers =====
const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** Group attempted+correct by date. */
function byDay(sessions) {
  const map = {}
  for (const s of sessions) {
    if (!map[s.date]) map[s.date] = { att: 0, corr: 0 }
    map[s.date].att += Number(s.questions_attempted) || 0
    map[s.date].corr += Number(s.questions_correct) || 0
  }
  return map
}

/** Last `n` days of question volume, scaled to the window max. Today = accent. */
export function volumeSeries(sessions, n) {
  const map = byDay(sessions)
  const today = todayStr()
  const arr = []
  let max = 1
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(new Date(), -i)
    const key = toDateStr(d)
    const value = map[key] ? map[key].att : 0
    max = Math.max(max, value)
    arr.push({ label: WD[d.getDay()], value, isToday: key === today })
  }
  return arr.map((b) => ({
    ...b,
    hPct: ((b.value / max) * 100).toFixed(1) + '%',
    color: b.isToday ? 'var(--accent)' : '#D9D4EC',
  }))
}

/** Accuracy % per day (only days with data) over the last `n` days. */
export function accuracySeries(sessions, n) {
  const map = byDay(sessions)
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const key = toDateStr(addDays(new Date(), -i))
    if (map[key] && map[key].att > 0) out.push(Math.round((map[key].corr / map[key].att) * 100))
  }
  return out
}

/** SVG path over a 0–100 box: x spans the width, y = 100 − value. */
export function linePath(values) {
  if (!values.length) return ''
  return values
    .map((v, i) => {
      const x = values.length === 1 ? 50 : (i / (values.length - 1)) * 100
      return (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + (100 - v).toFixed(2)
    })
    .join(' ')
}
export function areaPath(line) {
  return line ? line + ' L100 100 L0 100 Z' : ''
}

/** How many mocks to show for a given range. */
export function mockWindow(range) {
  return range === 'week' ? 3 : range === 'month' ? 5 : 99
}
export function dayWindow(range) {
  return range === 'week' ? 7 : range === 'month' ? 30 : 60
}

/** Mocks sorted ascending, sliced to the range window. */
export function mockSeries(mocks, range) {
  const sorted = [...mocks].sort((a, b) => a.date.localeCompare(b.date))
  const w = mockWindow(range)
  return sorted.slice(Math.max(0, sorted.length - w)).map((m) => ({
    name: m.name || m.type,
    percentile: Number(m.percentile) || 0,
  }))
}

/** Average section scores across all mocks, with bar widths. */
export function sectionAverages(mocks) {
  const avg = (key) =>
    mocks.length ? Math.round(mocks.reduce((a, m) => a + (Number(m[key]) || 0), 0) / mocks.length) : 0
  const rows = [
    { key: 'QA', avg: avg('qa_score') },
    { key: 'VARC', avg: avg('varc_score') },
    { key: 'LRDI', avg: avg('lrdi_score') },
  ].map((r) => ({ ...r, color: SECTION_COLORS[r.key] }))
  const max = Math.max(1, ...rows.map((r) => r.avg))
  return rows.map((r) => ({ ...r, barPct: (r.avg / max) * 100 + '%' }))
}

/** Headline numbers for the dashboard mocks card. */
export function overallSummary(sessions, mocks) {
  let att = 0
  let corr = 0
  for (const s of sessions) {
    att += Number(s.questions_attempted) || 0
    corr += Number(s.questions_correct) || 0
  }
  const sorted = [...mocks].sort((a, b) => a.date.localeCompare(b.date))
  return {
    mocksGiven: mocks.length,
    latestPercentile: sorted.length ? Number(sorted[sorted.length - 1].percentile) || 0 : 0,
    overallAccuracy: accuracy(att, corr),
  }
}

/** Today's "feed the kitten" goal progress. */
export function dailyGoal(sessions, goal = DAILY_GOAL) {
  const t = todayStats(sessions)
  const ratio = Math.min(1, goal ? t.attempted / goal : 0)
  const pawN = Math.round(t.accuracy / 20)
  return {
    attempted: t.attempted,
    accuracy: t.accuracy,
    goal,
    ratio,
    pawN,
    fed: t.attempted >= goal,
    note: t.attempted >= goal ? 'Kitten fed! 🎉' : `${goal - t.attempted} to go 🐟`,
  }
}

/** Weekly target rings: done/target per section + conic-gradient style. */
export function targetRings(sessions, targets) {
  const start = weekStartStr()
  const totals = weeklyTotals(sessions, start)
  let done = 0
  let target = 0
  const rings = SUBJECTS.map((k) => {
    const d = totals[k] || 0
    const tgt = Number(targets[k]) || 0
    done += d
    target += tgt
    const pct = tgt ? Math.min(100, Math.round((d / tgt) * 100)) : 0
    return {
      key: k,
      label: SECTION_LABELS[k],
      pct,
      done: d,
      target: tgt,
      color: SECTION_COLORS[k],
    }
  })
  return { rings, done, target }
}
