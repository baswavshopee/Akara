require('/home/sandy/Downloads/Devloper/project1/backend/node_modules/dotenv/lib/main.js').config({ path: '/home/sandy/Downloads/Devloper/project1/backend/.env' });
const supabase = require('/home/sandy/Downloads/Devloper/project1/backend/config/supabase.js');

async function createCouponsTable() {
    try {
        // We can't directly create tables via the JS client easily without raw SQL.
        // But we can try to insert a test record to see if it exists, or just rely on the user to run it in the dashboard.
        // Actually, I can use the Supabase SQL API if available, but usually I just assume I should provide the SQL.
        // I'll try to check if I can run a raw query via a stored procedure if one exists, but unlikely.
        
        console.log("Please run the following SQL in your Supabase SQL Editor:");
        console.log(`
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    expiry_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
        `);
    } catch (err) {
        console.error(err);
    }
}

createCouponsTable();
