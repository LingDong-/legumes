import {NOTE_LENGTH,ACCIDENTAL,CLEF, ARTICULATION, CUE, BRACKET} from './common';
import {HERSHEY,Hershey_entry,ascii_map, get_text_width, FONT} from './hershey';

export interface Element{
  tag: string;
  x: number;
  y: number;
  w: number;
  h: number;
  [other_options: string]: any
}

export interface Drawing{
  w:number;
  h:number;
  elements:Element[];
  polylines:[number,number][][];
}

export function export_mock_svg(dr:Drawing):string{
  let width = dr.w;
  let height = dr.h;
  let elements = dr.elements;
  let o : string = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  for (let i = 0; i < elements.length; i++){
    let elt = elements[i];
    let {tag,x,y,w,h} = elt;
    if (tag == 'note_head'){
      if (elt.stem_dir < 0){
        if (elt.twisted){
          o += `<rect x="${x}" y="${y-2}" width="${10}" height="${4}" fill="blue"/>`;
        }else{
          o += `<rect x="${x-10}" y="${y-2}" width="${10}" height="${4}" fill="blue"/>`;
        }
      }else{
        if (!elt.twisted){
          o += `<rect x="${x}" y="${y-2}" width="${10}" height="${4}" fill="blue"/>`;
        }else{
          o += `<rect x="${x-10}" y="${y-2}" width="${10}" height="${4}" fill="blue"/>`;
        }
        
      }
      o += `<text x="${x}" y="${y}" font-size="8" fill="red">${elt.duration}</text>`
    }else if (tag == 'rest'){
      o += `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" fill="rgba(0,255,0,0.2)" stroke="black"/>`
      o += `<text x="${x-w/2}" y="${y-h/2}" font-size="8">${elt.duration}</text>`
    }else if (tag == 'accidental' || tag == 'clef' || tag == 'timesig_digit'){
      o += `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" fill="rgba(255,255,0,0.2)" stroke="black"/>`
    }else if (tag == 'beam'){
      o += `<line x1="${x}" y1="${y}" x2="${x+w}" y2="${y+h}" stroke="brown" stroke-width="3"/>`
    }else if (tag == 'line'){
      o += `<line x1="${x}" y1="${y}" x2="${x+w}" y2="${y+h}" stroke="black"/>`
    }else if (tag == 'dbg'){
      o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${elt.color}" opacity="0.1"/>`
    }else{
      o += `<rect x="${x}" y="${y}" width="${w||1}" height="${h||1}" fill="rgba(0,0,0,0.2)" stroke="black"/>`
      o += `<text x="${x}" y="${y}" font-size="5">${tag}</text>`
    }
      // 
  }
  o += `</svg>`;
  return o;
}

function xform(polylines:[number,number][][],fn:(x:number,y:number)=>[number,number]):[number,number][][]{

  return polylines.map(p=>p.map(xy=>fn(xy[0],xy[1])));
}

function cubic_bezier(x0:number,y0:number,x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,t:number):[number,number]{
  let s = 1-t;
  let s2 = s*s;
  let s3 = s*s2;
  let t2 = t*t;
  let t3 = t2*t;
  return [
    s3*x0+3*s2*t*x1+3*s*t2*x2+t3*x3,
    s3*y0+3*s2*t*y1+3*s*t2*y2+t3*y3,
  ]
}

let symbols : Record<string,[number,number][][]> = {};
;(function make_symbols(){
  function note_var(p : [number,number][][],stem_dir:number,twisted:boolean):[number,number][][]{
    if (stem_dir < 0){
      if (twisted){
        p = xform(p,(u,v)=>[u+5,v]);
      }else{
        p = xform(p,(u,v)=>[u-6,v]);
      }
    }else{
      if (twisted){
        p = xform(p,(u,v)=>[u-6,v]);
      }else{
        p = xform(p,(u,v)=>[u+5,v]);
      }
    }
    return p;
  }
  let p : [number,number][][];
  {
    p = HERSHEY(2370).polylines;
    symbols['note_whole_up_twist'] = note_var(p,-1,true);
    symbols['note_whole_down_twist'] = note_var(p,1,true);
    symbols['note_whole_up'] = note_var(p,-1,false);
    symbols['note_whole_down'] = note_var(p,1,false);
  }{
    p = HERSHEY(2371).polylines;
    p = xform(p,(u,v)=>scale_axis(u,v,1,0.9,0.4634));
    p = p.slice(0,1).concat(xform(p.slice(0,1),(u,v)=>scale_axis(u,v,1,0.75,0.4634)));
    p = xform(p,(u,v)=>[u*0.82+0.5,v]);
    symbols['note_half_up_twist'] = note_var(p,-1,true);
    symbols['note_half_down_twist'] = note_var(p,1,true);
    symbols['note_half_up'] = note_var(p,-1,false);
    symbols['note_half_down'] = note_var(p,1,false);
  }{
    p = HERSHEY(2372).polylines;
    // p = p.filter((x,i)=>!(i%2));
    p = xform(p,(u,v)=>scale_axis(u,v,1,0.8,0.4634));
    symbols['note_fill_up_twist'] = note_var(p,-1,true);
    symbols['note_fill_down_twist'] = note_var(p,1,true);
    symbols['note_fill_up'] = note_var(p,-1,false);
    symbols['note_fill_down'] = note_var(p,1,false);
  }{
    p = HERSHEY(2317).polylines;
    symbols['dot'] = xform(p,(u,v)=>[u*1.1,v*1.1]);
  }{
    p = HERSHEY(2325).polylines;
    symbols['acc_flat'] = xform(p,(u,v)=>[u*0.7,v+0.5]);
  }{
    p = HERSHEY(2324).polylines;
    symbols['acc_nat'] = xform(p,(u,v)=>[u*0.7,v]);
  }{
    p = HERSHEY(2323).polylines;
    p = xform(p,(u,v)=>[u*0.9,v*1.1-u*0.2]);
    p[3] = xform(p.slice(3,4),(u,v)=>[u,v+0.15])[0];
    p[5] = xform(p.slice(5,6),(u,v)=>[u,v+0.15])[0];
    symbols['acc_sharp'] = p;
  }{
    p = HERSHEY(2380).polylines;
    symbols['clef_g'] = xform(p,(u,v)=>rotate(u,v,-0.15));
  }{
    p = HERSHEY(2381).polylines;
    symbols['clef_f'] = xform(p,(u,v)=>[u-9,v]);
  }{
    p = HERSHEY(2382).polylines;
    symbols['clef_c'] = xform(p,(u,v)=>[u,(v)*0.9]);
  }{
    p = HERSHEY(2376).polylines;
    symbols['rest_whole'] = xform(p,(u,v)=>[u*0.85,v*1.25+2.25]);
  }{
    p = HERSHEY(2377).polylines;
    symbols['rest_half'] = xform(p,(u,v)=>[u,v*1.25+1]);
  }{
    p = HERSHEY(2378).polylines;
    symbols['rest_quarter']  = xform(p,(u,v)=>rotate(u,v,-0.1));
  }{
    p = HERSHEY(2379).polylines;
    symbols['rest_8'] = xform(p,(u,v)=>[u,v]);
  }{
    p = HERSHEY(2379).polylines;
    let q = xform(p,(u,v)=>[u,v]);
    q[q.length-1][q[q.length-1].length-1][0] += 0.93;
    q[q.length-1][q[q.length-1].length-1][1] -= 3;
    
    p = xform(p,(u,v)=>[u-3.07,v+10]);
    symbols['rest_16'] = q.concat(p);

  }{
    p = HERSHEY(2379).polylines;
    let q = xform(p,(u,v)=>[u,v]);
    q[q.length-1][q[q.length-1].length-1][0] += 0.93;
    q[q.length-1][q[q.length-1].length-1][1] -= 3;

    let a = (xform(q,(u,v)=>[u+3.07,v-10]));
    let c = (xform(p,(u,v)=>[u-3.07,v+10]));
    symbols['rest_32'] = a.concat(q).concat(c);
  }{
    p = HERSHEY(2379).polylines;
    let q = xform(p,(u,v)=>[u,v]);
    q[q.length-1][q[q.length-1].length-1][0] += 0.93;
    q[q.length-1][q[q.length-1].length-1][1] -= 3;

    let a = (xform(q,(u,v)=>[u+4.07,v-10]));
    let b = (xform(q,(u,v)=>[u+1,v]));
    let c = (xform(p,(u,v)=>[u-2.07,v+10]));
    let d = (xform(p,(u,v)=>[u-5.14,v+20]));
    symbols['rest_64'] = a.concat(b).concat(c).concat(d);
  }{
    p = HERSHEY(2368).polylines;
    p = xform(p,(u,v)=>[u+5,(v+2.5)*1.5]);
    symbols['flag_up'] = p;

    p = xform(p,(u,v)=>[u,v]);
    p[0].pop();
    p[0].pop();
    p[0][p[0].length-1][1]+=3;
    symbols['flag_mid_up'] = p;
  }{
    p = HERSHEY(2369).polylines;
    p = xform(p,(u,v)=>[u+5,(v-2.5)*1.5]);
    symbols['flag_down'] = p;

    p = xform(p,(u,v)=>[u,v]);
    p[p.length-1].shift();
    p[p.length-1].shift();
    p[p.length-1][0][1]-=3;
    symbols['flag_mid_down'] = p;
  }{
    for (let i = 0; i < 10; i++){
      p = HERSHEY(3200+i).polylines;
      symbols['timesig_digit_'+i] = xform(p,(u,v)=>[u,v*0.85+1.1]);  
    }
  }{
    for (let i = 0; i < 10; i++){
      p = HERSHEY(2200+i).polylines;
      symbols['tuplet_digit_'+i] = xform(p,(u,v)=>[(u)*0.5,v*0.5]);  
    }
  }{
    p = HERSHEY(3103).polylines;
    symbols['timesig_c'] = xform(p,(u,v)=>[u,v*1.2-2.5]);
  }{
    p = [[]];
    for (let i = 0; i < 8; i++){
      let a = i/7*Math.PI;
      p[0].push([
        Math.cos(a)*6,
        1-Math.sin(a)*6,
      ])
    }
    p.push([[-1,1],[0,0],[1,1],[0,2]])
    symbols['fermata']=p;
  }{
    p = []
    p.push([
      [-8,2],[-5,-1],[-2,2],[1,-1],[4,2],[7,-1]
    ])
    p.push([
      [-4,-2],[-1,1]
    ]);
    p.push([
      [2,-2],[5,1]
    ]);
    symbols['mordent']=p;
  }{
    p = HERSHEY(2274).polylines.slice(-2);
    p = xform(p,(u,v)=>rotate(-u*0.4,v*0.6,Math.PI/2));
    symbols['turn']=p;
  }{

    p = xform(HERSHEY(2670).polylines,(u,v)=>[u*0.8-4,v*0.8]).concat(
        xform(HERSHEY(2668).polylines,(u,v)=>[u*0.8+4.5,v*0.8-0.5]));
    symbols['trill']=p;
  }{
    p = xform(HERSHEY(2218).polylines,(u,v)=>[u,v+8]);
    symbols['flageolet']=p;
  }{
    p = xform(HERSHEY(3316).polylines,(u,v)=>[u*0.8-11,v*0.8-3]).concat(
        xform(HERSHEY(3405).polylines,(u,v)=>[u*0.8+0,v*0.8])).concat(
        xform(HERSHEY(3404).polylines,(u,v)=>[u*0.8+8,v*0.8])).concat(
          [[[14,6],[15,5],[16,6],[15,7]]]
        );
    symbols['pedal_on']=xform(p,(u,v)=>[u,v+3]);
  }{
    p = [];
    for (let i = 0; i < 8; i++){
      let a = i/8*Math.PI*2;
      p=p.concat(xform([
        [[2,-2],[3,0],[7,-0.5],[9,-2],[11,0],[9,2],[7,0.5],[3,0],[2,2]]
      ],(u,v)=>rotate(u*0.8,v*0.8,a)));
    }
    symbols['pedal_off']=p;
  }{
    p = xform(HERSHEY(2407).polylines,(u,v)=>[(u-5)*1.25,v/78+0.5])
    p = xform(p,(u,v)=>{
      return v<0.5?[u-2*(v/0.5)-2,v]:[u-2*(1-v)/0.5-2,v];
    })
    symbols['brace']=p;
  }
})();

function scale_axis(x:number,y:number,sx:number,sy:number,th:number):[number,number]{
  let u = x * Math.cos(th) - y * Math.sin(th);
  let v = x * Math.sin(th) + y * Math.cos(th);
  u *= sx;
  v *= sy;
  return [u * Math.cos(-th) - v * Math.sin(-th),
   u * Math.sin(-th) + v * Math.cos(-th)];

}
function rotate(x:number,y:number,th:number):[number,number]{
  let u = x * Math.cos(th) - y * Math.sin(th);
  let v = x * Math.sin(th) + y * Math.cos(th);
  return [u,v];
}


function build_slur_bezier(elt:Element){

  let {tag,x,y,w,h} = elt;

  elt.pts = [];
  elt.pts1 = [];
  let n = 20;
  let sh = 0;//elt.dir*8;

  let x0 = elt.x;
  let y0 = elt.y;
  let x3 = elt.x+elt.w;
  let y3 = elt.y1;

  let a = Math.atan2(y3-y0,x3-x0)+Math.PI/2*elt.dir;
  let hx = Math.cos(a)*h;
  let hy = Math.sin(a)*h;

  let m0x = x0 * 0.8 + x3 * 0.2;
  let m0y = y0 * 0.8 + y3 * 0.2;
  let m1x = x0 * 0.2 + x3 * 0.8;
  let m1y = y0 * 0.2 + y3 * 0.8;
  let x1a = m0x + hx;
  let y1a = m0y + hy;
  let x2a = m1x + hx;
  let y2a = m1y + hy;

  let x1b = elt.x+elt.w*0.2;
  let y1b = elt.y+elt.dir*h;
  let x2b = elt.x+elt.w*0.8;
  let y2b = elt.y1+elt.dir*h;

  let x1 = x1a*0.5 + x1b*0.5;
  let y1 = y1a*0.5 + y1b*0.5;
  let x2 = x2a*0.5 + x2b*0.5;
  let y2 = y2a*0.5 + y2b*0.5;

  y0 += sh; y1 += sh; y2 += sh; y3 += sh;

  elt.control = [[x0,y0],[x1,y1],[x2,y2],[x3,y3]];

  let p : [number,number][] = [];
  for (let i = 0; i < n; i++){
    let t = i/(n-1);
    elt.pts.push(cubic_bezier(x0,y0,x1,y1,x2,y2,x3,y3,t));
  }

  p = []
  for (let i = 2; i < n-2; i++){
    let t = 1-i/(n-1);
    elt.pts1.push(cubic_bezier(x0,y0,x1,y1-elt.dir,x2,y2-elt.dir,x3,y3,t));
  }  
}

function build_cue(elt:Element){
  let {tag,x,y,w,h} = elt;

  elt.pts = [];
  function push_all(p:[number,number][][]){
    for (let i = 0; i < p.length; i++){
      if (p[i].length<=1) continue;
      elt.pts.push(p[i]);
    }
  }
  if (elt.text == CUE.PEDAL_ON){
    let p = symbols['pedal_on'];
    let scl = elt.h/24;
    push_all(xform(p,(u,v)=>[x+u*scl,y+v*scl+h/2]));
  }else if (elt.text == CUE.PEDAL_OFF){
    let p = symbols['pedal_off'];
    let scl = elt.h/24;
    push_all(xform(p,(u,v)=>[x+u*scl,y+v*scl+h/2]));
  }else if (
    elt.text == CUE.PIANISSISSIMO
  ||elt.text == CUE.PIANISSIMO   
  ||elt.text == CUE.PIANO        
  ||elt.text == CUE.MEZZO_PIANO  
  ||elt.text == CUE.MEZZO_FORTE  
  ||elt.text == CUE.FORTE        
  ||elt.text == CUE.FORTISSIMO   
  ||elt.text == CUE.FORTISSISSIMO
  ||elt.text == CUE.SFORZANDO    
  ){

    let v = get_text_width(elt.text,FONT.TRIPLEX_ITALIC);
    let scl = elt.h/30;
    let dx = -v/2*scl;
    for (let i = 0; i < elt.text.length; i++){
      if (elt.text[i] == ' '){
        dx += 10*scl;
        continue;
      }
      let a = ascii_map(elt.text[i],FONT.TRIPLEX_ITALIC);
      if (a === undefined){
        continue;
      }
      let e = HERSHEY(a);
      push_all(xform(e.polylines,(u,v)=>[x+dx+(u-e.xmin)*scl,y+(v+14)*scl]));
      dx += (e.xmax-e.xmin-3)*scl;
    }
  }else{


    let v = get_text_width(elt.text,FONT.DUPLEX_ITALIC);
    let scl = elt.h/40;
    let dx = 0;
    for (let i = 0; i < elt.text.length; i++){
      if (elt.text[i] == ' '){
        dx += 10*scl;
        continue;
      }
      let a = ascii_map(elt.text[i],FONT.DUPLEX_ITALIC);
      if (a === undefined){
        continue;
      }
      let e = HERSHEY(a);
      push_all(xform(e.polylines,(u,v)=>[x+dx+(u-e.xmin)*scl,y+(v+18)*scl]));
      dx += (e.xmax-e.xmin)*scl;
    }
  }

}



export function bounding_box(p:[number,number][][]|[number,number][]):{x:number,y:number,w:number,h:number}{
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;
  for (let i = 0; i < p.length; i++){
    if (Array.isArray(p[i][0])){
      for (let j = 0; j < p[i].length; j++){
        xmin = Math.min(xmin,p[i][j][0]);
        ymin = Math.min(ymin,p[i][j][1]);
        xmax = Math.max(xmax,p[i][j][0]);
        ymax = Math.max(ymax,p[i][j][1]);
      }
    }else{
      xmin = Math.min(xmin,(p[i] as [number,number])[0]);
      ymin = Math.min(ymin,(p[i] as [number,number])[1]);
      xmax = Math.max(xmax,(p[i] as [number,number])[0]);
      ymax = Math.max(ymax,(p[i] as [number,number])[1]);
    }
  }
  // xmin -=1;
  // ymin -=1;
  // xmax +=1;
  // ymax +=1;
  return {x:xmin,y:ymin,w:xmax-xmin,h:ymax-ymin};
}
function box_overlap(a:{x:number,y:number,w:number,h:number},b:{x:number,y:number,w:number,h:number}){
  return (
    a.x <= b.x + b.w &&
    a.x + a.w>= b.x &&
    a.y <= b.y + b.h &&
    a.y + a.h >= b.y
  )
}
function point_in_box(x,y,b:{x:number,y:number,w:number,h:number}){
  // return b.x <= x && x <= (b.x+b.w) && b.y <= y && y <= (b.y+b.h);
  return b.x <= x && x <= (b.x+b.w) && b.y <= y && y <= (b.y+b.h);
}

export function cue_evade_slur(elements:Element[]){
  let slurs : Element[] = [];
  let cues : Element[] = [];
  for (let i = 0; i < elements.length; i++){
    if (elements[i].tag == 'cue'){
      if (!elements[i].pts){
        build_cue(elements[i]);
      }
      if (!elements[i].bbox){
        elements[i].bbox = bounding_box(elements[i].pts);
      }
      cues.push(elements[i])
    }else if (elements[i].tag == 'slur'){
      if (!elements[i].pts){
        build_slur_bezier(elements[i]);
      }
      if (!elements[i].bbox){
        elements[i].bbox = bounding_box(elements[i].pts);
      }
      slurs.push(elements[i]);
    }else if (elements[i].tag == 'cresc'){
      let {x,y,w,h,x1,y1,w1,h1} = elements[i]
      elements[i].bbox = bounding_box([[x,y],[x+w,y+h],[x1,y1],[x1+w1,y1+h1]]);
      cues.push(elements[i])
    }
  }
  function resolve_(cue:Element,depth:number=5){
    if (depth <= 0){
      return;
    }
    for (let j = 0; j < slurs.length; j++){
      if (box_overlap(cue.bbox, slurs[j].bbox)){
        let hit = false;
        let dir : number = null;
        for (let k = 0; k < slurs[j].pts.length; k++){
          if (point_in_box(slurs[j].pts[k][0],slurs[j].pts[k][1], cue.bbox)){
            hit = true;
            dir = ((cue.bbox.y + cue.bbox.h/2) < (slurs[j].bbox.y + slurs[j].bbox.h/2))? -1 : 1;
            break;
          }
        }
        if (hit){
          let d = dir*Math.min(4,Math.max(2,depth));
          cue.y += d;
          cue.bbox.y += d;
          if (cue.y1 != undefined){
            cue.y1 += d;
          }
          cue.pts = null;
          return resolve_(cue,depth-1);
        }
      }
    }
  }
  for (let i = 0; i < cues.length; i++){
    resolve_(cues[i]);
  }
}



export function slur_evade_note(elements:Element[]){
  let slurs : Element[] = [];
  let notes : Element[] = [];
  for (let i = 0; i < elements.length; i++){
    if (elements[i].tag == 'note_head'){
      let elt = elements[i];
      let {x,y,w,h} = elt;
      x -= 1; y -= 1; w += 2; h += 2;
      if (!elt.bbox){
        if (elt.stem_dir < 0){
          if (elt.twisted){
            elt.bbox = {x,y:y-h/2,w,h};
          }else{
            elt.bbox = {x:x-w,y:y-h/2,w,h};
          }
        }else{
          if (!elt.twisted){
            elt.bbox = {x:x,y:y-h/2,w,h};
          }else{
            elt.bbox = {x:x-w,y:y-h/2,w,h};
          }
        }
      }
      notes.push(elements[i])
    }else if (elements[i].tag == 'slur'){
      if (!elements[i].pts){
        build_slur_bezier(elements[i]);
      }
      if (!elements[i].bbox){
        elements[i].bbox = bounding_box(elements[i].pts);
      }
      slurs.push(elements[i]);
    }
  }
  function resolve_(slur:Element,depth:number=5){
    if (depth <= 0){
      return;
    }
    for (let j = 0; j < notes.length; j++){
      if (box_overlap(slur.bbox, notes[j].bbox)){
        let hit = false;
        let dir : number = slur.dir;
        for (let k = 0; k < slur.pts.length; k++){
          if (point_in_box(slur.pts[k][0],slur.pts[k][1], notes[j].bbox)){
            hit = true;
            break;
          }
        }
        if (hit){
          let d = dir*Math.min(4,Math.max(2,depth));
          slur.y += d;
          slur.y1 += d;
          slur.bbox.y += d;
          slur.pts.forEach((xy:[number,number]) => {
            xy[1] += d;
          });
          slur.pts1.forEach((xy:[number,number]) => {
            xy[1] += d;
          });
          return resolve_(slur,depth-1);
        }
      }
    }
  }
  for (let i = 0; i < slurs.length; i++){
    if (slurs[i].adjacent){
      continue;
    }
    resolve_(slurs[i]);
  }
}



export function hf_drawing_polylines(elements:Element[],width:number,height:number):number[][][]{  
  let polylines : [number,number][][] = [];
  function push_all(p:[number,number][][]){
    for (let i = 0; i < p.length; i++){
      if (p[i].length<=1) continue;
      polylines.push(p[i]);
    }
  }

  for (let i = 0; i < elements.length; i++){
    let elt = elements[i];
    let {tag,x,y,w,h} = elt;
    if (tag == 'note_head'){
      let p : [number,number][][];

      let key =  (elt.stem_dir<0?'_up':'_down') + (elt.twisted?'_twist':'');

      if (elt.duration >= NOTE_LENGTH.WHOLE){
        key = 'note_whole'+key;
      }else if (elt.duration >= NOTE_LENGTH.HALF){
        key = 'note_half'+key;
      }else{
        key = 'note_fill'+key;
      }
      p = symbols[key];

      if (elt.mini) p = xform(p,(u,v)=>[u/2,v/2]);
      
      push_all(xform(p,(u,v)=>[x+u,y+v]));
    }else if (tag == 'dot'){
      let p = symbols['dot'];

      if (elt.mini) p = xform(p,(u,v)=>[u/2,v/2]);

      push_all(xform(p,(u,v)=>[x+u,y+v]));
    }else if (tag == 'accidental'){
      let p : [number,number][][];
      if (elt.type == ACCIDENTAL.FLAT){
        p = symbols['acc_flat'];
      }else if (elt.type == ACCIDENTAL.NATURAL){
        p = symbols['acc_nat'];
      }else if (elt.type == ACCIDENTAL.SHARP){
        p = symbols['acc_sharp'];
      }
      if (elt.mini) p = xform(p,(u,v)=>[u/2,v/2]);

      push_all(xform(p,(u,v)=>[x+u,y+v]));
    }else if (tag == 'clef'){
      let p : [number,number][][];
      if (elt.type == CLEF.TREBLE){
        p = symbols['clef_g'];
      }else if (elt.type == CLEF.BASS){
        p = symbols['clef_f'];
      }else{
        p = symbols['clef_c'];
      }
      push_all(xform(p,(u,v)=>[x+u,y+v]));
    }else if (tag == 'rest'){
      if (elt.duration == NOTE_LENGTH.WHOLE){
        let p = symbols['rest_whole'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (elt.duration == NOTE_LENGTH.HALF ){
        let p = symbols['rest_half'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (elt.duration == NOTE_LENGTH.QUARTER){
        let p = symbols['rest_quarter'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));

      }else if (elt.duration == NOTE_LENGTH.EIGHTH){
        let p = symbols['rest_8'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));

      }else if (elt.duration == NOTE_LENGTH.SIXTEENTH){
        let p = symbols['rest_16'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (elt.duration == NOTE_LENGTH.THIRTYSECOND){
        let p = symbols['rest_32'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (elt.duration == NOTE_LENGTH.SIXTYFOURTH){
        let p = symbols['rest_64'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }

    }else if (tag == 'flag'){
      if (elt.stem_dir < 0){
        let p = elt.is_last? symbols['flag_up']:symbols['flag_mid_up'];
        if (elt.mini) p = xform(p,(u,v)=>[u/2,v/2]);
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else{
        let p = elt.is_last? symbols['flag_down']:symbols['flag_mid_down'];
        if (elt.mini) p = xform(p,(u,v)=>[u/2,v/2]);
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }
    }else if (tag == 'beam'){
      for (let j = 0.3; j < 4.66; j+=1.09){
        polylines.push([[x,y-j*elt.stem_dir],[x+w,y+h-j*elt.stem_dir]]);
      }
    }else if (tag == 'line'){
      polylines.push([[x,y],[x+w,y+h]]);
    }else if (tag == 'cresc'){
      // {let p = [[elt.bbox.x,elt.bbox.y],[elt.bbox.x+elt.bbox.w,elt.bbox.y],[elt.bbox.x+elt.bbox.w,elt.bbox.y+elt.bbox.h],[elt.bbox.x,elt.bbox.y+elt.bbox.h]]; polylines.push(p as any);}


      let p : [number,number][][] = [
        [[x,y],[x+w,y+h]],
        [[elt.x1,elt.y1],[elt.x1+elt.w1,elt.y1+elt.h1]]
      ];
      push_all(p);
    
    }else if (tag == 'slur'){
      // let p = [[elt.bbox.x,elt.bbox.y],[elt.bbox.x+elt.bbox.w,elt.bbox.y],[elt.bbox.x+elt.bbox.w,elt.bbox.y+elt.bbox.h],[elt.bbox.x,elt.bbox.y+elt.bbox.h]]; polylines.push(p as any);

      if (!elt.pts){
        build_slur_bezier(elt);
      }
      polylines.push(elt.pts);
      polylines.push(elt.pts1);
      // polylines.push(elt.control);
      
    }else if (tag == 'timesig_digit'){
      let p = symbols['timesig_digit_'+elt.value];
      push_all(xform(p,(u,v)=>[x+u,y+v]));
    }else if (tag == 'timesig_c'){
      // polylines.push([[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]]);
      let p = symbols['timesig_c'];
      push_all(xform(p,(u,v)=>[x+u,y+v]));
      if (elt.type == 'cut'){
        polylines.push([[x,y-14],[x,y+14]]);
      }
    }else if (tag == 'tuplet_label'){
      let digits : string[] = elt.label.toString().split('');
      let mid = x+w/2;
      let mw = digits.length;
      let dw = 8;
      let dp = 4;
      let ml = mid-mw/2*dw-dp;
      let mr = mid+mw/2*dw+dp;
      if (ml >= x && mr <= x+w){
        // polylines.push([[x,y],[x,y+h],[x+w,y+h],[x+w,y]]);
        polylines.push([[x,y],[x,y+h],[ml,y+h]]);
        polylines.push([[mr,y+h],[x+w,y+h],[x+w,y]]);
      }
      for (let i = 0; i < digits.length; i++){
        // polylines.push([[ml+dp+dw*i,y+h-i*10],[ml+dp+dw*i+dw,y+h-i*10]]);
        let p = symbols['tuplet_digit_'+digits[i]];
        push_all(xform(p,(u,v)=>[ml+dp+dw*i+u+4,y+h+v]));
      }
      
    }else if (tag == 'lyric'){
     
      let scl = w/get_text_width(elt.text);
      let dx = -4*scl;
      for (let i = 0; i < elt.text.length; i++){
        if (elt.text[i] == ' '){
          dx += 10*scl;
          continue;
        }
        let a = ascii_map(elt.text[i]);
        if (a === undefined){
          continue;
        }
        
        let e = HERSHEY(a);
        // console.log(e.ymin,e.ymax);

        push_all(xform(e.polylines,(u,v)=>[x+dx+(u-e.xmin)*scl,y+(v+12)*scl]));
        dx += (e.xmax-e.xmin)*scl;
      }
    }else if (tag == 'bold_text'){
      let scl = w/get_text_width(elt.text,FONT.TRIPLEX,-2);
      if (isNaN(scl)) scl = 1;
      let dx = 0;
      for (let i = 0; i < elt.text.length; i++){
        if (elt.text[i] == ' '){
          dx += 10*scl;
          continue;
        }
        let a = ascii_map(elt.text[i],FONT.TRIPLEX);
        if (a === undefined){
          continue;
        }
        let e = HERSHEY(a);
        push_all(xform(e.polylines,(u,v)=>[x+dx+(u-e.xmin)*scl,y+(v+12)*scl]));
        dx += (e.xmax-e.xmin-2)*scl;
      }
    }else if (tag == 'regular_text'){
      let scl = w/get_text_width(elt.text,FONT.DUPLEX,-2);
      if (isNaN(scl)) scl = 1;
      let dx = 0;
      for (let i = 0; i < elt.text.length; i++){
        if (elt.text[i] == ' '){
          dx += 10*scl;
          continue;
        }
        let a = ascii_map(elt.text[i],FONT.DUPLEX);
        if (a === undefined){
          continue;
        }
        let e = HERSHEY(a);
        push_all(xform(e.polylines,(u,v)=>[x+dx+(u-e.xmin)*scl,y+(v+12)*scl]));
        dx += (e.xmax-e.xmin-2)*scl;
      }
    }else if (tag == 'bracket'){
      if (elt.type == BRACKET.BRACE){
        let p = symbols['brace'];
        push_all(xform(p,(u,v)=>[x+u,y+v*h]));
      }else if (elt.type == BRACKET.BRACKET){
        polylines.push([[x+5,y-12],[x-2,y-8],[x-8,y-7],[x-8,y+h+7],[x-2,y+h+8],[x+5,y+h+12]]);
        polylines.push([[x+5,y-12],[x-1,y-8],[x-7,y-6],[x-7,y+h+6],[x-1,y+h+8],[x+5,y+h+12]]);
        polylines.push([                     [x-6,y-5],[x-6,y+h+5]]);
      }
    }else if (tag == 'articulation'){
      let a = Math.abs(elt.type);
      if (a == ARTICULATION.STACCATO){
        let p = symbols['dot'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (a == ARTICULATION.ACCENT){
        let p : [number,number][] = [[x-5,y-3],[x+5,y],[x-5,y+3]];
        polylines.push(p);
      }else if (a == ARTICULATION.SPICCATO){
        let p : [number,number][] = [[x-1,y-3],[x,y+3],[x+1,y-3],[x-1,y-3]]
        polylines.push(p);
      }else if (a == ARTICULATION.TENUTO){
        let p : [number,number][] = [[x-4,y],[x+4,y]]
        polylines.push(p);
      }else if (a == ARTICULATION.MARCATO){
        let p : [number,number][] = [[x-3,y+3],[x,y-3],[x+3,y+3]]
        polylines.push(p);
      }else if (a == ARTICULATION.UP_BOW){
        let p : [number,number][] = [[x-3,y-3],[x,y+3],[x+3,y-3]]
        polylines.push(p);
      }else if (a == ARTICULATION.TREMBLEMENT){
        let p : [number,number][][] = [
          [[x-4,y],[x+4,y]],
          [[x,y-4],[x,y+4]],
        ]
        push_all(p);
      }else if (a == ARTICULATION.FERMATA){
        let p = symbols['fermata'];
        push_all(xform(p,(u,v)=>[x+u,y+v*elt.dir]));
      }else if (a == ARTICULATION.MORDENT){
        let p = symbols['mordent'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (a == ARTICULATION.TURN){
        let p = symbols['turn'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (a == ARTICULATION.TRILL){
        let p = symbols['trill'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else if (a == ARTICULATION.FLAGEOLET){
        let p = symbols['flageolet'];
        push_all(xform(p,(u,v)=>[x+u,y+v]));
      }else{
        let p = HERSHEY(ascii_map(elt.type.toString(),FONT.TRIPLEX)).polylines;
        push_all(xform(p,(u,v)=>[x+u/2,y+v/2]));
      }
      if (elt.type < 0){
        let p : [number,number][] = [[x,y-5],[x,y+5]];
        polylines.push(p);
      }
    }else if (tag == 'squiggle'){
      let p : [number,number][] = [];
      let q : [number,number][][] = [];
      let f = false;
      let h2 = Math.ceil(h/8)*8;
      let y2 = y - (h2-h)/2;
      for (let i = 0; i < h2; i += 4){
        p.push([f?(x+2):(x-2),y2+i]);
        if (f && i + 4 < h2){
          q.push([[x+2.8,i+y2+0.8],[x-1.2,i+y2+4.8]]);
        }
        f = !f;
      }
      polylines.push(p);
      push_all(q);
    }else if (tag == 'cue'){
      // let p = [[elt.bbox.x,elt.bbox.y],[elt.bbox.x+elt.bbox.w,elt.bbox.y],[elt.bbox.x+elt.bbox.w,elt.bbox.y+elt.bbox.h],[elt.bbox.x,elt.bbox.y+elt.bbox.h]]; polylines.push(p as any);


      // let p = [[x-10,y],[x+10,y],[x+10,y+h],[x-10,y+h]]; polylines.push(p as any);
      // let p = [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]; polylines.push(p as any);
      if (!elt.pts){
        build_cue(elt);
      }
      push_all(elt.pts);
    }
  }
  return polylines;
}



export function round_polylines(polylines:number[][][],accuracy:number=2){
  let n = Math.pow(10,accuracy);
  for (let i = 0; i < polylines.length; i++){
    for (let j = 0; j <polylines[i].length; j++){
      let [x,y] = polylines[i][j];
      x = Math.round(x * n)/n;
      y = Math.round(y * n)/n;
      polylines[i][j][0] = x;
      polylines[i][j][1] = y;
    }
  }
}







export function export_svg(dr: Drawing, {background="white"} : {background?:string}={}): string{
  let o : string = `<svg xmlns="http://www.w3.org/2000/svg" width="${dr.w}" height="${dr.h}">`;
  if (background){
    o += `<rect x="0" y="0" width="${dr.w}" height="${dr.h}" fill="${background}"></rect>`;
  }
  o += `<path stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" d="`;
  for (let i = 0; i < dr.polylines.length; i++){
    o += 'M ';
    for (let j = 0; j < dr.polylines[i].length; j++){
      o += dr.polylines[i][j] + ' ';
    }
  }
  o += `"/>`;
  o += `</svg>`;
  return o;
}


export function export_animated_svg(dr:Drawing,{background="white",speed=0.001} : {background?:string, speed?:number}={}): string{
  let width = dr.w;
  let height = dr.h;
  let polylines = dr.polylines;
  let o : string = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  if (background){
    o += `<rect x="0" y="0" width="${dr.w}" height="${dr.h}" fill="${background}"></rect>`;
  }
  let lengths : number[] = [];
  let acc_lengths : number[] = [];
  let total_l = 0;
  for (let i = 0; i < polylines.length; i++){
    let l = 0;
    for (let j = 1; j < polylines[i].length; j++){
      l += Math.hypot(
        polylines[i][j-1][0]-polylines[i][j][0],
        polylines[i][j-1][1]-polylines[i][j][1]
      );
    }
    
    lengths.push(l);
    acc_lengths.push(total_l);
    total_l+=l;
  }

  for (let i = 0; i < polylines.length; i++){
    let l = lengths[i];
    o += `
    <path 
      stroke="black" 
      stroke-width="1.5" 
      fill="none" 
      stroke-dasharray="${l}"
      stroke-dashoffset="${l}"
      d="M`;
    for (let j = 0; j < polylines[i].length; j++){
      o += polylines[i][j] + ' ';
    }
    let t = speed*l;
    o += `">
    <animate id="a${i}"
      attributeName="stroke-dashoffset" 
      fill="freeze"
      from="${l}" to="${0}" dur="${t}s" 
      begin="${(acc_lengths[i])*speed}s;a${i}.end+${1+speed*total_l}s"/>
    />
    <animate id="b${i}"
      attributeName="stroke-dashoffset" 
      fill="freeze"
      from="${0}" to="${l}" dur="${1}s" 
      begin="${speed*total_l}s;b${i}.end+${speed*total_l}s"/>
    />
    </path>`;
  }
  //begin="${i}s;a${i}.end+${polylines.length-i}s" />
  o += `</svg>`;
  return o;
}



export function export_pdf(dr:Drawing):string {
  let width = dr.w;
  let height = dr.h;
  let polylines = dr.polylines;
  var head = `%PDF-1.1\n%%¥±ë\n1 0 obj\n<< /Type /Catalog\n/Pages 2 0 R\n>>endobj
    2 0 obj\n<< /Type /Pages\n/Kids [3 0 R]\n/Count 1\n/MediaBox [0 0 ${width} ${height}]\n>>\nendobj
    3 0 obj\n<< /Type /Page\n/Parent 2 0 R\n/Resources\n<< /Font\n<< /F1\n<< /Type /Font
    /Subtype /Type1\n/BaseFont /Times-Roman\n>>\n>>\n>>\n/Contents [`;
  var pdf = "";
  var count = 4;
  for (var i = 0; i < polylines.length; i++) {
    pdf += `${count} 0 obj \n<< /Length 0 >>\n stream\n 1 j 1 J 1.5 w\n`;
    for (var j = 0; j < polylines[i].length; j++){
      var [x,y] = polylines[i][j];
      pdf += `${x} ${height-y} ${j?'l':'m'} `;
    }
    pdf += "\nS\nendstream\nendobj\n";
    head += `${count} 0 R `;
    count ++; 
  }
  head += "]\n>>\nendobj\n";
  pdf += "\ntrailer\n<< /Root 1 0 R \n /Size 0\n >>startxref\n\n%%EOF\n";
  return head+pdf;
}





function xiaolinwu(data:number[],w:number,h:number,x0:number,y0:number,x1:number,y1:number){
  //https://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm
  function plot(x:number, y:number, c:number){
    data[y*w+x]=1-(1-data[y*w+x])*(1-c);
  }
  function ipart (x:number){return Math.floor(x)}
  function round (x:number){return ipart(x + 0.5)}
  function fpart (x:number){return x - Math.floor(x)}
  function rfpart(x:number){return 1 - fpart(x)}

  function drawline(x0:number,y0:number,x1:number,y1:number){
    let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if (steep){
      [x0,y0] = [y0,x0];
      [x1,y1] = [y1,x1];
    }
    if (x0 > x1){
      [x0,x1] = [x1,x0];
      [y0,y1] = [y1,y0];
    }
    let dx = x1 - x0;
    let dy = y1 - y0;
    let gradient = dy / dx;
    if (dx == 0.0){
      gradient = 1.0;
    }
    let xend  = round(x0);
    let yend  = y0 + gradient * (xend - x0);
    let xgap  = rfpart(x0 + 0.5);
    let xpxl1 = xend;
    let ypxl1 = ipart(yend);
    if (steep){
      plot(ypxl1,   xpxl1, rfpart(yend) * xgap);
      plot(ypxl1+1, xpxl1,  fpart(yend) * xgap);
    }else{
      plot(xpxl1, ypxl1  , rfpart(yend) * xgap);
      plot(xpxl1, ypxl1+1,  fpart(yend) * xgap);
    }
    let intery = yend + gradient;
    xend = round(x1);
    yend = y1 + gradient * (xend - x1);
    xgap = fpart(x1 + 0.5);
    let xpxl2 = xend;
    let ypxl2 = ipart(yend);
    if (steep){
      plot(ypxl2  , xpxl2, rfpart(yend) * xgap);
      plot(ypxl2+1, xpxl2,  fpart(yend) * xgap);
    }else{
      plot(xpxl2, ypxl2,  rfpart(yend) * xgap);
      plot(xpxl2, ypxl2+1, fpart(yend) * xgap);
    }
    if (steep){
      for (let x = xpxl1+1; x <= xpxl2-1; x++){
        plot(ipart(intery)  , x, rfpart(intery));
        plot(ipart(intery)+1, x,  fpart(intery));
        intery = intery + gradient;
      }
    }else{
      for (let x = xpxl1 +1; x<= xpxl2-1; x++){
        plot(x, ipart(intery),  rfpart(intery));
        plot(x, ipart(intery)+1, fpart(intery));
        intery = intery + gradient;
      }
    }
  }
  drawline(x0,y0,x1,y1);
}


function encode_gif(data:number[],w:number,h:number){
  let bytes = [];
  bytes.push(0x47,0x49,0x46,0x38,0x39,0x61);
  bytes.push(w&0xff);
  bytes.push((w>>8)&0xff);
  bytes.push(h&0xff);
  bytes.push((h>>8)&0xff);
  bytes.push(0xf6);
  bytes.push(0,0);
  for (let i = 0; i < 127; i++){
    bytes.push(i*2,i*2,i*2);
  }
  bytes.push(0xff,0xff,0xff);
  bytes.push(0x2c,0,0,0,0);
  bytes.push(w&0xff);
  bytes.push((w>>8)&0xff);
  bytes.push(h&0xff);
  bytes.push((h>>8)&0xff);
  bytes.push(0,7);

  let n = ~~(w*h/126);
  let inc = n*126;
  let exc = w*h-inc;
  for (let i = 0; i < n; i++){
    bytes.push(0x7f);
    bytes.push(0x80);
    for (let j = 0; j < 126; j++){
      bytes.push(~~(data[i*126+j]*127));
    }
  }
  if (exc){
    bytes.push(exc+1);
    bytes.push(0x80);
    for (let i = 0; i < exc; i++){
      bytes.push(~~(data[inc+i]*127));
    }
  }
  bytes.push(0x01,0x81,0x00,0x3B);
  return bytes;
}


export function export_gif(dr:Drawing,{scale=1.0,iter=2} : {scale?:number,iter?:number}={}):number[] {
  let scl = 1/scale;
  let w = ~~(dr.w/scl);
  let h = ~~(dr.h/scl);
  let polylines = dr.polylines;
  // console.log(w,h);
  let data = new Array(w*h).fill(0);
  for (var i = 0; i < polylines.length; i++) {
    // console.log(polylines[i])
    for (var j = 0; j < polylines[i].length-1; j++){
      
      let x0 = polylines[i][j][0]/scl;
      let y0 = polylines[i][j][1]/scl;
      let x1 = polylines[i][j+1][0]/scl;
      let y1 = polylines[i][j+1][1]/scl;
      for (let k = 0; k < iter; k++) xiaolinwu(data,w,h,x0,y0,x1,y1);
    }
  }
  for (let i = 0; i < data.length; i++){
    data[i] = 1-data[i];
  }
  // console.log(data);
  let bytes = encode_gif(data,w,h);
  return bytes;
}