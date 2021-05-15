
let INCLUDE_CH_FONT = true;
let SAMPLE_FILE = 'mozart_turkish_march.txt';
let NO_DEP = true;

const fs = require('fs');
const execSync = require('child_process').execSync;


let files = Array.from(new Set(fs.readdirSync('samples').filter(x=>x.endsWith('.txt'))));
files.sort();
files = Object.fromEntries(files.map(x=>[x,fs.readFileSync('samples/'+x).toString()]));


function include(tag,src){
  if (NO_DEP){
    return `<${tag}>${execSync(`curl ${src}`)}</${tag}>`;
  }else{
    if (tag == 'style'){
      return `<link rel="stylesheet" href="${src}"></link>`;
    }else{
      return `<${tag} src="${src}"></${tag}>`;
    }
   
  }
}

function main(){
  window._G = {
    MIDI_SPD:0.008,
    OUT_FUNC:legumes.export_svg,
  }

  // JSON.stringify(Object.fromEntries(Object.entries(x).map(a=>[a[1],(a[0].split('_')[0]+Number(a[0].split('_')[1]-1)).replace('s','#')]).filter(a=>!a[1].includes('-'))))
  let name_midi_key = 
  // {"0":"C0","1":"Db0","2":"D0","3":"Eb0","4":"E0","5":"F0","6":"Gb0","7":"G0","8":"G#0","9":"A0","10":"Bb0","11":"B0","12":"C1","13":"Db1","14":"D1","15":"Eb1","16":"E1","17":"F1","18":"Gb1","19":"G1","20":"G#1","21":"A1","22":"Bb1","23":"B1","24":"C2","25":"Db2","26":"D2","27":"D#2","28":"E2","29":"F2","30":"Gb2","31":"G2","32":"G#2","33":"A2","34":"Bb2","35":"B2","36":"C3","37":"Db3","38":"D3","39":"D#3","40":"E3","41":"F3","42":"Gb3","43":"G3","44":"G#3","45":"A3","46":"Bb3","47":"B3","48":"C4","49":"Db4","50":"D4","51":"Eb4","52":"E4","53":"F4","54":"Gb4","55":"G4","56":"G#4","57":"A4","58":"Bb4","59":"B4","60":"C5","61":"Db5","62":"D5","63":"Eb5","64":"E5","65":"F5","66":"Gb5","67":"G5","68":"G#5","69":"A5","70":"Bb5","71":"B5","72":"C6","73":"Db6","74":"D6","75":"Eb6","76":"E6","77":"F6","78":"F#6","79":"G6","80":"G#6","81":"A6","82":"Bb6","83":"B6","84":"C7","85":"Db7","86":"D7","87":"Eb7","88":"E7","89":"F7","90":"Gb7","91":"G7","92":"G#7","93":"A7","94":"Bb7","95":"B7","96":"C8","97":"Db8","98":"D8","99":"Eb8","100":"E8","101":"F8","102":"Gb8","103":"G8","104":"G#8","105":"A8","106":"Bb8","107":"B8","108":"C9","109":"Db9","110":"D9","111":"Eb9","112":"E9","113":"F9","114":"Gb9","115":"G9","116":"G#9","117":"A9","118":"Bb9","119":"B9","120":"C10","122":"D10","124":"E10","125":"F10","127":"G10"}
  {"12":"C0","13":"Db0","14":"D0","15":"Eb0","16":"E0","17":"F0","18":"Gb0","19":"G0","20":"G#0","21":"A0","22":"Bb0","23":"B0","24":"C1","25":"Db1","26":"D1","27":"D#1","28":"E1","29":"F1","30":"Gb1","31":"G1","32":"G#1","33":"A1","34":"Bb1","35":"B1","36":"C2","37":"Db2","38":"D2","39":"D#2","40":"E2","41":"F2","42":"Gb2","43":"G2","44":"G#2","45":"A2","46":"Bb2","47":"B2","48":"C3","49":"Db3","50":"D3","51":"Eb3","52":"E3","53":"F3","54":"Gb3","55":"G3","56":"G#3","57":"A3","58":"Bb3","59":"B3","60":"C4","61":"Db4","62":"D4","63":"Eb4","64":"E4","65":"F4","66":"Gb4","67":"G4","68":"G#4","69":"A4","70":"Bb4","71":"B4","72":"C5","73":"Db5","74":"D5","75":"Eb5","76":"E5","77":"F5","78":"F#5","79":"G5","80":"G#5","81":"A5","82":"Bb5","83":"B5","84":"C6","85":"Db6","86":"D6","87":"Eb6","88":"E6","89":"F6","90":"Gb6","91":"G6","92":"G#6","93":"A6","94":"Bb6","95":"B6","96":"C7","97":"Db7","98":"D7","99":"Eb7","100":"E7","101":"F7","102":"Gb7","103":"G7","104":"G#7","105":"A7","106":"Bb7","107":"B7","108":"C8","109":"Db8","110":"D8","111":"Eb8","112":"E8","113":"F8","114":"Gb8","115":"G8","116":"G#8","117":"A8","118":"Bb8","119":"B8","120":"C9","122":"D9","124":"E9","125":"F9","127":"G9"}
  // {"0":"C0","1":"Db0","2":"D0","3":"Eb0","4":"E0","5":"F0","6":"Gb0","7":"G0","8":"G#0","9":"A0","10":"Bb0","11":"B0","12":"C1","13":"Db1","14":"D1","15":"Eb1","16":"E1","17":"F1","18":"Gb1","19":"G1","20":"G#1","21":"A1","22":"Bb1","23":"B1","24":"C2","25":"Db2","26":"D2","27":"D#2","28":"E2","29":"F2","30":"Gb2","31":"G2","32":"G#2","33":"A2","34":"Bb2","35":"B2","36":"C3","37":"Db3","38":"D3","39":"D#3","40":"E3","41":"F3","42":"Gb3","43":"G3","44":"G#3","45":"A3","46":"Bb3","47":"B3","48":"C4","49":"Db4","50":"D4","51":"Eb4","52":"E4","53":"F4","54":"Gb4","55":"G4","56":"G#4","57":"A4","58":"Bb4","59":"B4","60":"C5","61":"Db5","62":"D5","63":"Eb5","64":"E5","65":"F5","66":"Gb5","67":"G5","68":"G#5","69":"A5","70":"Bb5","71":"B5","72":"C6","73":"Db6","74":"D6","75":"Eb6","76":"E6","77":"F6","78":"F#6","79":"G6","80":"G#6","81":"A6","82":"Bb6","83":"B6","84":"C7","85":"Db7","86":"D7","87":"Eb7","88":"E7","89":"F7","90":"Gb7","91":"G7","92":"G#7","93":"A7","94":"Bb7","95":"B7","96":"C8","97":"Db8","98":"D8","99":"Eb8","100":"E8","101":"F8","102":"Gb8","103":"G8","104":"G#8","105":"A8","106":"Bb8","107":"B8","108":"C9","109":"Db9","110":"D9","111":"Eb9","112":"E9","113":"F9","114":"Gb9","115":"G9","116":"G#9","117":"A9","118":"Bb9","119":"B9","120":"C10","122":"D10","124":"E10","125":"F10","127":"G10"};
  CodeMirror.defineSimpleMode("leg", {
    meta:{
      blockCommentStart:';',
      blockCommentEnd:';',
    },
    start: [
      {regex: /'(?:[^\\]|\\.)*?(?:'|$)/mi, token: "string"},
      {regex: /(?:note|rest|cresc|slur|tie|title|composer|instruments|tempo)\b/,
       token: "keyword"},
      {regex: /(?:(A|B|C|D|E|F|G)\d+)\b/,
       token: "def"},
      {regex: /(?:measure|staff|tuplet|chord|grace|voice)\b/,
       indent: true,
       token: "type"},
      {regex: /(?:end)\b/,
        dedent:true,
        token: "type"},
      {regex: /(?:\$([^ \n\r\t]+))/, token: "atom"},
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
       token: "number"},
      {regex: /(?:(b+)|(#+))/, token: "variable-2"},
      {regex: /;.*;/, token: "comment"},
    ],
  });

  function betterTab(cm) {
    if (cm.somethingSelected()) {
      cm.indentSelection("add");
    } else {
      cm.replaceSelection(cm.getOption("indentWithTabs")? "\t":
        Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
    }
  }

  var CM = CodeMirror(document.getElementById("code"), {
    lineNumbers:true,
    matchBrackets: true,
    theme:"solarized light",
    mode:  "leg",
    indentWithTabs: false,
    indentUnit: 2,
    extraKeys:{
      'Ctrl-/': 'toggleComment',
      'Cmd-/': 'toggleComment',
      Tab: betterTab,
    }

  });
  window.CM = CM;

  CM.setSize(null,null);

  window.uploadFile = function(type,callback){
    let fu = document.createElement('input');
    fu.type = "file";
    fu.click();
    fu.addEventListener("change",function(){
      var file = this.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function (evt) {
          callback(evt.target.result);
        };
        reader['readAs'+type](file);
      }
    },false);
  }

  window.downloadPlain = function(filename,content){
    var bl = new Blob([content], {type: "text/plain"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = filename;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  window.downloadBin = function(filename,content){
    var bl = new Blob([new Uint8Array(content)], {type: "application/octet-stream"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = filename;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  let menu = document.createElement('div');
  menu.style = `z-index:1000;position:fixed;left:245px;top:0px;width:calc(70% - 245px);height:20px;background:black;`;
  document.body.appendChild(menu)
  menu.innerHTML = menu2html({
    'ℹ':{
      'About legumes':()=>alert(versionInfo),
      'Github':()=>{
        window.open("https://github.com/LingDong-/legumes", "_blank");
      },
      'Syntax Manual':()=>{
        window.open("https://github.com/LingDong-/legumes/blob/main/SYNTAX.md", "_blank");
      },
    },
    'File':{
      'Import TXT':()=>{
        uploadFile('Text',function(txt){
          CM.setValue(txt);
          document.getElementById('compile').click();
        })
      },
      'Import MIDI':()=>{
        uploadFile('ArrayBuffer',function(bytes){
          let bytes_in = Array.from(new Uint8Array(bytes));
          let midi_file = legumes.parse_midi(bytes_in);
          let score = legumes.score_from_midi(midi_file);
          legumes.compile_score(score);
          const txto = legumes.export_txt(score);
          CM.setValue(txto);
          document.getElementById('compile').click();
        });
      },
      '---':null,
      'Export SVG':()=>{
        downloadPlain('score.svg',document.getElementById('out').innerHTML);
      },
      'Export PDF':()=>{
        let score = legumes.parse_txt(CM.getValue());
        legumes.compile_score(score);
        window.score = score;
        let drawing = legumes.render_score(score);
        let pdf = legumes.export_pdf(drawing);
        downloadPlain('score.pdf',pdf);
      },
      'Export MIDI':()=>{
        let score = legumes.parse_txt(CM.getValue());
        let midi_file = legumes.score_to_midi(score);
        let bytes = legumes.export_midi(midi_file);
        downloadBin("score.mid",bytes);
      },
    },
    'Samples':(function(){
      let o = {};
      for (let k in sampleFiles){
        let s = `sampleFiles['${k}']`;
        o[k] = eval(`()=>CM.setValue(${s})+document.getElementById('compile').click();`);
      }
      return o;
    })(),
    'Compile':{
      'Plain':()=>{
        _G.OUT_FUNC = legumes.export_svg;
        document.getElementById('compile').click();
      },
      'Animated':()=>{
        _G.OUT_FUNC = legumes.export_animated_svg;
        document.getElementById('compile').click();
      },
      'Hand-drawn':()=>{
        _G.OUT_FUNC = legumes.export_sketch_svg;
        document.getElementById('compile').click();
      },
      '---':null,
      'Configure...':()=>{
        gui.open();
      }
    },
    'Playback':{
      'Play':()=>{
        document.getElementById('midiplay').click();
      },
      'Abort':()=>{
        window.abortPlay();
      },
      '---':null,
      'Decrease Speed':()=>{_G.MIDI_SPD*=1.125},
      'Increase Speed':()=>{_G.MIDI_SPD*=0.8},
    },
    'Source Code':{
      'Github':()=>{
        window.open("https://github.com/LingDong-/legumes", "_blank");
      },
      'Download':()=>{
        window.open("https://github.com/LingDong-/legumes/blob/main/dist/legumes.js", "_blank");
      },
    },
    'Help':{
      'Overview':()=>{
        window.open("https://github.com/LingDong-/legumes", "_blank");
      },
      'Syntax Manual':()=>{
        window.open("https://github.com/LingDong-/legumes/blob/main/SYNTAX.md", "_blank");
      },
      'Report an Issue':()=>{
        window.open("https://github.com/LingDong-/legumes/issues", "_blank");
      }
    }
  }) 
  // + `<div style="z-index:-1;position:absolute;right:20px;top:0px;color:gray;font-style:italic">legumes: sheet music → polylines</div>`;

  legumes.CONFIG.JUSTIFY_ALIGN_MIN = 0.6;

  document.getElementById('compile').onclick = function(){
    legumes.CONFIG.PAGE_WIDTH = window.innerWidth*0.7-20;
    legumes.CONFIG.INTER_NOTE_WIDTH = 0;

    let score = legumes.parse_txt(CM.getValue());
    legumes.compile_score(score);
    window.score = score;
    let drawing = legumes.render_score(score);

    legumes.round_polylines(drawing.polylines,2);

    let svg = _G.OUT_FUNC(drawing,{background:null});
    // let svg = legumes.export_sketch_svg(drawing,{background:null});
    document.getElementById('out').innerHTML = svg;
  }

  window.timeouts = [];

  window.rec_setTimeout = function(fn,t){
    let id = setTimeout(fn,t);
    window.timeouts.push(id);
  }

  window.abortPlay = function(){
    if (!window.synths) return;
    for (let k in window.synths){
      window.synths[k].volume.value = 0;
      window.synths[k].disconnect();
      window.synths[k].dispose();
    }
    for (let i = 0; i < window.timeouts.length; i++){
      clearTimeout(window.timeouts[i]);
    }
    window.timeouts = [];
  }

  document.getElementById('midiplay').onclick = function(){
    document.getElementById('compile').click();

    window.synths = {};
    let offset = 1;
    var now = Tone.now()+offset;
    let spd = _G.MIDI_SPD;

    let score = legumes.parse_txt(CM.getValue());
    legumes.compile_score(score);
    let midi_file = legumes.score_to_midi(score);

    let cont = document.getElementById("out");
    let elt = document.getElementById('playhead')
    elt.style.position="absolute";
    elt.style.zIndex="10000";

    let TT = 0;
    let epsilon = 0;
    let d_epsilon = 0.00001; //"Start time must be strictly greater than previous start time", WTF?
    for (let i = 0; i < midi_file.tracks.length; i++){
      let T = 0;
      for (let j = 0; j < midi_file.tracks[i].events.length; j++){
        let e = midi_file.tracks[i].events[j]
        T += e.delta_time;

        // let mul64 = T/(midi_file.ticks_per_quarter_note/16);
        // let [x0,y0,_,y1] = legumes.playhead_coords(score, mul64);
       
        // setTimeout(function(){
        //   elt.style.left =   (x0-cont.scrollLeft)+'px';
        //   elt.style.top  = (y0+20-cont.scrollTop)+'px';
        //   elt.style.height = (y1-y0)+'px';
        // },1000*(offset+T*spd));

        let id = `${i}-${e.data.key}`;
        if (e.type == 'NOTE_ON'){
          if (!synths[id]){
            synths[id] = new Tone.Synth().toDestination();
            synths[id].volume.value = (64-e.data.key)/3;//what's the right formula??
          }
          synths[id].triggerAttack(name_midi_key[e.data.key],now+T*spd+(epsilon+=d_epsilon));
        }else if (e.type == 'NOTE_OFF'){
          synths[id].triggerRelease(now+T*spd+(epsilon+=d_epsilon));
        }
      }
      TT = Math.max(T,TT);
    }
    for (let i = 0; i < TT; i++){
      let mul64 = i/(midi_file.ticks_per_quarter_note/16);
      let [x0,y0,_,y1] = legumes.playhead_coords(score, mul64);
      rec_setTimeout(function(){
        elt.style.left =   (x0-cont.scrollLeft)+'px';
        elt.style.top  = (y0+20-cont.scrollTop)+'px';
        elt.style.height = (y1-y0)+'px';
      },1000*(offset+i*spd));
    }
    rec_setTimeout(function(){
      elt.style.left = '0px';
      elt.style.top = '0px';
      elt.style.height = '0px';
    },1000*(offset+(TT+1)*spd));
  }

  window.gui = new dat.GUI({hideable:false});
  gui.remember(legumes.CONFIG);

  gui.domElement.style.marginRight="calc(100% - 245px)";
  let keys = Object.keys(legumes.CONFIG).sort();
  for (let k of keys){
    // console.log(k);
    gui.add(legumes.CONFIG, k);
  }
  gui.close();
}


var html = `
<meta charset="utf-8"/>
${include('style',"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/codemirror.min.css")}
${include('style',"https://codemirror.net/theme/solarized.css")}
<style>
.cm-s-solarized.CodeMirror {
  box-shadow: none; /* ugly as fuck */
}
</style>
${include('script',"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/codemirror.min.js")}
${include('script',"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/mode/simple.min.js")}
${include('script',"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/search/search.min.js")}
${include('script',"https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.min.js")}
${include('script',"https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.17/Tone.js")}
${include('script',"https://menu2html.glitch.me/menu2html.js")}
<script >
!function(){"use strict";var e={},n=/[^\s\u00a0]/,t=CodeMirror.Pos;function i(e){var t=e.search(n);return-1==t?0:t}CodeMirror.commands.toggleComment=function(e){var n=e.getCursor("start"),t=e.getCursor("end");e.uncomment(n,t)||e.lineComment(n,t)},CodeMirror.defineExtension("lineComment",function(o,l,r){r||(r=e);var a=this,m=CodeMirror.innerMode(a.getMode(),a.getTokenAt(o).state).mode,c=r.lineComment||m.lineComment;if(c){var g=a.getLine(o.line);if(null!=g){var d=Math.min(0!=l.ch||l.line==o.line?l.line+1:l.line,a.lastLine()+1),s=null==r.padding?" ":r.padding,f=r.commentBlankLines;a.operation(function(){if(r.indent)for(var e=g.slice(0,i(g)),l=o.line;l<d;++l){var m=a.getLine(l),C=e.length;(f||n.test(m))&&(m.slice(0,C)!=e&&(C=i(m)),a.replaceRange(e+c+s,t(l,0),t(l,C)))}else for(l=o.line;l<d;++l)(f||n.test(a.getLine(l)))&&a.replaceRange(c+s,t(l,0))})}}else(r.blockCommentStart||m.blockCommentStart)&&(r.fullLines=!0,a.blockComment(o,l,r))}),CodeMirror.defineExtension("blockComment",function(i,o,l){l||(l=e);var r=this,a=CodeMirror.innerMode(r.getMode(),r.getTokenAt(i).state).mode,m=l.blockCommentStart||a.blockCommentStart,c=l.blockCommentEnd||a.blockCommentEnd;if(m&&c){var g=Math.min(o.line,r.lastLine());g!=i.line&&0==o.ch&&n.test(r.getLine(g))&&--g;var d=null==l.padding?" ":l.padding;i.line>g||r.operation(function(){if(0!=l.fullLines){var e=n.test(r.getLine(g));r.replaceRange(d+c,t(g)),r.replaceRange(m+d,t(i.line,0));var s=l.blockCommentLead||a.blockCommentLead;if(null!=s)for(var f=i.line+1;f<=g;++f)(f!=g||e)&&r.replaceRange(s+d,t(f,0))}else r.replaceRange(c,o),r.replaceRange(m,i)})}else(l.lineComment||a.lineComment)&&0!=l.fullLines&&r.lineComment(i,o,l)}),CodeMirror.defineExtension("uncomment",function(i,o,l){l||(l=e);var r=this,a=CodeMirror.innerMode(r.getMode(),r.getTokenAt(i).state).mode,m=Math.min(o.line,r.lastLine()),c=Math.min(i.line,m),g=l.lineComment||a.lineComment,d=[],s=null==l.padding?" ":l.padding;e:for(;g;){for(var f=c;f<=m;++f){var C=r.getLine(f),u=C.indexOf(g);if(-1==u&&(f!=m||f==c)&&n.test(C))break e;if(f!=c&&u>-1&&n.test(C.slice(0,u)))break e;d.push(C)}return r.operation(function(){for(var e=c;e<=m;++e){var n=d[e-c],i=n.indexOf(g),o=i+g.length;i<0||(n.slice(o,o+s.length)==s&&(o+=s.length),r.replaceRange("",t(e,i),t(e,o)))}}),!0}var v=l.blockCommentStart||a.blockCommentStart,h=l.blockCommentEnd||a.blockCommentEnd;if(!v||!h)return!1;var k=l.blockCommentLead||a.blockCommentLead,p=r.getLine(c),L=m==c?p:r.getLine(m),b=p.indexOf(v),M=L.lastIndexOf(h);return-1==M&&c!=m&&(L=r.getLine(--m),M=L.lastIndexOf(h)),-1!=b&&-1!=M&&(r.operation(function(){r.replaceRange("",t(m,M-(s&&L.slice(M-s.length,M)==s?s.length:0)),t(m,M+h.length));var e=b+v.length;if(s&&p.slice(e,e+s.length)==s&&(e+=s.length),r.replaceRange("",t(c,b),t(c,e)),k)for(var i=c+1;i<=m;++i){var o=r.getLine(i),l=o.indexOf(k);if(-1!=l&&!n.test(o.slice(0,l))){var a=l+k.length;s&&o.slice(a,a+s.length)==s&&(a+=s.length),r.replaceRange("",t(i,l),t(i,a))}}}),!0)})}();
</script>
<script>${fs.readFileSync("dist/legumes.js")}</script>
<style>.CodeMirror { height: 100%; }</style>

<style>
.dg .c{
  position:relative;
  left:0%;
  width:30%;
}
.dg .property-name{
  width:70%;
}
</style>


<body style="background:floralwhite;overflow:hidden">

<div id="playhead" style="z-index:10000,position:absolute;left:0px;top:0px;width:2px;height:0px;background:red"></div>

<div id="out" style="position:absolute;left:0px;top:20px;width:70%;height:calc(100% - 20px);overflow:scroll"></div>

<div id="code" style="position:absolute;left:70%;top:0px;width:30%;height:calc(100% - 0px)">
</div>

<button id="compile" style="position:absolute;left:calc(70% - 60px);top:30px;width:50px;height:50px;font-size:32px;text-align:center">🔨</button>

<button id="midiplay" style="position:absolute;left:calc(70% - 60px);top:90px;width:50px;height:50px;font-size:32px;text-align:center">🔊</button>


</body>

<script>
var sampleFiles=${JSON.stringify(files)};
var versionInfo = "legumes: sheet music → polylines.\\nIDE built ${new Date().toISOString().split('T')[0]}";
</script>


<script>
  ${main.toString()};
  main();
</script>

<script>
${
(files[SAMPLE_FILE])?
`CM.setValue(sampleFiles["${SAMPLE_FILE}"]);`
:`CM.setValue(\`${fs.readFileSync(SAMPLE_FILE).toString().replace(/\\/g,'\\\\')}\`);`}
document.getElementById('compile').click();
</script>



<script async>{
  ${INCLUDE_CH_FONT?`
    let font = ${fs.readFileSync('tools/chinese.hf.json').toString()};
    
    legumes.register_font(font.cmap,font.data,font.scale);
  `:''}
}</script>

`;


fs.writeFileSync("site/index.html",html);