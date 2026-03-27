const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

fetch(`${SUPABASE_URL}/rest/v1/inventory_history?select=type`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
})
.then(res => res.json())
.then(data => {
    // Note: This will return empty unless RLS allows anon access, 
    // which it doesn't. We need to auth.
    console.log(data);
})
.catch(console.error);
