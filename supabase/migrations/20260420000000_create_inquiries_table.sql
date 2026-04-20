-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  region_sido TEXT NOT NULL,
  region_sigungu TEXT NOT NULL,
  waste_types TEXT[] NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL,
  message TEXT,
  agreement BOOLEAN NOT NULL DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anon users for the inquiry form)
CREATE POLICY "Allow anon insert" ON inquiries
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to read (for the dashboard)
CREATE POLICY "Allow authenticated read" ON inquiries
  FOR SELECT
  TO authenticated
  USING (true);
