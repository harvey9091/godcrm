/**
 * Utility script to initialize the closedClients table and policies in Supabase
 * 
 * This script contains the SQL commands needed to create the closedClients table
 * and set up Row Level Security (RLS) policies. Run these commands in your 
 * Supabase SQL editor to set up the closed clients functionality.
 */

export const initializeClosedClientsTable = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // This is just for documentation - you need to run the SQL in Supabase dashboard
    const sql = `
-- Create closedClients table
CREATE TABLE IF NOT EXISTS closedClients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  videosPerMonth INTEGER NOT NULL,
  chargePerVideo INTEGER NOT NULL,
  monthlyRevenue INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE closedClients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own closed clients" ON closedClients;
DROP POLICY IF EXISTS "Users can insert their own closed clients" ON closedClients;
DROP POLICY IF EXISTS "Users can update their own closed clients" ON closedClients;
DROP POLICY IF EXISTS "Users can delete their own closed clients" ON closedClients;

-- Create policies for closedClients
CREATE POLICY "Users can view their own closed clients" ON closedClients
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own closed clients" ON closedClients
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own closed clients" ON closedClients
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own closed clients" ON closedClients
  FOR DELETE USING (created_by = auth.uid());
    `;

    return {
      success: true,
      message: "Please run the following SQL in your Supabase SQL editor:\n\n" + sql
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to generate initialization SQL: " + (error as Error).message
    };
  }
};

// For direct execution in Node.js environment (if needed)
if (typeof window === 'undefined' && require.main === module) {
  initializeClosedClientsTable().then(result => {
    console.log(result.message);
  });
}