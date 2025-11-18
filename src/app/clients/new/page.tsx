'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { addClient } from '@/lib/supabase/db'
import { Client } from '@/lib/types'
import { 
  IconUser, 
  IconMail, 
  IconBuilding, 
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandTwitter, 
  IconBrandLinkedin, 
  IconBrandTiktok, 
  IconLink, 
  IconCalendar, 
  IconNotes, 
  IconTag,
  IconCloudUpload,
  IconChevronDown,
  IconPlus,
  IconMinus
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'

export default function NewClientPage() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    primary_contact: '',
    youtube: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    tiktok: '',
    drive_link: '',
    subscriber_count: '',
    outreach_type: '',
    outreach_platform: '',
    outreach_date: '',
    outreach_link_sent: '',
    outreach_notes: '',
    lead_temp: 'cold' as Client['lead_temp'],
    did_reply: '',
    follow_up_status: 'Not Started',
    follow_up_count: 0,
    platforms_followed_up_on: '',
    next_follow_up_date: '',
    first_outreach_date: '',
    source: '',
    tags: '',
    notes: '',
    status: 'active' as Client['status']
  })
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    notes: false
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
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

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  const incrementFollowUpCount = () => {
    setFormData({ ...formData, follow_up_count: formData.follow_up_count + 1 })
  }

  const decrementFollowUpCount = () => {
    if (formData.follow_up_count > 0) {
      setFormData({ ...formData, follow_up_count: formData.follow_up_count - 1 })
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await addClient({
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        primary_contact: formData.primary_contact || null,
        youtube: formData.youtube || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        linkedin: formData.linkedin || null,
        tiktok: formData.tiktok || null,
        drive_link: formData.drive_link || null,
        subscriber_count: formData.subscriber_count ? parseInt(formData.subscriber_count) : null,
        outreach_type: formData.outreach_type as Client['outreach_type'] || null,
        outreach_platform: formData.outreach_platform || null,
        outreach_date: formData.outreach_date || null,
        outreach_link_sent: formData.outreach_link_sent || null,
        outreach_notes: formData.outreach_notes || null,
        lead_temp: formData.lead_temp,
        did_reply: formData.did_reply as Client['did_reply'] || null,
        follow_up_status: formData.follow_up_status as Client['follow_up_status'] || null,
        platforms_followed_up_on: formData.platforms_followed_up_on || null,
        next_follow_up_date: formData.next_follow_up_date || null,
        first_outreach_date: formData.first_outreach_date || null,
        source: formData.source || null,
        tags: formData.tags || null,
        notes: formData.notes || null,
        status: formData.status
      })
      
      router.push('/clients')
    } catch (error) {
      console.error('Error creating client:', error)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <AnimatedGradientText className="text-3xl font-bold">
              Add New Client
            </AnimatedGradientText>
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            Back to Clients
          </Button>
        </div>

        <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Add New Client for Outreach</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Client Info Panel */}
                  <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <IconUser className="mr-2 h-5 w-5" />
                        Client Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Client Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Enter client name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Primary Contact Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company / Brand</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                          placeholder="Enter company or brand name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="primary_contact">Primary Point of Contact</Label>
                        <Input
                          id="primary_contact"
                          value={formData.primary_contact}
                          onChange={(e) => handleChange('primary_contact', e.target.value)}
                          placeholder="Enter primary contact name"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Socials & Stats Panel */}
                  <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <IconLink className="mr-2 h-5 w-5" />
                        Socials & Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="youtube" className="flex items-center">
                          <IconBrandYoutube className="mr-2 h-5 w-5 text-red-600" />
                          YouTube Channel Link
                        </Label>
                        <Input
                          id="youtube"
                          value={formData.youtube}
                          onChange={(e) => handleChange('youtube', e.target.value)}
                          placeholder="https://youtube.com/channel/..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subscriber_count">Subscriber Count</Label>
                          <Input
                            id="subscriber_count"
                            type="number"
                            value={formData.subscriber_count}
                            onChange={(e) => handleChange('subscriber_count', e.target.value)}
                            placeholder="e.g., 53200"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="instagram" className="flex items-center">
                          <IconBrandInstagram className="mr-2 h-5 w-5 text-pink-500" />
                          Instagram Link
                        </Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => handleChange('instagram', e.target.value)}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="flex items-center">
                          <IconBrandTwitter className="mr-2 h-5 w-5 text-blue-400" />
                          Twitter Link
                        </Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => handleChange('twitter', e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="tiktok" className="flex items-center">
                          <IconBrandTiktok className="mr-2 h-5 w-5" />
                          TikTok Link
                        </Label>
                        <Input
                          id="tiktok"
                          value={formData.tiktok}
                          onChange={(e) => handleChange('tiktok', e.target.value)}
                          placeholder="https://tiktok.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin" className="flex items-center">
                          <IconBrandLinkedin className="mr-2 h-5 w-5 text-blue-600" />
                          LinkedIn Link
                        </Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) => handleChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="drive_link" className="flex items-center">
                          <IconCloudUpload className="mr-2 h-5 w-5" />
                          Value Link (Drive / Loom)
                        </Label>
                        <Input
                          id="drive_link"
                          value={formData.drive_link}
                          onChange={(e) => handleChange('drive_link', e.target.value)}
                          placeholder="https://drive.google.com/... or https://loom.com/..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Outreach Details Panel */}
                  <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <IconMail className="mr-2 h-5 w-5" />
                        Outreach Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="outreach_type">Outreach Type</Label>
                        <Select
                          value={formData.outreach_type}
                          onValueChange={(value) => handleChange('outreach_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select outreach type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cold Email">Cold Email</SelectItem>
                            <SelectItem value="Reedit">Reedit</SelectItem>
                            <SelectItem value="YT Jobs">YT Jobs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="outreach_platform">Outreach Platform</Label>
                        <Select
                          value={formData.outreach_platform}
                          onValueChange={(value) => handleChange('outreach_platform', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Twitter DM">Twitter DM</SelectItem>
                            <SelectItem value="Instagram DM">Instagram DM</SelectItem>
                            <SelectItem value="LinkedIn DM">LinkedIn DM</SelectItem>
                            <SelectItem value="YouTube Comments">YouTube Comments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="outreach_date">Outreach Date</Label>
                        <Input
                          id="outreach_date"
                          type="date"
                          value={formData.outreach_date}
                          onChange={(e) => handleChange('outreach_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="outreach_link_sent">Outreach Link Sent</Label>
                        <Input
                          id="outreach_link_sent"
                          value={formData.outreach_link_sent}
                          onChange={(e) => handleChange('outreach_link_sent', e.target.value)}
                          placeholder="https://your-special-page.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="outreach_notes">Outreach Notes</Label>
                        <Textarea
                          id="outreach_notes"
                          value={formData.outreach_notes}
                          onChange={(e) => handleChange('outreach_notes', e.target.value)}
                          placeholder="Brief note about what was sent"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Follow-up Tracking Panel */}
                  <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center">
                          <IconCalendar className="mr-2 h-5 w-5" />
                          Follow-up Tracking
                        </span>
                        <div className="flex space-x-2">
                          <Badge 
                            className={formData.lead_temp === 'hot' ? 'bg-red-500' : formData.lead_temp === 'warm' ? 'bg-orange-500' : 'bg-blue-500'}
                          >
                            {formData.lead_temp.charAt(0).toUpperCase() + formData.lead_temp.slice(1)}
                          </Badge>
                          <Badge 
                            className={formData.follow_up_status === 'Completed' ? 'bg-green-500' : formData.follow_up_status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-500'}
                          >
                            {formData.follow_up_status}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lead_temp">Lead Temperature</Label>
                          <Select
                            value={formData.lead_temp}
                            onValueChange={(value) => handleChange('lead_temp', value as Client['lead_temp'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select temperature" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cold">Cold</SelectItem>
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="hot">Hot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="did_reply">Did they reply?</Label>
                          <Select
                            value={formData.did_reply}
                            onValueChange={(value) => handleChange('did_reply', value)}
                          >
                            <SelectTrigger>
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="follow_up_status">Follow-up Status</Label>
                          <Select
                            value={formData.follow_up_status}
                            onValueChange={(value) => handleChange('follow_up_status', value)}
                          >
                            <SelectTrigger>
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
                          <Label htmlFor="follow_up_count">Follow-up Count</Label>
                          <div className="flex items-center">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={decrementFollowUpCount}
                              disabled={formData.follow_up_count <= 0}
                            >
                              <IconMinus className="h-4 w-4" />
                            </Button>
                            <div className="mx-2 w-12 text-center">
                              {formData.follow_up_count}
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={incrementFollowUpCount}
                            >
                              <IconPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="platforms_followed_up_on">Platforms Followed Up On</Label>
                        <Input
                          id="platforms_followed_up_on"
                          value={formData.platforms_followed_up_on}
                          onChange={(e) => handleChange('platforms_followed_up_on', e.target.value)}
                          placeholder="e.g., Email, Twitter, IG"
                        />
                      </div>
                      <div>
                        <Label htmlFor="next_follow_up_date">Next Follow-up Date</Label>
                        <Input
                          id="next_follow_up_date"
                          type="date"
                          value={formData.next_follow_up_date}
                          onChange={(e) => handleChange('next_follow_up_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="first_outreach_date">First Outreach Date</Label>
                        <Input
                          id="first_outreach_date"
                          type="date"
                          value={formData.first_outreach_date}
                          onChange={(e) => handleChange('first_outreach_date', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Notes Panel (Collapsible) */}
              <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
                <CardHeader 
                  className="pb-3 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleSection('notes')}
                >
                  <CardTitle className="text-lg flex items-center">
                    <IconNotes className="mr-2 h-5 w-5" />
                    Notes / Research
                  </CardTitle>
                  <IconChevronDown 
                    className={`h-5 w-5 transition-transform ${expandedSections.notes ? 'rotate-180' : ''}`} 
                  />
                </CardHeader>
                {expandedSections.notes && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Input
                        id="source"
                        value={formData.source}
                        onChange={(e) => handleChange('source', e.target.value)}
                        placeholder="How were they found?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleChange('tags', e.target.value)}
                        placeholder="e.g., priority, niche"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes / Research</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Paste research, email drafts, and other notes here..."
                        rows={6}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <RainbowButton type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Client'}
                </RainbowButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}