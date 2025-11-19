/**
 * Debug script to check what tables exist in the Supabase database
 * This script can help identify if the closedClients table exists and what its actual name is
 */

import { createClient } from './client'

export const debugDatabaseTables = async () => {
  try {
    const supabase = createClient()
    
    // Try to get table information
    console.log('Checking database tables...')
    
    // Try to list all tables (this might not work depending on permissions)
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
    
    if (error) {
      console.error('Error fetching table information:', error)
    } else {
      console.log('Available tables:')
      data.forEach((table: { table_name: string }) => {
        console.log(`- ${table.table_name}`)
      })
    }
    
    // Try to access closedClients table specifically
    console.log('\nTrying to access closedClients table...')
    const { data: closedClientsData, error: closedClientsError } = await supabase
      .from('closedClients')
      .select('count()')
    
    if (closedClientsError) {
      console.error('Error accessing closedClients table:', closedClientsError)
    } else {
      console.log('Successfully accessed closedClients table')
      console.log('Record count:', closedClientsData)
    }
    
    // Try lowercase version
    console.log('\nTrying to access closedclients table...')
    const { data: lowerData, error: lowerError } = await supabase
      .from('closedclients')
      .select('count()')
    
    if (lowerError) {
      console.error('Error accessing closedclients table:', lowerError)
    } else {
      console.log('Successfully accessed closedclients table')
      console.log('Record count:', lowerData)
    }
    
  } catch (error) {
    console.error('Unexpected error in debugDatabaseTables:', error)
  }
}

// Run the debug function if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  debugDatabaseTables().then(() => {
    console.log('Debug completed')
  }).catch((error) => {
    console.error('Debug failed:', error)
  })
}