require('/home/sandy/Downloads/Devloper/project1/backend/node_modules/dotenv/lib/main.js').config({ path: '/home/sandy/Downloads/Devloper/project1/backend/.env' });
const supabase = require('/home/sandy/Downloads/Devloper/project1/backend/config/supabase.js');

async function testProductInsert() {
    try {
        const payload = {
            name: 'effjjff',
            category: 'Badges',
            price: 123,
            original_price: 123,
            image: 'https://images.unsplash.com/photo-1579541591970-e5a10750f0ed',
            description: '', // User left it empty
            theme: null,
            sizes: [],
            colors: [],
            in_stock: true,
            featured: false,
            badge: null,
            rating: 0, // Backend should provide this
            reviews: 0  // Backend should provide this
        };
        const { data, error } = await supabase.from('products').insert(payload).select();
        
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

testProductInsert();
