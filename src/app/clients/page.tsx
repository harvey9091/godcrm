'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Client } from '@/lib/types'
import { getClients, deleteClient } from '@/lib/supabase/db'
import { 
  IconEdit, 
  IconTrash, 
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandTiktok 
} from '@tabler/icons-react'

export default function ClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
      // Show user-friendly error message
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          await fetchClients()
        }
      } catch (error) {
        console.debug('Authentication check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, fetchClients])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    
    setDeletingId(id)
    try {
      await deleteClient(id)
      await fetchClients() // Refresh the client list
    } catch (error) {
      console.error('Error deleting client:', error)
      // Show user-friendly error message
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'ongoing': return 'bg-blue-500'
      case 'closed': return 'bg-yellow-500'
      case 'dead': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getLeadTempColor = (leadTemp: string) => {
    switch (leadTemp) {
      case 'hot': return 'bg-red-500'
      case 'warm': return 'bg-orange-500'
      case 'cold': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const isRecent = (date: string) => {
    const createdDate = new Date(date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdDate > thirtyDaysAgo
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
              Clients
            </AnimatedGradientText>
          </h1>
          <RainbowButton onClick={() => router.push('/clients/new')}>
            Add New Client
          </RainbowButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No clients found. Add your first client!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lead Temp</TableHead>
                    <TableHead>Socials</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLeadTempColor(client.lead_temp)}>
                          {client.lead_temp}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {client.youtube && (
                            <a href={client.youtube} target="_blank" rel="noopener noreferrer">
                              <IconBrandYoutube className="w-5 h-5 text-red-600" />
                            </a>
                          )}
                          {client.instagram && (
                            <a href={client.instagram} target="_blank" rel="noopener noreferrer">
                              <IconBrandInstagram className="w-5 h-5 text-pink-500" />
                            </a>
                          )}
                          {client.linkedin && (
                            <a href={client.linkedin} target="_blank" rel="noopener noreferrer">
                              <IconBrandLinkedin className="w-5 h-5 text-blue-600" />
                            </a>
                          )}
                          {client.tiktok && (
                            <a href={client.tiktok} target="_blank" rel="noopener noreferrer">
                              <IconBrandTiktok className="w-5 h-5 text-black" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(client.created_at).toLocaleDateString()}
                        {isRecent(client.created_at) && (
                          <Badge variant="secondary" className="ml-2">
                            Recent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/clients/${client.id}`)}
                          >
                            <IconEdit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(client.id)}
                            disabled={deletingId === client.id}
                          >
                            {deletingId === client.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                              <IconTrash className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}