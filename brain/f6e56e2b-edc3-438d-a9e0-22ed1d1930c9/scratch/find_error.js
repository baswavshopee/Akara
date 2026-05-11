const fs = require('fs');
const parser = require('/home/sandy/Downloads/Devloper/project1/frontend/node_modules/@babel/parser/lib/index.js');

const files = [
    '/home/sandy/Downloads/Devloper/project1/frontend/src/pages/AdminPage.jsx',
    '/home/sandy/Downloads/Devloper/project1/frontend/src/pages/CategoryPage.jsx',
    '/home/sandy/Downloads/Devloper/project1/frontend/src/pages/ProductPage.jsx',
    '/home/sandy/Downloads/Devloper/project1/frontend/src/components/ProductCard.jsx'
];

for (const file of files) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        parser.parse(content, {
            sourceType: 'module',
            plugins: ['jsx']
        });
        console.log(`${file}: OK`);
    } catch (err) {
        console.log(`${file}: ERROR at line ${err.loc.line}, column ${err.loc.column}`);
        console.log(err.message);
    }
}
