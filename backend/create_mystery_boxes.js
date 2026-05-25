const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTable() {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS mystery_boxes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        category TEXT,
        price TEXT,
        customization TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  console.log("RPC Error:", error);
  
  // If rpc doesn't exist, we can't do this easily.
}
createTable();
