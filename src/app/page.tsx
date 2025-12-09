'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (data.session) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-stone-black-1">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-accent"></div>
    </div>
  )
}