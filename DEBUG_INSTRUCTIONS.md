# Debugging Closed Clients Table Issues

If you're experiencing issues with the "Failed to fetch closed clients" error, follow these steps:

## 1. Verify Table Creation

Make sure you've run the `create-closed-clients-table.sql` script in your Supabase SQL editor:

```sql
-- Create closedClients table - using exact case as in the application
CREATE TABLE IF NOT EXISTS "closedClients" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  videosPerMonth INTEGER NOT NULL,
  chargePerVideo INTEGER NOT NULL,
  monthlyRevenue INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE "closedClients" ENABLE ROW LEVEL SECURITY;

-- Create policies for closedClients
CREATE POLICY "Users can view their own closed clients" ON "closedClients"
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own closed clients" ON "closedClients"
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own closed clients" ON "closedClients"
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own closed clients" ON "closedClients"
  FOR DELETE USING (created_by = auth.uid());
```

## 2. Use the Debug Page

Navigate to the "Debug Tables" page in your application sidebar. This page will:

- List all available tables in your database
- Try to access the closedClients table with various naming conventions
- Show detailed error messages if access fails

Click the "Run Table Debug" button and check the output for any errors.

## 3. Common Issues and Solutions

### Table Doesn't Exist
If you see errors like "relation does not exist":
1. Make sure you ran the SQL script exactly as provided
2. Check that you're running it in the correct Supabase project
3. Verify the table name is exactly `"closedClients"` (with quotes)

### Permission Denied
If you see "permission denied" errors:
1. Check that RLS is enabled on the table
2. Verify that the policies are correctly set up
3. Make sure you're logged in as a user with proper permissions

### Network Errors
If you see network-related errors:
1. Check your internet connection
2. Verify your Supabase credentials in the `.env` file
3. Ensure your Supabase project is accessible

## 4. Manual Verification

You can also manually check if the table exists by running this query in your Supabase SQL editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'closedClients';
```

If the table exists, this query should return one row.

## 5. Need More Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Look at the network tab to see the exact API responses
3. Contact support with the detailed error messages from the debug page