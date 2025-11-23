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
          <h1 className="text-2xl font-bold text-white">Loading...</h1>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Test Closed Clients</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-white mb-2">Error</h2>
            <p className="text-white">{error}</p>
          </div>
        )}
        
        <div className="bg-white/10 border border-white/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-2">Closed Clients Count: {closedClients.length}</h2>
          
          {closedClients.length > 0 ? (
            <div className="space-y-2">
              {closedClients.map((client) => (
                <div key={client.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white">Name: {client.name}</p>
                  <p className="text-white">Videos per Month: {client.videosPerMonth}</p>
                  <p className="text-white">Charge per Video: ${client.chargePerVideo}</p>
                  <p className="text-white">Monthly Revenue: ${client.monthlyRevenue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70">No closed clients found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}