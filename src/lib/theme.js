// Design tokens shared across components (Direction C).
import { todayStr, parseDate } from './dates'

// Section accents — fixed across palettes (QA violet, VARC orange, LRDI green).
export const SECTION_COLORS = { QA: '#6C4DF6', VARC: '#FF7A45', LRDI: '#13B981' }
export const SECTION_TINTS = { QA: '#EEEAFE', VARC: '#FFEEE5', LRDI: '#E2F6EE' }
export const SECTION_LABELS = { QA: 'Quant', VARC: 'Verbal', LRDI: 'LR & DI' }

// CAT 2026 exam date — for the D-day counter.
export const CAT_DATE = '2026-11-29'

// Daily question goal (the "feed the kitten" gamification).
export const DAILY_GOAL = 50

/** Whole days from today until the CAT exam. */
export function dDay(catDate = CAT_DATE) {
  const t = parseDate(todayStr())
  const c = parseDate(catDate)
  return Math.max(0, Math.round((c - t) / 86400000))
}
