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
  IconNotes,
  IconTag,
  IconInfoCircle,
  IconPlus,
  IconTrash,
  IconCheck
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
  const [, setCustomFields] = useState<CustomField[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    // For now, allow all users to edit
    // if (!userPermissions.canEdit) {
    //   setError('You do not have permission to edit this client.')
    //   return
    // }

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
      const updatedClientData = { ...formData, ...socialData }
      
      // Remove undefined fields
      Object.keys(updatedClientData).forEach(key => {
        if (updatedClientData[key as keyof Client] === undefined) {
          delete updatedClientData[key as keyof Client]
        }
      })
      
      // Update the client in the database
      const updatedClient = await updateClient(client.id, updatedClientData)
      
      // Log the edit for audit purposes
      const changes = getChangedFields(client, updatedClientData)
      if (Object.keys(changes).length > 0) {
        await logClientEdit(client.id, changes)
      }
      
      // Notify parent component of the update
      onSave(updatedClient)
      
      // Show success message
      toast.success('Client updated successfully!')
      
      // Close the modal
      onClose()
    } catch (err) {
      console.error('Error updating client:', err)
      setError(err instanceof Error ? err.message : 'Failed to update client')
      toast.error('Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  if (!client) return null

  // Platform options for social links
  const platformOptions = [
    { value: 'website', label: 'Website', icon: IconLink },
    { value: 'youtube', label: 'YouTube', icon: IconBrandYoutube },
    { value: 'instagram', label: 'Instagram', icon: IconBrandInstagram },
    { value: 'twitter', label: 'Twitter', icon: IconBrandTwitter },
    { value: 'linkedin', label: 'LinkedIn', icon: IconBrandLinkedin },
    { value: 'tiktok', label: 'TikTok', icon: IconBrandTiktok },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="!w-[80vw] !max-w-[1600px] !min-w-[70vw] h-[85vh] rounded-[18px] overflow-hidden shadow-2xl backdrop-blur-[20px] bg-white/10 border border-white/15 p-0 transition-all duration-300"
        style={{
          animation: open ? 'modalEnter 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'modalExit 200ms ease-in'
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
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #9b5cff, #8b5cf6);
            border-radius: 10px;
            box-shadow: 0 0 4px rgba(155, 92, 255, 0.5);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #8b5cf6, #9b5cff);
          }
        `}</style>
        
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 z-10 backdrop-blur-sm border border-white/10"
        >
          <IconX className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 p-6 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Edit Client: {client.name}</h1>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-white/20 hover:bg-white/10 text-white rounded-[12px]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] transition-all duration-300 hover:scale-[1.02] flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 m-4 backdrop-blur-sm">
              <div className="flex items-center">
                <IconInfoCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">Error</h3>
                  <div className="mt-1 text-sm text-red-200">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content with Scrollbar */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconUser className="w-5 h-5 text-violet-400" />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value as Client['email'])}
                        className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-white">Company</Label>
                      <Input
                        id="company"
                        value={formData.company || ''}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary_contact" className="text-white">Primary Contact</Label>
                      <Input
                        id="primary_contact"
                        value={formData.primary_contact || ''}
                        onChange={(e) => handleChange('primary_contact', e.target.value)}
                        className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconLink className="w-5 h-5 text-violet-400" />
                      Social Links
                    </h2>
                    <Button 
                      onClick={addSocialLink}
                      variant="outline"
                      size="sm"
                      className="border-white/20 hover:bg-white/10 text-white rounded-[8px]"
                    >
                      <IconPlus className="w-4 h-4 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {socialLinks.map((link) => {
                      
                      return (
                        <div key={link.id} className="flex gap-3">
                          <div className="w-32">
                            <Select
                              value={link.platform}
                              onValueChange={(value) => handleSocialLinkChange(link.id, 'platform', value)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[8px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-white/10 text-white rounded-[8px]">
                                {platformOptions.map((option) => {
                                  const OptionIcon = option.icon
                                  return (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <OptionIcon className="w-4 h-4" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-grow">
                            <Input
                              value={link.url}
                              onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                              placeholder="https://..."
                              className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[8px]"
                            />
                          </div>
                          <Button 
                            onClick={() => removeSocialLink(link.id)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 hover:bg-white/10 text-white rounded-[8px] p-2"
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Outreach Information */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconMail className="w-5 h-5 text-violet-400" />
                    Outreach Information
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Outreach Type</Label>
                        <Select
                          value={formData.outreach_type || ''}
                          onValueChange={(value) => handleChange('outreach_type', value as Client['outreach_type'])}
                        >
                          <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[12px]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-white/10 text-white rounded-[12px]">
                            <SelectItem value="Cold Email">Cold Email</SelectItem>
                            <SelectItem value="Reedit">Reedit</SelectItem>
                            <SelectItem value="YT Jobs">YT Jobs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="outreach_platform" className="text-white">Outreach Platform</Label>
                        <Input
                          id="outreach_platform"
                          value={formData.outreach_platform || ''}
                          onChange={(e) => handleChange('outreach_platform', e.target.value)}
                          placeholder="e.g., LinkedIn, Email"
                          className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="outreach_date" className="text-white">Outreach Date</Label>
                        <Input
                          id="outreach_date"
                          type="date"
                          value={formData.outreach_date ? formData.outreach_date.split('T')[0] : ''}
                          onChange={(e) => handleChange('outreach_date', e.target.value)}
                          className="bg-white/10 border-white/10 text-white rounded-[12px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="first_outreach_date" className="text-white">First Outreach Date</Label>
                        <Input
                          id="first_outreach_date"
                          type="date"
                          value={formData.first_outreach_date ? formData.first_outreach_date.split('T')[0] : ''}
                          onChange={(e) => handleChange('first_outreach_date', e.target.value)}
                          className="bg-white/10 border-white/10 text-white rounded-[12px]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="outreach_link_sent" className="text-white">Outreach Link Sent</Label>
                      <Input
                        id="outreach_link_sent"
                        value={formData.outreach_link_sent || ''}
                        onChange={(e) => handleChange('outreach_link_sent', e.target.value)}
                        placeholder="https://example.com/reel"
                        className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Follow-up & Tags */}
              <div className="space-y-6">
                {/* Follow-up Information */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconTag className="w-5 h-5 text-violet-400" />
                    Follow-up Information
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Follow-up Status</Label>
                      <Select
                        value={formData.follow_up_status || ''}
                        onValueChange={(value) => handleChange('follow_up_status', value as Client['follow_up_status'])}
                      >
                        <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-[12px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/10 text-white rounded-[12px]">
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="follow_up_count" className="text-white">Follow-up Count</Label>
                      <Input
                        id="follow_up_count"
                        type="number"
                        value={formData.follow_up_count || 0}
                        onChange={(e) => handleChange('follow_up_count', parseInt(e.target.value) || 0)}
                        className="bg-white/10 border-white/10 text-white rounded-[12px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="next_follow_up_date" className="text-white">Next Follow-up Date</Label>
                      <Input
                        id="next_follow_up_date"
                        type="date"
                        value={formData.next_follow_up_date ? formData.next_follow_up_date.split('T')[0] : ''}
                        onChange={(e) => handleChange('next_follow_up_date', e.target.value)}
                        className="bg-white/10 border-white/10 text-white rounded-[12px]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconTag className="w-5 h-5 text-violet-400" />
                    Tags
                  </h2>
                  <div className="space-y-3">
                    <Textarea
                      value={formData.tags || ''}
                      onChange={(e) => handleChange('tags', e.target.value)}
                      placeholder="Enter tags separated by commas"
                      className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] min-h-[80px]"
                    />
                    <p className="text-sm text-white/70">Example: high-priority, video-editing, youtube</p>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconNotes className="w-5 h-5 text-violet-400" />
                    Notes
                  </h2>
                  <div className="space-y-3">
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Add any additional notes about this client"
                      className="bg-white/10 border-white/10 text-white placeholder-white/50 rounded-[12px] min-h-[120px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
