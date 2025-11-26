export type Client = {
  id: string
  created_by: string
  name: string
  email: string
  company?: string | null
  primary_contact?: string | null
  youtube: string | null
  instagram: string | null
  linkedin: string | null
  tiktok: string | null
  twitter?: string | null
  drive_link?: string | null
  subscriber_count?: number | null
  outreach_type?: 'Cold Email' | 'Reedit' | 'YT Jobs' | null
  outreach_platform?: string | null
  outreach_date?: string | null
  outreach_link_sent?: string | null
  outreach_notes?: string | null
  lead_temp: 'cold' | 'warm' | 'hot'
  did_reply?: 'No Reply' | 'Interested' | 'Ghosted' | 'Replied - Needs Follow-up' | null
  follow_up_status?: 'Not Started' | 'In Progress' | 'Completed' | null
  follow_up_count?: number | null
  platforms_followed_up_on?: string | null
  next_follow_up_date?: string | null
  first_outreach_date?: string | null
  source?: string | null
  tags?: string | null
  notes?: string | null
  status: 'active' | 'ongoing' | 'closed' | 'dead'
  website?: string | null
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  client_id: string
  content: string
  created_at: string
}

export type Asset = {
  id: string
  client_id: string
  file_url: string
  file_name: string
  created_at: string
}

export type ClosedClient = {
  id: string
  created_by: string
  name: string
  videosPerMonth: number
  chargePerVideo: number
  monthlyRevenue: number
  created_at: string
}

// Add the Invoice type for client invoices
export type Invoice = {
  id: string
  client_id: string
  amount: number
  status: 'paid' | 'pending'
  file_url: string
  month: string // Format: YYYY-MM
  videos_count: number // Number of videos in this invoice
  created_at: string
}

// Add the ClientEdit type for audit logging
export type ClientEdit = {
  id: string
  client_id: string
  changed_by: string
  changed_at: string
  changed_fields: Record<string, { old: unknown; new: unknown }>
}