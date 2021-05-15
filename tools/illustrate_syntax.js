const EMBED_SVG = false; //not supported by github
const fs = require('fs');
const {CONFIG,compile_score,render_score,export_svg,export_mock_svg,parse_txt,export_txt,register_font,export_sketch_svg,round_polylines} = require("../dist/legumes");

CONFIG.INTER_NOTE_WIDTH = 8;
CONFIG.DURATION_BASED_SPACING = 0.07;
CONFIG.PAGE_MARGIN_X = 30;
CONFIG.PAGE_MARGIN_Y = 30;
CONFIG.STEM_LENGTH = 3;
CONFIG.PAGE_WIDTH = 800;

let md = fs.readFileSync("tools/syntax.md").toString();

let blocks = md.split('```');

for (let i = 1; i < blocks.length; i+=2){
  let code = blocks[i];
  const score = parse_txt(code);
  compile_score(score);
  let drawing = render_score(score);
  round_polylines(drawing.polylines);
  let svg = export_svg(drawing);
  if (EMBED_SVG){
    blocks[i+1] = '\n' + svg + '\n' + blocks[i+1];
  }else{
    let fn = `__syntax_generated_${((i-1)/2).toString().padStart(3,'0')}.svg`
    fs.writeFileSync('screenshots/'+fn,svg);
    blocks[i+1] = `\n![](screenshots/${fn})\n` + blocks[i+1];
  }
}


let md2 = `
<!-- ------- GENERATED FILE DO NOT EDIT! ------- -->
<!-- tools/syntax.md, tools/illustrate_syntax.js -->
`+blocks.join('```');

fs.writeFileSync(`SYNTAX${EMBED_SVG?'.1':''}.md`,md2);