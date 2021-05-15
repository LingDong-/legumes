const fs = require('fs');

const {CONFIG,parse_midi,export_midi,compile_score,render_score,export_svg,export_mock_svg,parse_txt,export_txt,score_from_midi,score_to_midi,export_gif} = require("../dist/legumes");
{
  const file = Array.from(new Set(fs.readdirSync('tests/midi').filter(x=>x.endsWith('.mid')))).sort()[Number(process.argv[2]||0)];

  // CONFIG.PAGE_WIDTH = 4000;

  let bytes_in = Array.from(new Uint8Array(fs.readFileSync("tests/midi/"+file)));
  let midi_file = parse_midi(bytes_in);
  // console.dir(midi_file,{ depth: null,'maxArrayLength': 10000000 })

  let score = score_from_midi(midi_file);
  // console.dir(score,{ depth: null,'maxArrayLength': 10000000 });

  compile_score(score);

  // console.dir(score,{ depth: null,'maxArrayLength': 10000000 });

  let drawing = render_score(score);
  // console.dir(drawing,{ depth: null,'maxArrayLength': 10000000 });

  fs.writeFileSync("tmp/test_mock.svg",export_mock_svg(drawing));
  fs.writeFileSync("tmp/test_hf.svg",export_svg(drawing));

  // fs.writeFileSync("tmp/test_hf.gif",Buffer.from(export_gif(drawing,{scale:0.5,iter:1})));

  const txto = export_txt(score);
  fs.writeFileSync("tmp/out.txt",txto);

  let bytes_out = export_midi(midi_file);
  fs.writeFileSync('tmp/out.mid',Buffer.from(bytes_out));

  let midi_file2 = score_to_midi(score);
  // console.dir(midi_file2,{ depth: null,'maxArrayLength': 10000000 })
  let bytes_out2 = export_midi(midi_file2);
  fs.writeFileSync('tmp/out2.mid',Buffer.from(bytes_out2));


  let score2 = score_from_midi(midi_file2);
  // console.dir(score2,{ depth: null,'maxArrayLength': 10000000 });
  compile_score(score2);
  let drawing2 = render_score(score2);
  fs.writeFileSync("tmp/test_hf2.svg",export_svg(drawing2));
}

// if(0)
{
  const file = Array.from(new Set(fs.readdirSync('tests/txt').filter(x=>x.endsWith('.txt')))).sort()[Number(process.argv[3]||0)];
  
  const txt = fs.readFileSync("tests/txt/"+file).toString();
  const score = parse_txt(txt);
  let midi_file2 = score_to_midi(score);
  console.dir(midi_file2,{ depth: null,'maxArrayLength': 10000000 })

  let bytes_out2 = export_midi(midi_file2);
  fs.writeFileSync('tmp/out3.mid',Buffer.from(bytes_out2));

  let score2 = score_from_midi(midi_file2);
  // console.dir(score2,{ depth: null,'maxArrayLength': 10000000 });
  compile_score(score2);
  let drawing2 = render_score(score2);
  fs.writeFileSync("tmp/test_hf3.svg",export_svg(drawing2));
}