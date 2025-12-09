'use client'

import { useEffect, useState } from 'react'
import { getClosedClients } from '@/lib/supabase/db'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ClosedClient } from '@/lib/types'

export default function TestClosedClients() {
  const [closedClients, setClosedClients] = useState<ClosedClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClosedClients = async () => {
      try {
        console.log('Fetching closed clients...')
        const data = await getClosedClients()
        console.log('Closed clients data:', data)
        setClosedClients(data)
      } catch (err) {
        console.error('Error fetching closed clients:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchClosedClients()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-text-primary">Loading...</h1>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Test Closed Clients</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Error</h2>
            <p className="text-text-primary">{error}</p>
          </div>
        )}
        
        <div className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-lg p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Closed Clients Count: {closedClients.length}</h2>
          
          {closedClients.length > 0 ? (
            <div className="space-y-2">
              {closedClients.map((client) => (
                <div key={client.id} className="bg-input-bg border border-soft rounded-lg p-3">
                  <p className="text-text-primary">Name: {client.name}</p>
                  <p className="text-text-primary">Videos per Month: {client.videosPerMonth}</p>
                  <p className="text-text-primary">Charge per Video: ${client.chargePerVideo}</p>
                  <p className="text-text-primary">Monthly Revenue: ${client.monthlyRevenue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No closed clients found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}