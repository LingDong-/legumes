import {
  Score_itf, Staff_itf, Measure_itf, Note_itf, Rest_itf, Slur_itf, Cresc_itf, Time_signature,
  CLEF, ACCIDENTAL, ORDER_OF_ACCIDENTALS, NOTE_LENGTH, 
  note_name_to_staff_pos, get_median_staff_pos, chord_and_beam_staff, short_id, Tuplet_itf, ARTICULATION, BARLINE, BRACKET, 
} from "./common"

import {CONFIG} from "./main"


const ARTICULATION_SYMBOL_LOOKUP : Record<string,number> = {
  '>':ARTICULATION.ACCENT,
  '^':ARTICULATION.MARCATO,
  '.':ARTICULATION.STACCATO,
  '-':ARTICULATION.TENUTO,
  ',':ARTICULATION.SPICCATO,
  '?':ARTICULATION.FERMATA,
  '+':ARTICULATION.TREMBLEMENT,
  't':ARTICULATION.TRILL,
  'o':ARTICULATION.FLAGEOLET,
  'm':ARTICULATION.MORDENT,
  's':ARTICULATION.TURN,
  'v':ARTICULATION.UP_BOW,
  '{':ARTICULATION.ARPEGGIATED
};
let ARTICULATION_SYMBOL = Object.fromEntries(Object.entries(ARTICULATION_SYMBOL_LOOKUP).map(x=>[x[1],x[0]]));

export function parse_txt(txt:string) : Score_itf{
  txt = txt.replace(/[\n\r\t]/g,' ');
  let swap_sp = '￿'/*FFFF*/ ; let swap_sp_re = new RegExp(swap_sp,'g');
  let swap_qt = '￾'/*FFFE*/ ; let swap_qt_re = new RegExp(swap_qt,'g');

  txt = txt.replace(/\\'/g,swap_qt);
  txt = txt.split("'").map((x,i)=>(i%2)?x.replace(/ /g,swap_sp):x).join("'");
  // console.log(txt);
  txt = txt.split(';').filter((_,i)=>!(i%2)).join(' ');
  let words = txt.split(' ').filter(x=>x.length).map(x=>x.replace(swap_sp_re,' ').replace(swap_qt_re,"'"));
  // console.log(words);

  let score : Score_itf = {
    title:[],
    instruments:[],
    composer:[],
    slurs:[],
    measures:[],
    crescs:[],
  };

  let measure : Measure_itf;
  let staff   : Staff_itf;
  let note    : Note_itf;
  let rest    : Rest_itf;
  let slur    : Slur_itf;
  let cresc   : Cresc_itf;
  let i = 0;
  let state : string[] = [];
  let begin = 0;
  let voice = 0;
  let begin0 = 0;
  let rest_hidden = false;

  let tup_state : {id:string,mul:number,begin:number,dur:number,num:number,members:(Note_itf|Rest_itf)[]}[] = [];
  
  function curr_state(s:string):boolean{
    return state[state.length-1]==s;
  }

  function pop_short_state(){
    let curr = state[state.length-1];
    if (curr){
      if (curr == "note" ){
        state.pop();
        
        
        if (note.tuplet && note.tuplet.display_duration === null){
          note.tuplet.display_duration = note.duration;
          // console.log(JSON.stringify(tup_state));
          note.duration = Math.max(1,~~(note.duration*tup_state[tup_state.length-1].mul));
          // note.duration = Math.round(note.duration*tup_state[tup_state.length-1].mul);
          
        }
        if (note.tuplet) tup_state[tup_state.length-1].members.push(note);
        

        if (curr_state('grace') || state.includes('grace')){
          // console.log(begin,note.duration);
          if (!staff.grace[begin0]){
            staff.grace[begin0] = {duration:0,barline:BARLINE.NONE,staves:[{
              clef:staff.clef,
              time_signature:[1,1],
              key_signature:staff.key_signature,
              notes:[],
              grace:[],
              rests:[],
              voices:1,
              beams:[],
            }]};
          }
          staff.grace[begin0].staves[0].notes.push(note);
        }else{
          staff.notes.push(note);
        }
        measure.duration = Math.max(measure.duration,begin+note.duration);

        if (!curr_state('chord')){
          begin += note.duration;
        }
      }else if (curr == "rest"){
        state.pop();
        if (rest.tuplet && rest.tuplet.display_duration === null){
          rest.tuplet.display_duration = rest.duration;

          rest.duration = Math.max(1,~~(rest.duration*tup_state[tup_state.length-1].mul));
          // rest.duration = Math.round(rest.duration*tup_state[tup_state.length-1].mul);
          
        }
        if (rest.tuplet && !rest_hidden) tup_state[tup_state.length-1].members.push(rest);

        measure.duration = Math.max(measure.duration,begin+rest.duration);
        begin += rest.duration;
        if (!rest_hidden) staff.rests.push(rest);
      }else if (curr == "title" || curr == "composer" || curr == "instruments" || curr == "tempo"){
        state.pop();
      }else if (curr == "slur"){
        state.pop();
        score.slurs.push(slur);
      }else if (curr == "cresc"){
        state.pop();
        score.crescs.push(cresc);
      }
    }
  }
  function switch_state(s:string){
    pop_short_state();
    state.push(s);
  }

  function parse_dur(x:string):[number,boolean]{
    if (x[x.length-1] == '.'){
      return [96/Number(x.slice(0,-1)),true];
    }else{
      return [64/Number(x),false];
    }
  }

  while (i < words.length){
    let x:string = words[i];
    if (x == 'end'){
      pop_short_state();
      if (curr_state("staff")){
        compile_staff(staff);
        measure.staves.push(staff);
        
      }else if (curr_state("measure")){
        // if (measure.duration){
          score.measures.push(measure);
        // }
      }else if (curr_state("chord")){
        if (state.includes('grace')){
          begin += staff.grace[begin0].staves[0].notes[staff.grace[begin0].staves[0].notes.length-1].duration;
        }else{
          begin += staff.notes[staff.notes.length-1].duration;
        }
      }else if (curr_state("voice")){
        voice ++;
        begin = 0;
      }else if (curr_state("grace")){
        // console.log(JSON.stringify(staff.grace),begin);
        staff.grace[begin0].duration = Math.max(staff.grace[begin0].duration,begin);
        compile_staff(staff.grace[begin0].staves[0],-1);
        begin = begin0;
      }else if (curr_state("tuplet")){
        let tup = tup_state.pop();
        let sum = (tup.members[tup.members.length-1].begin-tup.begin) + tup.members[tup.members.length-1].duration;
        let remain = tup.dur-sum;
        for (let i = tup.members.length-1; i >= 0; i--){
          if (tup.members[i].begin ==tup.members[tup.members.length-1].begin ){
            tup.members[i].duration += remain;
          }else{
            break;
          }
        }
        // console.log(remain,tup);
        begin = tup.begin+tup.dur;
      }
      state.pop();
    }else if (x == 'title'){
      switch_state("title")
      
    }else if (x == 'composer'){
      switch_state("composer")
    }else if (x == 'instruments'){
      switch_state("instruments")
    }else if (x == 'tempo'){
      switch_state("tempo")
    }else if (x == 'measure'){
      switch_state("measure");
      measure = {
        duration: 0,
        barline: BARLINE.SINGLE,
        staves: [],
      };

    }else if (x == 'staff'){
      switch_state("staff");
      staff = {
        clef:CLEF.TREBLE,
        time_signature:[4,4],
        key_signature:[0,0],
        notes:[],
        grace:[],
        rests:[],
        voices:1,
        beams:[],
      };
      if (score.measures[score.measures.length-1]){
        if (score.measures[score.measures.length-1].staves[measure.staves.length]){
          let prev = score.measures[score.measures.length-1].staves[measure.staves.length];
          staff.time_signature[0] = prev.time_signature[0];
          staff.time_signature[1] = prev.time_signature[1];
          staff.key_signature[0] = prev.key_signature[0];
          staff.key_signature[1] = prev.key_signature[1];
          staff.clef = prev.clef;
        }
      }
      begin = 0;
      voice = 0;
    }else if (x == 'note'){
      switch_state("note");
      note = {
        begin:null,
        duration:null,
        accidental:null,
        modifier:false,
        octave:null,
        name:null,
        voice:null,
        staff_pos:null,
        stem_dir:null,
        prev_in_chord:null,
        next_in_chord:null,
        tuplet:null,
      }
      if (state[state.length-2] == 'grace' && staff.grace[begin0] && staff.grace[begin0].staves[0].notes.length){
        let notes = staff.grace[begin0].staves[0].notes;
        if (notes[notes.length-1]){
          Object.assign(note,notes[notes.length-1]);
        }
      }else{
        if (staff.notes[staff.notes.length-1]){
          Object.assign(note,staff.notes[staff.notes.length-1]);
        }
      }
      note.begin = begin;
      note.accidental = null;
      note.voice = voice;
      if (note.id){
        delete note.id;
      }
      if (note.lyric){
        delete note.lyric;
      }
      if (note.articulation){
        delete note.articulation;
      }
      if (note.cue){
        delete note.cue;
      }
      
      if (state[state.length-2] != 'grace'){
        let tup = tup_state[tup_state.length-1];
        if (note.tuplet && tup){
          if (note.tuplet.id != tup.id){
            note.tuplet = {id:tup.id,display_duration:null,label:tup.num};
          }
        }else if (tup && !note.tuplet){
          note.tuplet = {id:tup.id,display_duration:null,label:tup.num};
        }else if (!tup && note.tuplet){
          note.tuplet = null;
        }
      }else{
        note.tuplet = null;
      }
    }else if (x == 'rest'){
      switch_state("rest");
      rest = {
        begin:null,
        duration:null,
        voice:null,
        tuplet:null,
      };
      rest_hidden = false;
      if (staff.rests[staff.rests.length-1]){
        Object.assign(rest,staff.rests[staff.rests.length-1]);
      }
      rest.begin = begin;
      rest.voice = voice;
      if (rest.cue){
        delete rest.cue;
      }
      if (state[state.length-2] != 'grace'){
        let tup = tup_state[tup_state.length-1];
        if (rest.tuplet && tup){
          if (rest.tuplet.id != tup.id){
            rest.tuplet = {id:tup.id,display_duration:null,label:tup.num};
          }
        }else if (tup && !rest.tuplet){
          rest.tuplet = {id:tup.id,display_duration:null,label:tup.num};
        }else if (!tup && rest.tuplet){
          rest.tuplet = null;
        }
      }else{
        rest.tuplet = null;
      }
    }else if (x == 'chord'){
      switch_state("chord");

    }else if (x == 'grace'){
      switch_state("grace");
      begin0 = begin;
      begin = 0;

    }else if (x == 'tuplet'){
      switch_state("tuplet");
      tup_state.push({
        id:short_id(),
        mul:1,
        begin:begin,
        dur:0,
        num:3,
        members:[],
      });
    }else if (x == 'voice'){
      switch_state("voice");

    }else if (x == "slur"){
      switch_state("slur");
      slur = {
        left:null,
        right:null,
        is_tie:false,
      }
    }else if (x == "tie"){
      switch_state("slur");
      slur = {
        left:null,
        right:null,
        is_tie:true,
      }
    }else if (x == 'cresc'){
      switch_state("cresc");
      cresc = {
        left:null,
        right:null,
        val_left:null,
        val_right:null,
      }
    }else if (curr_state("measure")){
      if (x.startsWith('|') || x.startsWith(':')){
        if (x == '|'){
          measure.barline = BARLINE.SINGLE;
        }else if (x == '||'){
          measure.barline = BARLINE.DOUBLE;
        }else if (x == '|||'){
          measure.barline = BARLINE.END;
        }else if (x == '|:'){
          measure.barline = BARLINE.REPEAT_BEGIN;
        }else if (x == ':|'){
          measure.barline = BARLINE.REPEAT_END;
        }else if (x == ':|:'){
          measure.barline = BARLINE.REPEAT_END_BEGIN;
        }
      }
    }else if (curr_state("staff")){
      if (x == 'G'){
        staff.clef = CLEF.TREBLE;
      }else if (x == 'F'){
        staff.clef = CLEF.BASS;
      }else if (x == 'Ca' || x == 'C'){
        staff.clef = CLEF.ALTO;
      }else if (x == 'Ct'){
        staff.clef = CLEF.TENOR;
      }else if (x == 'Cm'){
        staff.clef = CLEF.MEZZO_SOPRANO;
      }else if (x == 'Cs'){
        staff.clef = CLEF.SOPRANO;
      }else if (x == 'Cb'){
        staff.clef = CLEF.BARITONE;
      }else if (x == '~'){
        staff.key_signature = [0,0];
      }else if (x.startsWith('b')){
        staff.key_signature = [ACCIDENTAL.FLAT,x.length];
      }else if (x.startsWith('#')){
        staff.key_signature = [ACCIDENTAL.SHARP,x.length];
      }else if (x.includes('/')){
        let s = x.split('/');
        staff.time_signature = [Number(s[0]),Number(s[1])];
      }
    }else if (curr_state("note")){
      if ((/^[A-Z].*/).test(x)){
        note.name = x[0];
        note.octave = Number(x.slice(1));
      }else if (x[0] == 'd'){
        let [dur,mod] = parse_dur(x.slice(1));
        note.duration = dur;
        note.modifier = mod;
        if (note.tuplet) note.tuplet.display_duration = null;

      }else if (x[0] == '$'){
        note.id = x.slice(1);
      }else if (x[0] == '#'){
        note.accidental = ACCIDENTAL.SHARP;
      }else if (x[0] == 'b'){
        note.accidental = ACCIDENTAL.FLAT;
      }else if (x[0] == '~'){
        note.accidental = ACCIDENTAL.NATURAL;
      }else if (x[0] == 'l'){
        note.lyric = x.slice(1).replace(/(^')|('$)/g,'');
      }else if (x[0] == 'a'){
        if (ARTICULATION_SYMBOL_LOOKUP[x[1]]){
          note.articulation = ARTICULATION_SYMBOL_LOOKUP[x[1]];
        }else{
          note.articulation = Number(x[1]);
        }
        if (x[2] == '|'){
          note.articulation = -note.articulation;
        }
      }else if (x[0] == '|'){
        note.cue = {position:0,data:x.slice(1).replace(/(^')|('$)/g,'')};
      }else if (x[0] == '['){
        note.cue = {position:-1,data:x.slice(1).replace(/(^')|('$)/g,'')};
      }else if (x[0] == ']'){
        note.cue = {position:1,data:x.slice(1).replace(/(^')|('$)/g,'')};
      }
    }else if (curr_state("rest")){
      if (x[0] == 'd'){
        let dur = 64/Number(x.slice(1));
        rest.duration = dur;
        if (rest.tuplet) rest.tuplet.display_duration = null;
      }else if (x[0] == '|'){
        rest.cue = {position:0,data:x.slice(1).replace(/(^')|('$)/g,'')};
      }else if (x[0] == '['){
        rest.cue = {position:-1,data:x.slice(1).replace(/(^')|('$)/g,'')};
      }else if (x[0] == ']'){
        rest.cue = {position:1,data:x.slice(1).replace(/(^')|('$)/g,'')};
      }else if (x[0] == '-'){
        rest_hidden = true;
      }
    }else if (curr_state("slur")){
      if (x[0] == '$'){
        if (slur.left == null){
          slur.left = x.slice(1);
        }else{
          slur.right = x.slice(1);
        }
      }
    }else if (curr_state("cresc")){
      if (x[0] == '$'){
        if (cresc.left == null){
          cresc.left = x.slice(1);
        }else{
          cresc.right = x.slice(1);
        }
      }else{
        if (cresc.val_left === null){
          cresc.val_left = Number(x);
        }else{
          cresc.val_right = Number(x);
        }
      }
    }else if (curr_state("tuplet")){
      if (x[0] == 'd'){
        let [a_,b_] = x.slice(1).split('/');
        let a : number = parse_dur(a_)[0];
        let b : number = parse_dur(b_)[0];
        tup_state[tup_state.length-1].mul = a/b;
        tup_state[tup_state.length-1].dur = a;
        // console.log(a_,b_,a,b);
      }else{
        let n : number = Number(x);
        tup_state[tup_state.length-1].num = n;
      }
    }else if (curr_state("title")){
      score.title.push(x.replace(/(^')|('$)/g,''));
    }else if (curr_state("composer")){
      score.composer.push(x.replace(/(^')|('$)/g,''));
    }else if (curr_state("instruments")){
      if (x == '{'){
        while (score.instruments[score.instruments.length-1] && score.instruments[score.instruments.length-1].connect_barlines.length < score.instruments[score.instruments.length-1].names.length) score.instruments[score.instruments.length-1].connect_barlines.push(false);
        score.instruments.push({bracket:BRACKET.BRACE,names:[],connect_barlines:[]})
      }else if (x == '['){
        while (score.instruments[score.instruments.length-1] && score.instruments[score.instruments.length-1].connect_barlines.length < score.instruments[score.instruments.length-1].names.length) score.instruments[score.instruments.length-1].connect_barlines.push(false);
        score.instruments.push({bracket:BRACKET.BRACKET,names:[],connect_barlines:[]})
      }else if (x == '|'){
        while (score.instruments[score.instruments.length-1] && score.instruments[score.instruments.length-1].connect_barlines.length < score.instruments[score.instruments.length-1].names.length) score.instruments[score.instruments.length-1].connect_barlines.push(false);
        score.instruments.push({bracket:BRACKET.NONE,names:[],connect_barlines:[]})
      }else if (x == '-'){
        score.instruments[score.instruments.length-1].connect_barlines.push(true);
      }else{
        if (!score.instruments.length){
          score.instruments.push({bracket:BRACKET.NONE,names:[],connect_barlines:[]})
        }
        let group = score.instruments[score.instruments.length-1];
        if (group.connect_barlines.length < group.names.length){
          group.connect_barlines.push(false);
        }
        group.names.push(x.replace(/(^')|('$)/g,''));
      }
    }else if (curr_state("tempo")){
      if (!score.tempo){
        score.tempo = {};
      }
      if (x[0] == 'd'){
        let [dur,mod] = parse_dur(x.slice(1));
        score.tempo.duration = dur;
        score.tempo.modifier = mod;
      }else if (x[0] == '='){
        score.tempo.bpm = Number(x.slice(1));
      }else{
        score.tempo.text = x.replace(/(^')|('$)/g,'');
      }
    }
    i++;
  }
  pop_short_state();
  return score;

}



function compile_staff(
  staff:Staff_itf, force_stem_dir:number=0
){
  for (let i = 0; i < staff.notes.length; i++){
    staff.voices = Math.max(staff.notes[i].voice+1,staff.voices);
  }
  for (let i = 0; i < staff.rests.length; i++){
    staff.voices = Math.max(staff.rests[i].voice+1,staff.voices);
  }

  function get_beat_length(time_sig:Time_signature){
    if (CONFIG.BEAM_POLICY == 0){
      return 1;
    }else if (CONFIG.BEAM_POLICY == 1){
      return ~~(NOTE_LENGTH.WHOLE/time_sig[1]);
    }else{
      let beat_length = ~~(NOTE_LENGTH.WHOLE/time_sig[1]);
      beat_length *= (time_sig[0]%2 || (time_sig[0] <= 2 && time_sig[1] > 2)) ? time_sig[0] : (time_sig[0]/2);
      return beat_length;
    }
  }

  let beat_length = get_beat_length(staff.time_signature);
  
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
    let notes_in_beat : Note_itf[];

    if (note.duration < NOTE_LENGTH.QUARTER){
      let beat_idx : number = get_beat_idx(note);
      
      if (note.tuplet){
        notes_in_beat = staff.notes.filter(x=>x.tuplet&&x.tuplet.id==note.tuplet.id);
      }else{
        // let s = Math.sign(note.duration-NOTE_LENGTH.QUARTER);
        // notes_in_beat = get_notes_in_beat(beat_idx)//.filter(x=>Math.sign(x.duration-NOTE_LENGTH.QUARTER)==s);
        notes_in_beat = get_notes_in_beat(beat_idx).filter(x=>x.duration<NOTE_LENGTH.QUARTER);
      }
    }else{
      notes_in_beat=[];
      for (let m of staff.notes){
        if (m.begin == note.begin){
          notes_in_beat.push(m);
        }
      }
    }

    let avg_line : number = notes_in_beat.reduce((acc:number,x:Note_itf):number=>(acc+x.staff_pos),0)/notes_in_beat.length;

    if (avg_line < 4){
      return 1;
    }else{
      return -1;
    }
  }

  let [measure_acc, num_acc] = staff.key_signature;
  let acc_names : string[] = ORDER_OF_ACCIDENTALS[measure_acc].slice(0,num_acc).split('');
  let acc_history : Record<string,number> = {};
  
  for (let i = 0; i < staff.notes.length; i++){
    let note : Note_itf = staff.notes[i];
    let note_bname = note.name;
    let key = note_bname + '_' + note.octave;
  
    if (note.accidental != null){
      note.name = note_bname + (['b','','s'][note.accidental+1]);
      acc_history[key] = note.accidental;
    }else{
      if (acc_history[key] === undefined){
        if (acc_names.includes(note_bname)){
          note.name = note_bname + (['b',null,'s'][measure_acc+1]);
          acc_history[key] = measure_acc;
        }else{
          note.name = note_bname;
        }
      }else{
        note.name = note_bname + ['b','','s'][acc_history[key]+1];
      }
    }
    note.name += "_";
    note.name += note.octave;
    note.staff_pos = note_name_to_staff_pos(note.name,staff.clef);
  }

  for (let i = 0; i < staff.notes.length; i++){
    let note = staff.notes[i];
    let stem_dir :number;
    
    if (staff.voices == 1){
      stem_dir = force_stem_dir || calc_stem_dir(note);
    }else{
      stem_dir = note.voice % 2 ? 1 : -1;
    }
    note.stem_dir = stem_dir;
  }

  chord_and_beam_staff(staff,beat_length);

}


export function export_txt(score:Score_itf):string{
  let o : string = "";
  o += `title '${score.title.map(x=>x.replace(/'/g,"\\'")).join("' '")}'\n`;
  if (score.composer){
    o += `composer '${score.composer}'\n`;
  }
  if (score.tempo){
    o += `tempo`
    if (score.tempo.text){
      o += ` '`+score.tempo.text.replace(/'/g,"\\'")+`'`;
    }
    if (score.tempo.duration){
      if (score.tempo.modifier){
        o += ' d'+(96/score.tempo.duration).toString()+'.';
      }else{
        o += ' d'+(64/score.tempo.duration).toString();
      }
      if (score.tempo.bpm){
        o += ' ='+score.tempo.bpm;
      }
    }
    o += '\n';
  }
  if (score.instruments.length){
    o += 'instruments ';
    for (let i = 0; i < score.instruments.length; i++){
      o += ['','{','['][score.instruments[i].bracket] + ' ';
      for (let j = 0; j < score.instruments[i].names.length; j++){
        if (j && score.instruments[i].connect_barlines[j-1]){
          o += ' - ';
        }
        o += `'${score.instruments[i].names[j].replace(/'/g,"\\'")}' `;
      }
    }
    o += '\n';
  }
  for (let i = 0; i < score.measures.length; i++){
    let measure = score.measures[i];

    o += `measure`;
    if (measure.barline == BARLINE.DOUBLE){
      o += ` ||`;
    }else if (measure.barline == BARLINE.REPEAT_BEGIN){
      o += ` |:`;
    }else if (measure.barline == BARLINE.REPEAT_END){
      o += ` :|`;
    }else if (measure.barline == BARLINE.END ){
      o += ` |||`;
    }else if (measure.barline == BARLINE.REPEAT_END_BEGIN){
      o += ` :|:`;
    }
    o += `\n`;
    
    for (let j = 0; j < measure.staves.length; j++){
      let staff = measure.staves[j];

      o += `  staff ${staff.clef==CLEF.TREBLE?'G':'F'} ${['b','','#'][staff.key_signature[0]+1].repeat(staff.key_signature[1])} ${staff.time_signature[0]}/${staff.time_signature[1]}\n`;
      for (let k = 0; k < staff.voices; k++){

        
        let items : [string,(Note_itf|Rest_itf|{begin:number,duration:number,[other_options: string]: any}),boolean][] = [];
        for (let l = 0; l < staff.notes.length; l++){
          if (staff.notes[l].voice == k){
            items.push(['note',staff.notes[l],false]);
          }
        }
        for (let l = 0; l < staff.rests.length; l++){
          if (staff.rests[l].voice == k){
            items.push(['rest',staff.rests[l],false]);
          }
        }
        for (let l = 0; l < staff.grace.length; l++){
          if (!staff.grace[l]){
            continue;
          }
          let grace_item : [string,({begin:number,duration:number,[other_options: string]: any}),boolean] = ['grace',{begin:l-0.001,duration:staff.grace[l].duration,items:[]},false];
          for (let m = 0; m < staff.grace[l].staves[0].notes.length; m++){
            let n = staff.grace[l].staves[0].notes[m];
            if (n.voice == k){
              grace_item[1].items.push(['note',n,false]);
            }
          }
          for (let m = 0; m < staff.grace[l].staves[0].rests.length; m++){
            let n = staff.grace[l].staves[0].rests[m];
            if (n.voice == k){
              grace_item[1].items.push(['rest',n,false]);
            }
          }
          grace_item[1].items.sort((a:{begin:number,duration:number,[other_options: string]: any},b:{begin:number,duration:number,[other_options: string]: any})=>(a[1].begin-b[1].begin));
          if (grace_item[1].items.length)
            items.push(grace_item);
        }
        items.sort((a,b)=>(a[1].begin-b[1].begin));
        // console.log(items);
        if (staff.voices>1) {o += '   voice\n';}

        function do_items(items:[string,(Note_itf|Rest_itf|{begin:number,duration:number,[other_options: string]: any}),boolean][]){
          for (let l = 0; l < items.length; l++){
            let done = items[l][2];
            if (done){
              continue;
            }
            
    

            if (items[l][1].tuplet){
              function count():string[]{
                let begin = -1;
                let real = 0;
                let disp = 0;
                for (let m = l; m < items.length; m++){
                  if (!items[m][1].tuplet || items[m][1].tuplet.id != items[l][1].tuplet.id){
                    break;
                  }
                  if (items[m][1].begin != begin){
                    begin = items[m][1].begin;
                    disp += items[m][1].tuplet.display_duration;
                  }
                  real = items[m][1].begin-items[l][1].begin + items[m][1].duration;
                }
                function to_str(n:number){
                  if (64/n == ~~(64/n)){
                    return (~~(64/n)).toString();
                  }else{
                    return (~~(96/n)).toString()+".";
                  }
                }
                let real_str : string = to_str(real);
                let disp_str : string = to_str(disp);

                
                return [real_str,disp_str];
              }
              let prev_tup_id : string = null;
           
              for (let m = l-1; m>=0; m--){
                let e = (items[m][1] as {tuplet:Tuplet_itf});
                if (e.tuplet){
                  prev_tup_id = items[m][1].tuplet.id;
                  break;
                }
              }
              if (!items[l-1] || prev_tup_id === null){
                o += `   tuplet ${items[l][1].tuplet.label} d${count().join('/')}\n`;
              }else if (prev_tup_id !== null && prev_tup_id != items[l][1].tuplet.id){
                o += `   end\n   tuplet ${items[l][1].tuplet.label} d${count().join('/')}\n`;
              }
            }else if  (items[l-1] && items[l-1][1].tuplet){
              let next_tup_id : string = null;
              for (let m = l+1; m < items.length; m++){
                let e = (items[m][1] as {tuplet:Tuplet_itf});
                if (e.tuplet){
                  next_tup_id = items[m][1].tuplet.id;
                  break;
                }
              }
            
              if (items[l-1][1].tuplet.id != next_tup_id){
                o += `   end\n`;
              }
            }

            
            
            if (items[l][0] == 'note'){
              let e : Note_itf = (items[l][1] as Note_itf);
              while (e.prev_in_chord !== null){
                e = staff.notes[e.prev_in_chord];
              }
              let is_chord = e.next_in_chord !== null;
              if (is_chord) o += '    chord\n';
              
              do{
                items.find(x=>(x[1]==e))[2] = true;
                let s : string[] = ['note'];
                s.push(e.name[0]+e.octave);
                if (e.accidental !== null){
                  s.push(['b','~','#'][e.accidental+1]);
                }
                let dur = e.duration;
                if (e.tuplet){
                  dur = e.tuplet.display_duration;
                }
                if (e.modifier){
                  s.push('d'+(96/dur).toString()+'.');
                }else{
                  s.push('d'+(64/dur).toString());
                }
                if (e.articulation){
                  s.push('a'+(ARTICULATION_SYMBOL[e.articulation]??e.articulation));
                }
                if (e.cue){
                  s.push(`${['[','|',']'][e.cue.position+1]}'${e.cue.data.replace(/'/g,"\\'")}'` );
                }
                if (e.lyric){
                  s.push(`l'${e.lyric.replace(/'/g,"\\'")}'`);
                }
                
                let t = '    ';
                if (is_chord) t += '  ';
                t += s.join(' ');
                if (e.id){
                  t = t.padEnd(50,' ')+' $'+e.id;
                }
                o += t + '\n';
                e = staff.notes[e.next_in_chord];
              }while(e);
              if (is_chord) o += '    end\n';
            }else if (items[l][0] == "rest"){
              let e : Rest_itf = (items[l][1] as Rest_itf);
              let dur = e.duration;
              if (e.tuplet){
                dur = e.tuplet.display_duration;
              }
              o += `    rest d${64/dur}`;
              if (e.cue){
                o += ` ${['[','|',']'][e.cue.position+1]}'${e.cue.data.replace(/'/g,"\\'")}'`;
              }
              o += '\n';
            }else if (items[l][0] == "grace"){
              o += `   grace\n`;
              do_items((items[l][1] as {begin:number,duration:number,[other_options: string]: any}).items);
              o += `   end\n`;
            }else{}
          }
          if (items[items.length-1] && items[items.length-1][1].tuplet){
            o += `   end\n`;
          }
        }
        do_items(items);
        if (staff.voices>1) {o += '   end\n';}
      }
      o += `  end\n`;
    }
    o += `end\n`;
  }
  for (let i = 0; i < score.slurs.length; i++){
    let slur = score.slurs[i];
    if (slur.is_tie){
      o += `tie $${slur.left} $${slur.right}\n`;
    }else{
      o += `slur $${slur.left} $${slur.right}\n`;
    }
    
  }
  for (let i = 0; i < score.crescs.length; i++){
    let cresc = score.crescs[i];
    o += `cresc ${cresc.val_left} ${cresc.val_right} $${cresc.left} $${cresc.right}\n`;
  }
  return o;
}