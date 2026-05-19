-- Add image_url column to categories (run this in Supabase SQL editor)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
