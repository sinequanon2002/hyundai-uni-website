-- Add collection_date and update quantity column type
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS collection_date TEXT,
  ALTER COLUMN quantity TYPE TEXT;

-- Update the view or any other dependent objects if necessary
-- In this case, we just need the columns for the application to work.
