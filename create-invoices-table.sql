-- Run these commands in your Supabase SQL editor to create the invoices table

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES "closedClients"(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  description TEXT,
  videos_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  file_url TEXT,
  month TEXT, -- YYYY-MM format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (client_id IN (SELECT id FROM "closedClients" WHERE created_by = auth.uid()));

CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM "closedClients" WHERE created_by = auth.uid()));

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (client_id IN (SELECT id FROM "closedClients" WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (client_id IN (SELECT id FROM "closedClients" WHERE created_by = auth.uid()));