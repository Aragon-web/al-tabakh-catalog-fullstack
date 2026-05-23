const { createClient } = require('@supabase/supabase-js');
const url = 'https://gatrjlwzbmblmxcayyyl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdHJqbHd6Ym1ibG14Y2F5eXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTExMjgzMCwiZXhwIjoyMDk0Njg4ODMwfQ.tKxYQMrOJ9v1INNTPKQftvEnUpjCZ-LuHRucuqp9nlU';
const client = createClient(url, key);
async function run() {
  const { data, error } = await client.rpc('exec_sql', { query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price INTEGER DEFAULT NULL; CREATE TABLE IF NOT EXISTS contacts (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, file_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW());' });
  if (error) { console.error('RPC failed:', error.message); return; }
  console.log('Migration applied:', JSON.stringify(data));
}
run();
