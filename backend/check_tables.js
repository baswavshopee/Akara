const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
  const { data, error } = await supabase.from('not_real_table').select('*');
  // It gives an error with a hint. Let's see what we can do.
  // Actually, there's no direct show tables.
}
listTables();
