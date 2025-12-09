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
  IconUsers,
  IconEye,
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
          <div className="text-text-primary">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Background for Apple-style grainy effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,29,33,0.8)_0%,rgba(10,10,12,0.95)_100%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ij48L3JlY3Q+PC9zdmc+')] opacity-10"></div>
      </div>
      
      <div className="space-y-6 relative z-10 animate-fadeInUp">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text-primary">Closed Clients</h1>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] flex items-center transition-all duration-300 hover:scale-105"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedClients.map((client) => (
            <Card key={client.id} className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-text-primary text-lg">{client.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      className="border-soft text-text-primary hover:bg-hover-surface rounded-[8px] h-8 px-2 transition-colors"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                      className="border-soft text-text-primary hover:bg-hover-surface rounded-[8px] h-8 px-2 transition-colors"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Videos/Month</span>
                    <span className="text-text-primary font-medium">{client.videosPerMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Charge/Video</span>
                    <span className="text-text-primary font-medium">${client.chargePerVideo}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-soft">
                    <span className="text-text-secondary text-sm">Monthly Revenue</span>
                    <span className="text-text-primary font-bold">${client.monthlyRevenue}</span>
                  </div>
                  <Button 
                    onClick={() => handleViewInvoices(client)}
                    className="w-full bg-hover-surface hover:bg-input-bg text-text-primary border border-soft rounded-[12px] flex items-center justify-center transition-all duration-300 hover:scale-[1.02]"
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
          <div className="text-center py-12 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone">
            <IconUsers className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-1">No closed clients</h3>
            <p className="text-text-secondary mb-6">Get started by adding a new client.</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-105"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Add New Client</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Add a new closed client to track their invoices and revenue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="client-name" className="text-text-primary text-sm font-medium">
                Client Name
              </label>
              <Input
                id="client-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow"
                placeholder="Enter client name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="videos-per-month" className="text-text-primary text-sm font-medium">
                  Videos per Month
                </label>
                <Input
                  id="videos-per-month"
                  type="number"
                  min="0"
                  value={newClient.videosPerMonth}
                  onChange={(e) => setNewClient({ ...newClient, videosPerMonth: e.target.value })}
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="charge-per-video" className="text-text-primary text-sm font-medium">
                  Charge per Video ($)
                </label>
                <Input
                  id="charge-per-video"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newClient.chargePerVideo}
                  onChange={(e) => setNewClient({ ...newClient, chargePerVideo: e.target.value })}
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-soft text-text-primary hover:bg-hover-surface rounded-[12px] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddClient}
              className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-105"
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Edit Client</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Update client information.
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-client-name" className="text-text-primary text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="edit-client-name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-videos-per-month" className="text-text-primary text-sm font-medium">
                    Videos per Month
                  </label>
                  <Input
                    id="edit-videos-per-month"
                    type="number"
                    min="0"
                    value={editingClient.videosPerMonth}
                    onChange={(e) => setEditingClient({ ...editingClient, videosPerMonth: parseInt(e.target.value) || 0 })}
                    className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-charge-per-video" className="text-text-primary text-sm font-medium">
                    Charge per Video ($)
                  </label>
                  <Input
                    id="edit-charge-per-video"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingClient.chargePerVideo}
                    onChange={(e) => setEditingClient({ ...editingClient, chargePerVideo: parseFloat(e.target.value) || 0 })}
                    className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-soft text-text-primary hover:bg-hover-surface rounded-[12px] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateClient}
              className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-105"
            >
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Invoice Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Upload Invoice</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Upload an invoice for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">
                Invoice File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-soft rounded-xl cursor-pointer bg-input-bg hover:bg-hover-surface transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <IconUpload className="w-8 h-8 mb-2 text-text-muted" />
                    <p className="text-sm text-text-muted">
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
              className="border-soft text-text-primary hover:bg-hover-surface rounded-[12px] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadInvoice}
              disabled={!selectedFile || uploading}
              className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone max-w-2xl mx-auto mt-20 !w-[80vw] !max-w-[1600px] !min-w-[70vw] h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Invoices for {selectedClient?.name}</DialogTitle>
            <DialogDescription className="text-text-secondary">
              View and manage invoices
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-soft">
                  <th className="text-left py-2 px-3 text-text-secondary font-medium text-sm">Date</th>
                  <th className="text-left py-2 px-3 text-text-secondary font-medium text-sm">File</th>
                  <th className="text-left py-2 px-3 text-text-secondary font-medium text-sm">Status</th>
                  <th className="text-left py-2 px-3 text-text-secondary font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-soft">
                    <td className="py-2 px-3 text-text-primary text-sm">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-text-primary text-sm">
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
                            className="bg-input-bg border-soft text-text-primary rounded-[8px] px-2 py-1 focus:ring-2 focus:ring-gold-glow"
                          >
                            <option value="pending" className="bg-stone-black-2">Pending</option>
                            <option value="paid" className="bg-stone-black-2">Paid</option>
                          </select>
                          <Button
                            onClick={() => handleUpdateInvoiceStatus(invoice.id, newStatus)}
                            className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[8px] h-8 px-2 transition-all duration-300 hover:scale-105"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingInvoiceId(null)}
                            className="border-soft text-text-primary hover:bg-hover-surface rounded-[8px] h-8 px-2 transition-colors"
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
                            className="border-soft text-text-primary hover:bg-hover-surface rounded-[8px] h-6 px-2 transition-colors"
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
                          className="border-soft text-text-primary hover:bg-hover-surface rounded-[8px] h-8 px-2 transition-colors"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="border-soft text-text-primary hover:bg-hover-surface rounded-[8px] h-8 px-2 transition-colors"
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
              <div className="text-center py-8 text-text-secondary">
                No invoices found
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setIsViewerOpen(false)}
              className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-105"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}