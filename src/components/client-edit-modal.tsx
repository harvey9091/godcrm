'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { 
  IconX,
  IconUser,
  IconMail,
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandTwitter, 
  IconBrandLinkedin, 
  IconBrandTiktok, 
  IconLink,
  IconCalendar,
  IconNotes,
  IconTag,
  IconCurrencyDollar,
  IconInfoCircle,
  IconPlus,
  IconTrash,
  IconLock
} from '@tabler/icons-react'
import { Client } from '@/lib/types'
import { updateClient, logClientEdit } from '@/lib/supabase/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ClientEditModalProps {
  client: Client | null
  open: boolean
  onClose: () => void
  onSave: (updatedClient: Client) => void
}

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface CustomField {
  id: string
  name: string
  value: string
}

export function ClientEditModal({ client, open, onClose, onSave }: ClientEditModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<{ canEdit: boolean }>({ canEdit: true })

  useEffect(() => {
    if (client && open) {
      setFormData({ ...client })
      
      // Initialize social links from client data
      const links: SocialLink[] = []
      if (client.website) links.push({ id: 'website', platform: 'website', url: client.website })
      if (client.youtube) links.push({ id: 'youtube', platform: 'youtube', url: client.youtube })
      if (client.instagram) links.push({ id: 'instagram', platform: 'instagram', url: client.instagram })
      if (client.twitter) links.push({ id: 'twitter', platform: 'twitter', url: client.twitter })
      if (client.linkedin) links.push({ id: 'linkedin', platform: 'linkedin', url: client.linkedin })
      if (client.tiktok) links.push({ id: 'tiktok', platform: 'tiktok', url: client.tiktok })
      setSocialLinks(links)
      
      // Initialize custom fields (for future use)
      setCustomFields([])
      
      setHasUnsavedChanges(false)
      setError(null)
    }
  }, [client, open])

  const handleChange = <K extends keyof Client>(field: K, value: Client[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSocialLinkChange = (id: string, field: 'platform' | 'url', value: string) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    )
    setHasUnsavedChanges(true)
  }

  const addSocialLink = () => {
    setSocialLinks(prev => [
      ...prev,
      { id: Date.now().toString(), platform: 'website', url: '' }
    ])
    setHasUnsavedChanges(true)
  }

  const removeSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id))
    setHasUnsavedChanges(true)
  }

  const addCustomField = () => {
    setCustomFields(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', value: '' }
    ])
    setHasUnsavedChanges(true)
  }

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id))
    setHasUnsavedChanges(true)
  }

  const handleCustomFieldChange = (id: string, field: 'name' | 'value', value: string) => {
    setCustomFields(prev => 
      prev.map(fieldItem => 
        fieldItem.id === id ? { ...fieldItem, [field]: value } : fieldItem
      )
    )
    setHasUnsavedChanges(true)
  }

  // Function to compare objects and find changed fields
  const getChangedFields = (original: Partial<Client>, updated: Partial<Client>): Record<string, { old: unknown; new: unknown }> => {
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    
    // Compare all fields in the updated object
    Object.keys(updated).forEach(key => {
      const typedKey = key as keyof Client
      if (typedKey === 'id' || typedKey === 'created_by' || typedKey === 'created_at') {
        return // Skip read-only fields
      }
      
      const oldValue = original[typedKey]
      const newValue = updated[typedKey]
      
      // Check if values are different
      if (oldValue !== newValue) {
        changes[key] = { old: oldValue, new: newValue }
      }
    })
    
    // Also check for fields that were removed (exist in original but not in updated)
    Object.keys(original).forEach(key => {
      const typedKey = key as keyof Client
      if (typedKey === 'id' || typedKey === 'created_by' || typedKey === 'created_at') {
        return // Skip read-only fields
      }
      
      if (!(typedKey in updated)) {
        changes[key] = { old: original[typedKey], new: null }
      }
    })
    
    return changes
  }

  const handleSave = async () => {
    if (!client) return

    // Check user permissions
    if (!userPermissions.canEdit) {
      setError('You do not have permission to edit this client.')
      return
    }

    setIsSaving(true)
    setError(null)
    
    try {
      // Prepare social links data
      const socialData: Partial<Client> = {}
      socialLinks.forEach(link => {
        switch (link.platform) {
          case 'website': socialData.website = link.url; break
          case 'youtube': socialData.youtube = link.url; break
          case 'instagram': socialData.instagram = link.url; break
          case 'twitter': socialData.twitter = link.url; break
          case 'linkedin': socialData.linkedin = link.url; break
          case 'tiktok': socialData.tiktok = link.url; break
        }
      })

      // Merge form data with social links data
      const updatedData = { ...formData, ...socialData }
      
      // Remove id, created_by, created_at from the update data
      const { id, created_by, created_at, updated_at, ...updateData } = updatedData
      
      // Get changed fields for audit logging
      const originalData: Record<string, unknown> = {}
      Object.keys(client).forEach(key => {
        if (key !== 'id' && key !== 'created_by' && key !== 'created_at' && key !== 'updated_at') {
          originalData[key] = client[key as keyof Client]
        }
      })
      
      const changedFields = getChangedFields(originalData, updateData)
      
      // Update the client
      const updatedClient = await updateClient(client.id, updateData)
      
      // Log the edit if there are changes
      if (Object.keys(changedFields).length > 0) {
        try {
          await logClientEdit(client.id, changedFields)
        } catch (logError) {
          console.error('Failed to log client edit:', logError)
          // Don't fail the save if logging fails
        }
      }
      
      setHasUnsavedChanges(false)
      onSave(updatedClient)
      
      // Show success message
      toast.success('Client updated successfully!')
    } catch (err) {
      console.error('Error updating client:', err)
      setError('Failed to update client. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  // Handle browser back/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={handleDiscard}>
      <DialogContent 
        className="w-[95vw] max-w-[1600px] h-[90vh] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg bg-card/40 border border-white/10 p-0"
        style={{
          animation: open ? 'modalEnter 250ms ease-out' : 'modalExit 250ms ease-in'
        }}
      >
        {/* Hidden dialog title for accessibility */}
        <DialogTitle className="sr-only">Edit Client</DialogTitle>
        
        <style jsx>{`
          @keyframes modalEnter {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes modalExit {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.5);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.7);
          }
        `}</style>
        
        {/* Custom Close Button */}
        <button
          onClick={handleDiscard}
          className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <IconX className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 p-6 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">Edit Client</h1>
            <p className="text-white/70 mt-1">Update client information and details</p>
            {!userPermissions.canEdit && (
              <div className="mt-2 flex items-center text-amber-300">
                <IconLock className="w-4 h-4 mr-1" />
                <span className="text-sm">You have read-only access to this client</span>
              </div>
            )}
          </div>
          
          {/* Scrollable Content Area */}
          <div className="overflow-y-auto custom-scrollbar pr-2 flex-grow p-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <IconInfoCircle className="text-red-400 mr-2" />
                  <span className="text-red-200">{error}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconUser className="w-5 h-5 text-violet-400" />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm text-white/80 mb-1 block">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Client name"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm text-white/80 mb-1 block">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="client@example.com"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm text-white/80 mb-1 block">Company</Label>
                      <Input
                        id="company"
                        value={formData.company || ''}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Company name"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="primary_contact" className="text-sm text-white/80 mb-1 block">Primary Contact</Label>
                      <Input
                        id="primary_contact"
                        value={formData.primary_contact || ''}
                        onChange={(e) => handleChange('primary_contact', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Contact person"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconLink className="w-5 h-5 text-violet-400" />
                      Social Links
                    </h2>
                    {userPermissions.canEdit && (
                      <Button 
                        onClick={addSocialLink}
                        variant="outline"
                        size="sm"
                        className="border-white/20 hover:bg-white/10 text-white"
                      >
                        <IconPlus className="w-4 h-4 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="flex gap-2">
                        <div className="w-1/3">
                          <Select
                            value={link.platform}
                            onValueChange={(value) => handleSocialLinkChange(link.id, 'platform', value)}
                            disabled={!userPermissions.canEdit}
                          >
                            <SelectTrigger className="bg-background/20 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-grow">
                          <Input
                            value={link.url}
                            onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                            className="bg-background/20 border-white/10 text-white"
                            placeholder="https://..."
                            disabled={!userPermissions.canEdit}
                          />
                        </div>
                        {userPermissions.canEdit && (
                          <Button
                            onClick={() => removeSocialLink(link.id)}
                            variant="outline"
                            size="icon"
                            className="border-white/20 hover:bg-white/10 text-white"
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {socialLinks.length === 0 && (
                      <p className="text-white/50 text-center py-4">No social links added</p>
                    )}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconNotes className="w-5 h-5 text-violet-400" />
                    Notes
                  </h2>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="bg-background/20 border-white/10 text-white min-h-[120px]"
                    placeholder="Add notes about this client..."
                    disabled={!userPermissions.canEdit}
                  />
                </div>
                
                {/* Custom Fields */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconTag className="w-5 h-5 text-violet-400" />
                      Custom Fields
                    </h2>
                    {userPermissions.canEdit && (
                      <Button 
                        onClick={addCustomField}
                        variant="outline"
                        size="sm"
                        className="border-white/20 hover:bg-white/10 text-white"
                      >
                        <IconPlus className="w-4 h-4 mr-1" />
                        Add Field
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {customFields.map((field) => (
                      <div key={field.id} className="flex gap-2">
                        <div className="w-1/3">
                          <Input
                            value={field.name}
                            onChange={(e) => handleCustomFieldChange(field.id, 'name', e.target.value)}
                            className="bg-background/20 border-white/10 text-white"
                            placeholder="Field name"
                            disabled={!userPermissions.canEdit}
                          />
                        </div>
                        <div className="flex-grow">
                          <Input
                            value={field.value}
                            onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                            className="bg-background/20 border-white/10 text-white"
                            placeholder="Field value"
                            disabled={!userPermissions.canEdit}
                          />
                        </div>
                        {userPermissions.canEdit && (
                          <Button
                            onClick={() => removeCustomField(field.id)}
                            variant="outline"
                            size="icon"
                            className="border-white/20 hover:bg-white/10 text-white"
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {customFields.length === 0 && (
                      <p className="text-white/50 text-center py-4">No custom fields added</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar with Status, Lead Temp, and Other Details */}
              <div className="space-y-6">
                {/* Status and Lead Temperature */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-white/80 mb-1 block">Status</Label>
                      <Select
                        value={formData.status || 'active'}
                        onValueChange={(value) => handleChange('status', value as Client['status'])}
                        disabled={!userPermissions.canEdit}
                      >
                        <SelectTrigger className="bg-background/20 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="dead">Dead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-white/80 mb-1 block">Lead Temperature</Label>
                      <Select
                        value={formData.lead_temp || 'cold'}
                        onValueChange={(value) => handleChange('lead_temp', value as Client['lead_temp'])}
                        disabled={!userPermissions.canEdit}
                      >
                        <SelectTrigger className="bg-background/20 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Badge 
                        className={
                          formData.status === 'active' ? 'bg-green-500' :
                          formData.status === 'ongoing' ? 'bg-blue-500' :
                          formData.status === 'closed' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }
                      >
                        {formData.status || 'active'}
                      </Badge>
                      <Badge 
                        className={
                          formData.lead_temp === 'hot' ? 'bg-red-500' :
                          formData.lead_temp === 'warm' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }
                      >
                        {formData.lead_temp || 'cold'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Outreach Information */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconMail className="w-5 h-5 text-violet-400" />
                    Outreach
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="outreach_type" className="text-sm text-white/80 mb-1 block">Outreach Type</Label>
                      <Select
                        value={formData.outreach_type || ''}
                        onValueChange={(value) => handleChange('outreach_type', value as Client['outreach_type'])}
                        disabled={!userPermissions.canEdit}
                      >
                        <SelectTrigger className="bg-background/20 border-white/10 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cold Email">Cold Email</SelectItem>
                          <SelectItem value="Reedit">Reedit</SelectItem>
                          <SelectItem value="YT Jobs">YT Jobs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="outreach_platform" className="text-sm text-white/80 mb-1 block">Platform</Label>
                      <Input
                        id="outreach_platform"
                        value={formData.outreach_platform || ''}
                        onChange={(e) => handleChange('outreach_platform', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Platform name"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="outreach_date" className="text-sm text-white/80 mb-1 block">Outreach Date</Label>
                      <Input
                        id="outreach_date"
                        type="date"
                        value={formData.outreach_date ? formData.outreach_date.split('T')[0] : ''}
                        onChange={(e) => handleChange('outreach_date', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="outreach_link_sent" className="text-sm text-white/80 mb-1 block">Link Sent</Label>
                      <Input
                        id="outreach_link_sent"
                        value={formData.outreach_link_sent || ''}
                        onChange={(e) => handleChange('outreach_link_sent', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Link sent to client"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="outreach_notes" className="text-sm text-white/80 mb-1 block">Outreach Notes</Label>
                      <Textarea
                        id="outreach_notes"
                        value={formData.outreach_notes || ''}
                        onChange={(e) => handleChange('outreach_notes', e.target.value)}
                        className="bg-background/20 border-white/10 text-white min-h-[80px]"
                        placeholder="Notes about the outreach"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="first_outreach_date" className="text-sm text-white/80 mb-1 block">First Outreach Date</Label>
                      <Input
                        id="first_outreach_date"
                        type="date"
                        value={formData.first_outreach_date ? formData.first_outreach_date.split('T')[0] : ''}
                        onChange={(e) => handleChange('first_outreach_date', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Follow-up Information */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconCalendar className="w-5 h-5 text-violet-400" />
                    Follow-up
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="did_reply" className="text-sm text-white/80 mb-1 block">Did They Reply?</Label>
                      <Select
                        value={formData.did_reply || ''}
                        onValueChange={(value) => handleChange('did_reply', value as Client['did_reply'])}
                        disabled={!userPermissions.canEdit}
                      >
                        <SelectTrigger className="bg-background/20 border-white/10 text-white">
                          <SelectValue placeholder="Select reply status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No Reply">No Reply</SelectItem>
                          <SelectItem value="Interested">Interested</SelectItem>
                          <SelectItem value="Ghosted">Ghosted</SelectItem>
                          <SelectItem value="Replied - Needs Follow-up">Replied - Needs Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="follow_up_status" className="text-sm text-white/80 mb-1 block">Follow-up Status</Label>
                      <Select
                        value={formData.follow_up_status || ''}
                        onValueChange={(value) => handleChange('follow_up_status', value as Client['follow_up_status'])}
                        disabled={!userPermissions.canEdit}
                      >
                        <SelectTrigger className="bg-background/20 border-white/10 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="next_follow_up_date" className="text-sm text-white/80 mb-1 block">Next Follow-up Date</Label>
                      <Input
                        id="next_follow_up_date"
                        type="date"
                        value={formData.next_follow_up_date ? formData.next_follow_up_date.split('T')[0] : ''}
                        onChange={(e) => handleChange('next_follow_up_date', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="follow_up_count" className="text-sm text-white/80 mb-1 block">Follow-up Count</Label>
                      <Input
                        id="follow_up_count"
                        type="number"
                        value={formData.follow_up_count || 0}
                        onChange={(e) => handleChange('follow_up_count', parseInt(e.target.value) || 0)}
                        className="bg-background/20 border-white/10 text-white"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="platforms_followed_up_on" className="text-sm text-white/80 mb-1 block">Platforms Followed Up On</Label>
                      <Input
                        id="platforms_followed_up_on"
                        value={formData.platforms_followed_up_on || ''}
                        onChange={(e) => handleChange('platforms_followed_up_on', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Comma separated platforms"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Pricing Details */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconCurrencyDollar className="w-5 h-5 text-violet-400" />
                    Pricing
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subscriber_count" className="text-sm text-white/80 mb-1 block">Subscriber Count</Label>
                      <Input
                        id="subscriber_count"
                        type="number"
                        value={formData.subscriber_count || ''}
                        onChange={(e) => handleChange('subscriber_count', parseInt(e.target.value) || 0)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Subscriber count"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-4">Metadata</h2>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-white/80 mb-1 block">Created At</Label>
                      <div className="text-white/70">
                        {client.created_at ? new Date(client.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 mb-1 block">Last Updated</Label>
                      <div className="text-white/70">
                        {client.updated_at ? new Date(client.updated_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 mb-1 block">Source</Label>
                      <Input
                        value={formData.source || ''}
                        onChange={(e) => handleChange('source', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Source of lead"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white/80 mb-1 block">Tags</Label>
                      <Input
                        value={formData.tags || ''}
                        onChange={(e) => handleChange('tags', e.target.value)}
                        className="bg-background/20 border-white/10 text-white"
                        placeholder="Comma separated tags"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with Action Buttons */}
          <div className="bg-card/20 backdrop-blur-lg border-t border-white/10 p-4 flex justify-between">
            <Button 
              onClick={handleDiscard}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white"
              disabled={isSaving}
            >
              Discard Changes
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.name || !userPermissions.canEdit}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}