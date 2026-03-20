require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('inventory_history')
    .select('*')
    .eq('type', 'CONSUME');
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
