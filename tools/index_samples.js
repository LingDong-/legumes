const fs = require('fs');
const files = Array.from(new Set(fs.readdirSync('samples').filter(x=>x.endsWith('.svg')).map(x=>x.split('.')[0])));
files.sort();

let cmds = fs.readFileSync('samples/Makefile').toString().split('\n');

let md = '# Samples\n';
for (let i = 0; i < files.length; i++){
  let cmd = cmds.find(x=>x.includes(` ${files[i]}.txt`));
  md += `## [${files[i]}.txt](${files[i]}.txt)\n\n`
  md += `**Regular | [Animated](${files[i]}.anim.svg) | [Hand-drawn](${files[i]}.hand.svg)**\n\n`;
  md += `![](${files[i]}.svg)\n\n`;
  md += '\n```\n'+cmd.slice(4)+'\n```\n'
  md += `\n---\n\n\n`;
}
fs.writeFileSync('samples/README.md',md);