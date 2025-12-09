'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (data.session) {
          setAuthenticated(true)
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-black-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-accent"></div>
      </div>
    )
  }

  return authenticated ? <>{children}</> : null
}