'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { getClients, deleteClient } from '@/lib/supabase/db'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { ClientDetailModal } from '@/components/client-detail-modal'
import { ClientEditModal } from '@/components/client-edit-modal'
import { 
  IconUsers, 
  IconSearch, 
  IconFilter, 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle
} from '@tabler/icons-react'
import { Client } from '@/lib/types'

export default function ClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [leadTempFilter, setLeadTempFilter] = useState<string>('all')
  const [followUpStatusFilter, setFollowUpStatusFilter] = useState<string>('all')
  const [outreachTypeFilter, setOutreachTypeFilter] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const router = useRouter()

  // Filter clients based on search and filter criteria
  useEffect(() => {
    let result = [...clients]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(client => 
        client.name.toLowerCase().includes(term) || 
        client.email.toLowerCase().includes(term) ||
        (client.company && client.company.toLowerCase().includes(term))
      )
    }
    
    // Apply lead temp filter
    if (leadTempFilter !== 'all') {
      result = result.filter(client => client.lead_temp === leadTempFilter)
    }
    
    // Apply follow-up status filter
    if (followUpStatusFilter !== 'all') {
      result = result.filter(client => client.follow_up_status === followUpStatusFilter)
    }
    
    // Apply outreach type filter
    if (outreachTypeFilter !== 'all') {
      result = result.filter(client => client.outreach_type === outreachTypeFilter)
    }
    
    setFilteredClients(result)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [clients, searchTerm, leadTempFilter, followUpStatusFilter, outreachTypeFilter])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await getSession()
        if (!session) {
          router.push('/login')
          return
        }
        
        const clientData = await getClients()
        setClients(clientData || [])
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleDeleteClient = async (client: Client) => {
    setClientToDelete(client)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return
    
    try {
      setDeletingId(clientToDelete.id)
      await deleteClient(clientToDelete.id)
      setClients(clients.filter(c => c.id !== clientToDelete.id))
      setDeleteConfirmOpen(false)
      setClientToDelete(null)
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setIsDetailModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleClientUpdated = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c))
    if (selectedClient && selectedClient.id === updatedClient.id) {
      setSelectedClient(updatedClient)
    }
  }

  // Pagination logic
  const indexOfLastClient = currentPage * itemsPerPage
  const indexOfFirstClient = indexOfLastClient - itemsPerPage
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient)
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)))
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Leads</h1>
            <p className="text-white/70 mt-1">Manage your client leads and prospects</p>
          </div>
          <Button 
            onClick={() => router.push('/clients/new')}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] flex items-center"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>

        {/* Search and Filters Section - Added proper spacing */}
        <div className="space-y-6">
          {/* Search Bar */}
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <Input
                  placeholder="Search clients by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Filters Section */}
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <IconFilter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Lead Temperature</label>
                  <Select value={leadTempFilter} onValueChange={setLeadTempFilter}>
                    <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[12px] h-10">
                      <SelectValue placeholder="Select temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Temperatures</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Follow-up Status</label>
                  <Select value={followUpStatusFilter} onValueChange={setFollowUpStatusFilter}>
                    <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[12px] h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">Outreach Type</label>
                  <Select value={outreachTypeFilter} onValueChange={setOutreachTypeFilter}>
                    <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[12px] h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Cold Email">Cold Email</SelectItem>
                      <SelectItem value="Reedit">Reedit</SelectItem>
                      <SelectItem value="YT Jobs">YT Jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients List Section */}
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg">
            <CardHeader className="pb-3 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <IconUsers className="mr-2 h-5 w-5" />
                  All Clients
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/70">
                    {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {currentClients.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 text-white/80 font-medium text-sm">Client</th>
                          <th className="text-left py-3 px-2 text-white/80 font-medium text-sm">Status</th>
                          <th className="text-left py-3 px-2 text-white/80 font-medium text-sm">Lead Temp</th>
                          <th className="text-left py-3 px-2 text-white/80 font-medium text-sm">Follow-up</th>
                          <th className="text-left py-3 px-2 text-white/80 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentClients.map((client) => (
                          <tr key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-2">
                              <div>
                                <div className="font-medium text-white">{client.name}</div>
                                <div className="text-sm text-white/70">{client.email}</div>
                                {client.company && (
                                  <div className="text-sm text-white/60">{client.company}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                client.status === 'active' ? 'bg-green-100/20 text-green-300' :
                                client.status === 'ongoing' ? 'bg-blue-100/20 text-blue-300' :
                                client.status === 'closed' ? 'bg-purple-100/20 text-purple-300' :
                                'bg-gray-100/20 text-gray-300'
                              }`}>
                                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                client.lead_temp === 'hot' ? 'bg-red-100/20 text-red-300' :
                                client.lead_temp === 'warm' ? 'bg-yellow-100/20 text-yellow-300' :
                                'bg-blue-100/20 text-blue-300'
                              }`}>
                                {client.lead_temp.charAt(0).toUpperCase() + client.lead_temp.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-sm text-white/70">
                                {client.follow_up_status || 'N/A'}
                              </div>
                              {client.next_follow_up_date && (
                                <div className="text-xs text-white/60">
                                  Next: {new Date(client.next_follow_up_date).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClient(client)}
                                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  <IconEye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClient(client)}
                                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClient(client)}
                                  disabled={deletingId === client.id}
                                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  {deletingId === client.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <IconTrash className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white/70">Items per page:</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[12px] h-8 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border-white/20 text-white hover:bg-white/10 rounded-[12px] h-8 w-8 p-0"
                        >
                          <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="border-white/20 text-white hover:bg-white/10 rounded-[12px] h-8 w-8 p-0"
                        >
                          <IconChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <IconUsers className="mx-auto h-12 w-12 text-white/30 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-1">No clients found</h3>
                  <p className="text-white/70 mb-4">
                    {clients.length > 0 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Get started by adding your first client'}
                  </p>
                  {clients.length === 0 && (
                    <Button 
                      onClick={() => router.push('/clients/new')}
                      className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Your First Client
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setIsDetailModalOpen(false)
            setIsEditModalOpen(true)
          }}
        />
      )}

      {/* Client Edit Modal */}
      {selectedClient && (
        <ClientEditModal
          client={selectedClient}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleClientUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {clientToDelete && (
              <div className="flex items-center p-3 rounded-lg bg-white/5 border border-white/10">
                <IconAlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <div className="font-medium text-white">{clientToDelete.name}</div>
                  <div className="text-sm text-white/70">{clientToDelete.email}</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteClient}
              className="bg-red-600 hover:bg-red-700 text-white rounded-[12px]"
            >
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}