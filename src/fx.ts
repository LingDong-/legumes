import {bounding_box, Drawing,Element} from './drawing'

let PERLIN_YWRAPB = 4; let PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
let PERLIN_ZWRAPB = 8; let PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
let PERLIN_SIZE = 4095;
let perlin_octaves = 4;let perlin_amp_falloff = 0.5;
let scaled_cosine = function(i:number):number {return 0.5*(1.0-Math.cos(i*Math.PI));};
let p_perlin : number[];

function noise(x:number,y:number=0,z:number=0) {
  //https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js
  if (p_perlin == null) {
    p_perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      p_perlin[i] = Math.random();
    }
  }
  if (x<0) { x=-x; } if (y<0) { y=-y; } if (z<0) { z=-z; }
  let xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
  let xf = x - xi; let yf = y - yi; let zf = z - zi;
  let rxf:number, ryf:number;
  let r=0; let ampl=0.5;
  let n1:number,n2:number,n3:number;
  for (let o=0; o<perlin_octaves; o++) {
    let of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);
    rxf = scaled_cosine(xf); ryf = scaled_cosine(yf);
    n1  = p_perlin[of&PERLIN_SIZE];
    n1 += rxf*(p_perlin[(of+1)&PERLIN_SIZE]-n1);
    n2  = p_perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
    n2 += rxf*(p_perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
    n1 += ryf*(n2-n1);
    of += PERLIN_ZWRAP;
    n2  = p_perlin[of&PERLIN_SIZE];
    n2 += rxf*(p_perlin[(of+1)&PERLIN_SIZE]-n2);
    n3  = p_perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
    n3 += rxf*(p_perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
    n2 += ryf*(n3-n2);
    n1 += scaled_cosine(zf)*(n2-n1);
    r += n1*ampl;
    ampl *= perlin_amp_falloff;
    xi<<=1; xf*=2; yi<<=1; yf*=2; zi<<=1; zf*=2;
    if (xf>=1.0) { xi++; xf--; }
    if (yf>=1.0) { yi++; yf--; }
    if (zf>=1.0) { zi++; zf--; }
  }
  return r;
};

function resample_polyline(polyline:[number,number][], l:number, L:number):[number,number][]{
  let q = [];
  for (let i = 0; i < polyline.length-1; i++){
    let a = polyline[i];
    let b = polyline[i+1];
    let s = Math.hypot(a[0]-b[0],a[1]-b[1]);
    let n = Math.ceil(s/l);
    if (s >= L){
      n = 1;
    }
    for (let j = 0; j < n; j++){
      let t = j/n;
      let c = [a[0]*(1-t)+b[0]*t, a[1]*(1-t)+b[1]*t]
      q.push(c);
    }
    q.push(b.slice());
  }
  return q;
}

function disturb_polylines(elements:Element[], polylines:[number,number][][], multiplier:number=1):[number,number][][]{
  let content_y = 0;
  for (let i = 0; i < elements.length; i++){
    if (elements[i].type == 'composer' || elements[i].type == 'tempo' || elements[i].type == 'title' || elements[i].type == 'subtitle'){
      content_y = Math.max(content_y, elements[i].y + elements[i].h);
    }
  }

  let q :[number,number][][] = [];
  for (let i = 0; i < polylines.length; i++){
    let qq :[number,number][] = [];
    let bbox = bounding_box(polylines[i]);
    if (bbox.y-4 <= content_y){
      for (let j = 0; j < polylines[i].length; j++){
        let [x,y] = polylines[i][j];
        x += (noise(x*0.01,y*0.01,1+i*0.1)*2-1)*2*multiplier;
        y += (noise(x*0.01,y*0.01,2+i*0.1)*2-1)*2*multiplier;
        x -= Math.min(y*0.1,20)*multiplier;
        y -= Math.min(x*0.01,20)*multiplier;
        qq.push([x,y])
      }
    }else{
      for (let j = 0; j < polylines[i].length; j++){
        let [x,y] = polylines[i][j];
        x += (noise(x*0.01,y*0.01,1+i*0.1)*2-1)*6*multiplier;
        y += (noise(x*0.01,y*0.01,2+i*0.1)*2-1)*5*multiplier;
        x -= Math.min(y*0.015,20)*multiplier;
        y -= Math.min(x*0.01,20)*multiplier;
        qq.push([x,y])
      }
    }
    q.push(qq);
  }
  return q;
}

export function export_sketch_svg(dr:Drawing,{noise_mul=1} : {noise_mul?:number}={}){
  let p = dr.polylines.map(x=>resample_polyline(x,5,500));

  p = disturb_polylines(dr.elements,p,noise_mul);

  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${dr.w}" height="${dr.h}">`;
  o += `<rect x="0" y="0" width="${dr.w}" height="${dr.h}" fill="antiquewhite"></rect>`;

  for (let i = 0; i < p.length; i++){
    o += `<path stroke="#2B1100" stroke-opacity="${Math.random()*0.1+0.6}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M `;
    for (let j = 0; j < p[i].length; j++){
      o += p[i][j] + ' ';
    }
    o += `"/>`;
  }
  o += `</svg>`;
  return o;
}
