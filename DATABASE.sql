-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  primary_contact TEXT,
  youtube TEXT,
  instagram TEXT,
  linkedin TEXT,
  tiktok TEXT,
  twitter TEXT,
  drive_link TEXT,
  subscriber_count INTEGER,
  outreach_type TEXT CHECK (outreach_type IN ('Cold Email', 'Reedit', 'YT Jobs')),
  outreach_platform TEXT,
  outreach_date DATE,
  outreach_link_sent TEXT,
  outreach_notes TEXT,
  lead_temp TEXT CHECK (lead_temp IN ('cold', 'warm', 'hot')) DEFAULT 'cold',
  did_reply TEXT CHECK (did_reply IN ('No Reply', 'Interested', 'Ghosted', 'Replied - Needs Follow-up')),
  follow_up_status TEXT CHECK (follow_up_status IN ('Not Started', 'In Progress', 'Completed')),
  follow_up_count INTEGER DEFAULT 0,
  platforms_followed_up_on TEXT,
  next_follow_up_date DATE,
  first_outreach_date DATE,
  source TEXT,
  tags TEXT,
  notes TEXT,
  website TEXT,
  status TEXT CHECK (status IN ('active', 'ongoing', 'closed', 'dead')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE "closedClients" ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (created_by = auth.uid());

-- Create policies for notes
CREATE POLICY "Users can view notes for their clients" ON notes
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

CREATE POLICY "Users can insert notes for their clients" ON notes
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update notes for their clients" ON notes
  FOR UPDATE USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete notes for their clients" ON notes
  FOR DELETE USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

-- Create policies for assets
CREATE POLICY "Users can view assets for their clients" ON assets
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

CREATE POLICY "Users can insert assets for their clients" ON assets
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete assets for their clients" ON assets
  FOR DELETE USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

-- Create policies for closedClients
CREATE POLICY "Users can view their own closed clients" ON "closedClients"
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own closed clients" ON "closedClients"
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own closed clients" ON "closedClients"
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own closed clients" ON "closedClients"
  FOR DELETE USING (created_by = auth.uid());

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE
  ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create clientEdits audit log table
CREATE TABLE clientEdits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_fields JSONB
);

-- Add website column to existing clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;

-- Enable RLS (Row Level Security) for clientEdits
ALTER TABLE clientEdits ENABLE ROW LEVEL SECURITY;

-- Create policies for clientEdits
CREATE POLICY "Users can view edits for their clients" ON clientEdits
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));

CREATE POLICY "Users can insert edits for their clients" ON clientEdits
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));