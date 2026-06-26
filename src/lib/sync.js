// Batch sync to Supabase. localStorage stays the source of truth; we push the
// whole data blob and resolve conflicts by last-write-wins on `last_updated`.
//
// Cloud table (see supabase/schema.sql):
//   cat_data(user_id uuid pk, data jsonb, last_updated timestamptz)
import { supabase, isSupabaseConfigured } from './supabase'
import { exportAll, importAll, getMeta } from './storage'

const TABLE = 'cat_data'
const SYNC_INTERVAL_MS = 60 * 60 * 1000 // 60 minutes

let listeners = { status: new Set() }
let lastSyncAt = null
let syncing = false

export function onSyncStatus(cb) {
  listeners.status.add(cb)
  return () => listeners.status.delete(cb)
}
function emitStatus(state) {
  listeners.status.forEach((fn) => fn({ state, at: lastSyncAt }))
}

export function getLastSyncAt() {
  return lastSyncAt
}

/** Push the full local blob to the cloud. */
export async function push(userId) {
  if (!isSupabaseConfigured || !userId || syncing) return
  syncing = true
  emitStatus('syncing')
  try {
    const blob = exportAll()
    const last_updated = blob.last_updated || new Date().toISOString()
    const { error } = await supabase
      .from(TABLE)
      .upsert({ user_id: userId, data: { ...blob, last_updated }, last_updated }, { onConflict: 'user_id' })
    if (error) throw error
    lastSyncAt = new Date().toISOString()
    emitStatus('synced')
  } catch (err) {
    console.warn('[sync] push failed:', err.message)
    emitStatus('error')
  } finally {
    syncing = false
  }
}

/** Pull from the cloud and reconcile (last-write-wins). */
export async function pull(userId) {
  if (!isSupabaseConfigured || !userId) return
  emitStatus('syncing')
  try {
    const { data: row, error } = await supabase
      .from(TABLE)
      .select('data, last_updated')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error

    const localUpdated = getMeta().last_updated
    if (!row) {
      // first device for this user → seed the cloud with local data
      await push(userId)
      return
    }
    const remoteUpdated = row.last_updated || row.data?.last_updated || null
    const remoteNewer = remoteUpdated && (!localUpdated || remoteUpdated > localUpdated)
    if (remoteNewer) {
      importAll({ ...row.data, last_updated: remoteUpdated })
      lastSyncAt = new Date().toISOString()
      emitStatus('synced')
    } else {
      // local is newer (or equal) → make the cloud match
      await push(userId)
    }
  } catch (err) {
    console.warn('[sync] pull failed:', err.message)
    emitStatus('error')
  }
}

/** Start background sync for a logged-in user. Returns a cleanup function. */
export function startAutoSync(userId) {
  if (!isSupabaseConfigured || !userId) return () => {}

  // initial reconcile
  pull(userId)

  const interval = setInterval(() => push(userId), SYNC_INTERVAL_MS)

  const onHide = () => {
    if (document.visibilityState === 'hidden') push(userId)
  }
  const onOnline = () => push(userId)

  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('online', onOnline)

  return () => {
    clearInterval(interval)
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('online', onOnline)
  }
}
