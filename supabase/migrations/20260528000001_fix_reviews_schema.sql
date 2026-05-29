-- Rename text/boolean columns directly
ALTER TABLE reviews RENAME COLUMN comment TO review_text;
ALTER TABLE reviews RENAME COLUMN is_verified_buyer TO is_verified_purchase;

-- Add new columns to match the application code expectations
ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reviews ADD COLUMN customer_id UUID REFERENCES customers (id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN image_url TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Migrate data from old columns to new columns
UPDATE reviews SET is_approved = (status = 'approved');
UPDATE reviews r SET customer_id = c.id FROM customers c WHERE r.customer_name = c.name;

-- Drop deprecated columns
ALTER TABLE reviews DROP COLUMN status;
ALTER TABLE reviews DROP COLUMN customer_name;
