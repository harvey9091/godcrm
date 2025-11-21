# Closed Clients Table Fix Instructions

## Issue Identified

Your `closedClients` table is missing required columns:
- `chargePerVideo`
- `monthlyRevenue`

This is causing the error: "Database error: column closedClients.monthlyRevenue does not exist"

## How to Fix

### Step 1: Check Current Table Structure
1. Go to the **Closed Clients** page in your application
2. Click the **"Check Structure"** button
3. Note which columns are missing

### Step 2: Fix Table Structure
1. Click the **"Fix Structure"** button
2. This will show you the SQL commands needed to fix your table
3. Copy the SQL commands

### Step 3: Run SQL Commands in Supabase
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Paste the SQL commands and run them

The commands will look like this:
```sql
ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS videosPerMonth INTEGER;
ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS chargePerVideo INTEGER;
ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS monthlyRevenue INTEGER;
ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE "closedClients" ADD COLUMN IF NOT EXISTS name TEXT;
```

### Step 4: Verify the Fix
1. Refresh your Closed Clients page
2. Click **"Check Structure"** again to verify all columns exist
3. Try adding sample data with the **"Add Sample Data"** button

## Alternative Solution: Recreate the Table

If the above doesn't work, you can recreate the entire table:

1. **Backup any existing data** (if you have any important closed clients)
2. Run this SQL in your Supabase SQL editor:

```sql
-- Drop the existing table
DROP TABLE IF EXISTS "closedClients";

-- Recreate the table with correct structure
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

## After Fixing

Once you've fixed the table structure:
1. You should be able to add sample data
2. The dashboard will show real revenue data instead of demo data
3. All functionality should work correctly

## Files Modified

1. `src/lib/supabase/sample-data.ts` - Added table structure checking utility
2. `src/lib/supabase/fix-table-structure.ts` - Created table fixing utility
3. `src/app/assets/page.tsx` - Added buttons for checking and fixing table structure