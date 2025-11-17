import { createClient } from './client'
import { Client, Note, Asset } from '@/lib/types'

const supabase = createClient()

// Clients
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Client[]
}

export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Client
}

export const addClient = async (client: Omit<Client, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...client }])
    .select()
    .single()
  
  if (error) throw error
  return data as Client
}

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...client, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Client
}

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Notes
export const getNotesByClientId = async (clientId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Note[]
}

export const createNote = async (note: Omit<Note, 'id' | 'created_at'>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note }])
    .select()
    .single()
  
  if (error) throw error
  return data as Note
}

export const updateNote = async (id: string, content: string): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Note
}

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Assets
export const getAssetsByClientId = async (clientId: string): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Asset[]
}

export const createAsset = async (asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> => {
  const { data, error } = await supabase
    .from('assets')
    .insert([{ ...asset }])
    .select()
    .single()
  
  if (error) throw error
  return data as Asset
}

export const deleteAsset = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}