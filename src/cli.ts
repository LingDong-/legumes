#!/usr/bin/env node

import {
  NOTE_LENGTH,ACCIDENTAL,CLEF,ARTICULATION,CUE,BARLINE,BRACKET,CONFIG,
  parse_midi, score_from_midi, score_to_midi,
  compile_score,
  export_animated_svg, export_svg, export_mock_svg, export_sketch_svg,
  parse_txt, export_txt, export_pdf, render_score, export_midi, export_gif,
  register_font,
} from "./main";

import fs from 'fs';
import path from 'path';
import { Drawing, round_polylines } from "./drawing";
import { Score_itf } from "./common";

let build_date = 'sed-auto-replace-date-yyyy-mm-dd';

function print_help(){
  console.log(`legumes: render sheet music => polylines`);
  console.log(`(build ${build_date})\n`)
  console.log(`usage:\n`)
  console.log(`legc [options] file.(txt|mid) > output.ext\n`);
  console.log(`options:\n`)
  console.log("--format pdf|svg|gif|json|txt|mid|      Output format");
  console.log("         svg-mock|svg-anim|svg-hand     ");
  console.log("--font   font.json                      Custom Hershey font")
  console.log("--config config.json                    Configuration file, OR");
  console.log("                                        as below arguments:\n");
  let o = "";
  let nl = false;
  let keys = Object.keys(CONFIG).sort();
  for (let k of keys){
    let t = '--'+k.toLowerCase().replace(/_/g,'-');
    let v = Number(CONFIG[k]).toString();
    let l = 37-t.length-v.length;
    o += t+' '.repeat(l)+v;
    if (nl){
      console.log(o);
      o = '';
    }else{
      o += '     '
    }
    nl = !nl;
  }
  if (o.length){
    console.log(o);
  }
}

if (process.argv.length <= 2){
  print_help();
  process.exit(0);
}

let i = 2;
let input_path : string;
let inp_format = 'txt';
let out_format = 'pdf';



while (i < process.argv.length){
  if (process.argv[i] == '--help' || process.argv[i] == '-h'){
    print_help();
    process.exit(0);
  }else if (process.argv[i] == '--version' || process.argv[i] == '-v'){
    console.log(build_date);
    process.exit(0);
  }else if (process.argv[i] == '--format'){
    out_format = process.argv[i+1];
    i+=2;
  }else if (process.argv[i] == '--config'){
    Object.assign(CONFIG,JSON.parse(fs.readFileSync(process.argv[i+1]).toString()));
    i+=2;
  }else if (process.argv[i] == '--font'){
    let font = JSON.parse(fs.readFileSync(process.argv[i+1]).toString());
    register_font(font.cmap, font.data, font.scale??1);
    i+=2;
  }else if (process.argv[i].slice(0,2) == '--'){
    let k = process.argv[i].slice(2).toUpperCase().replace(/-/g,'_');
    let v = Number(process.argv[i+1]);

    if (CONFIG[k] === undefined){
      console.error("unrecognized option: "+process.argv[i]);
      process.exit(1);
    }
    if (isNaN(v)){
      console.error(`invalid value for option '${process.argv[i]}': ${process.argv[i+1]}`);
      process.exit(1);
    }
    CONFIG[k] = v;
    i+=2;
  }else{
    input_path = process.argv[i];
    i++;
  }
}
if (!input_path){
  console.error("no input file.");
  process.exit(1);
}

let input = path.parse(input_path);
if (input.ext != '.txt' && input.ext != '.mid'){
  console.error(`unsupported file format '${input.ext}'`);
  process.exit(1);
}else{
  inp_format = input.ext.slice(1);
}

let score : Score_itf;
if (inp_format == 'mid'){
  const bytes = Array.from(new Uint8Array(fs.readFileSync(input_path)));
  const midi_file = parse_midi(bytes);
  score = score_from_midi(midi_file);
}else if (inp_format == 'txt'){
  const txt = fs.readFileSync(input_path).toString();
  score = parse_txt(txt);
}

score = compile_score(score);

let drawing : Drawing;

if (out_format == 'txt'){
  const txto = export_txt(score);
  console.log(txto);
  process.exit(0);
}else{
  drawing = render_score(score as any);
  round_polylines(drawing.polylines,2);
}

if (out_format == 'json'){
  console.dir(
    {score,drawing},
    { depth: null,'maxArrayLength': Infinity }
  );
}else if (out_format == 'svg'){
  console.log(export_svg(drawing));
}else if (out_format == 'pdf'){
  console.log(export_pdf(drawing));
}else if (out_format == 'svg-mock'){
  console.log(export_mock_svg(drawing));
}else if (out_format == 'svg-anim'){
  console.log(export_animated_svg(drawing));
}else if (out_format == 'svg-hand'){
  console.log(export_sketch_svg(drawing));
}else if (out_format == 'mid'){
  let midi_file = score_to_midi(score);
  let bytes = export_midi(midi_file);
  process.stdout.write(Buffer.from(bytes));
  // fs.writeFileSync('test.mid',Buffer.from(bytes));
}else if (out_format == 'gif'){
  let bytes = export_gif(drawing);
  process.stdout.write(Buffer.from(bytes));
}else{
  console.error("unrecognized output format: "+out_format);
  process.exit(1);
}

