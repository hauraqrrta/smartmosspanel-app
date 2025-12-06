const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'pages', 'index.js');
const s = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const stack = [];
const openRe = /<([a-zA-Z0-9-_]+)(?=\s|>)/g;
const selfClosingRe = /<([a-zA-Z0-9-_]+)(?=\s|>)[^>]*\/\s*>/g;
for (let i = 0; i < s.length; i++) {
  const line = s[i];
  // remove JSX comments to avoid false matches
  const stripped = line.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  let match;
  // handle self-closing tags
  const selfCloses = (stripped.match(/<[^>]+\/\s*>/g) || []).length;
  // find opens
  while ((match = openRe.exec(stripped))) {
    const tag = match[1];
    // skip closing tags
    const before = stripped[match.index - 1];
    if (before === '/') continue;
    // skip xml prolog
    if (tag === '!') continue;
    // consider it an open
    stack.push({ tag, line: i + 1, text: stripped.trim() });
  }
  // find closes
  const closeRe = /<\/(\w+)>/g;
  while ((match = closeRe.exec(stripped))) {
    const tag = match[1];
    // pop until matching tag
    for (let j = stack.length - 1; j >= 0; j--) {
      if (stack[j].tag === tag) { stack.splice(j, 1); break; }
    }
  }
}
if (stack.length) {
  console.log('Unclosed tags (top 5):');
  console.log(stack.slice(-5));
} else {
  console.log('All tags seem balanced (simple check).');
}
console.log('Done.');
