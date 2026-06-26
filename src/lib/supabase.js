// Supabase client. Created only if env vars are present — otherwise the whole
// auth/sync layer is inert and the app runs offline on localStorage alone.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

// Scope needed to create Google Calendar events on the user's behalf.
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: CALENDAR_SCOPE,
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/** Google access token from the active session (used for Calendar API). */
export async function getProviderToken() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data?.session?.provider_token || null
}
