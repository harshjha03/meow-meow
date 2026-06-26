import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, signInWithGoogle, signOut as sbSignOut } from '../lib/supabase'
import { setMeta } from '../lib/storage'
import { startAutoSync } from '../lib/sync'
import { isDemoLoggedIn, DEMO_USER, setDemoLoggedIn } from '../lib/demo'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  // DEV-only "preview signed-in" state (see lib/demo.js)
  const [demo, setDemo] = useState(() => import.meta.env.DEV && isDemoLoggedIn())

  // load + watch the real auth session
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
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // watch the demo toggle (DEV only)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const h = () => setDemo(isDemoLoggedIn())
    window.addEventListener('cat-demo-auth', h)
    return () => window.removeEventListener('cat-demo-auth', h)
  }, [])

  const realUser = session?.user ?? null
  const user = realUser ?? (import.meta.env.DEV && demo ? DEMO_USER : null)

  // background sync only for a REAL signed-in user (never the demo user)
  useEffect(() => {
    const id = realUser?.id
    if (!id) return
    setMeta({ user_id: id })
    return startAutoSync(id)
  }, [realUser?.id])

  const signOut = async () => {
    if (import.meta.env.DEV) setDemoLoggedIn(false)
    await sbSignOut()
  }

  const value = {
    user,
    session,
    loading,
    configured: isSupabaseConfigured,
    signIn: signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
