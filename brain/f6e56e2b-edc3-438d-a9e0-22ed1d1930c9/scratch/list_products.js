require('/home/sandy/Downloads/Devloper/project1/backend/node_modules/dotenv/lib/main.js').config({ path: '/home/sandy/Downloads/Devloper/project1/backend/.env' });
const supabase = require('/home/sandy/Downloads/Devloper/project1/backend/config/supabase.js');

async function listProducts() {
    try {
        const { data, error } = await supabase.from('products').select('name, category, theme');
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Products:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

listProducts();
