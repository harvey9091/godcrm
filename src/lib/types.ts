export type Client = {
  id: string
  created_by: string
  name: string
  email: string
  youtube: string | null
  instagram: string | null
  linkedin: string | null
  tiktok: string | null
  status: 'active' | 'ongoing' | 'closed' | 'dead'
  lead_temp: 'cold' | 'warm' | 'hot'
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