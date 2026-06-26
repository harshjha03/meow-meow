// Streak logic (see architecture doc "Streak Logic").
//  - active : a session was logged TODAY → streak is safe ✅
//  - frozen : nothing today, but a session yesterday → at risk, 1 miss allowed ⚠️
//  - broken : nothing today or yesterday → streak is 0
import { todayStr, parseDate, toDateStr, addDays } from './dates'

export function computeStreak(sessions) {
  const days = new Set(sessions.map((s) => s.date))
  if (days.size === 0) return { count: 0, status: 'broken' }

  const today = todayStr()
  const yesterday = toDateStr(addDays(parseDate(today), -1))

  let startStr
  let status
  if (days.has(today)) {
    startStr = today
    status = 'active'
  } else if (days.has(yesterday)) {
    startStr = yesterday
    status = 'frozen'
  } else {
    return { count: 0, status: 'broken' }
  }

  // count consecutive days backward from the start date
  let count = 0
  let cursor = parseDate(startStr)
  while (days.has(toDateStr(cursor))) {
    count += 1
    cursor = addDays(cursor, -1)
  }
  return { count, status }
}

export const STREAK_LABELS = {
  active: { emoji: '🔥', note: 'On track' },
  frozen: { emoji: '⚠️', note: 'Log today to keep it' },
  broken: { emoji: '💤', note: 'Start a new streak today' },
}
