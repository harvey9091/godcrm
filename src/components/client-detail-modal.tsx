'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { 
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandTwitter, 
  IconBrandLinkedin, 
  IconBrandTiktok, 
  IconLink,
  IconMail,
  IconCalendar,
  IconNotes,
  IconTag,
  IconX,
  IconUser,
  IconUsers,
  IconInfoCircle,
  IconEdit
} from '@tabler/icons-react'
import { Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ClientDetailModalProps {
  client: Client | null
  open: boolean
  onClose: () => void
  onEdit?: (client: Client) => void
}

interface YouTubeData {
  title: string
  description: string
  thumbnail_url: string
  author_name: string
  author_url: string
  subscriber_count?: string
}

export function ClientDetailModal({ client, open, onClose, onEdit }: ClientDetailModalProps) {
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (client && client.youtube && open) {
      fetchYouTubeData(client.youtube)
    } else {
      setYoutubeData(null)
      setError(null)
    }
  }, [client, open])

  const fetchYouTubeData = async (youtubeUrl: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Extract YouTube video ID or channel ID
      const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      const channelIdMatch = youtubeUrl.match(/youtube\.com\/(?:channel\/|c\/|user\/)?([^\/\?]+)/)
      
      let embedUrl = ''
      if (videoIdMatch) {
        embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoIdMatch[1]}&format=json`
      } else if (channelIdMatch) {
        embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${channelIdMatch[1]}&format=json`
      } else {
        embedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`
      }
      
      const response = await fetch(embedUrl)
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube data')
      }
      
      const data: YouTubeData = await response.json()
      setYoutubeData(data)
    } catch (err) {
      console.error('Error fetching YouTube data:', err)
      setError('YouTube data unavailable')
      setYoutubeData(null)
    } finally {
      setLoading(false)
    }
  }

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="!w-[80vw] !max-w-[1600px] !min-w-[70vw] h-[85vh] rounded-[18px] overflow-hidden shadow-2xl backdrop-blur-[20px] bg-white/10 border border-white/15 p-0 transition-all duration-300"
        style={{
          animation: open ? 'modalEnter 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'modalExit 200ms ease-in'
        }}
      >
        {/* Hidden dialog title for accessibility */}
        <DialogTitle className="sr-only">Client Details</DialogTitle>
        
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
          {/* Hero Section - Full Width Header */}
          <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 p-8 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                {loading ? (
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-400"></div>
                  </div>
                ) : youtubeData?.thumbnail_url ? (
                  <Image 
                    src={youtubeData.thumbnail_url} 
                    alt="Channel thumbnail" 
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-2 border-violet-400/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                    <IconUser className="w-16 h-16 text-violet-400/50" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                  {onEdit && (
                    <Button 
                      onClick={() => onEdit(client)}
                      className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 rounded-[12px] transition-all duration-300 hover:scale-[1.02]"
                    >
                      <IconEdit className="w-4 h-4" />
                      Edit Client
                    </Button>
                  )}
                </div>
                
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-5 bg-white/20 rounded animate-pulse w-1/2 mx-auto md:mx-0"></div>
                    <div className="h-4 bg-white/10 rounded animate-pulse w-3/4 mx-auto md:mx-0"></div>
                  </div>
                ) : error ? (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex items-center gap-4 max-w-2xl mx-auto md:mx-0">
                    <IconInfoCircle className="text-violet-400 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-medium text-white">Channel preview unavailable</p>
                      <p className="text-sm text-white/70">YouTube data could not be loaded</p>
                    </div>
                  </div>
                ) : youtubeData ? (
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                      <div className="flex items-center gap-2">
                        <IconUsers className="w-5 h-5 text-violet-400" />
                        <span className="text-white/80">
                          {youtubeData.subscriber_count ? `${youtubeData.subscriber_count} subscribers` : 'Subscriber count unavailable'}
                        </span>
                      </div>
                      <a 
                        href={youtubeData.author_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        <IconBrandYoutube className="w-5 h-5" />
                        Visit Channel
                      </a>
                    </div>
                    <h2 className="text-xl font-semibold text-white">{youtubeData.title}</h2>
                    <p className="text-white/80 line-clamp-3">{youtubeData.description}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <IconMail className="w-5 h-5 text-violet-400 flex-shrink-0" />
                      <span className="text-white/80">{client.email || 'No email provided'}</span>
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-3">
                        <IconUsers className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        <span className="text-white/80">{client.company}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Client Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconMail className="w-5 h-5 text-violet-400" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70">Email</label>
                      <p className="text-white">{client.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Company</label>
                      <p className="text-white">{client.company || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Primary Contact</label>
                      <p className="text-white">{client.primary_contact || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Status</label>
                      <p className="text-white capitalize">{client.status}</p>
                    </div>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconLink className="w-5 h-5 text-violet-400" />
                    Social Links
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {client.website && (
                      <a 
                        href={client.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <IconLink className="w-5 h-5 text-violet-400" />
                        <span className="text-white truncate">Website</span>
                      </a>
                    )}
                    {client.youtube && (
                      <a 
                        href={client.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <IconBrandYoutube className="w-5 h-5 text-red-500" />
                        <span className="text-white truncate">YouTube</span>
                      </a>
                    )}
                    {client.instagram && (
                      <a 
                        href={client.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <IconBrandInstagram className="w-5 h-5 text-pink-500" />
                        <span className="text-white truncate">Instagram</span>
                      </a>
                    )}
                    {client.twitter && (
                      <a 
                        href={client.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <IconBrandTwitter className="w-5 h-5 text-blue-400" />
                        <span className="text-white truncate">Twitter</span>
                      </a>
                    )}
                    {client.linkedin && (
                      <a 
                        href={client.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <IconBrandLinkedin className="w-5 h-5 text-blue-600" />
                        <span className="text-white truncate">LinkedIn</span>
                      </a>
                    )}
                    {client.tiktok && (
                      <a 
                        href={client.tiktok} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <IconBrandTiktok className="w-5 h-5 text-black dark:text-white" />
                        <span className="text-white truncate">TikTok</span>
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Notes */}
                {client.notes && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <IconNotes className="w-5 h-5 text-violet-400" />
                      Notes
                    </h2>
                    <p className="text-white/80 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Right Column - Outreach & Follow-up */}
              <div className="space-y-6">
                {/* Outreach Information */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconCalendar className="w-5 h-5 text-violet-400" />
                    Outreach Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/70">Outreach Type</label>
                      <p className="text-white">{client.outreach_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Outreach Date</label>
                      <p className="text-white">
                        {client.outreach_date 
                          ? new Date(client.outreach_date).toLocaleDateString() 
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Lead Temperature</label>
                      <p className="text-white capitalize">{client.lead_temp}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Did Reply</label>
                      <p className="text-white">{client.did_reply || 'No response yet'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Follow-up Status */}
                <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconTag className="w-5 h-5 text-violet-400" />
                    Follow-up Status
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/70">Status</label>
                      <p className="text-white">{client.follow_up_status || 'Not started'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Follow-up Count</label>
                      <p className="text-white">{client.follow_up_count || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Next Follow-up Date</label>
                      <p className="text-white">
                        {client.next_follow_up_date 
                          ? new Date(client.next_follow_up_date).toLocaleDateString() 
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Platforms Followed Up On</label>
                      <p className="text-white">{client.platforms_followed_up_on || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {client.tags && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-[18px] border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <IconTag className="w-5 h-5 text-violet-400" />
                      Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.split(',').map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-violet-900/30 text-violet-300 rounded-full text-sm border border-violet-500/30"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}