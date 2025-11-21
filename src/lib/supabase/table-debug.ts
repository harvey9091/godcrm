/**
 * Enhanced debug script to check what tables exist in the Supabase database
 * This script can help identify if the closedClients table exists and what its actual name is
 */

import { createClient } from './client'

export const debugDatabaseTables = async () => {
  try {
    const supabase = createClient()
    
    console.log('=== Supabase Table Debug Information ===')
    
    // Try to get table information from information_schema
    console.log('\n1. Checking database tables via information_schema...')
    
    // Try to list all tables (this might not work depending on permissions)
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT table_name, table_schema 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `
      })
    
    if (tablesError) {
      console.error('Error fetching table information:', tablesError)
      
      // Fallback: try a simpler query
      console.log('\nTrying fallback method...')
      const { data: simpleData, error: simpleError } = await supabase
        .rpc('execute_sql', {
          query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        })
      
      if (simpleError) {
        console.error('Fallback method also failed:', simpleError)
      } else {
        console.log('Tables found (fallback method):')
        simpleData.forEach((row: { tablename: string }) => {
          console.log(`- ${row.tablename}`)
        })
      }
    } else {
      console.log('Available tables:')
      tablesData.forEach((row: { table_name: string }) => {
        console.log(`- ${row.table_name}`)
      })
    }
    
    // Try to access closedClients table specifically (with different naming variations)
    const tableVariations = [
      'closedClients',
      'closedclients',
      'closed_clients',
      '"closedClients"'
    ]
    
    for (const tableName of tableVariations) {
      console.log(`\n2. Trying to access table: ${tableName}...`)
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.error(`Error accessing ${tableName}:`, error.message)
        } else {
          console.log(`Successfully accessed ${tableName}`)
          console.log(`Record count: ${count}`)
        }
      } catch (accessError) {
        console.error(`Exception when accessing ${tableName}:`, (accessError as Error).message)
      }
    }
    
    console.log('\n=== Debug completed ===')
    
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