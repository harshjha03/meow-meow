import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, signInWithGoogle, signOut as sbSignOut } from '../lib/supabase'
import { setMeta } from '../lib/storage'
import { startAutoSync } from '../lib/sync'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  // load + watch the auth session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const user = session?.user ?? null

  // start/stop background sync with the logged-in user
  useEffect(() => {
    if (!user) return
    setMeta({ user_id: user.id })
    const stop = startAutoSync(user.id)
    return stop
  }, [user?.id])

  const value = {
    user,
    session,
    loading,
    configured: isSupabaseConfigured,
    signIn: signInWithGoogle,
    signOut: sbSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
