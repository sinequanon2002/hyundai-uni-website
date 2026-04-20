-- Add new columns to support redesigned inquiry form
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'quoted', 'completed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS address_detail TEXT,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Make legacy columns nullable (removed from the new form design)
ALTER TABLE inquiries
  ALTER COLUMN region_sido DROP NOT NULL,
  ALTER COLUMN region_sigungu DROP NOT NULL,
  ALTER COLUMN quantity DROP NOT NULL,
  ALTER COLUMN unit DROP NOT NULL,
  ALTER COLUMN frequency DROP NOT NULL;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_inquiry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiry_updated_at_trigger
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_inquiry_updated_at();

-- Allow authenticated users (admins) to update status and notes
CREATE POLICY "Allow authenticated update" ON inquiries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
