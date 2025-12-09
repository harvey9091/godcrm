'use client'

import { SignupForm } from "@/components/signup-form"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSession } from '@/lib/supabase/auth'

export default function Page() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await getSession()
        if (data.session) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        // Move setIsMounted to the finally block to avoid setState in effect
        setIsMounted(true)
      }
    }

    checkSession()
  }, [router])

  if (!isMounted) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-stone-black-1">
        <div className="w-full max-w-sm">
          <div className="h-96 animate-pulse bg-stone-grey-deep rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-stone-black-1">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}