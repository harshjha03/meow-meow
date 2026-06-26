// Reactive localStorage store. localStorage is the SINGLE SOURCE OF TRUTH.
// Every mutation bumps cat_meta.last_updated (for last-write-wins sync) and
// notifies subscribers so the React UI re-renders.
import { useSyncExternalStore } from 'react'
import { weekStartStr } from './dates'

export const KEYS = {
  sessions: 'cat_sessions',
  mocks: 'cat_mocks',
  targets: 'cat_targets',
  planner: 'cat_planner',
  profile: 'cat_profile',
  meta: 'cat_meta',
}

export const SUBJECTS = ['QA', 'VARC', 'LRDI']
export const TEST_TYPES = ['mock', 'sectional', 'topic']

const DEFAULTS = {
  [KEYS.sessions]: [],
  [KEYS.mocks]: [],
  [KEYS.planner]: [],
  [KEYS.targets]: { QA: 300, VARC: 200, LRDI: 200, week_start: weekStartStr() },
  [KEYS.profile]: { name: '' },
  [KEYS.meta]: { last_updated: null, user_id: null },
}

// ---- in-memory cache gives useSyncExternalStore stable references ----
const cache = {}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return clone(DEFAULTS[key])
    return JSON.parse(raw)
  } catch {
    return clone(DEFAULTS[key])
  }
}

function clone(v) {
  return Array.isArray(v) ? [...v] : { ...v }
}

function ensure(key) {
  if (!(key in cache)) cache[key] = load(key)
  return cache[key]
}

// ---- pub/sub ----
const subs = new Set()
export function subscribe(cb) {
  subs.add(cb)
  return () => subs.delete(cb)
}
function emit() {
  subs.forEach((fn) => fn())
}

function touchMeta() {
  const meta = { ...ensure(KEYS.meta), last_updated: new Date().toISOString() }
  cache[KEYS.meta] = meta
  localStorage.setItem(KEYS.meta, JSON.stringify(meta))
}

/** Persist a value to a key. Bumps last_updated unless writing meta itself. */
function persist(key, value, opts = {}) {
  cache[key] = value
  localStorage.setItem(key, JSON.stringify(value))
  if (key !== KEYS.meta && !opts.silentMeta) touchMeta()
  emit()
}

// ---- snapshot getters (stable refs) ----
export const getSessions = () => ensure(KEYS.sessions)
export const getMocks = () => ensure(KEYS.mocks)
export const getPlanner = () => ensure(KEYS.planner)
export const getTargets = () => ensure(KEYS.targets)
export const getProfile = () => ensure(KEYS.profile)
export const getMeta = () => ensure(KEYS.meta)

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`

// ---- Sessions (practice) ----
export function addSession(data) {
  const item = { id: uid(), created_at: new Date().toISOString(), ...data }
  persist(KEYS.sessions, [item, ...getSessions()])
  return item
}
export function updateSession(id, patch) {
  persist(KEYS.sessions, getSessions().map((s) => (s.id === id ? { ...s, ...patch } : s)))
}
export function deleteSession(id) {
  persist(KEYS.sessions, getSessions().filter((s) => s.id !== id))
}

// ---- Mocks / tests ----
export function addMock(data) {
  const item = { id: uid(), created_at: new Date().toISOString(), ...data }
  persist(KEYS.mocks, [item, ...getMocks()])
  return item
}
export function updateMock(id, patch) {
  persist(KEYS.mocks, getMocks().map((m) => (m.id === id ? { ...m, ...patch } : m)))
}
export function deleteMock(id) {
  persist(KEYS.mocks, getMocks().filter((m) => m.id !== id))
}

// ---- Planner ----
export function addPlannerItem(data) {
  const item = { id: uid(), google_event_id: null, ...data }
  persist(KEYS.planner, [...getPlanner(), item])
  return item
}
export function updatePlannerItem(id, patch) {
  persist(KEYS.planner, getPlanner().map((p) => (p.id === id ? { ...p, ...patch } : p)))
}
export function deletePlannerItem(id) {
  persist(KEYS.planner, getPlanner().filter((p) => p.id !== id))
}

// ---- Targets ----
export function setTargets(patch) {
  persist(KEYS.targets, { ...getTargets(), ...patch })
}

// ---- Profile ----
export function setProfile(patch) {
  persist(KEYS.profile, { ...getProfile(), ...patch })
}

// ---- Meta (user id, sync timestamps) ----
export function setMeta(patch) {
  persist(KEYS.meta, { ...getMeta(), ...patch })
}

// ---- Sync helpers (last-write-wins) ----
/** Snapshot of everything to push to the cloud. */
export function exportAll() {
  return {
    sessions: getSessions(),
    mocks: getMocks(),
    targets: getTargets(),
    planner: getPlanner(),
    profile: getProfile(),
    last_updated: getMeta().last_updated,
  }
}

/** Overwrite all local data from a cloud blob WITHOUT bumping last_updated
 *  (we adopt the cloud's timestamp so the two copies stay comparable). */
export function importAll(blob) {
  if (!blob) return
  if (blob.sessions) persist(KEYS.sessions, blob.sessions, { silentMeta: true })
  if (blob.mocks) persist(KEYS.mocks, blob.mocks, { silentMeta: true })
  if (blob.targets) persist(KEYS.targets, blob.targets, { silentMeta: true })
  if (blob.planner) persist(KEYS.planner, blob.planner, { silentMeta: true })
  if (blob.profile) persist(KEYS.profile, blob.profile, { silentMeta: true })
  setMeta({ last_updated: blob.last_updated || new Date().toISOString() })
}

/** Wipe everything (used on logout if desired — not called by default). */
export function clearAll() {
  Object.values(KEYS).forEach((k) => {
    localStorage.removeItem(k)
    cache[k] = clone(DEFAULTS[k])
  })
  emit()
}

// keep tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(KEYS).includes(e.key)) {
      cache[e.key] = load(e.key)
      emit()
    }
  })
}

// ---- React hooks ----
export const useSessions = () => useSyncExternalStore(subscribe, getSessions)
export const useMocks = () => useSyncExternalStore(subscribe, getMocks)
export const usePlanner = () => useSyncExternalStore(subscribe, getPlanner)
export const useTargets = () => useSyncExternalStore(subscribe, getTargets)
export const useProfile = () => useSyncExternalStore(subscribe, getProfile)
export const useMeta = () => useSyncExternalStore(subscribe, getMeta)
