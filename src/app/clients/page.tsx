'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
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
  IconBrandTwitter,
  IconBrandLinkedin, 
  IconBrandTiktok,
  IconDots,
  IconMail,
  IconSearch,
  IconFilter,
  IconLink
} from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClientDetailModal } from '@/components/client-detail-modal'
import { ClientEditModal } from '@/components/client-edit-modal'

export default function ClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [leadTempFilter, setLeadTempFilter] = useState<string>('all')
  const [followUpStatusFilter, setFollowUpStatusFilter] = useState<string>('all')
  const [outreachTypeFilter, setOutreachTypeFilter] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const router = useRouter()

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data || [])
      setFilteredClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      // Check if it's an authentication error
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          console.error('Authentication error - redirecting to login')
          router.push('/login')
        }
      }
      // Set empty arrays on error to prevent crashes
      setClients([])
      setFilteredClients([])
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

  // Filter clients based on search and filters
  useEffect(() => {
    let result = [...clients]
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Apply lead temperature filter
    if (leadTempFilter !== 'all') {
      result = result.filter(client => client.lead_temp === leadTempFilter)
    }
    
    // Apply follow-up status filter
    if (followUpStatusFilter !== 'all' && followUpStatusFilter) {
      result = result.filter(client => client.follow_up_status === followUpStatusFilter)
    }
    
    // Apply outreach type filter
    if (outreachTypeFilter !== 'all' && outreachTypeFilter) {
      result = result.filter(client => client.outreach_type === outreachTypeFilter)
    }
    
    setFilteredClients(result)
  }, [searchTerm, leadTempFilter, followUpStatusFilter, outreachTypeFilter, clients])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    
    setDeletingId(id)
    try {
      await deleteClient(id)
      await fetchClients() // Refresh the client list
    } catch (error) {
      console.error('Error deleting client:', error)
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

  const getFollowUpStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-500'
    switch (status) {
      case 'Completed': return 'bg-green-500'
      case 'In Progress': return 'bg-yellow-500'
      case 'Not Started': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const isRecent = (date: string) => {
    const createdDate = new Date(date)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return createdDate > sevenDaysAgo
  }

  const formatSubscriberCount = (count: number | undefined | null) => {
    if (!count) return ''
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const toggleClientSelection = (id: string) => {
    setSelectedClients(prev => 
      prev.includes(id) 
        ? prev.filter(clientId => clientId !== id) 
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(client => client.id))
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setLeadTempFilter('all')
    setFollowUpStatusFilter('all')
    setOutreachTypeFilter('all')
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsDetailModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleSaveEditedClient = (updatedClient: Client) => {
    // Update the client in the local state
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
    )
    setFilteredClients(prevClients => 
      prevClients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
    )
    
    // If the selected client is the one being edited, update it
    if (selectedClient && selectedClient.id === updatedClient.id) {
      setSelectedClient(updatedClient)
    }
    
    setIsEditModalOpen(false)
    
    // Refresh the client list to ensure consistency
    fetchClients()
  }

  // Calculate KPIs
  const totalClients = clients.length
  const outreachesToday = clients.filter(client => 
    client.outreach_date && 
    new Date(client.outreach_date).toDateString() === new Date().toDateString()
  ).length
  const outreachesRemaining = Math.max(0, 3 - outreachesToday)
  const followUpsPending = clients.filter(client => 
    client.follow_up_status === 'Not Started' || 
    client.follow_up_status === 'In Progress'
  ).length
  const newLeads = clients.filter(client => isRecent(client.created_at)).length

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
          <button 
            onClick={() => router.push('/clients/new')}
            className="text-base text-violet-400 hover:text-violet-300 focus:outline-none focus:underline focus:underline-offset-2 focus:underline-violet-300 border-b border-violet-400/30 hover:border-violet-400 pb-1 transition-all"
          >
            Add New Client
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card 
            className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {}}
          >
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Clients</div>
              <div className="text-2xl font-bold">{totalClients}</div>
            </CardContent>
          </Card>
          <Card 
            className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {}}
          >
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Outreaches Today</div>
              <div className="text-2xl font-bold">{outreachesToday}</div>
            </CardContent>
          </Card>
          <Card 
            className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {}}
          >
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Outreaches Remaining</div>
              <div className="text-2xl font-bold">{outreachesRemaining} / 3</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className="bg-violet-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min((outreachesToday / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {
              setFollowUpStatusFilter('Not Started')
            }}
          >
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Follow-ups Pending</div>
              <div className="text-2xl font-bold">{followUpsPending}</div>
            </CardContent>
          </Card>
          <Card 
            className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {
              // Filter by recent clients
              const sevenDaysAgo = new Date()
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
              // This would require a more complex filter implementation
            }}
          >
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">New Leads</div>
              <div className="text-2xl font-bold">{newLeads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={leadTempFilter} onValueChange={setLeadTempFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Lead Temp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leads</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={followUpStatusFilter} onValueChange={setFollowUpStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Follow-up Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={outreachTypeFilter} onValueChange={setOutreachTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Outreach Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Cold Email">Cold Email</SelectItem>
                    <SelectItem value="Reedit">Reedit</SelectItem>
                    <SelectItem value="YT Jobs">YT Jobs</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar */}
        {selectedClients.length > 0 && (
          <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Send Bulk Email
                  </Button>
                  <Button variant="outline" size="sm">
                    Mark Follow-up Complete
                  </Button>
                  <Button variant="outline" size="sm">
                    Assign Tag
                  </Button>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clients Table */}
        <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No clients found. Add your first client!</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Socials</TableHead>
                      <TableHead>Lead Temp</TableHead>
                      <TableHead>Outreach</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className="hover:bg-card/50 transition-colors"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => toggleClientSelection(client.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <button 
                              onClick={() => {
                                setSelectedClient(client)
                                setIsDetailModalOpen(true)
                              }}
                              className="text-left hover:underline"
                            >
                              {client.name}
                            </button>
                            {isRecent(client.created_at) && (
                              <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                                New
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.subscriber_count ? formatSubscriberCount(client.subscriber_count) : ''}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {client.website ? (
                              <a 
                                href={client.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-violet-500 hover:text-violet-600"
                              >
                                <IconLink className="w-5 h-5" />
                              </a>
                            ) : (
                              <IconLink className="w-5 h-5 text-gray-400" />
                            )}
                            {client.youtube ? (
                              <a 
                                href={client.youtube} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-700"
                              >
                                <IconBrandYoutube className="w-5 h-5" />
                              </a>
                            ) : (
                              <IconBrandYoutube className="w-5 h-5 text-gray-400" />
                            )}
                            {client.twitter && (
                              <a 
                                href={client.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-500"
                              >
                                <IconBrandTwitter className="w-5 h-5" />
                              </a>
                            )}
                            {client.instagram && (
                              <a 
                                href={client.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-pink-500 hover:text-pink-600"
                              >
                                <IconBrandInstagram className="w-5 h-5" />
                              </a>
                            )}
                            {client.linkedin && (
                              <a 
                                href={client.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <IconBrandLinkedin className="w-5 h-5" />
                              </a>
                            )}
                            {client.tiktok && (
                              <a 
                                href={client.tiktok} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-gray-700"
                              >
                                <IconBrandTiktok className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLeadTempColor(client.lead_temp)}>
                            {client.lead_temp}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {client.outreach_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {client.outreach_date ? new Date(client.outreach_date).toLocaleDateString() : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFollowUpStatusColor(client.follow_up_status || undefined)}>
                            {client.follow_up_status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {client.follow_up_count}
                        </TableCell>
                        <TableCell>
                          {client.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <IconDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedClient(client)
                                setIsDetailModalOpen(true)
                              }}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Send Link
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(client.id)}
                                disabled={deletingId === client.id}
                              >
                                {deletingId === client.id ? 'Deleting...' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ClientDetailModal 
        client={selectedClient} 
        open={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditClient}
      />
      <ClientEditModal
        client={selectedClient}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedClient}
      />
    </DashboardLayout>
  )
}