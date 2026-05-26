-- Seed Lomaras™ hero product (run after migration)
INSERT INTO products (id, name, description, price, inventory_count, is_active)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Lomaras™ Ayurvedic Scalp Oil',
  'Cold-infused over seven slow days. Crafted with Bhringraj, Amla, Neem, Sesame, Brahmi & Methi in 100ml amber glass — formulated by a Vaidya who spent four decades studying scalps, not market trends.',
  599.00,
  100,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  inventory_count = EXCLUDED.inventory_count,
  is_active = EXCLUDED.is_active,
  updated_at = now();
