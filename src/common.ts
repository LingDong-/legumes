export type Key_signature = [number,number];
export type Time_signature = [number,number];


export const NOTE_LENGTH : Record<string,number> = {
  WHOLE : 64,
  HALF : 32,
  QUARTER : 16,
  EIGHTH : 8,
  SIXTEENTH : 4,
  THIRTYSECOND : 2,
  SIXTYFOURTH : 1,
};

export const ACCIDENTAL : Record<string,number> = {
  SHARP : 1,
  NATURAL : 0,
  FLAT : -1,
}
export const CLEF : Record <string,number> = {
  TREBLE : 0,
  BASS : 1,
  ALTO: 2,
  TENOR: 3,
  MEZZO_SOPRANO: 4,
  SOPRANO: 5,
  BARITONE: 6,
}
export const ORDER_OF_ACCIDENTALS : Record<string,string> = {
  [ACCIDENTAL.SHARP]: 'FCGDAEB',
  [ACCIDENTAL.FLAT]:  'BEADGCF',
  [ACCIDENTAL.NATURAL]: ''
};
export const ARTICULATION : Record<string,number> = {
  STACCATO   :11,
  SPICCATO   :12,
  TENUTO     :13,
  FERMATA    :14,
  ACCENT     :15,
  MARCATO    :16,
  TREMBLEMENT:17,
  TRILL      :18,
  MORDENT    :19,
  TURN       :20,
  UP_BOW     :21,
  FLAGEOLET  :22,
  ARPEGGIATED:23,
  MORDENT_INV:-19,
  TURN_INV   :-20,
}
export const CUE : Record<string,string> = {
  PEDAL_ON     :'ped',
  PEDAL_OFF    :'*',
  PIANISSISSIMO:'ppp',
  PIANISSIMO   :'pp',
  PIANO        :'p',
  MEZZO_PIANO  :'mp',
  MEZZO_FORTE  :'mf',
  FORTE        :'f',
  FORTISSIMO   :'ff',
  FORTISSISSIMO:'fff',
  SFORZANDO    :'sfz',
}
export const BARLINE : Record<string,number> = {
  NONE:            0,
  SINGLE:          1,
  DOUBLE:          2,
  END:             3,
  REPEAT_BEGIN:    4,
  REPEAT_END:      5,
  REPEAT_END_BEGIN:6,
}

export const BRACKET : Record<string,number> = {
  NONE:   0,
  BRACE:  1,
  BRACKET:2,
}

export interface Tuplet_itf{
  id:string;
  display_duration:number;
  label:number;
}

export interface Note_itf {
  id?: string;
  begin: number;
  duration: number;
  modifier: boolean;
  accidental: number|null;
  name: string;
  octave: number;
  voice: number;
  staff_pos: number;
  prev_in_chord: number|null;
  next_in_chord: number|null;
  stem_dir: number;
  tuplet: Tuplet_itf|null;
  lyric?:string;
  articulation?:number;
  cue?:Cue_itf;
};

export interface Cue_itf {
  position: number;
  data: string;
}

export interface Rest_itf{
  begin: number;
  duration: number;
  voice: number;
  tuplet: Tuplet_itf|null;
  cue?:Cue_itf;
};

export interface Measure_itf{
  duration: number;
  barline: number;
  staves: Staff_itf[];
}

export interface Staff_itf{
  time_signature: Time_signature;
  key_signature: Key_signature;
  clef: number;
  voices: number;
  rests: Rest_itf[];
  notes: Note_itf[];
  grace: Measure_itf[];
  beams: number[][];
}

export interface Slur_itf{
  left: string;
  right: string;
  is_tie : boolean;
}

export interface Cresc_itf{
  left: string;
  right: string;
  val_left: number;
  val_right: number;
}

export interface Tempo_itf{
  text?: string;
  duration?: number;
  modifier?:boolean;
  bpm?: number;
}

export interface Instrument_group_itf{
  bracket: number;
  names: string[];
  connect_barlines: boolean[];
}

export interface Score_itf{
  title: string[];
  composer: string[];
  tempo?: Tempo_itf;
  instruments: Instrument_group_itf[];
  slurs: Slur_itf[];
  measures: Measure_itf[];
  crescs: Cresc_itf[];
}

export function note_name_to_staff_pos(name:string,clef:number){
  let base_name = name[0];
  let octave = Number(name.split('_')[1]);
  let i0 = {
    [CLEF.TREBLE]: (6*7+3),
    [CLEF.BASS]:   (5*7-2),
    [CLEF.ALTO]:   (6*7-3),
    [CLEF.TENOR]:  (6*7-5),
    [CLEF.MEZZO_SOPRANO]: (6*7-1),
    [CLEF.SOPRANO]: (6*7+1),
    [CLEF.BARITONE]: (5*7),
  }[clef];
  let idx = i0-("CDEFGAB".indexOf(base_name)+octave*7);
  return idx;
}

export function get_note_name_accidental(name:string):number{
  return [ACCIDENTAL.FLAT, ACCIDENTAL.NATURAL, ACCIDENTAL.SHARP]["b_s".indexOf(name[1])];
}

export function get_existing_voices(staff_notes:(Note_itf|Rest_itf)[],filt:number[]):number[]{
  return Array.from(new Set(staff_notes.map(x=>x.voice))).filter(x=>(filt.includes(x)||!filt.length));
}

export function short_id(){
  return '_'+String.fromCharCode(...new Array(6).fill(0).map(x=>(~~(Math.random()*26)+0x41)));
}

export function get_median_staff_pos(notes:Note_itf[]):Record<number,number>{
  let c2p : Record<number,number[]> = {}

  for (let n of notes){
    if (!c2p[n.voice]){
      c2p[n.voice] = [];
    }
    c2p[n.voice].push(n.staff_pos);
  }
  let c2p2 : Record<number,number> = {};
  for (let k in c2p){
    c2p[k].sort((a,b)=>(a-b));
    let m = ~~((c2p[k].length)/2.0);
    if (c2p[k].length % 2){
      c2p2[k] = c2p[k][m];
    }else{
      c2p2[k] = (c2p[k][m-1]+c2p[k][m])/2;
    }
  }
  return c2p2;
}


export function chord_and_beam_staff(staff:Staff_itf,beat_length:number){
  let beam_cnt = 1;

  let notes_beam : number[] = new Array(staff.notes.length);
  let beam_info : Record<number,Record<number,number[]>> = {};

  for (let i = 0; i < staff.notes.length; i++){
    // console.log('----',i);
    let note = staff.notes[i];
    let beam = 0;
    let chord : [number,Note_itf][] = [];
    let stem_dir = note.stem_dir;
    let disp_dur = note.duration;
    if (note.tuplet){
      disp_dur = note.tuplet.display_duration;
    }

    for (let j = 0; j <  staff.notes.length; j++){
      let own = note;
      let other =  staff.notes[j];
      if (own.voice == other.voice && own.begin == other.begin && own.duration == other.duration){
        chord.push([j,other]);
      }
    }
    // console.log(chord);
    chord.sort((a,b)=>stem_dir*(a[1].staff_pos-b[1].staff_pos));
    // console.log(chord);

    let my_idx = chord.findIndex(x=>(x[0]==i));
    // console.log(i,my_idx);

    if (chord[my_idx-1]){
      note.prev_in_chord = chord[my_idx-1][0];
    }
    if (chord[my_idx+1]){
      note.next_in_chord = chord[my_idx+1][0];

    }else if (disp_dur < NOTE_LENGTH.QUARTER){
      let linked : boolean = false;
      for (let j = 0; j < i; j++){
        let own = staff.notes[i];
        let other = staff.notes[j];
        let other_beam = notes_beam[j];

        let consecutive : boolean = true;

        if (other.voice != own.voice){
          continue;
        }
        if (other.next_in_chord != null){
          continue;
        }

        function calc_consecutive(){
          for (let k = 0; k < i; k++){
            if (staff.notes[k].voice != staff.notes[i].voice){
              continue;
            }
            if (staff.notes[j].begin < staff.notes[k].begin &&
                staff.notes[k].begin < staff.notes[i].begin){
              consecutive = false;
              
              break;
            }
          }
          if (consecutive){
            for (let k = 0; k < staff.rests.length; k++){
              if (staff.rests[k].voice != staff.notes[i].voice){
                continue;
              }
              if (staff.notes[j].begin < staff.rests[k].begin &&
                  staff.rests[k].begin < staff.notes[i].begin){
                consecutive = false;
                break;
              }
            }
          }
          if (consecutive){
            for (let k = staff.notes[j].begin+staff.notes[j].duration; k <= staff.notes[i].begin; k++){
              if (staff.grace[k]){
                consecutive = false;
                break;
              }
            }
          }
        }

        if (own.tuplet && other.tuplet && own.tuplet.id == other.tuplet.id){
          // console.log(j,i);
          calc_consecutive();
          if (consecutive){
            beam = notes_beam[j];
            linked = true;
            break;
          }

        }else if (own.tuplet || other.tuplet){
          continue;

        }else{

          calc_consecutive();
          let same_stem_dir = (stem_dir == staff.notes[j].stem_dir);
          let same_beat = ~~(other.begin / beat_length) == ~~(own.begin / beat_length);

          if (other_beam != 0 && consecutive && same_stem_dir && same_beat){
            beam = notes_beam[j];
            linked = true;
            break;
          }
        }
      }
      if (!linked){
        beam = beam_cnt;
        beam_cnt ++;
      }
    }
    // if (staff.notes[i].tuplet) console.log(i,beam);
    notes_beam[i] = beam;
  }
  
  for (let i = 0; i < staff.voices; i++){
    beam_info[i] = {};
  }

  for (let b = 1; b < beam_cnt; b++){
    let children : number[] = notes_beam.map((x,i)=>[x,i]).filter(x=>x[0]==b).map(x=>x[1]);
    if (children.length > 1){
      beam_info[staff.notes[children[0]].voice][b] = [];
    }
  }

  for (let i = 0; i < staff.notes.length; i++){
    let on_record = beam_info[staff.notes[i].voice][notes_beam[i]];
    let can_beam = notes_beam[i] > 0;
    if (can_beam && (! on_record)){

    }else if (on_record){
      beam_info[staff.notes[i].voice][notes_beam[i]].push(i);
    }
  }


  for (let a in beam_info){
    for (let b in beam_info[a]){
      staff.beams.push(beam_info[a][b]);
    }
  }
}

