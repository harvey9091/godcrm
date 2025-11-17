'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Client, Note } from '@/lib/types'
import { 
  getClientById, 
  updateClient, 
  getNotesByClientId, 
  createNote, 
  updateNote, 
  deleteNote 
} from '@/lib/supabase/db'
import { 
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandTiktok,
  IconTrash,
  IconEdit
} from '@tabler/icons-react'

export default function ClientDetailsPage() {
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const params = useParams()

  const fetchClient = useCallback(async () => {
    try {
      const data = await getClientById(params.id as string)
      if (data) {
        setClient(data)
        setFormData(data)
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }, [params.id])

  const fetchNotes = useCallback(async () => {
    try {
      const data = await getNotesByClientId(params.id as string)
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }, [params.id])

  useEffect(() => {
    setIsMounted(true)
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          fetchClient()
          fetchNotes()
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, params.id, fetchClient, fetchNotes])

  const handleUpdateClient = async () => {
    try {
      if (client) {
        await updateClient(client.id, formData)
        setClient({ ...client, ...formData } as Client)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating client:', error)
    }
  }

  const handleCreateNote = async () => {
    try {
      await createNote({
        client_id: params.id as string,
        content: newNoteContent
      })
      setNewNoteContent('')
      fetchNotes()
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleUpdateNote = async (id: string) => {
    try {
      await updateNote(id, editNoteContent)
      setEditingNoteId(null)
      fetchNotes()
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      await deleteNote(id)
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleChange = (field: keyof Client, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div>Client not found</div>
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
              {client.name}
            </AnimatedGradientText>
          </h1>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
                <RainbowButton onClick={handleUpdateClient}>
                  Save Changes
                </RainbowButton>
              </>
            ) : (
              <RainbowButton onClick={() => setIsEditing(true)}>
                Edit Client
              </RainbowButton>
            )}
          </div>
        </div>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.youtube || ''}
                    onChange={(e) => handleChange('youtube', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram || ''}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin || ''}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.tiktok || ''}
                    onChange={(e) => handleChange('tiktok', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || ''}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                  <Label htmlFor="lead_temp">Lead Temperature</Label>
                  <Select
                    value={formData.lead_temp || ''}
                    onValueChange={(value) => handleChange('lead_temp', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <div className="text-sm">{client.name}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="text-sm">{client.email}</div>
                </div>
                <div>
                  <Label>Social Media</Label>
                  <div className="flex space-x-2 mt-1">
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
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge 
                    className={
                      client.status === 'active' ? 'bg-green-500' :
                      client.status === 'ongoing' ? 'bg-blue-500' :
                      client.status === 'closed' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }
                  >
                    {client.status}
                  </Badge>
                </div>
                <div>
                  <Label>Lead Temperature</Label>
                  <Badge 
                    className={
                      client.lead_temp === 'hot' ? 'bg-red-500' :
                      client.lead_temp === 'warm' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }
                  >
                    {client.lead_temp}
                  </Badge>
                </div>
                <div>
                  <Label>Created At</Label>
                  <div className="text-sm">
                    {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Note Form */}
            <div className="space-y-2">
              <Label>Add Note</Label>
              <Textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Add a note about this client..."
              />
              <div className="flex justify-end">
                <RainbowButton 
                  onClick={handleCreateNote} 
                  disabled={!newNoteContent.trim()}
                >
                  Add Note
                </RainbowButton>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        defaultValue={note.content}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </Button>
                        <RainbowButton 
                          onClick={() => handleUpdateNote(note.id)}
                        >
                          Save
                        </RainbowButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                        <div className="space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingNoteId(note.id)
                              setEditNoteContent(note.content)
                            }}
                          >
                            <IconEdit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}