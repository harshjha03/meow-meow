// Demo helpers: seed a realistic sample dataset + reset (available in the
// Profile screen, incl. production), plus a DEV-only "preview signed-in" toggle
// (fakes auth; gated to dev in AuthContext and the Profile data section).
import { importAll, clearAll } from './storage'

const pad = (n) => String(n).padStart(2, '0')
const ds = (off) => {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const uid = () => 'demo-' + Math.random().toString(36).slice(2)

function buildDemo() {
  const now = new Date().toISOString()
  const subs = ['QA', 'VARC', 'LRDI']
  const topics = {
    QA: ['Geometry', 'Algebra', 'Arithmetic', 'Number Systems'],
    VARC: ['RC Passage', 'Para Jumbles', 'Critical Reasoning'],
    LRDI: ['Tables', 'Puzzles', 'Caselets', 'Bar Graphs'],
  }
  const sessions = []
  const add = (date, subject, topic, att, corr, dur) =>
    sessions.push({ id: uid(), date, subject, topic, questions_attempted: att, questions_correct: corr, duration_min: dur, notes: '', created_at: now })
  add(ds(0), 'QA', 'Number Systems', 27, 23, 80)
  add(ds(0), 'LRDI', 'Caselets', 20, 17, 55)
  for (let i = 1; i <= 11; i++) {
    const s = subs[i % 3]
    const t = topics[s][i % topics[s].length]
    const att = 22 + (i * 7) % 30
    const corr = Math.min(att, Math.round(att * (0.68 + ((i * 5) % 20) / 100)))
    add(ds(-i), s, t, att, corr, 35 + (i * 11) % 55)
    if (i % 2 === 0) {
      const s2 = subs[(i + 2) % 3]
      const a2 = 16 + (i * 5) % 22
      add(ds(-i), s2, topics[s2][i % topics[s2].length], a2, Math.round(a2 * 0.75), 30 + (i * 7) % 30)
    }
  }

  const mocks = []
  ;[[-58, 'AIMCAT 1', 98, 76.2, 38, 28, 32], [-44, 'SIMCAT 2', 112, 81.4, 46, 32, 34], [-30, 'AIMCAT 3', 105, 79.0, 42, 36, 27], [-19, 'SIMCAT 4', 128, 85.6, 52, 38, 38], [-9, 'AIMCAT 5', 141, 88.9, 58, 40, 43], [-3, 'SIMCAT 6', 152, 91.3, 62, 42, 48]].forEach((m) =>
    mocks.push({ id: uid(), date: ds(m[0]), type: 'Full Mock', name: m[1], score: m[2], percentile: m[3], qa_score: m[4], varc_score: m[5], lrdi_score: m[6], notes: '', created_at: now })
  )

  const planner = []
  ;[[0, 'QA — Geometry drill', '18:00', true], [1, 'Mock: SIMCAT 7', '10:00', true], [1, 'VARC — 2 RC passages', '19:30', false], [3, 'LRDI — Caselets set', '17:00', false], [5, 'Revise formula sheet', '08:00', false]].forEach((p) =>
    planner.push({ id: uid(), date: ds(p[0]), label: p[1], reminder_time: p[2], google_event_id: p[3] ? 'demo_evt_' + uid() : null })
  )

  const mon = new Date()
  mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7))
  const week_start = `${mon.getFullYear()}-${pad(mon.getMonth() + 1)}-${pad(mon.getDate())}`

  return {
    sessions,
    mocks,
    planner,
    targets: { QA: 130, VARC: 90, LRDI: 90, week_start },
    profile: { name: 'Arjun' },
    last_updated: now,
  }
}

export function loadDemoData() {
  importAll(buildDemo())
}

export function resetAll() {
  clearAll()
  setDemoLoggedIn(false)
}

// ---- demo "signed-in" preview ----
const FLAG = 'cat_demo_login'
export const DEMO_USER = { id: 'demo-user', email: 'arjun.demo@meowmeow.app' }
export const isDemoLoggedIn = () => localStorage.getItem(FLAG) === '1'
export function setDemoLoggedIn(on) {
  if (on) localStorage.setItem(FLAG, '1')
  else localStorage.removeItem(FLAG)
  window.dispatchEvent(new Event('cat-demo-auth'))
}
