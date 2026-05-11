
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL or SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data, error } = await supabase.from('products').select('name, category, theme');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  console.log('Total products:', data.length);
  console.log('Sample products:', JSON.stringify(data.slice(0, 10), null, 2));
  
  const categories = [...new Set(data.map(p => p.category))];
  console.log('Categories found in DB:', categories);
}

checkProducts();
