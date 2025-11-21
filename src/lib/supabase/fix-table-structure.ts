/**
 * Utility script to fix the closedClients table structure
 * This script can help add missing columns to the closedClients table
 */

import { createClient } from './client'

export const fixTableStructure = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = createClient()
    
    // First, let's check what tables exist
    console.log('Checking existing tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
    } else {
      console.log('Existing tables:', tables)
    }
    
    // Check specifically for closed clients tables with different naming
    const tableNamesToCheck = ['closedClients', 'closedclients', 'closed_clients']
    
    for (const tableName of tableNamesToCheck) {
      try {
        const { data: sampleData, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (selectError) {
          console.log(`Table ${tableName} not accessible:`, selectError.message)
        } else {
          console.log(`Table ${tableName} accessible. Sample data:`, sampleData)
          if (sampleData && sampleData.length > 0) {
            const columns = Object.keys(sampleData[0])
            console.log(`Columns in ${tableName}:`, columns)
          }
        }
      } catch (err) {
        console.log(`Error checking ${tableName}:`, err)
      }
    }
    
    // Try to access the specific table we're using
    const { data: sampleData, error: selectError } = await supabase
      .from('closedClients')
      .select('*')
      .limit(1)
    
    if (selectError && !selectError.message.includes('column')) {
      // If it's not a column error, it might be a table error
      console.log('Error accessing closedClients table:', selectError.message)
      
      // Try alternative table names
      const alternatives = ['closedclients', 'closed_clients']
      for (const altName of alternatives) {
        try {
          const { data: altData, error: altError } = await supabase
            .from(altName)
            .select('*')
            .limit(1)
          
          if (!altError) {
            console.log(`Found data in alternative table ${altName}`)
            return {
              success: false,
              message: `Data found in table '${altName}' instead of 'closedClients'. Please rename the table or update the application code.`
            }
          }
        } catch (err) {
          console.log(`Alternative table ${altName} also not accessible`)
        }
      }
      
      return {
        success: false,
        message: `Failed to access table: ${selectError.message}. The table may not exist or you may not have permissions.`
      }
    }
    
    // Get existing columns if any data exists
    let existingColumns: string[] = []
    if (sampleData && sampleData.length > 0) {
      existingColumns = Object.keys(sampleData[0])
    }
    
    console.log('Existing columns:', existingColumns)
    
    // Define the required columns
    const requiredColumns = ['id', 'created_by', 'name', 'videosPerMonth', 'chargePerVideo', 'monthlyRevenue', 'created_at']
    
    // Check which columns are missing
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
    
    if (missingColumns.length === 0) {
      return {
        success: true,
        message: 'Table structure is already correct. All required columns exist.'
      }
    }
    
    console.log('Missing columns:', missingColumns)
    
    // For Supabase, we need to add columns using ALTER TABLE
    // However, we can't do this directly from the client-side JavaScript
    // Instead, we'll provide the SQL commands that need to be run
    
    let sqlCommands = ''
    
    // Use consistent table name "closedClients" (with quotes)
    if (missingColumns.includes('videosPerMonth')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS videosPerMonth INTEGER;\n'
    }
    
    if (missingColumns.includes('chargePerVideo')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS chargePerVideo INTEGER;\n'
    }
    
    if (missingColumns.includes('monthlyRevenue')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS monthlyRevenue INTEGER;\n'
    }
    
    if (missingColumns.includes('created_by')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);\n'
    }
    
    if (missingColumns.includes('created_at')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();\n'
    }
    
    if (missingColumns.includes('name')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS name TEXT;\n'
    }
    
    // Add the id column last (though it should already exist in a proper table)
    if (missingColumns.includes('id')) {
      sqlCommands += 'ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();\n'
    }
    
    return {
      success: true,
      message: `Table is missing the following columns: ${missingColumns.join(', ')}.

Please run these SQL commands in your Supabase SQL editor:

${sqlCommands}`
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${(error as Error).message}`
    }
  }
}

// For direct execution in Node.js environment (if needed)
if (typeof window === 'undefined' && require.main === module) {
  fixTableStructure().then(result => {
    console.log(result.message)
  }).catch(error => {
    console.error('Fix failed:', error)
  })
}