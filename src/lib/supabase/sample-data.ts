/**
 * Utility functions to add sample data to the closedClients table
 */

import { createClient } from './client'

// Sample closed clients data
const sampleClients = [
  {
    name: 'TechCorp Solutions',
    videosPerMonth: 3,
    chargePerVideo: 1200,
  },
  {
    name: 'Marketing Masters',
    videosPerMonth: 2,
    chargePerVideo: 800,
  },
  {
    name: 'Design Dynamics',
    videosPerMonth: 4,
    chargePerVideo: 1500,
  },
  {
    name: 'Innovation Labs',
    videosPerMonth: 1,
    chargePerVideo: 2000,
  },
  {
    name: 'Growth Partners',
    videosPerMonth: 5,
    chargePerVideo: 1000,
  }
]

export const addSampleClosedClients = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated. Please log in first.'
      }
    }
    
    // Insert sample clients using camelCase column names
    const clientsWithUser = sampleClients.map(client => ({
      name: client.name,
      videosPerMonth: client.videosPerMonth,
      chargePerVideo: client.chargePerVideo,
      monthlyRevenue: client.videosPerMonth * client.chargePerVideo,
      created_by: user.id
    }))
    
    const { error } = await supabase
      .from('closedClients')
      .insert(clientsWithUser)
    
    if (error) {
      return {
        success: false,
        message: `Failed to insert sample data: ${error.message}`
      }
    }
    
    return {
      success: true,
      message: `Successfully added ${sampleClients.length} sample closed clients to your database.`
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${(error as Error).message}`
    }
  }
}

export const clearClosedClients = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated. Please log in first.'
      }
    }
    
    // Delete all closed clients for this user
    const { error } = await supabase
      .from('closedClients')
      .delete()
      .match({ created_by: user.id })
    
    if (error) {
      return {
        success: false,
        message: `Failed to clear data: ${error.message}`
      }
    }
    
    return {
      success: true,
      message: 'Successfully cleared all closed clients from your database.'
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${(error as Error).message}`
    }
  }
}

// Utility to check the actual table structure
export const checkTableStructure = async (): Promise<{ success: boolean; message: string; columns?: string[] }> => {
  try {
    const supabase = createClient()
    
    // Try to get column information
    const { data, error } = await supabase
      .from('closedClients')
      .select('*')
      .limit(1)
    
    if (error) {
      return {
        success: false,
        message: `Failed to access table: ${error.message}`
      }
    }
    
    // If we get data, extract column names
    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      return {
        success: true,
        message: 'Successfully accessed table',
        columns
      }
    }
    
    // If no data but no error, table exists but is empty
    return {
      success: true,
      message: 'Table exists but is empty',
      columns: []
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${(error as Error).message}`
    }
  }
}