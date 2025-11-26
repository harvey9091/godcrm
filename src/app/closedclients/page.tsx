'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { getClosedClients, addClosedClient, deleteClosedClient, updateClosedClient, getInvoicesByClientId, createInvoice, deleteInvoice, updateInvoice } from '@/lib/supabase/db'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  IconPlus, 
  IconFileInvoice, 
  IconUpload, 
  IconTrash, 
  IconDownload,
  IconUsers,
  IconTrendingUp,
  IconEye,
  IconFile,
  IconPdf,
  IconEdit
} from '@tabler/icons-react'
import { Invoice } from '@/lib/types'

// Define the ClosedClient type
interface ClosedClient {
  id: string
  created_by: string
  name: string
  videosPerMonth: number
  chargePerVideo: number
  monthlyRevenue: number
  created_at: string
}

export default function ClosedClientsPage() {
  const [loading, setLoading] = useState(true)
  const [closedClients, setClosedClients] = useState<ClosedClient[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedClient, setSelectedClient] = useState<ClosedClient | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    videosPerMonth: '',
    chargePerVideo: ''
  })
  const [editingClient, setEditingClient] = useState<ClosedClient | null>(null)
  
  // Add new state for editing invoice status
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<'pending' | 'paid'>('pending')
  
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await getSession()
        if (!session) {
          router.push('/login')
          return
        }
        
        // Fetch closed clients data
        const clientsData = await getClosedClients()
        setClosedClients(clientsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Failed to fetch closed clients. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadInvoice = async () => {
    if (!selectedClient || !selectedFile) return
    
    setUploading(true)
    try {
      // In a real implementation, you would upload the file to storage and save the URL to the database
      // For now, we'll just simulate the upload and create a mock invoice record
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate upload delay
      
      const invoiceData = {
        client_id: selectedClient.id,
        amount: 0, // Will be determined from the invoice
        description: `Invoice for ${selectedClient.name}`,
        videos_count: 0, // Will be determined from the invoice
        status: 'pending' as 'pending' | 'paid',
        file_url: URL.createObjectURL(selectedFile), // In real implementation, this would be the storage URL
        month: new Date().toISOString().slice(0, 7) // YYYY-MM format
      }
      
      const createdInvoice = await createInvoice(invoiceData)
      setInvoices([...invoices, createdInvoice])
      setIsUploadModalOpen(false)
      setSelectedFile(null)
    } catch (error) {
      console.error('Error uploading invoice:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      // Check if the error is related to the invoices table not existing
      if (errorMessage.includes('invoices table does not exist')) {
        alert(`Failed to upload invoice: ${errorMessage} Please run the create-invoices-table.sql script in your Supabase SQL editor to create the required table.`)
      } else {
        alert(`Failed to upload invoice: ${errorMessage}`)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleViewInvoices = async (client: ClosedClient) => {
    setSelectedClient(client)
    try {
      const clientInvoices = await getInvoicesByClientId(client.id)
      setInvoices(clientInvoices || [])
      setIsViewerOpen(true)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      // Check if the error is related to the invoices table not existing
      if (errorMessage.includes('invoices table does not exist')) {
        alert(`Failed to fetch invoices: ${errorMessage} Please run the create-invoices-table.sql script in your Supabase SQL editor to create the required table.`)
      } else {
        alert(`Failed to fetch invoices: ${errorMessage}`)
      }
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    try {
      await deleteInvoice(invoiceId)
      setInvoices(invoices.filter(inv => inv.id !== invoiceId))
    } catch (error) {
      console.error('Error deleting invoice:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      // Check if the error is related to the invoices table not existing
      if (errorMessage.includes('invoices table does not exist')) {
        alert(`Failed to delete invoice: ${errorMessage} Please run the create-invoices-table.sql script in your Supabase SQL editor to create the required table.`)
      } else {
        alert(`Failed to delete invoice: ${errorMessage}`)
      }
    }
  }

  const handleViewInvoiceFile = (fileUrl: string) => {
    // In a real implementation, you would open the PDF in a viewer
    // For now, we'll just open it in a new tab
    window.open(fileUrl, '_blank')
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.videosPerMonth || !newClient.chargePerVideo) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      const clientData = {
        name: newClient.name,
        videosPerMonth: parseInt(newClient.videosPerMonth),
        chargePerVideo: parseInt(newClient.chargePerVideo)
      }
      
      const createdClient = await addClosedClient(clientData)
      setClosedClients([createdClient, ...closedClients])
      setIsAddModalOpen(false)
      setNewClient({
        name: '',
        videosPerMonth: '',
        chargePerVideo: ''
      })
    } catch (error) {
      console.error('Error adding client:', error)
      alert(`Failed to add client: ${(error as Error).message || 'Please try again.'}`)
    }
  }

  const handleEditClient = (client: ClosedClient) => {
    setEditingClient(client)
    setIsEditModalOpen(true)
  }

  const handleUpdateClient = async () => {
    if (!editingClient) return
    
    try {
      const updatedClient = await updateClosedClient(editingClient.id, {
        name: editingClient.name,
        videosPerMonth: editingClient.videosPerMonth,
        chargePerVideo: editingClient.chargePerVideo
      })
      
      setClosedClients(closedClients.map(client => 
        client.id === editingClient.id ? updatedClient : client
      ))
      setIsEditModalOpen(false)
      setEditingClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      alert(`Failed to update client: ${(error as Error).message || 'Please try again.'}`)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated invoices.')) return
    
    try {
      await deleteClosedClient(clientId)
      setClosedClients(closedClients.filter(client => client.id !== clientId))
    } catch (error) {
      console.error('Error deleting client:', error)
      alert(`Failed to delete client: ${(error as Error).message || 'Please try again.'}`)
    }
  }

  // Add function to update invoice status
  const handleUpdateInvoiceStatus = async (invoiceId: string, status: 'pending' | 'paid') => {
    try {
      // Use the existing updateInvoice function from db.ts
      const updatedInvoice = await updateInvoice(invoiceId, { status })
      
      // Update the invoices state with the updated invoice
      setInvoices(invoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv))
      setEditingInvoiceId(null)
    } catch (error) {
      console.error('Error updating invoice status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      alert(`Failed to update invoice status: ${errorMessage}`)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Closed Clients</h1>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] flex items-center"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedClients.map((client) => (
            <Card key={client.id} className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-[18px] overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{client.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      className="border-white/20 text-white hover:bg-white/10 rounded-[8px] h-8 px-2"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                      className="border-white/20 text-white hover:bg-white/10 rounded-[8px] h-8 px-2"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Videos/Month</span>
                    <span className="text-white font-medium">{client.videosPerMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Charge/Video</span>
                    <span className="text-white font-medium">${client.chargePerVideo}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white/70 text-sm">Monthly Revenue</span>
                    <span className="text-white font-bold">${client.monthlyRevenue}</span>
                  </div>
                  <Button 
                    onClick={() => handleViewInvoices(client)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-[12px] flex items-center justify-center"
                  >
                    <IconFileInvoice className="h-4 w-4 mr-2" />
                    View Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {closedClients.length === 0 && (
          <div className="text-center py-12">
            <IconUsers className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No closed clients</h3>
            <p className="text-white/60 mb-6">Get started by adding a new client.</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Client</DialogTitle>
            <DialogDescription className="text-white/70">
              Add a new closed client to track their invoices and revenue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="client-name" className="text-white text-sm font-medium">
                Client Name
              </label>
              <Input
                id="client-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                placeholder="Enter client name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="videos-per-month" className="text-white text-sm font-medium">
                  Videos per Month
                </label>
                <Input
                  id="videos-per-month"
                  type="number"
                  min="0"
                  value={newClient.videosPerMonth}
                  onChange={(e) => setNewClient({ ...newClient, videosPerMonth: e.target.value })}
                  className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="charge-per-video" className="text-white text-sm font-medium">
                  Charge per Video ($)
                </label>
                <Input
                  id="charge-per-video"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newClient.chargePerVideo}
                  onChange={(e) => setNewClient({ ...newClient, chargePerVideo: e.target.value })}
                  className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddClient}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Client</DialogTitle>
            <DialogDescription className="text-white/70">
              Update client information.
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-client-name" className="text-white text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="edit-client-name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-videos-per-month" className="text-white text-sm font-medium">
                    Videos per Month
                  </label>
                  <Input
                    id="edit-videos-per-month"
                    type="number"
                    min="0"
                    value={editingClient.videosPerMonth}
                    onChange={(e) => setEditingClient({ ...editingClient, videosPerMonth: parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-charge-per-video" className="text-white text-sm font-medium">
                    Charge per Video ($)
                  </label>
                  <Input
                    id="edit-charge-per-video"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingClient.chargePerVideo}
                    onChange={(e) => setEditingClient({ ...editingClient, chargePerVideo: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateClient}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Invoice Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Invoice</DialogTitle>
            <DialogDescription className="text-white/70">
              Upload an invoice for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">
                Invoice File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <IconUpload className="w-8 h-8 mb-2 text-white/50" />
                    <p className="text-sm text-white/50">
                      {selectedFile ? selectedFile.name : 'Click to upload invoice'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadInvoice}
              disabled={!selectedFile || uploading}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              {uploading ? 'Uploading...' : 'Upload Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-2xl mx-auto mt-20 !w-[80vw] !max-w-[1600px] !min-w-[70vw] h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-white">Invoices for {selectedClient?.name}</DialogTitle>
            <DialogDescription className="text-white/70">
              View and manage invoices
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-white/80 font-medium text-sm">Date</th>
                  <th className="text-left py-2 px-3 text-white/80 font-medium text-sm">File</th>
                  <th className="text-left py-2 px-3 text-white/80 font-medium text-sm">Status</th>
                  <th className="text-left py-2 px-3 text-white/80 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5">
                    <td className="py-2 px-3 text-white text-sm">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-white text-sm">
                      <div className="flex items-center">
                        <IconPdf className="h-4 w-4 mr-2 text-red-400" />
                        Invoice.pdf
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      {editingInvoiceId === invoice.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as 'pending' | 'paid')}
                            className="bg-white/10 border-white/10 text-white rounded-[8px] px-2 py-1"
                          >
                            <option value="pending" className="bg-gray-800">Pending</option>
                            <option value="paid" className="bg-gray-800">Paid</option>
                          </select>
                          <Button
                            onClick={() => handleUpdateInvoiceStatus(invoice.id, newStatus)}
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-[8px] h-8 px-2"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingInvoiceId(null)}
                            className="border-white/20 text-white hover:bg-white/10 rounded-[8px] h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            invoice.status === 'paid' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {invoice.status}
                          </span>
                          <Button
                            onClick={() => {
                              setEditingInvoiceId(invoice.id)
                              setNewStatus(invoice.status as 'pending' | 'paid')
                            }}
                            className="border-white/20 text-white hover:bg-white/10 rounded-[8px] h-6 px-2"
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewInvoiceFile(invoice.file_url)}
                          className="border-white/20 text-white hover:bg-white/10 rounded-[8px] h-8 px-2"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="border-white/20 text-white hover:bg-white/10 rounded-[8px] h-8 px-2"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {invoices.length === 0 && (
              <div className="text-center py-8 text-white/60">
                No invoices found
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsViewerOpen(false)}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}