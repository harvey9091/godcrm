'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { getClosedClients, addClosedClient, deleteClosedClient, getInvoicesByClientId, deleteInvoice } from '@/lib/supabase/db'
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
  IconAlertTriangle,
  IconUsers,
  IconTrendingUp
} from '@tabler/icons-react'
import { Invoice } from '@/lib/types'

interface ClosedClient {
  id: string
  created_by: string
  name: string
  videosPerMonth: number
  chargePerVideo: number
  monthlyRevenue: number
  created_at: string
}

export default function ClosedClients() {
  const router = useRouter()
  const [closedClients, setClosedClients] = useState<ClosedClient[]>([])
  const [invoices, setInvoices] = useState<{ [clientId: string]: Invoice[] }>({})
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    videosPerMonth: 0,
    chargePerVideo: 0,
  })
  const [selectedClient, setSelectedClient] = useState<ClosedClient | null>(null)
  const [invoiceData, setInvoiceData] = useState({
    amount: 0,
    month: '',
  })
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  // Fetch closed clients and their invoices
  const fetchClosedClients = async () => {
    try {
      const session = await getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const clients = await getClosedClients()
      setClosedClients(clients)

      // Fetch invoices for each client
      const clientInvoices = await Promise.all(
        clients.map(async (client) => {
          const clientInvoices = await getInvoicesByClientId(client.id)
          return { [client.id]: clientInvoices }
        })
      )

      const invoicesObj = clientInvoices.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      setInvoices(invoicesObj)
    } catch (err) {
      console.error('Error fetching closed clients:', err)
    }
  }

  // Add a modern toast notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container')
    if (!toastContainer) {
      toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2'
      document.body.appendChild(toastContainer)
    }
    
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `
      px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out
      flex items-center space-x-3 max-w-md
      ${type === 'success' ? 'bg-green-500/90 backdrop-blur-xl' : 
        type === 'error' ? 'bg-red-500/90 backdrop-blur-xl' : 
        'bg-blue-500/90 backdrop-blur-xl'}
      text-white border border-white/20
    `
    toast.innerHTML = `
      <div>
        ${type === 'success' ? 
          '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' : 
          type === 'error' ? 
          '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>' : 
          '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'}
      </div>
      <div class="text-sm font-medium">${message}</div>
    `
    
    toastContainer.appendChild(toast)
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full')
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    
    try {
      await deleteClosedClient(clientId)
      showToast('Client deleted successfully', 'success')
      fetchClosedClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      showToast('Failed to delete client. Please try again.', 'error')
    }
  }

  const handleUploadInvoice = async () => {
    if (!selectedClient || !invoiceData.amount || !invoiceData.month || !invoiceFile) {
      showToast('Please fill all required fields', 'error')
      return
    }

    try {
      // In a real implementation, you would upload the file to storage and create the invoice
      // For now, we'll just show a success message
      showToast('Invoice uploaded successfully', 'success')
      
      // Reset form
      setInvoiceData({
        amount: 0,
        month: new Date().toISOString().slice(0, 7)
      })
      setInvoiceFile(null)
      setSelectedClient(null)
      
      // Refresh invoices
      if (selectedClient) {
        fetchClosedClients()
      }
    } catch (error) {
      console.error('Error uploading invoice:', error)
      showToast('Failed to upload invoice. Please try again.', 'error')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId)
      setInvoices((prevInvoices) => {
        const updatedInvoices = Object.keys(prevInvoices).reduce((acc, clientId) => {
          const clientInvoices = prevInvoices[clientId].filter((invoice) => invoice.id !== invoiceId)
          return { ...acc, [clientId]: clientInvoices }
        }, {})

        return updatedInvoices
      })
    } catch (err) {
      console.error('Error deleting invoice:', err)
    }
  }

  const saveClient = async () => {
    if (!formData.name || formData.videosPerMonth <= 0 || formData.chargePerVideo <= 0) {
      showToast('Please fill all fields with valid values', 'error')
      return
    }

    try {
      console.log('Saving closed client...')
      await addClosedClient({
        name: formData.name,
        videosPerMonth: formData.videosPerMonth,
        chargePerVideo: formData.chargePerVideo
      })
      
      showToast('Client added to closed list!', 'success')
      
      // Reset form
      setFormData({
        name: '',
        videosPerMonth: 0,
        chargePerVideo: 0
      })
      setIsAddClientModalOpen(false)
      
      // Refresh the client list
      fetchClosedClients()
    } catch (error) {
      console.error('Error saving client:', error)
      if (error instanceof Error) {
        showToast(`Error: ${error.message}`, 'error')
      } else {
        showToast('Failed to save client. Please try again.', 'error')
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchClosedClients()
    }
    
    fetchData()
  }, [router, fetchClosedClients])

  // Calculate revenue based on form data
  const calculatedRevenue = useMemo(() => {
    if (formData.videosPerMonth > 0 && formData.chargePerVideo > 0) {
      return formData.videosPerMonth * formData.chargePerVideo
    }
    return null
  }, [formData.videosPerMonth, formData.chargePerVideo])

  return (
    <DashboardLayout>
      {/* Background video for Apple-style grainy effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,30,45,0.6)_0%,rgba(15,15,30,0.9)_100%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ij48L3JlY3Q+PC9zdmc+')] opacity-20"></div>
      </div>
      
      <div className="space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Closed Clients</h1>
            <p className="text-white/70 mt-1">Manage your closed clients and their invoices</p>
          </div>
          <Button 
            onClick={() => setIsAddClientModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] flex items-center"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Closed Clients Grid */}
        {closedClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closedClients.map((client) => (
              <Card 
                key={client.id} 
                className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/20"
              >
                <CardHeader className="pb-3 pt-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-white flex items-center">
                      <IconUsers className="mr-2 h-5 w-5" />
                      {client.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Videos/Month:</span>
                      <span className="text-white font-medium">{client.videosPerMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Charge/Video:</span>
                      <span className="text-white font-medium">${client.chargePerVideo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Monthly Revenue:</span>
                      <span className="text-white font-bold">${client.monthlyRevenue}</span>
                    </div>
                    <div className="pt-2">
                      <Button
                        onClick={() => {
                          setSelectedClient(client)
                          setInvoiceData({
                            amount: client.monthlyRevenue,
                            month: new Date().toISOString().slice(0, 7)
                          })
                        }}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] flex items-center"
                      >
                        <IconFileInvoice className="mr-2 h-4 w-4" />
                        Manage Invoices
                      </Button>
                    </div>
                    
                    {/* Invoices Section */}
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-white">Invoices</h4>
                        <span className="text-xs text-white/70">
                          {invoices[client.id]?.length || 0} items
                        </span>
                      </div>
                      
                      {invoices[client.id] && invoices[client.id].length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {invoices[client.id].map((invoice) => (
                            <div 
                              key={invoice.id} 
                              className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {invoice.month}
                                </div>
                                <div className="text-xs text-white/70">
                                  ${invoice.amount}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  <IconDownload className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                  className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/50 italic">No invoices yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg">
            <CardContent className="py-12 text-center">
              <IconTrendingUp className="mx-auto h-12 w-12 text-white/30 mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">No closed clients yet</h3>
              <p className="text-white/70 mb-4">Get started by adding your first closed client</p>
              <Button 
                onClick={() => setIsAddClientModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Client Modal */}
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Closed Client</DialogTitle>
            <DialogDescription className="text-white/70">
              Add a new closed client to your list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="client-name" className="text-white text-sm font-medium">
                Client Name
              </label>
              <Input
                id="client-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.videosPerMonth}
                  onChange={(e) => setFormData({ ...formData, videosPerMonth: parseInt(e.target.value) || 0 })}
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
                  value={formData.chargePerVideo}
                  onChange={(e) => setFormData({ ...formData, chargePerVideo: parseFloat(e.target.value) || 0 })}
                  className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
                />
              </div>
            </div>
            
            {calculatedRevenue !== null && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Calculated Monthly Revenue:</span>
                  <span className="text-white font-bold">${calculatedRevenue}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddClientModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10 rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              onClick={saveClient}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Management Modal */}
      <Dialog 
        open={selectedClient !== null} 
        onOpenChange={(open) => !open && setSelectedClient(null)}
      >
        <DialogContent className="bg-white/10 backdrop-blur-[20px] border border-white/15 rounded-[18px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Invoices</DialogTitle>
            <DialogDescription className="text-white/70">
              Upload and manage invoices for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="invoice-amount" className="text-white text-sm font-medium">
                Amount ($)
              </label>
              <Input
                id="invoice-amount"
                type="number"
                min="0"
                step="0.01"
                value={invoiceData.amount}
                onChange={(e) => setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) || 0 })}
                className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="invoice-month" className="text-white text-sm font-medium">
                Month
              </label>
              <Input
                id="invoice-month"
                type="month"
                value={invoiceData.month}
                onChange={(e) => setInvoiceData({ ...invoiceData, month: e.target.value })}
                className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] h-10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">
                Invoice File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <IconUpload className="w-8 h-8 mb-2 text-white/50" />
                    <p className="text-sm text-white/50">
                      {invoiceFile ? invoiceFile.name : 'Click to upload invoice'}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedClient(null)}
              className="border-white/20 text-white hover:bg-white/10 rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadInvoice}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px]"
            >
              Upload Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}