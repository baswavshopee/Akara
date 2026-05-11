require('/home/sandy/Downloads/Devloper/project1/backend/node_modules/dotenv/lib/main.js').config({ path: '/home/sandy/Downloads/Devloper/project1/backend/.env' });
const supabase = require('/home/sandy/Downloads/Devloper/project1/backend/config/supabase.js');

async function testInsert() {
    try {
        const { data, error } = await supabase
            .from('banners')
            .insert({ name: 'Test Category', image_url: 'https://example.com/test.jpg' })
            .select();
        
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

testInsert();
