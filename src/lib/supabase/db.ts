import { createClient } from './client'
import { Client, Note, Asset, ClosedClient, ClientEdit, Invoice } from '@/lib/types'

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
    .insert([{ ...client, created_by: user.id }])
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

// Add function to log client edits
export const logClientEdit = async (clientId: string, changedFields: Record<string, { old: unknown; new: unknown }>): Promise<ClientEdit> => {
  const supabase = getSupabaseClient()
  
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('clientEdits')
    .insert([{
      client_id: clientId,
      changed_by: user.id,
      changed_fields: changedFields
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in logClientEdit:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to log client edit. Please make sure you are logged in.')
    }
    throw error
  }
  return data as ClientEdit
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

// Invoices
export const getInvoicesByClientId = async (clientId: string): Promise<Invoice[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Supabase error in getInvoicesByClientId:', error)
    // If it's a permission error, return empty array instead of throwing
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      return []
    }
    throw error
  }
  return data as Invoice[]
}

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .insert([{ ...invoice, created_at: new Date().toISOString() }])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in createInvoice:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to create invoice. Please make sure you are logged in.')
    }
    throw error
  }
  return data as Invoice
}

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error in updateInvoice:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to update invoice. Please make sure you are logged in and have permission to edit this invoice.')
    }
    throw error
  }
  return data as Invoice
}

export const deleteInvoice = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Supabase error in deleteInvoice:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to delete invoice. Please make sure you are logged in and have permission to delete this invoice.')
    }
    throw error
  }
}

// Closed Clients
export const getClosedClients = async (): Promise<ClosedClient[]> => {
  const supabase = getSupabaseClient()
  
  // Log the request for debugging
  console.log('Attempting to fetch closedClients from Supabase...')
  
  try {
    // Use snake_case column names to match the actual database schema
    const { data, error } = await supabase
      .from('closedClients')
      .select(`
        id,
        created_by,
        name,
        videospermonth,
        chargepervideo,
        monthlyrevenue,
        created_at
      `)
      .order('monthlyrevenue', { ascending: false })
    
    if (error) {
      console.error('Supabase error in getClosedClients:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Log additional debugging information
      console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.error('Table name being accessed:', 'closedClients')
      
      // Handle specific error cases with more detailed messages
      if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
        console.error('Permission denied. Check your Supabase credentials and RLS policies.')
        throw new Error('Permission denied: Unable to fetch closed clients. Please make sure you are logged in and have the correct permissions.')
      }
      
      // Handle "relation does not exist" error
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('The closedClients table does not exist in the database.')
        console.error('Please run the create-closed-clients-table.sql script in your Supabase SQL editor.')
        throw new Error('The closedClients table does not exist in your database. Please make sure you have run the create-closed-clients-table.sql script in your Supabase SQL editor.')
      }
      
      // Handle column does not exist error
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('A required column is missing from the closedClients table.')
        console.error('This typically happens when the table structure is incomplete.')
        throw new Error('Column missing error: ' + error.message + '. Please make sure all required columns exist in your closedClients table.')
      }
      
      // Handle 404 errors specifically
      if (error.code === '404' || error.message.includes('404')) {
        console.error('Received 404 error when trying to access closedClients table.')
        console.error('This confirms the table does not exist.')
        console.error('Please run the create-closed-clients-table.sql script in your Supabase SQL editor.')
        throw new Error('The closedClients table was not found in your database. Please make sure you have run the create-closed-clients-table.sql script in your Supabase SQL editor.')
      }
      
      // Handle network/connection errors
      if (error.message.includes('connection') || error.message.includes('network') || error.message.includes('fetch')) {
        console.error('Network error when trying to access closedClients table.')
        throw new Error('Network error: Unable to connect to the database. Please check your internet connection and Supabase configuration.')
      }
      
      // For any other errors, provide a more user-friendly message
      throw new Error(`Database error: ${error.message}`)
    }
    
    // Transform the data to match our TypeScript interface (camelCase)
    const transformedData = data?.map((item: { 
      id: string; 
      created_by: string; 
      name: string; 
      videospermonth: number; 
      chargepervideo: number; 
      monthlyrevenue: number; 
      created_at: string 
    }) => ({
      id: item.id,
      created_by: item.created_by,
      name: item.name,
      videosPerMonth: item.videospermonth,
      chargePerVideo: item.chargepervideo,
      monthlyRevenue: item.monthlyrevenue,
      created_at: item.created_at
    })) || []
    
    return transformedData as ClosedClient[]
  } catch (err) {
    // Handle any unexpected errors
    console.error('Unexpected error in getClosedClients:', err)
    throw new Error(`Unexpected error: ${(err as Error).message}`)
  }
}

export const addClosedClient = async (client: Omit<ClosedClient, 'id' | 'created_by' | 'created_at' | 'monthlyRevenue'> & { videosPerMonth: number, chargePerVideo: number }): Promise<ClosedClient> => {
  const supabase = getSupabaseClient()
  
  // Log the request for debugging
  console.log('Attempting to add closedClient to Supabase...')
  
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Calculate monthly revenue on the server side
  const monthlyRevenue = client.videosPerMonth * client.chargePerVideo
  
  // Use snake_case column names to match the actual database schema
  const { data, error } = await supabase
    .from('closedClients')
    .insert([{ 
      name: client.name,
      videospermonth: client.videosPerMonth,
      chargepervideo: client.chargePerVideo,
      monthlyrevenue: monthlyRevenue,
      created_by: user.id
    }])
    .select(`
      id,
      created_by,
      name,
      videospermonth,
      chargepervideo,
      monthlyrevenue,
      created_at
    `)
    .single()
  
  if (error) {
    console.error('Supabase error in addClosedClient:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    
    // Log additional debugging information
    console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.error('Table name being accessed:', 'closedClients')
    
    // Handle specific error cases
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to create closed client. Please make sure you are logged in.')
    }
    
    // Handle "relation does not exist" error
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      throw new Error('The closedClients table does not exist in your database. Please run the create-closed-clients-table.sql script in your Supabase SQL editor.')
    }
    
    // Handle 404 errors specifically
    if (error.code === '404' || error.message.includes('404')) {
      throw new Error('Received 404 error when trying to access closedClients table. Please run the create-closed-clients-table.sql script in your Supabase SQL editor.')
    }
    
    throw error
  }
  
  // Transform the data to match our TypeScript interface (camelCase)
  const transformedData = {
    id: data.id,
    created_by: data.created_by,
    name: data.name,
    videosPerMonth: data.videospermonth,
    chargePerVideo: data.chargepervideo,
    monthlyRevenue: data.monthlyrevenue,
    created_at: data.created_at
  }
  
  return transformedData as ClosedClient
}

export const updateClosedClient = async (id: string, client: Partial<ClosedClient>): Promise<ClosedClient> => {
  const supabase = getSupabaseClient()
  
  // Prepare update data with snake_case column names
  const updateData: Record<string, unknown> = {}
  
  if (client.name !== undefined) updateData.name = client.name
  if (client.videosPerMonth !== undefined) updateData.videospermonth = client.videosPerMonth
  if (client.chargePerVideo !== undefined) updateData.chargepervideo = client.chargePerVideo
  
  // If videosPerMonth and chargePerVideo are provided, recalculate monthlyRevenue
  if (client.videosPerMonth !== undefined && client.chargePerVideo !== undefined) {
    updateData.monthlyrevenue = client.videosPerMonth * client.chargePerVideo
  } else if (client.videosPerMonth !== undefined || client.chargePerVideo !== undefined) {
    // If only one of them is provided, we need to fetch the other value to recalculate
    const { data: existingClient } = await supabase
      .from('closedClients')
      .select('videospermonth, chargepervideo')
      .eq('id', id)
      .single()
    
    if (existingClient) {
      const videosPerMonth = client.videosPerMonth !== undefined ? client.videosPerMonth : existingClient.videospermonth
      const chargePerVideo = client.chargePerVideo !== undefined ? client.chargePerVideo : existingClient.chargepervideo
      updateData.monthlyrevenue = videosPerMonth * chargePerVideo
    }
  }
  
  const { data, error } = await supabase
    .from('closedClients')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      created_by,
      name,
      videospermonth,
      chargepervideo,
      monthlyrevenue,
      created_at
    `)
    .single()
  
  if (error) {
    console.error('Supabase error in updateClosedClient:', error)
    // If it's a permission error, provide a more helpful message
    if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
      throw new Error('Permission denied: Unable to update closed client. Please make sure you are logged in and have permission to edit this client.')
    }
    throw error
  }
  
  // Transform the data to match our TypeScript interface (camelCase)
  const transformedData = {
    id: data.id,
    created_by: data.created_by,
    name: data.name,
    videosPerMonth: data.videospermonth,
    chargePerVideo: data.chargepervideo,
    monthlyRevenue: data.monthlyrevenue,
    created_at: data.created_at
  }
  
  return transformedData as ClosedClient
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