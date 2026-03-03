import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, AuthChangeEvent, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { checkAdminFromMetadata } from '../lib/admin'
import { getMyRole, type DashboardRole } from '../lib/adminUsers'

type User = SupabaseUser | null

interface AuthContextType {
  user: User
  loading: boolean
  role: DashboardRole
  isAdmin: boolean
  isSemiAdmin: boolean
  canAccessDashboard: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<DashboardRole>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setRole(null)
      return
    }
    let cancelled = false
    getMyRole().then((r) => {
      if (cancelled) return
      if (r) setRole(r)
      else if (checkAdminFromMetadata(user)) setRole('admin')
      else setRole(null)
    })
    return () => { cancelled = true }
  }, [user])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const isAdmin = role === 'admin'
  const isSemiAdmin = role === 'semi_admin'
  const canAccessDashboard = isAdmin || isSemiAdmin

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin, isSemiAdmin, canAccessDashboard, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

