const fs = require('fs');
const legumes = require('../dist/legumes')
let md = fs.readFileSync("API.md").toString();

let before = md.split("## Variables")[0] + "## Variables";
let after = "## Functions" + md.split("## Functions")[1];
let items = md.split("## Variables")[1].split("## Functions")[0].split('___');
for (let i = 0; i < items.length; i++){
  let name = items[i].split('###')[1].split('\n')[0].replace(/\\/g,'');
  let val = eval(`legumes.${name}`);
  let o = '';
  if (typeof val =='object' && !Array.isArray(val)){
    o += '| Key | Value |\n';
    o += '|-----|-------|\n';
    for (let k in val){
      o += `| ${k} | ${JSON.stringify(val[k])} |\n`
    }
  }else{
    o += JSON.stringify(val[k])
  }
  items[i]+=o;
}

let md2 = before + items.join('___') + after;
md = md.replace(/# legumes/g,'# legumes API');
md2 = md2.replace(/__namedParameters/g,'params');

fs.writeFileSync('API.md',md2);