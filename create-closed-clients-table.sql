-- Run these commands in your Supabase SQL editor to create the closedClients table

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