-- Add slug and image_url to products
ALTER TABLE products ADD COLUMN slug TEXT;
ALTER TABLE products ADD COLUMN image_url TEXT;

-- Set slug for the fallback product
UPDATE products SET slug = 'lomaras-ayurvedic-scalp-oil', image_url = '/images/lomaras-oil.jpg' WHERE id = '6c14e2f3-bef1-4bf8-a7cf-11dd8dac0eec';

-- Make slug unique
ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
