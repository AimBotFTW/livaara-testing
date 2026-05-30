-- Add sequential order_number to orders
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER DEFAULT nextval('orders_order_number_seq');
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique ON orders (order_number);

-- Add COD charge column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_charge NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Add prakriti (dosha type array) to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS prakriti TEXT[] DEFAULT '{}';
