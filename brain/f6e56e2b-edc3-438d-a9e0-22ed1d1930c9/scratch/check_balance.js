const fs = require('fs');
const path = require('path');

const filePath = '/home/sandy/Downloads/Devloper/project1/frontend/src/pages/AdminPage.jsx';
const content = fs.readFileSync(filePath, 'utf8');

function checkBalance(text) {
    let braces = 0;
    let parens = 0;
    let brackets = 0;
    for (let char of text) {
        if (char === '{') braces++;
        if (char === '}') braces--;
        if (char === '(') parens++;
        if (char === ')') parens--;
        if (char === '[') brackets++;
        if (char === ']') brackets--;
    }
    return { braces, parens, brackets };
}

console.log(checkBalance(content));
