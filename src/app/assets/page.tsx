'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { getClosedClients, addClosedClient } from '@/lib/supabase/db'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

// Define type for closed client
interface ClosedClient {
  id: string
  name: string
  videosPerMonth: number
  chargePerVideo: number
  monthlyRevenue: number
  created_at: string
}

export default function ClosedClientsPage() {
  const [loading, setLoading] = useState(true)
  const [closedClients, setClosedClients] = useState<ClosedClient[]>([])
  const [formData, setFormData] = useState({
    name: '',
    videosPerMonth: 0,
    chargePerVideo: 0
  })
  const [calculatedRevenue, setCalculatedRevenue] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          fetchClosedClients()
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

  const fetchClosedClients = async () => {
    try {
      const data = await getClosedClients()
      setClosedClients(data)
    } catch (error) {
      console.error('Error fetching closed clients:', error)
      // Show error in UI instead of toast
      alert('Failed to fetch closed clients. Please make sure the closedClients table exists in your database.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }))
  }

  const calculateRevenue = () => {
    const revenue = formData.videosPerMonth * formData.chargePerVideo
    setCalculatedRevenue(revenue)
  }

  const saveClient = async () => {
    if (!formData.name || formData.videosPerMonth <= 0 || formData.chargePerVideo <= 0) {
      alert('Please fill all fields with valid values')
      return
    }

    try {
      await addClosedClient({
        name: formData.name,
        videosPerMonth: formData.videosPerMonth,
        chargePerVideo: formData.chargePerVideo
      })
      
      alert('Client added to closed list!')
      
      // Reset form
      setFormData({
        name: '',
        videosPerMonth: 0,
        chargePerVideo: 0
      })
      setCalculatedRevenue(null)
      
      // Refresh the client list
      fetchClosedClients()
    } catch (error) {
      console.error('Error saving client:', error)
      // Check if it's a table doesn't exist error
      if (error instanceof Error && error.message.includes('relation "closedClients" does not exist')) {
        alert('The closedClients table does not exist in your database. Please run the DATABASE.sql script in your Supabase SQL editor.')
      } else {
        alert('Failed to save client. Please try again.')
      }
    }
  }

  const totalMonthlyRevenue = closedClients.reduce((sum, client) => sum + client.monthlyRevenue, 0)

  // Sort clients by monthly revenue (highest first)
  const sortedClients = [...closedClients].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)

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
        <div>
          <h1 className="text-3xl font-bold">
            <AnimatedGradientText className="text-3xl font-bold">
              Closed Clients
            </AnimatedGradientText>
          </h1>
          <p className="text-muted-foreground mt-1">Confirmed clients & monthly revenue overview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Closed Client Form */}
          <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg font-semibold">Add Closed Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  className="bg-background/20 border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Videos per Month</label>
                  <Input
                    type="number"
                    name="videosPerMonth"
                    value={formData.videosPerMonth || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-background/20 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Charge per Video ($)</label>
                  <Input
                    type="number"
                    name="chargePerVideo"
                    value={formData.chargePerVideo || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-background/20 border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={calculateRevenue}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  Calculate Monthly Revenue
                </Button>

                <Button 
                  onClick={saveClient}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Save Client
                </Button>
              </div>

              {calculatedRevenue !== null && (
                <div className="p-3 bg-violet-900/20 rounded-lg border border-violet-500/30">
                  <p className="text-sm text-muted-foreground">Calculated Monthly Revenue</p>
                  <p className="text-xl font-bold text-violet-300">${calculatedRevenue.toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Revenue Leaderboard */}
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Monthly Revenue</p>
                    <p className="text-2xl font-bold text-violet-300">${totalMonthlyRevenue.toLocaleString()}</p>
                  </div>
                  <Badge variant="secondary" className="bg-violet-900/30 text-violet-300">
                    {closedClients.length} Clients
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Table */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg font-semibold">Monthly Revenue Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No closed clients yet. Add your first client!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Client Name</TableHead>
                        <TableHead className="text-muted-foreground">Videos/Month</TableHead>
                        <TableHead className="text-muted-foreground">Charge/Video</TableHead>
                        <TableHead className="text-muted-foreground">Monthly Revenue</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedClients.map((client) => (
                        <TableRow 
                          key={client.id} 
                          className="hover:bg-white/5 border-white/5"
                        >
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.videosPerMonth}</TableCell>
                          <TableCell>${client.chargePerVideo.toLocaleString()}</TableCell>
                          <TableCell className="font-bold text-violet-300">
                            ${client.monthlyRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                              Closed Client
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}