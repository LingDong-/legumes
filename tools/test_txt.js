const fs = require('fs');
const {CONFIG,compile_score,render_score,export_svg,export_mock_svg,parse_txt,export_txt,register_font,export_sketch_svg} = require("../dist/legumes");

const file = Array.from(new Set(fs.readdirSync('tests/txt').filter(x=>x.endsWith('.txt')))).sort()[Number(process.argv[2]||0)];
  

let font = JSON.parse(fs.readFileSync("tools/chinese.hf.json").toString());
register_font(font.cmap,font.data,font.scale);
CONFIG.LYRIC_SCALE=0.7;
CONFIG.CUE_HEIGHT=0;
CONFIG.DURATION_BASED_SPACING=0.01;
CONFIG.INTER_NOTE_WIDTH=2;
const txt = fs.readFileSync("tests/txt/"+file).toString();
// const txt = fs.readFileSync("out.txt").toString();

const score = parse_txt(txt);

// console.dir(score,{ depth: null,'maxArrayLength': 10000000 });

compile_score(score);

console.dir(score,{ depth: null,'maxArrayLength': 10000000 });

let drawing = render_score(score);

fs.writeFileSync("tmp/test_mock.svg",export_mock_svg(drawing));
fs.writeFileSync("tmp/test_hf.svg",export_svg(drawing));
fs.writeFileSync("tmp/test_sketch.svg",export_sketch_svg(drawing));

const txto = export_txt(score);
fs.writeFileSync("tmp/out.txt",txto);

const scoreo = parse_txt(txto);
compile_score(scoreo);
let drawingo = render_score(scoreo);
fs.writeFileSync("tmp/test_o.svg",export_svg(drawingo));