-- Al-Tabakh Premium Catalog - Supabase Schema

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  desc_en TEXT DEFAULT '',
  desc_ar TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  pieces_per_carton TEXT DEFAULT '',
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT DEFAULT '',
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL DEFAULT '[]',
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (id, name_en, name_ar, sort_order) VALUES
  ('all', 'All Products', 'جميع المنتجات', 0);

INSERT INTO settings (key, value) VALUES
  ('theme', '{"accentColor":"#D11D1D","bgColor":"#0D0D12","textPrimary":"#F0F0F5"}'),
  ('site_info', '{"title":"Al-Tabakh Premium Catalog","phone":"+9647733310100"}');
