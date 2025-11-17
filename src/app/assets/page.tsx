'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Client } from '@/lib/types'
import { getClients } from '@/lib/supabase/db'
import CardDemo1 from '@/components/cards-demo-1'
import CardDemo2 from '@/components/cards-demo-2'
import CardDemo3 from '@/components/cards-demo-3'

export default function AssetsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          fetchClients()
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <AnimatedGradientText className="text-3xl font-bold">
              Assets
            </AnimatedGradientText>
          </h1>
          <RainbowButton onClick={() => router.push('/clients')}>
            Manage Clients
          </RainbowButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client, index) => {
            // Rotate through different card demos
            const cardDemos = [CardDemo1, CardDemo2, CardDemo3]
            const CardComponent = cardDemos[index % 3]
            
            return (
              <div 
                key={client.id} 
                onClick={() => router.push(`/assets/${client.id}`)}
                className="cursor-pointer"
              >
                <CardComponent />
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}