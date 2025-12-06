const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'pages', 'index.js');
const s = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const stack = [];
for (let i = 0; i < s.length; i++) {
  const line = s[i];
  const opens = (line.match(/<div(?![\w\-])/g) || []).length + (line.match(/<div\b/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  for (let j = 0; j < opens; j++) stack.push({line: i+1, text: line.trim()});
  for (let j = 0; j < closes; j++) stack.pop();
}
if (stack.length) {
  console.log('Unclosed <div> tags (top 10):');
  console.log(stack.slice(-10));
} else console.log('All <div> tags balanced.');
console.log('Total unclosed:', stack.length);
