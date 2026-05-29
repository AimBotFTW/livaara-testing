-- Add reviewer_name column to reviews (missing from initial migration)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name TEXT;
