-- Add stock column to products (NULL = unlimited, 0 = out of stock)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;

-- Add status column to orders (already exists in seed, but ensure it's there)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
