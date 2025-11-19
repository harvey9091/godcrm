import { createClient } from './client'
import { Client, Note, Asset, ClosedClient } from '@/lib/types'

// Create a new client instance for each request to avoid state issues
const getSupabaseClient = () => createClient()

// Clients
export const getClients = async (): Promise<Client[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Supabase error in getClients:', error)
    // If it's a permission error, return empty array instead of throwing
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      return []
    }
    throw error
  }
  return data as Client[] || []
}

export const getClientById = async (id: string): Promise<Client | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Supabase error in getClientById:', error)
    // If it's a permission error, return null instead of throwing
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      return null
    }
    throw error
  }
  return data as Client
}

export const addClient = async (client: Omit<Client, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'follow_up_count'>): Promise<Client> => {
  const supabase = getSupabaseClient()
  
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...client, created_by: user.id, follow_up_count: 0 }])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in addClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to create client. Please make sure you are logged in.')
    }
    throw error
  }
  return data as Client
}

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .update({ ...client, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in updateClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to update client. Please make sure you are logged in and have permission to edit this client.')
    }
    throw error
  }
  return data as Client
}

export const deleteClient = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Supabase error in deleteClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to delete client. Please make sure you are logged in and have permission to delete this client.')
    }
    throw error
  }
}

// Notes
export const getNotesByClientId = async (clientId: string): Promise<Note[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Supabase error in getNotesByClientId:', error)
    // If it's a permission error, return empty array instead of throwing
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      return []
    }
    throw error
  }
  return data as Note[]
}

export const createNote = async (note: Omit<Note, 'id' | 'created_at'>): Promise<Note> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note }])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in createNote:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to create note. Please make sure you are logged in.')
    }
    throw error
  }
  return data as Note
}

export const updateNote = async (id: string, content: string): Promise<Note> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in updateNote:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to update note. Please make sure you are logged in and have permission to edit this note.')
    }
    throw error
  }
  return data as Note
}

export const deleteNote = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Supabase error in deleteNote:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to delete note. Please make sure you are logged in and have permission to delete this note.')
    }
    throw error
  }
}

// Assets
export const getAssetsByClientId = async (clientId: string): Promise<Asset[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Supabase error in getAssetsByClientId:', error)
    // If it's a permission error, return empty array instead of throwing
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      return []
    }
    throw error
  }
  return data as Asset[]
}

export const createAsset = async (asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('assets')
    .insert([{ ...asset }])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in createAsset:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to upload asset. Please make sure you are logged in.')
    }
    throw error
  }
  return data as Asset
}

export const deleteAsset = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Supabase error in deleteAsset:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to delete asset. Please make sure you are logged in and have permission to delete this asset.')
    }
    throw error
  }
}

// Closed Clients
export const getClosedClients = async (): Promise<ClosedClient[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('closedClients')
    .select('*')
    .order('monthlyRevenue', { ascending: false })
  
  if (error) {
    console.error('Supabase error in getClosedClients:', error)
    // If it's a permission error, return empty array instead of throwing
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      return []
    }
    throw error
  }
  return data as ClosedClient[] || []
}

export const addClosedClient = async (client: Omit<ClosedClient, 'id' | 'created_by' | 'created_at' | 'monthlyRevenue'> & { videosPerMonth: number, chargePerVideo: number }): Promise<ClosedClient> => {
  const supabase = getSupabaseClient()
  
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Calculate monthly revenue on the server side
  const monthlyRevenue = client.videosPerMonth * client.chargePerVideo
  
  const { data, error } = await supabase
    .from('closedClients')
    .insert([{ 
      ...client, 
      created_by: user.id,
      monthlyRevenue
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in addClosedClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to create closed client. Please make sure you are logged in.')
    }
    throw error
  }
  return data as ClosedClient
}

export const updateClosedClient = async (id: string, client: Partial<ClosedClient>): Promise<ClosedClient> => {
  const supabase = getSupabaseClient()
  
  // If videosPerMonth and chargePerVideo are provided, recalculate monthlyRevenue
  let updateData = { ...client }
  if (client.videosPerMonth !== undefined && client.chargePerVideo !== undefined) {
    updateData = {
      ...client,
      monthlyRevenue: client.videosPerMonth * client.chargePerVideo
    }
  } else if (client.videosPerMonth !== undefined || client.chargePerVideo !== undefined) {
    // If only one of them is provided, we need to fetch the other value to recalculate
    const { data: existingClient } = await supabase
      .from('closedClients')
      .select('videosPerMonth, chargePerVideo')
      .eq('id', id)
      .single()
    
    if (existingClient) {
      const videosPerMonth = client.videosPerMonth !== undefined ? client.videosPerMonth : existingClient.videosPerMonth
      const chargePerVideo = client.chargePerVideo !== undefined ? client.chargePerVideo : existingClient.chargePerVideo
      updateData = {
        ...client,
        monthlyRevenue: videosPerMonth * chargePerVideo
      }
    }
  }
  
  const { data, error } = await supabase
    .from('closedClients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in updateClosedClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to update closed client. Please make sure you are logged in and have permission to edit this client.')
    }
    throw error
  }
  return data as ClosedClient
}

export const deleteClosedClient = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('closedClients')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Supabase error in deleteClosedClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to delete closed client. Please make sure you are logged in and have permission to delete this client.')
    }
    throw error
  }
}