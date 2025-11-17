'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getSession, signOut as supabaseSignOut } from '@/lib/supabase/auth'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await getSession()
        if (session) {
          const { data: { user } } = await getUser()
          setUser(user)
        }
      } catch (error) {
        console.debug('Error checking user session:', error)
        // Intentionally ignoring error as it's expected when not authenticated
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const signOut = async () => {
    try {
      await supabaseSignOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}