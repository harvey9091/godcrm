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
  IconInfoCircle
} from '@tabler/icons-react'
import { Client } from '@/lib/types'

interface ClientDetailModalProps {
  client: Client | null
  open: boolean
  onClose: () => void
}

interface YouTubeData {
  title: string
  description: string
  thumbnail_url: string
  author_name: string
  author_url: string
  subscriber_count?: string
}

export function ClientDetailModal({ client, open, onClose }: ClientDetailModalProps) {
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
        className="!w-[80vw] !max-w-[1600px] !min-w-[70vw] h-[85vh] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg bg-card/40 border border-white/10 p-0"
        style={{
          animation: open ? 'modalEnter 250ms ease-out' : 'modalExit 250ms ease-in'
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
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <IconX className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex flex-col h-full">
          {/* Hero Section - Full Width Header */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 p-8 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                {loading ? (
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-400"></div>
                  </div>
                ) : youtubeData?.thumbnail_url ? (
                  <img 
                    src={youtubeData.thumbnail_url} 
                    alt="Channel thumbnail" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-violet-400/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                    <IconUser className="w-16 h-16 text-violet-400/50" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-4">{client.name}</h1>
                
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
                        <span className="text-white/90 text-lg">
                          {youtubeData.subscriber_count || 'N/A'} subscribers
                        </span>
                      </div>
                      <a 
                        href={client.youtube || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-300 hover:text-violet-200 flex items-center gap-2 text-lg transition-colors"
                      >
                        <IconBrandYoutube className="w-5 h-5" />
                        <span>View Channel</span>
                      </a>
                    </div>
                    
                    {youtubeData.description && (
                      <p className="text-white/80 text-base leading-relaxed">
                        {youtubeData.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-white/70 text-lg">No YouTube channel linked</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="overflow-y-auto custom-scrollbar pr-2 flex-grow p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Client Information */}
              <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <IconUser className="w-5 h-5 text-violet-400" />
                  Client Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Name</p>
                      <p className="font-medium text-white text-base">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Email</p>
                      <p className="font-medium text-white text-base">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Company</p>
                      <p className="font-medium text-white text-base">{client.company || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Primary Contact</p>
                      <p className="font-medium text-white text-base">{client.primary_contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Website</p>
                      <p className="font-medium text-white text-base">
                        {client.website ? (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:text-violet-200 hover:underline">
                            {client.website}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Status</p>
                      <p className="font-medium text-white text-base capitalize">{client.status}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {client.website ? (
                    <a 
                      href={client.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 bg-violet-900/20 rounded-xl hover:bg-violet-900/30 hover:scale-105 transition-all duration-200 group"
                    >
                      <IconLink className="w-8 h-8 text-violet-400 group-hover:text-violet-300" />
                      <span className="text-sm text-white/80 text-center">Website</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <IconLink className="w-8 h-8 text-white/30" />
                      <span className="text-sm text-white/50 text-center">Website</span>
                    </div>
                  )}
                  
                  {client.youtube ? (
                    <a 
                      href={client.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 bg-red-900/20 rounded-xl hover:bg-red-900/30 hover:scale-105 transition-all duration-200 group"
                    >
                      <IconBrandYoutube className="w-8 h-8 text-red-500 group-hover:text-red-400" />
                      <span className="text-sm text-white/80 text-center">YouTube</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <IconBrandYoutube className="w-8 h-8 text-white/30" />
                      <span className="text-sm text-white/50 text-center">YouTube</span>
                    </div>
                  )}
                  
                  {client.twitter ? (
                    <a 
                      href={client.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 bg-blue-900/20 rounded-xl hover:bg-blue-900/30 hover:scale-105 transition-all duration-200 group"
                    >
                      <IconBrandTwitter className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                      <span className="text-sm text-white/80 text-center">Twitter</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <IconBrandTwitter className="w-8 h-8 text-white/30" />
                      <span className="text-sm text-white/50 text-center">Twitter</span>
                    </div>
                  )}
                  
                  {client.instagram ? (
                    <a 
                      href={client.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 bg-pink-900/20 rounded-xl hover:bg-pink-900/30 hover:scale-105 transition-all duration-200 group"
                    >
                      <IconBrandInstagram className="w-8 h-8 text-pink-500 group-hover:text-pink-400" />
                      <span className="text-sm text-white/80 text-center">Instagram</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <IconBrandInstagram className="w-8 h-8 text-white/30" />
                      <span className="text-sm text-white/50 text-center">Instagram</span>
                    </div>
                  )}
                  
                  {client.linkedin ? (
                    <a 
                      href={client.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 bg-blue-900/20 rounded-xl hover:bg-blue-900/30 hover:scale-105 transition-all duration-200 group"
                    >
                      <IconBrandLinkedin className="w-8 h-8 text-blue-500 group-hover:text-blue-400" />
                      <span className="text-sm text-white/80 text-center">LinkedIn</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <IconBrandLinkedin className="w-8 h-8 text-white/30" />
                      <span className="text-sm text-white/50 text-center">LinkedIn</span>
                    </div>
                  )}
                  
                  {client.tiktok ? (
                    <a 
                      href={client.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 bg-gray-900/20 rounded-xl hover:bg-gray-900/30 hover:scale-105 transition-all duration-200 group"
                    >
                      <IconBrandTiktok className="w-8 h-8 text-white group-hover:text-gray-300" />
                      <span className="text-sm text-white/80 text-center">TikTok</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <IconBrandTiktok className="w-8 h-8 text-white/30" />
                      <span className="text-sm text-white/50 text-center">TikTok</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Outreach Information */}
              <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <IconMail className="w-5 h-5 text-violet-400" />
                  Outreach Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Outreach Type</p>
                      <p className="font-medium text-white text-base">{client.outreach_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Outreach Platform</p>
                      <p className="font-medium text-white text-base">{client.outreach_platform || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Outreach Date</p>
                      <p className="font-medium text-white text-base">
                        {client.outreach_date ? new Date(client.outreach_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">First Outreach Date</p>
                      <p className="font-medium text-white text-base">
                        {client.first_outreach_date ? new Date(client.first_outreach_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60 mb-1">Outreach Link Sent</p>
                    <p className="font-medium text-white text-base">{client.outreach_link_sent || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60 mb-1">Outreach Notes</p>
                    <p className="font-medium text-white text-base">{client.outreach_notes || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Follow-up Information */}
              <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <IconCalendar className="w-5 h-5 text-violet-400" />
                  Follow-up Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Lead Temperature</p>
                      <p className="font-medium text-white text-base capitalize">{client.lead_temp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Did They Reply?</p>
                      <p className="font-medium text-white text-base">{client.did_reply || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Follow-up Status</p>
                      <p className="font-medium text-white text-base">{client.follow_up_status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Follow-up Count</p>
                      <p className="font-medium text-white text-base">{client.follow_up_count || 0}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Platforms Followed Up On</p>
                      <p className="font-medium text-white text-base">{client.platforms_followed_up_on || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Next Follow-up Date</p>
                      <p className="font-medium text-white text-base">
                        {client.next_follow_up_date ? new Date(client.next_follow_up_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes / Internal Info */}
              {(client.notes || client.source || client.tags) && (
                <div className="lg:col-span-2 bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <IconNotes className="w-5 h-5 text-violet-400" />
                    Notes & Internal Information
                  </h2>
                  <div className="space-y-6">
                    {client.notes && (
                      <div>
                        <p className="text-sm text-white/60 mb-2 flex items-center gap-1">
                          <IconNotes className="w-4 h-4" />
                          Notes
                        </p>
                        <p className="font-medium text-white whitespace-pre-wrap bg-white/5 p-4 rounded-lg text-base leading-relaxed">
                          {client.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {client.source && (
                        <div>
                          <p className="text-sm text-white/60 mb-2 flex items-center gap-1">
                            <IconTag className="w-4 h-4" />
                            Source
                          </p>
                          <p className="font-medium text-white bg-white/5 p-3 rounded-lg text-base">
                            {client.source}
                          </p>
                        </div>
                      )}
                      
                      {client.tags && (
                        <div>
                          <p className="text-sm text-white/60 mb-2 flex items-center gap-1">
                            <IconTag className="w-4 h-4" />
                            Tags
                          </p>
                          <p className="font-medium text-white bg-white/5 p-3 rounded-lg text-base">
                            {client.tags}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="bg-card/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-sm text-white/60 mb-1">Subscriber Count</p>
                    <p className="font-bold text-xl text-white">
                      {client.subscriber_count ? client.subscriber_count.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-sm text-white/60 mb-1">Created At</p>
                    <p className="font-bold text-xl text-white">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-sm text-white/60 mb-1">Lead Temp</p>
                    <p className="font-bold text-xl text-white capitalize">{client.lead_temp}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-sm text-white/60 mb-1">Status</p>
                    <p className="font-bold text-xl text-white capitalize">{client.status}</p>
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