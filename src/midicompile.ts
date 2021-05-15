import {Midi_file, Midi_track, Midi_event, parse_midi} from "./midifmt"
import {
  ACCIDENTAL, ORDER_OF_ACCIDENTALS, CLEF,
  Time_signature,Key_signature,
  Note_itf, Rest_itf, Slur_itf, Measure_itf, Score_itf,
  get_median_staff_pos,
  note_name_to_staff_pos, get_note_name_accidental, get_existing_voices, short_id, chord_and_beam_staff, BARLINE, BRACKET, ARTICULATION,
} from "./common"

const MAX_VOICES = 2;

const NOTE_LENGTH : Record<string,number> = {
  WHOLE : 32,
  HALF : 16,
  QUARTER : 8,
  EIGHTH : 4,
  SIXTEENTH : 2,
  THIRTYSECOND : 1,
};
const NOTE_LENGTH_QUANT = 2;

const NOTE_LENGTH_MODIFIER = 1.5;
const NAME2PITCH : Record<string,number> = {
  Ab_0:8, Ab_1:20, Ab_2:32, Ab_3:44, Ab_4:56, Ab_5:68, Ab_6:80, Ab_7:92, 
  Ab_8:104, Ab_9:116, F_3:41, Ds_8:99, Ds_9:111, F_8:101, F_9:113, Gs_3:44, 
  Gs_2:32, Gs_1:20, Gs_0:8, Gs_7:92, Gs_6:80, Gs_5:68, Gs_4:56, G_10:127, 
  Gs_9:116, Gs_8:104, E_3:40, E_2:28, E_1:16, E_0:4, E_7:88, E_6:76, E_5:64, 
  E_4:52, E_9:112, E_8:100, As_9:118, As_8:106, Ds_0:3, Ds_1:15, Ds_6:75, 
  Ds_7:87, Ds_4:51, Ds_5:63, As_1:22, As_0:10, As_3:46, As_2:34, As_5:70, 
  As_4:58, As_7:94, As_6:82, Cs_7:85, Cs_6:73, Cs_5:61, Cs_4:49, Bb_9:118, 
  Cs_2:25, Cs_1:13, Cs_0:1, Bb_5:70, Bb_4:58, Bb_7:94, Bb_6:82, Bb_1:22, 
  Bb_0:10, Cs_9:109, Cs_8:97, Bb_8:106, Bb_3:46, Bb_2:34, A_7:93, A_6:81, 
  A_5:69, A_4:57, A_3:45, A_2:33, A_1:21, A_0:9, F_4:53, A_9:117, A_8:105, 
  B_8:107, B_9:119, F_10:125, B_0:11, B_1:23, B_2:35, B_3:47, B_4:59, B_5:71,
  B_6:83, B_7:95, Fs_0:6, Fs_1:18, Fs_2:30, Fs_3:42, Fs_4:54, Fs_5:66, F_5:65,
  Fs_7:90, Fs_8:102, Fs_9:114, Gb_8:102, Gb_9:114, Gb_2:30, Gb_3:42, Gb_0:6, 
  Gb_1:18, Gb_6:78, Gb_7:90, Gb_4:54, Gb_5:66, F_6:77, Fs_6:78, Eb_8:99, 
  Eb_9:111, E_10:124, Eb_4:51, Eb_5:63, Eb_6:75, Eb_7:87, Eb_0:3, Eb_1:15, 
  Eb_2:27, Eb_3:39, D_8:98, D_9:110, D_2:26, D_3:38, D_0:2, D_1:14, D_6:74, 
  D_7:86, D_4:50, D_5:62, F_2:29, G_9:115, G_8:103, G_5:67, G_4:55, G_7:91, 
  G_6:79, G_1:19, G_0:7, G_3:43, G_2:31, Cs_3:37, Db_9:109, Db_8:97, Db_3:37, 
  Db_2:25, Db_1:13, Db_0:1, Db_7:85, Db_6:73, Db_5:61, Db_4:49, C_1:12, C_0:0,
  C_3:36, C_2:24, C_5:60, C_4:48, C_7:84, C_6:72, C_9:108, C_8:96, Ds_2:27, 
  Ds_3:39, D_10:122, C_10:120, F_7:89, F_0:5, F_1:17
};
for (let i = 0; i <= 10; i++){
  NAME2PITCH['Es_'+i] = NAME2PITCH['F_'+i];
  NAME2PITCH['Fb_'+i] = NAME2PITCH['E_'+i];
  NAME2PITCH['Bs_'+i] = NAME2PITCH['C_'+(i+1)];
  NAME2PITCH['Cb_'+i] = NAME2PITCH['B_'+(i-1)];
}


interface _Note_impl{
  id?:string;
  begin: number;
  duration: number;
  pitch: number;
  channel: number;
}

interface _Measure_impl{
  duration: number;
  time_signature: Time_signature;
  key_signature: Key_signature;
  notes: _Note_impl[];
  cross_ties:Cross_tie[];
}

interface Cross_tie{
  left: _Note_impl;
  right: _Note_impl;
}

interface Tick_table {
  time_signature:Time_signature;
  key_signature:Key_signature;
  resolution:number;
  duration: number;
  notes:_Note_impl[];
};

function classify_key_signature(key_sig:number[]):Key_signature{
  let [num_acc, is_minor] = key_sig;
  let acc = ACCIDENTAL.NATURAL
  if (num_acc < 0){
    acc = ACCIDENTAL.FLAT
    num_acc = - num_acc
  }else if (num_acc){
    acc = ACCIDENTAL.SHARP
  }
  return [acc, num_acc];
}

function note_duration_overlap(a:_Note_impl,b:_Note_impl):boolean{
  let x1 = a.begin;
  let x2 = a.begin+a.duration;
  let y1 = b.begin;
  let y2 = b.begin+b.duration;
  return x1 < y2 && y1 < x2;
}


let _pitch2name_cache : Record<string,string> = {};
function infer_name_from_pitch(pitch:number,key_signature:Key_signature){
  let candidates : string[] = [];
  let key = pitch | (key_signature[0]<<24) | (key_signature[1]<<16);
  let val = _pitch2name_cache[key];
  if (val !== undefined){return val;}
  for (let name in NAME2PITCH){
    if (NAME2PITCH[name] == pitch){
      candidates.push(name);
    }
  }
  if (candidates.length == 0){
    return null;
  }
  if (candidates.length == 1){
    _pitch2name_cache[key] = candidates[0];
    return candidates[0];
  }

  let [acc, num_acc] = key_signature;
  let acc_notes : string[] = ORDER_OF_ACCIDENTALS[acc].slice(0,num_acc).split('');
  
  for (let n of acc_notes){
    for (let i = 0; i < candidates.length; i++){
      if (acc == ACCIDENTAL.SHARP && candidates[i].startsWith(n+"s")){
        _pitch2name_cache[key] = candidates[i];
        return candidates[i];
      }else if (acc == ACCIDENTAL.FLAT && candidates[i].startsWith(n+"b")){
        _pitch2name_cache[key] = candidates[i];
        return candidates[i];
      }
    }
  }
  _pitch2name_cache[key] = candidates[0];
  return candidates[0];
}


function pitch_to_staff(pitch:number, clef:number, key_signature:Key_signature){
  pitch = ~~pitch;
  let name : string = infer_name_from_pitch(pitch,key_signature=key_signature);
  let i0 = (clef == CLEF.TREBLE) ? (6*7+3) : (5*7-2);
  let idx = i0-("CDEFGAB".indexOf(name[0])+Number(name.split("_")[1])*7);
  return idx;
}



function compare_wholeness(a:number,b:number){
  for (let i = 5; i >= 0; i--){
    let p  : number = Math.pow(2,i);
    let ap : number = a/p;
    let bp : number = b/p;
    ap -= ~~(ap);
    bp -= ~~(bp);
    if (ap == 0 && bp == 0){
      return 0;
    }else if (ap > 0 && bp == 0){
      return -1;
    }else if (ap == 0 && bp > 0){
      return 1;
    }
  }
  return 0;
}


function factor_rest_duration(begin:number,dur:number,channel:number):Rest_itf[]{
  let l = dur;
  let b = begin;
  let rests : Rest_itf[] = [];
  while (l > 0){
    let ll = 0;
    
    for (let p = 0; p <= 5; p++){
      let d = Math.pow(2,p);
      if (l < d){
        break;
      }
      // console.log(b,d,compare_wholeness(b + d, b))
      if (compare_wholeness(b + d, b)>0){
        ll = d;
        break;
      }
    }
    if (!ll){
      for (let p = 5; p >= 0; p--){
        let d = Math.pow(2,p);
        if (l >= d){
          ll = d;
          break;
        }
      }
    }
    rests.push({
      begin:b,
      duration:ll,
      voice:channel,
      tuplet:null
    });
    l -= ll;
    b += ll;
  }
  return rests;
}


function find_rests(measure:Measure_itf,staff_idx:number,channels:number[]):Rest_itf[]{
  // find & merge rests
  let measure_length = measure.duration;

  let staff = measure.staves[staff_idx];
  let rests : Rest_itf[] = [];

  // console.log(staff,channels);

  let did : boolean = false;
  for (let c of channels){
    let channel_notes = staff.notes.filter(x=>x.voice==c);
    if (!channel_notes.length){
      continue;
    }
    did = true;
    let bins = new Array(measure_length).fill(true);
    for (let i= 0; i < measure_length; i++){
      for (let m of channel_notes){
        if (m.voice == c){
          if (m.begin <= i && i < m.begin + m.duration){
            bins[i] = false;
            break;
          }
        }
      }
    }
    let last_length : number = 0;
    for (let i = 0; i < bins.length+1; i++){
      if (i < bins.length && bins[i]){
        last_length ++;
      }else{
        if (last_length > 0){
          rests.push(...factor_rest_duration(i-last_length,last_length,c));
        }
        last_length = 0;
      }
    }
  }
  if (!did){
    rests.push(...factor_rest_duration(0,measure_length,channels[0]));
  }
  return rests;
}

function get_piece_title(pattern:Midi_file):string[]{
  let title : string[] = [];
  // let found : boolean = false;
  for (let track of pattern.tracks){
    for (let event of track.events){
      // console.log(event.type)
      if (event.type == 'SEQUENCE_OR_TRACK_NAME'){
        // console.log(event);
        title.push(...event.data['text'].split('\n'));
        // found = true;
      }
    }
    // if (found) break;
  }
  // if (!title) return [];
  
  return title;
}

function get_piece_instruments(pattern:Midi_file):string[]{
  let instruments = []
  for (let track of pattern.tracks){
    for (let event of track.events){
      if (event.type == 'INSTRUMENT_NAME'){
        instruments.push(event.data['text']);
      }
    }
  }
  return instruments;
}


function is_note_on_event(evt:Midi_event):boolean{
  return evt.type == 'NOTE_ON' && evt.data['velocity'] != 0;
}
function is_note_off_event(evt:Midi_event):boolean{
  return evt.type == 'NOTE_OFF' || (evt.type == 'NOTE_ON' && evt.data['velocity'] == 0);
}

function pattern_to_tick_tables(pattern:Midi_file):Tick_table[]{
  // change relative tick into absolute tick
  // duration in ticks, pitch 0-127, channel: 16*track + origin channel
  let res = pattern.ticks_per_quarter_note;

  let sections : Array<[
    number,
    [Time_signature,Key_signature],
    Array<Record<string,any>>
  ]> = [];

  // console.dir(pattern,{depth:null,maxArrayLength:null});

  let track_id = -1;
  let end_of_track = 0;
  let last_time_sig = null;
  let last_key_sig = null;

  for (let track of pattern.tracks){
    track_id += 1
    let t : number = 0;
    for (let event of track.events){
      t += event.delta_time;
      if (event.type == 'TIME_SIGNATURE' && track_id == 0){
        let ts : Time_signature = [event.data['numerator'],2**event.data['denominator_exp']];
        if (sections.length == 0 || (sections[sections.length-1][1][0] != null)){
          sections.push([t,[ts,last_key_sig], []]);
        }else{
          sections[sections.length-1][1][0] = ts;
        }
        last_time_sig = ts;

      }else if (event.type == 'KEY_SIGNATURE' && track_id == 0){
        let ks : Key_signature = classify_key_signature([event.data['num_sharps_or_flats'], event.data['is_minor']]);
        if (sections.length == 0 || (sections[sections.length-1][1][1] != null)){
          sections.push([t,[last_time_sig,ks], []]);
        }else{
          sections[sections.length-1][1][1] = ks;
        }
        last_key_sig = ks;

      }else if (event.type == 'END_OF_TRACK'){
        end_of_track = Math.max(t,end_of_track);
      }else{
        for (let i = 0; i < sections.length; i++){
          let idx = sections.length-i-1;
          if (t >= sections[idx][0]){
            if (event.type == 'NOTE_ON' || event.type == 'NOTE_OFF'){
              let name : string;
              if (is_note_on_event(event)){
                name = 'NOTE_ON';
              }else if (is_note_off_event(event)){
                name = 'NOTE_OFF';
              }
              sections[idx][2].push({name,abs_tick:t-sections[idx][0],pitch:event.data['key'],channel:(track_id*16+event.data['channel'])*100});
            }  
            break; 
          }
        }
      }
    }
  }
  // console.dir(sections,{depth:null,maxArrayLength:null});

  let unpaired : Array<[boolean,number,number,Record<string,any>]>= [];
  for (let i = 0; i < sections.length; i++){
    for (let j = 0; j < sections[i][2].length; j++){
      let note = sections[i][2][j];
      if (note.name == 'NOTE_ON'){
        unpaired.unshift([true, i, j, note]);
      }else if (note.name == 'NOTE_OFF'){
        for (let k = 0; k < unpaired.length; k++){
          let up = unpaired[k];
          if (up[0] && up[3].channel == note.channel && up[3].pitch == note.pitch){
            unpaired[k][0] = false;
            sections[up[1]][2][up[2]].duration = note.abs_tick-up[3].abs_tick;
            break;
          }
        }
      }
    }
  }
  let tick_tables : Tick_table[] = [];
  for (let i = 0; i < sections.length; i++){
    let end_tick : number =  (i+1 < sections.length) ? sections[i+1][0] : end_of_track;
    tick_tables.push({
      time_signature:sections[i][1][0], 
      key_signature:sections[i][1][1] ?? [0,0],
      resolution:res,
      duration:end_tick-sections[i][0],
      notes:[],
    });
    for (let j = 0; j < sections[i][2].length; j++){
      let note = sections[i][2][j];
      if (sections[i][2][j].name=='NOTE_ON'){
        if (note.duration !== undefined){
          let dur = note.duration;
          tick_tables[tick_tables.length-1].notes.push({
            begin:note.abs_tick, pitch:note.pitch, duration:dur, channel:note.channel
          });
        }else{
          console.warn(`WARNING: Unpaired NOTE_ON event, discarding!`,note);
        }
      }
    }
  }
  return tick_tables;
}

function split_voices(measures:_Measure_impl[]){
  function collide(a:_Note_impl,b:_Note_impl){
    if (a.begin == b.begin && a.duration == b.duration){
      // console.log(a.pitch,b.pitch)
      return a.pitch == b.pitch;
    }
    return note_duration_overlap(a,b);
  }
  function collide_with_channel(measure:_Measure_impl,index:number){
    let channel = measure.notes[index].channel;
    for (let i = 0; i < index/*measure.notes.length*/; i++){
      // if (i == index){
      //   continue;
      // }
      if (measure.notes[i].channel != channel){
        continue;
      }
      if (collide(measure.notes[index],measure.notes[i])){
        return true;
      }
    }
    return false;
  }
  for (let i = 0; i < measures.length; i++){
    let notes = measures[i].notes;
    let cross_ties : Cross_tie[] = measures[i].cross_ties;
    for (let j = 0; j < notes.length; j++){
      let note : _Note_impl = notes[j];
      let skip : boolean = false;
      for (let k = 0; k < cross_ties.length; k++){
        if (note == cross_ties[k].right){
          skip = true;
          break;
        }
      }
      if (skip) continue;

      while (collide_with_channel(measures[i],j)){
        note.channel++;
      }
      for (let k = 0; k < measures[i].cross_ties.length; k++){
        if (measures[i].cross_ties[k].left == note){
          measures[i].cross_ties[k].right.channel = note.channel;
        }
      }
    }
  }
}


function classify_note_length(length:number):[number,boolean]{
  let d0 = 1024;
  let l0 = -1;
  let mod = false;
  for (let k in NOTE_LENGTH){
    let l = NOTE_LENGTH[k];
    let d = Math.abs(length-l);
    if (d < d0){
      l0 = l;
      d0 = d;
    }
  }
  for (let k in NOTE_LENGTH){
    let l = ~~(NOTE_LENGTH[k]*NOTE_LENGTH_MODIFIER);
    let d = Math.abs(length-l)
    if (d < d0){
      mod = true;
      l0 = l;
      d0 = d;
    }
  }
  return [l0,mod];
}

function has_modifier(length:number):boolean{
  if (length == NOTE_LENGTH.THIRTYSECOND * NOTE_LENGTH_MODIFIER)
    return true;
  if (length == NOTE_LENGTH.SIXTEENTH * NOTE_LENGTH_MODIFIER)
    return true;
  if (length == NOTE_LENGTH.EIGHTH * NOTE_LENGTH_MODIFIER)
    return true;
  if (length == NOTE_LENGTH.QUARTER * NOTE_LENGTH_MODIFIER)
    return true;
  if (length == NOTE_LENGTH.HALF * NOTE_LENGTH_MODIFIER)
    return true;
  if (length == NOTE_LENGTH.WHOLE * NOTE_LENGTH_MODIFIER)
    return true;
  return false;
}






function tick2length(tick:number,resolution:number):number{
  let ticks_per_quarter_note = resolution;
  let num_quarter_notes = tick/ticks_per_quarter_note;
  let num_32nd_notes = num_quarter_notes * (NOTE_LENGTH.QUARTER/NOTE_LENGTH.THIRTYSECOND);
  return num_32nd_notes;
}

function length2tick(length:number,resolution:number):number{
  let num_32nd_notes = length;
  let num_quarter_notes = num_32nd_notes * (NOTE_LENGTH.THIRTYSECOND*1.0/NOTE_LENGTH.QUARTER);
  let ticks_per_quarter_note = resolution;
  let num_ticks = num_quarter_notes * ticks_per_quarter_note;
  return ~~num_ticks
}


function tick_table_to_measures(tick_table:Tick_table):_Measure_impl[]{
  let time_sig = tick_table.time_signature;
  let key_sig = tick_table.key_signature;
  let resolution = tick_table.resolution;
  let notes = tick_table.notes;
  let measures : _Measure_impl[] = [];

  function getmeasurelength(){
    let ticks_per_quarter_note = resolution;
    let num_beats = time_sig[0];
    let num_32nd_notes_per_beat = ~~(NOTE_LENGTH.WHOLE/time_sig[1]);
    let num_32nd_notes = num_32nd_notes_per_beat * num_beats;
    return num_32nd_notes;
  }
  function getmeasureticks(){
    let num_32nd_notes = getmeasurelength();
    return length2tick(num_32nd_notes,resolution);
  }

  let measure_duration = getmeasureticks();
  let measure_length = getmeasurelength();

  function getlength(tick:number):number{
    return ~~(tick2length(tick,resolution));
  }

  function empty_measure():_Measure_impl{
    return {time_signature:time_sig,key_signature:key_sig,
      duration: getlength(measure_duration), notes:[], cross_ties:[],
    };
  }
  while (tick_table.duration > measure_duration * measures.length){
    measures.push(empty_measure())
  }

  for (let i = 0; i < notes.length; i++){
    let note : _Note_impl = notes[i];
    let measure_id = ~~(note.begin/measure_duration);

    while (measure_id >= measures.length){
      measures.push(empty_measure())
    }

    let begin = getlength(note.begin-measure_id*measure_duration);
    let [length,modifier] = classify_note_length(tick2length(note.duration,resolution));
    let channel = note.channel;
    let pitch = note.pitch;

    let nnote = {begin,channel,pitch,
      duration:  Math.min(length,measure_length-begin),
    };
    measures[measure_id].notes.push(nnote);

    let carry_cnt = 1;
    let left : _Note_impl = nnote;
    while (begin + length > measure_length){
      if (measure_id+carry_cnt >= measures.length){
        measures.push(empty_measure())
      }
      let right : _Note_impl = {
        begin:  0,
        duration:  Math.min(measure_length, begin + length - measure_length),
        channel,
        pitch
      }
      measures[measure_id+carry_cnt].notes.push(right);
      measures[measure_id+carry_cnt-1].cross_ties.push({left,right});
      measures[measure_id+carry_cnt].cross_ties.push({left,right});
      length = (begin + length) - measure_length;
      begin = 0;
      carry_cnt += 1;
      left = right;
    }
  }

  return measures;
}


function compile_staff(
  measure:Measure_itf, staff_idx:number
){
  let staff = measure.staves[staff_idx];

  let [measure_acc, num_acc] = staff.key_signature;
  let acc_names : string[] = ORDER_OF_ACCIDENTALS[measure_acc].slice(0,num_acc).split('');
  let acc_history : Record<string,number> = {};
  
  function get_beat_length(time_sig:Time_signature){
    let beat_length = ~~(NOTE_LENGTH.WHOLE/time_sig[1]);
    if (time_sig[1] == 4 && time_sig[0] >= 4){
      beat_length *= 2;
    }
    return beat_length;
  }
  
  let beat_length = get_beat_length(staff.time_signature);

  let channels = get_existing_voices(staff.notes.concat(staff.rests as Note_itf[]),[]);
  staff.voices = channels.length;

  
  function get_beat_idx(note:Note_itf) : number{
    return ~~(note.begin/beat_length);
  }

  function get_notes_in_beat(beat_idx:number) : Note_itf[]{
    let notes : Note_itf[] = [];
    for (let m of staff.notes){
      if (get_beat_idx(m) == beat_idx){
        notes.push(m);
      }
    }
    return notes;
  }

  function calc_stem_dir(note:Note_itf){
    let beat_idx : number = get_beat_idx(note);
    let notes_in_beat : Note_itf[] = get_notes_in_beat(beat_idx);
    // console.log(notes_in_beat);

    let avg_line : number = notes_in_beat.reduce((acc:number,x:Note_itf):number=>(acc+x.staff_pos),0)/notes_in_beat.length;

    if (avg_line < 4){
      return 1;
    }else{
      return -1;
    }
  }

  
  for (let i = 0; i < staff.notes.length; i++){

    let note : Note_itf = staff.notes[i];
    // console.log(note);
    let note_name = note.name;
    let note_oct = Number(note_name.split('_')[1]);
    let note_staff = note_name_to_staff_pos(note_name, staff.clef);

    note.octave = note_oct;
    note.staff_pos = note_staff;

    let modifier = has_modifier(note.duration);
    note.modifier = modifier;
  }

  for (let i = 0; i < staff.notes.length; i++){
    let accidental : number = null;
    let note = staff.notes[i];
    let note_name = note.name;
    let note_bname = note_name[0];
    let note_acc = get_note_name_accidental(note_name);
    
    let key = note_bname + '_' + note.octave;

    if (acc_names.includes(note_bname)){
      if (note_acc == measure_acc){
        if (acc_history[key] === undefined || acc_history[key] === note_acc){
          // ok...
        }else{
          accidental = note_acc;
          acc_history[key] = note_acc;
        }
      }else{
        accidental = note_acc;
        acc_history[key] = note_acc;
      }
    }else{
      if (note_acc == ACCIDENTAL.NATURAL){
        if (acc_history[key]){
          accidental = note_acc;
          acc_history[key] = note_acc;
        }
      }else{
        if (acc_history[key] !== note_acc){
          accidental = note_acc;
          acc_history[key] = note_acc;
        }
      }
    }
    note.accidental = accidental;
  }

  let channel_median_staff_pos = get_median_staff_pos(staff.notes);
  let channel_to_voice : Record<number,number> = {};
  let voice_median_staff_pos : Record<number,number> = {};
  
  let channels_sorted = Object.entries(channel_median_staff_pos).sort((a,b)=>a[1]-b[1]);
  for (let i = 0; i < channels_sorted.length; i++){
    channel_to_voice[channels_sorted[i][0]] = i;
    voice_median_staff_pos[i] = channel_median_staff_pos[channels_sorted[i][0]];
  }

  

  for (let i = 0; i < staff.notes.length; i++){
    staff.notes[i].voice = channel_to_voice[staff.notes[i].voice]??0;
  }
  for (let i = 0; i < staff.rests.length; i++){
    staff.rests[i].voice = channel_to_voice[staff.rests[i].voice]??0;
  }


  for (let i = 0; i < staff.notes.length; i++){
    let note = staff.notes[i];
    let stem_dir :number;

    if (staff.voices == 1){
      stem_dir = calc_stem_dir(note);
    }else{
      stem_dir = note.voice % 2 ? 1 : -1;
    }
    note.stem_dir = stem_dir;
  }

  chord_and_beam_staff(staff,beat_length);

  for (let i = 0; i < staff.notes.length; i++){
    staff.notes[i].duration *= NOTE_LENGTH_QUANT;
    staff.notes[i].begin *= NOTE_LENGTH_QUANT;
  }
  for (let i = 0; i < staff.rests.length; i++){
    staff.rests[i].duration *= NOTE_LENGTH_QUANT;
    staff.rests[i].begin *= NOTE_LENGTH_QUANT;
  }
}

function get_channel_average_pitch(measures:_Measure_impl[]):Record<number,number>{
  let c2p : Record<number,[number,number]> = {}
  for (let m of measures){
    for (let n of m.notes){
      if (!c2p[n.channel]){
        c2p[n.channel] = [0,0];
      }
      c2p[n.channel][0] += n.pitch;
      c2p[n.channel][1] ++;
    }
  }
  let c2p2 : Record<number,number> = {};
  for (let k in c2p){
    c2p2[k] = c2p[k][1]?(c2p[k][0]/c2p[k][1]):0;
  }
  return c2p2;
}

function assign_clef_from_pitch(pitch:number):number{
  if (pitch > NAME2PITCH["C_5"]){
    return CLEF.TREBLE;
  }else{
    return CLEF.BASS;
  }
}

export function score_from_midi(pattern:Midi_file):Score_itf{
  let tick_tables : Tick_table[]= pattern_to_tick_tables(pattern);
  // console.dir(tick_tables,{depth:null,maxArrayLength:10000});
  let measures_ : _Measure_impl[] = [];
  for (let i = 0; i < tick_tables.length; i++){
    let ms = tick_table_to_measures(tick_tables[i]);
    for (let j = 0; j < ms.length; j++){
      measures_.push(ms[j]);
    }
  }
  split_voices(measures_);

  let channel2pitch : Record<number,number> = get_channel_average_pitch(measures_);
  let channel2clef : Record<number,number> = {};

  for (let k in channel2pitch){
    channel2clef[k] = assign_clef_from_pitch(channel2pitch[k]);
  }
  let channels = Object.keys(channel2pitch).map(Number).sort((a,b)=>a-b);

  let channel_groups_ : Record<number,number[]> = {}
  for (let i = 0; i < channels.length; i++){
    let g = ~~(channels[i]/100);
    let g0 = channels[i] - g*100;
    let g1 = ~~(g0/MAX_VOICES);
    // let g1 = g0 % RENDER.MAX_VOICES;
    let gg = g * 100 + g1;
    // console.log(channels[i],g,g0,g1,gg)
    if (!channel_groups_[gg]) channel_groups_[gg] = [];
    channel_groups_[gg].push(channels[i]);
  }
  let channel_groups : number[][] = Object.values(channel_groups_);
  let score : Score_itf = {
    title:get_piece_title(pattern),
    instruments:[],//get_piece_instruments(pattern).map(x=>({names:[x],connect_barlines:[false],bracket:BRACKET.NONE})),
    composer:[],
    slurs:[],
    measures:[],
    crescs:[],
  };

  for (let i = 0; i< measures_.length; i++){
    let ties : Cross_tie[] = measures_[i].cross_ties;
    for (let j = 0; j < ties.length; j++){
      let slur = {left:ties[j].left.id??short_id(),right:ties[j].right.id??short_id(),is_tie:true};
      ties[j].left.id = slur.left;
      ties[j].right.id = slur.right;
      score.slurs.push(slur);
    }
  }
  
  for (let i = 0; i < measures_.length; i++){
    let measure : Measure_itf = {
      duration: measures_[i].duration, barline: (i==measures_.length)?BARLINE.END:BARLINE.SINGLE,
      staves: [],
    };
    for (let j = 0; j < channel_groups.length; j++){
      let ch_group = channel_groups[j];
      measure.staves.push({
        clef:channel2clef[ch_group[0]],
        time_signature: measures_[i].time_signature,
        key_signature: measures_[i].key_signature,
        notes:[],
        rests:[],
        grace:[],
        voices:null,
        beams:[],
      });
      for (let k = 0; k < measures_[i].notes.length; k++){
        if (ch_group.includes(measures_[i].notes[k].channel)){
          let name = infer_name_from_pitch(measures_[i].notes[k].pitch, measures_[i].key_signature);
          let note : Note_itf = {
            begin:measures_[i].notes[k].begin,
            duration:measures_[i].notes[k].duration,
            accidental:null,
            modifier:null,
            octave:null,
            name,
            voice:measures_[i].notes[k].channel,
            staff_pos:null,
            stem_dir:null,
            prev_in_chord:null,
            next_in_chord:null,
            tuplet:null,
          }
          
          if (measures_[i].notes[k].id){
            note.id = measures_[i].notes[k].id;
          }
          measure.staves[j].notes.push(note);
        }
      }
      measure.staves[j].rests.push(...find_rests(measure,j,ch_group));

      compile_staff(measure,j);
      // console.dir(measures[i],{depth:null});
    }
    measure.duration*=2;
    score.measures.push(measure);
  }
  return score;
}



export function score_to_midi(score : Score_itf) : Midi_file{
  let meta_track : Midi_track = {events:[]};
  let tracks : Midi_track[] = [];
  let tied_lefts : Record<string,boolean> = {};
  let tied_rights : Record<string,boolean> = {};
  for (let i = 0; i < score.slurs.length; i++){
    if (score.slurs[i].is_tie){
      tied_lefts[score.slurs[i].left] = true;
      tied_rights[score.slurs[i].right] = true;
    }
  }

  meta_track.events.push({type:"SEQUENCE_OR_TRACK_NAME",delta_time:0,data:{text:score.title.concat(score.composer).join('\n')}});

  let instruments = [];
  for (let i = 0; i < score.instruments.length; i++){
    instruments.push(...score.instruments[i].names);
  }

  for (let j = 0; j < score.measures[0].staves.length; j++){
    let T : number = 0;
    
    for (let i = 0; i < score.measures.length; i++){
      if (!tracks[j]){
        tracks[j] = {events:[]};
        if (instruments[j]){
          tracks[j].events.push({type:'INSTRUMENT_NAME',delta_time:0,data:{text:instruments[j]}})
        }
      }

      if (j == 0){
        if (i == 0 || score.measures[i].staves[j].key_signature.toString() != score.measures[i-1].staves[j].key_signature.toString()){
          let [acc, num_acc] = score.measures[i].staves[j].key_signature;
          meta_track.events.push({type:'KEY_SIGNATURE',delta_time:T,data:{num_sharps_or_flats:acc*num_acc,is_minor:0}});
        }
        if (i == 0 || score.measures[i].staves[j].time_signature.toString() != score.measures[i-1].staves[j].time_signature.toString()){
          let [numerator, denominator] = score.measures[i].staves[j].time_signature;
          let denominator_exp = Math.log2(denominator);
          meta_track.events.push({type:'TIME_SIGNATURE',delta_time:T,data:{numerator,denominator_exp,clocks_per_metronome_click:24,notated_32nd_per_quarter_note:8}});
        }
      }
      for (let k = 0; k < score.measures[i].staves[j].notes.length; k++){
        let note = score.measures[i].staves[j].notes[k];
        let t0 = note.begin;
        let d = note.duration;
        
        let v = 100;
        if (note.articulation == ARTICULATION.STACCATO){
          d /= 2;
        }
        if (note.articulation == ARTICULATION.SPICCATO){
          d /= 4;
        }
        if (note.articulation == ARTICULATION.ACCENT){
          v = 125;
        }
        let t1 = t0+d;

        if (note.prev_in_chord != null || note.next_in_chord != null ){
          let first = note;
          let last = note;
          let count_prev = 0;
          let count_next = 0;
          let is_arp = note.articulation == ARTICULATION.ARPEGGIATED;
          while (first.prev_in_chord != null){
            first = score.measures[i].staves[j].notes[first.prev_in_chord];
            is_arp = is_arp || (first.articulation == ARTICULATION.ARPEGGIATED)
            count_prev ++;
          }
          while (last.next_in_chord != null){
            last = score.measures[i].staves[j].notes[last.next_in_chord];
            is_arp = is_arp || (last.articulation == ARTICULATION.ARPEGGIATED)
            count_next ++;
          }
          if (is_arp){
            let idx : number;
            if (first.staff_pos < last.staff_pos){
              idx = count_next;
            }else{
              idx = count_prev;
            }
            t0 += Math.min(2,note.duration/(count_next+count_prev+1))*idx;
          }
        }
        if (score.measures[i].staves[j].grace[note.begin]){
          t0 = Math.min(t1-1,Math.max(t0,note.begin+score.measures[i].staves[j].grace[note.begin].duration/4));
        }
        if (note.articulation != ARTICULATION.TRILL && note.articulation != ARTICULATION.TREMBLEMENT){
          if (!tied_rights[note.id]){
            tracks[j].events.push({type:'NOTE_ON', delta_time:T+t0,data:{key:NAME2PITCH[note.name],velocity:  v,channel:0}});
          }
          if (!tied_lefts[note.id]){
            tracks[j].events.push({type:'NOTE_OFF',delta_time:T+t1,data:{key:NAME2PITCH[note.name],velocity:  0,channel:0}});
          }
        }else{
          let above = String.fromCharCode(note.name[0].charCodeAt(0)+1);
          if (above == 'H'){
            above = 'A' + note.name.slice(1);;
          }else if (above == 'C'){
            above += note.name.slice(1);
            above = above.split('_')[0]+'_'+(note.octave+1);
          }else{
            above += note.name.slice(1);
          }
          let flip = false;
          for (let i = t0; i < t1; i++){
            tracks[j].events.push({type:'NOTE_ON', delta_time:T+i,  data:{key:NAME2PITCH[flip?above:note.name],velocity:  v,channel:0}});
            tracks[j].events.push({type:'NOTE_OFF',delta_time:T+i+1,data:{key:NAME2PITCH[flip?above:note.name],velocity:  0,channel:0}});
            flip = !flip;
          }
        }
      }
      for (let k = 0; k < score.measures[i].staves[j].grace.length; k++){
        if (!score.measures[i].staves[j].grace[k]) continue;

        for (let l = 0; l < score.measures[i].staves[j].grace[k].staves[0].notes.length; l++){
          let note = score.measures[i].staves[j].grace[k].staves[0].notes[l];
          tracks[j].events.push({type:'NOTE_ON', delta_time:T+k+note.begin/4,                data:{key:NAME2PITCH[note.name],velocity:100,channel:0}});
          tracks[j].events.push({type:'NOTE_OFF',delta_time:T+k+(note.begin+note.duration)/4,data:{key:NAME2PITCH[note.name],velocity:  0,channel:0}});
        }
      }
      T += score.measures[i].duration;
    }
  }
  tracks.unshift(meta_track);
  for (let j = 0; j < tracks.length; j++){
    tracks[j].events.sort((a,b)=>(a.delta_time-b.delta_time));
    for (let k = tracks[j].events.length-1; k > 0; k--){
      tracks[j].events[k].delta_time -= tracks[j].events[k-1].delta_time;
    }
  }
  for (let j = 0; j < tracks.length; j++){
    for (let k = 0; k < tracks[j].events.length; k++){
      tracks[j].events[k].delta_time = ~~(tracks[j].events[k].delta_time*6);
    }
    tracks[j].events.push({ type: 'END_OF_TRACK', delta_time: 0, data: {} })
  }
  let pattern : Midi_file = {
    magic:'MThd',
    tracks,
    num_tracks:tracks.length,
    format:1,
    time_format:"METRIC",
    ticks_per_quarter_note: 96,
  };
  return pattern; 
}