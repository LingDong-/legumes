//https://ccrma.stanford.edu/~craig/14q/midifile/MidiFileFormat.html
//https://midimusic.github.io/tech/midispec.html

const META_EVENT : Record<number,string[]> = {
  0x00:["SEQUENCE_NUMBER",'value'],
  0x01:["TEXT_EVENT",'text'],
  0x02:["COPYRIGHT_NOTICE",'text'],
  0x03:["SEQUENCE_OR_TRACK_NAME",'text'],
  0x04:["INSTRUMENT_NAME",'text']	,
  0x05:["LYRIC",'text'],
  0x06:["MARKER",'text'],
  0x07:["CUE_POINT",'text'],
  0x20:["CHANNEL_PREFIX",'value'],
  0x21:["PORT",'value'],
  0x2F:["END_OF_TRACK"],
  0x54:["SMPTE_OFFSET",'hour','min','sec','frame','frac_frame'],
  0x51:["SET_TEMPO",'data'],
  0x58:["TIME_SIGNATURE",'numerator','denominator_exp','clocks_per_metronome_click','notated_32nd_per_quarter_note'],
  0x59:["KEY_SIGNATURE",'num_sharps_or_flats','is_minor'],
  0x7F:["SEQUENCER_SPECIFIC_EVENT",'data'],
};
const MIDI_EVENT : Record<number,string[]> = {
  0b1000: ['NOTE_OFF','key','velocity'],
  0b1001: ['NOTE_ON','key','velocity'],
  0b1010: ['POLYPHONIC_KEY_PRESSURE','key','pressure'],
  0b1011: ['CONTROL_CHANGE','controller','value'],
  0b1100: ['PROGRAM_CHANGE','value'],
  0b1101: ['CHANNEL_PRESSURE','value'],
  0b1110: ['PITCH_WHEEL_CHANGE','lsb','msb'],
};
const SYSTEM_EVENT : Record<number, string[]> = {
  0b0010: ['SONG_POSITION_POINTER','lsb','msb'],
  0b0011: ['SONG_SELECT','value'],
  0b0110: ['TUNE_REQUEST'],
  0b0111: ['END_OF_EXCLUSIVE'],
  0b1000: ['TIMING_CLOCK'],
  0b1010: ['START'],
  0b1011: ['CONTINUE'],
  0b1100: ['STOP'],
  0b1110: ['ACTIVE_SENSING'],
  0b1111: ['RESET'],
}
let META_EVENT_LOOKUP = Object.fromEntries(Object.entries(META_EVENT).map(x=>[x[1][0],[x[0],...x[1].slice(1)]]));
let MIDI_EVENT_LOOKUP = Object.fromEntries(Object.entries(MIDI_EVENT).map(x=>[x[1][0],[x[0],...x[1].slice(1)]]));
let SYSTEM_EVENT_LOOKUP = Object.fromEntries(Object.entries(SYSTEM_EVENT).map(x=>[x[1][0],[x[0],...x[1].slice(1)]]));

export interface Midi_file {
  magic: string;
  format: number;
  num_tracks: number;
  time_format : 'METRIC'|'TIME_CODE';
  ticks_per_quarter_note?:number;
  negative_SMPTE_format?:number;
  ticks_per_frame?:number;
  tracks : Midi_track[];
};
export interface Midi_track {
   events : Midi_event[];
}
export interface Midi_event {
  type : string;
  delta_time : number;
  data : Record<string,any>|(number[]);
}

export function parse_midi(bytes:number[]) : Midi_file{
  let ptr = 0;
  function read_str(n:number):string{
    let s : string = String.fromCharCode(...bytes.slice(ptr,ptr+n));
    ptr += n;
    return s;
  }
  function read_u8():number{
    return bytes[ptr++];
  }
  function read_u32():number{
    let s : number = ((bytes[ptr] << 24) | (bytes[ptr+1] << 16) | (bytes[ptr+2] << 8) | (bytes[ptr+3]))>>>0;
    ptr += 4;
    return s;
  }
  function read_u16():number{
    let s : number = (bytes[ptr] << 8) | (bytes[ptr+1]);
    ptr += 2;
    return s;
  }
  function read_u(n_bytes:number):number{
    let s : number = 0;
    for (let i = 0; i < n_bytes; i++){
      s = ((s<<8) | bytes[ptr])>>>0;
      ptr ++;
    }
    return s;
  }
  function read_vlen():number{
    let is_last : boolean = false;
    let s : number = 0;
    do{
      let n : number = bytes[ptr] & 0x7f;
      s = ((s << 7) | n)>>>0;
      is_last = !((bytes[ptr] >> 7) & 1);
      ptr ++;
    } while (!is_last);
    return s;
  }

  let magic : string =  read_str(4);

  let hd_len : number = read_u32();
  let hd_fmt : number = read_u16();
  let hd_ntk : number = read_u16();
  let div_fmt = (bytes[ptr]>>7) & 1;

  let ot : {
    negative_SMPTE_format?:number, 
    ticks_per_frame?:number, 
    ticks_per_quarter_note?:number}= {};
    
  if (div_fmt){
    let x : number = read_u16()&0x7fff;
    ot.negative_SMPTE_format = -(((~(x >> 8))&0x7f)+1);
    ot.ticks_per_frame = x & 0xff;
  }else{
    ot.ticks_per_quarter_note = read_u16()&0x7fff;
  }

  let o : Midi_file = {
    magic,
    num_tracks: hd_ntk,
    format: hd_fmt,
    time_format : div_fmt?'TIME_CODE':'METRIC',
    ...ot,
    tracks : [],
  };


  while (read_str(4) == 'MTrk'){
    let track_len = read_u32();
    let p0 = ptr;
    let trk : Midi_track = {events:[]};
 
    while (ptr < p0+track_len){
      
      let dt = read_vlen();
      let e : Midi_event = {type:'UNDEFINED',delta_time:dt,data:{}};
      
      if (bytes[ptr] == 0xff){
        let tmpl : string[] = META_EVENT[bytes[++ptr]] ?? ['UNDEFINED'];
        ptr++;
        let len : number = read_vlen();
        e.type = tmpl[0];
        let chunk : number = ~~(len/(tmpl.length-1));
        for (let i = 1; i < tmpl.length; i++){
          if (tmpl[i] == 'text'){
            e.data['text'] = read_str(chunk);
          }else if (tmpl[i] == 'data'){
            e.data = bytes.slice(ptr,ptr+chunk);
            ptr += chunk;
          }else{
            e.data[tmpl[i]] = read_u(chunk);
            if (tmpl[i] == 'num_sharps_or_flats'){
              let x : number = e.data[tmpl[i]];
              if (x > 0x7f){
                x = - (((~x)&0xff)+1);
              }
              e.data[tmpl[i]] = x;
            }
          }
        }

      }else if (bytes[ptr] == 0xf0 || bytes[ptr] == 0xf7){
        e.type = 'SYSEX';
        e.data = [];
        do {
          e.data.push(bytes[ptr++]);
        } while (bytes[ptr] != 0xf0 && bytes[ptr] != 0xf7);
        e.data.push(bytes[ptr++]);
      }else{

        let type : number = (bytes[ptr]>>4) & 0xf;
        let chan : number = bytes[ptr] & 0xf;
        ptr ++;
        let tmpl : string[] = ['UNDEFINED'];
        if (type == 0xf){
          tmpl = SYSTEM_EVENT[chan]??tmpl;
        }else{
          tmpl = MIDI_EVENT[type]??tmpl;
        }
        if (tmpl[0] == 'UNDEFINED' && trk.events.length){
          ptr --;
          chan = trk.events[trk.events.length-1].data['channel'];
          tmpl = Object.values(MIDI_EVENT).find(x=>x[0] == trk.events[trk.events.length-1].type);
        }
        e.type = tmpl[0];
        
        for (let i = 1; i < tmpl.length; i++){
          e.data[tmpl[i]] = read_u8();
        }
        e.data['channel'] = chan;
      }
      trk.events.push(e);
      
    }
    o.tracks.push(trk);
  }
  return o;
}




export function export_midi(pattern:Midi_file):number[]{
  let bytes : number[] = [];
  function write_str(s:string){
    for (let i = 0; i < s.length; i++){
      bytes.push(s.charCodeAt(i));
    }
  }
  function write_u8(n:number){
    return bytes.push(n);
  }
  function write_u32(n:number){
    bytes.push((n>>24)&0xff);
    bytes.push((n>>16)&0xff);
    bytes.push((n>>8)&0xff);
    bytes.push(n&0xff);
  }
  function write_u16(n:number){
    bytes.push((n>>8)&0xff);
    bytes.push(n&0xff);
  }
  function write_u(n:number, n_bytes:number){
    for (let i = 0; i < n_bytes; i++){
      bytes.push((n>>((n_bytes-i-1)<<3))&0xff);
    }
  }
  function write_vlen(n:number){
    let b = [];
    while (n > 0){
      b.push(n & 0x7f);
      n = n >>> 7;
    }
    if (!b.length) b.push(0);
    b.reverse();
    for (let i = 0; i < b.length-1; i++){
      b[i] |= 0x80;
    }
    bytes.push(...b);
  }

  write_str(pattern.magic);
  write_u32(6);
  write_u16(1);
  write_u16(pattern.num_tracks);
  if (pattern.time_format == 'METRIC'){
    write_u16(pattern.ticks_per_quarter_note);
  }else{
    write_u16(pattern.ticks_per_frame | (( (~(-pattern.negative_SMPTE_format-1)) <<8)));
  }
  for (let i = 0; i < pattern.tracks.length; i++){
    write_str('MTrk');
    let len_pos = bytes.length;
    bytes.push(0,0,0,0);
    for (let j = 0; j < pattern.tracks[i].events.length; j++){
      let e = pattern.tracks[i].events[j];
      // console.log(e);
      write_vlen(e.delta_time);

      if (META_EVENT_LOOKUP[e.type]){
        let k = META_EVENT_LOOKUP[e.type][0];
        write_u8(0xff);
        write_u8(Number(k));
        if (META_EVENT[k][1] == 'text'){
          write_vlen(e.data['text'].length);
          write_str(e.data['text']);
        }else if (META_EVENT[k][1] == 'value'){
          if (e.type == 'SEQUENCE_NUMBER'){
            write_u8(2);
            write_u16(e.data['value'])
          }else{
            write_u8(1);
            write_u8(e.data['value'])
          }
        }else if (META_EVENT[k][1] == 'data'){
          write_vlen(e.data.length);
          bytes.push(...(e.data as number[]));
        }else{
          write_vlen(META_EVENT[k].length-1);
          for (let j = 1; j < META_EVENT[k].length; j++){
            let x = e.data[META_EVENT[k][j]];
            if (META_EVENT[k][j] == 'num_sharps_or_flats' && x < 0){
              x = (((~  (-x) )&0xff)+1);
            }
            bytes.push(x);
          }
        }
      }else if (MIDI_EVENT_LOOKUP[e.type]){
        let k = Number(MIDI_EVENT_LOOKUP[e.type][0]);
        bytes.push((k<<4) | e.data['channel']);
        for (let j = 1; j < MIDI_EVENT[k].length; j++){
          write_u8(e.data[MIDI_EVENT[k][j]]);
        }
      }else if (SYSTEM_EVENT_LOOKUP[e.type]){
        let k = Number(SYSTEM_EVENT_LOOKUP[e.type][0]);
        bytes.push((0xf<<4) | k);
        for (let j = 1; j < SYSTEM_EVENT[k].length; j++){
          write_u8(e.data[SYSTEM_EVENT[k][j]]);
        }
      }else{
        for (let j = 1; j < e.data.length; j++){
          write_u8(e.data[j]);
        }
      }
    }
    let n = bytes.length - len_pos-4;
    bytes[len_pos]   = ((n>>24)&0xff);
    bytes[len_pos+1] = ((n>>16)&0xff);
    bytes[len_pos+2] = ((n>>8)&0xff);
    bytes[len_pos+3] = (n&0xff);
  }
  return bytes;
}