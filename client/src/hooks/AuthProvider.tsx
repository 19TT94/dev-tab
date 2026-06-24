import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

// Hooks
import { AuthContext } from './useAuth'

// Utils
import { isMockMode } from '../lib/config'
import { supabase } from '../lib/supabase'

const MOCK_SESSION: Session = {
  access_token: 'mock',
  refresh_token: 'mock',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: 'mock-user-id',
    email: 'dev@localhost',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(
    isMockMode ? MOCK_SESSION : null,
  )
  const [loading, setLoading] = useState(!isMockMode)

  useEffect(() => {
    if (isMockMode) return

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isMockMode) {
      setSession({
        ...MOCK_SESSION,
        user: { ...MOCK_SESSION.user, email: email || 'dev@localhost' },
      })
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (isMockMode) {
      setSession(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
