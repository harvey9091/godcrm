/**
 * Comprehensive diagnostic tool for closedClients table
 */

import { createClient } from './client'

export const diagnoseTable = async (): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> => {
  try {
    const supabase = createClient()
    
    console.log('=== Starting comprehensive table diagnostics ===')
    
    // 1. Check what tables exist
    console.log('\n1. Checking existing tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
      return {
        success: false,
        message: `Error fetching tables: ${tablesError.message}`
      }
    }
    
    const tableNames = (tables as Array<{table_name: string}>).map(t => t.table_name)
    console.log('Existing tables:', tableNames)
    
    // 2. Check specifically for closed clients tables
    const possibleTableNames = ['closedClients', 'closedclients', 'closed_clients']
    let foundTable: string | null = null
    let foundColumns: string[] = []
    
    console.log('\n2. Checking for closed clients tables...')
    for (const tableName of possibleTableNames) {
      try {
        console.log(`Checking table: ${tableName}`)
        const { data: sampleData, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (selectError) {
          console.log(`  Table ${tableName} not accessible:`, selectError.message)
        } else {
          console.log(`  ✓ Table ${tableName} accessible`)
          foundTable = tableName
          if (sampleData && sampleData.length > 0) {
            foundColumns = Object.keys(sampleData[0])
            console.log(`  Columns:`, foundColumns)
          } else {
            console.log(`  Table exists but is empty`)
          }
          break
        }
      } catch (err) {
        console.log(`  Error checking ${tableName}:`, (err as Error).message)
      }
    }
    
    // 3. If we found a table, check its structure in detail
    if (foundTable) {
      console.log(`\n3. Detailed structure of table ${foundTable}...`)
      
      // Try to get column information from information_schema
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', foundTable)
        .order('ordinal_position')
      
      if (columnsError) {
        console.log('  Could not get detailed column information:', columnsError.message)
      } else {
        console.log('  Column details:')
        columns.forEach((col: {column_name: string, data_type: string, is_nullable: string}) => {
          console.log(`    ${col.column_name} (${col.data_type}, ${col.is_nullable})`)
        })
      }
    }
    
    // 4. Try the specific query that's failing
    console.log('\n4. Testing the specific query that fails in the app...')
    try {
      const { data, error } = await supabase
        .from('closedClients')
        .select('*')
        .order('monthlyRevenue', { ascending: false })
      
      if (error) {
        console.log('  Query failed:', error.message)
        console.log('  Error code:', error.code)
      } else {
        console.log('  Query succeeded!')
        console.log('  Row count:', data.length)
        if (data.length > 0) {
          console.log('  Sample row:', data[0])
        }
      }
    } catch (err) {
      console.log('  Query threw exception:', (err as Error).message)
    }
    
    // Summary
    console.log('\n=== Diagnostics Summary ===')
    if (foundTable) {
      const requiredColumns = ['id', 'created_by', 'name', 'videosPerMonth', 'chargePerVideo', 'monthlyRevenue', 'created_at']
      const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col))
      
      if (missingColumns.length === 0) {
        console.log('✓ Table structure is complete')
        return {
          success: true,
          message: `Table ${foundTable} exists and has all required columns.`,
          details: {
            tableName: foundTable,
            columns: foundColumns,
            rowCount: 'Query test needed'
          }
        }
      } else {
        console.log(`✗ Table is missing columns: ${missingColumns.join(', ')}`)
        return {
          success: false,
          message: `Table ${foundTable} exists but is missing columns: ${missingColumns.join(', ')}`,
          details: {
            tableName: foundTable,
            existingColumns: foundColumns,
            missingColumns: missingColumns
          }
        }
      }
    } else {
      console.log('✗ No closed clients table found')
      return {
        success: false,
        message: 'No closed clients table found. Checked: ' + possibleTableNames.join(', '),
        details: {
          checkedTables: possibleTableNames,
          existingTables: tableNames
        }
      }
    }
  } catch (error) {
    console.error('Diagnostics failed with exception:', error)
    return {
      success: false,
      message: `Diagnostics failed: ${(error as Error).message}`
    }
  }
}

// For direct execution
if (typeof window === 'undefined' && require.main === module) {
  diagnoseTable().then(result => {
    console.log('\n=== FINAL RESULT ===')
    console.log(result.message)
    if (result.details) {
      console.log('Details:', JSON.stringify(result.details, null, 2))
    }
  }).catch(error => {
    console.error('Diagnostics failed:', error)
  })
}