'use strict';
const Anticurse=(()=>{
const BASE=[
'fuck','shit','ass','bitch','cunt','dick','cock','pussy','whore','slut',
'bastard','crap','piss','fag','faggot','nigger','nigga','nigger','niger',
'retard','spic','chink','kike','twat','wanker','bollocks','arse','bugger',
'prick','tosser','bellend','knob','minge','slag','rape','pedophile','nonce',
'cum','jizz','dildo','blowjob','handjob','tranny','chode','taint','rimjob'
];

const LEETMAP={
'0':'o','1':'i','2':'z','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g',
'@':'a','$':'s','!':'i','+':'t','(':'c',')':'o','[':'c',']':'o',
'ph':'f','ck':'k','qu':'kw','x':'ks'
};

const UNICODE_RANGES=[
[0x1F600,0x1F64F],[0x1F300,0x1F5FF],[0x1F680,0x1F6FF],
[0x2600,0x26FF],[0x2700,0x27BF],[0xFE00,0xFE0F]
];

function stripUnicode(str){
let out='';
for(let i=0;i<str.length;i++){
const code=str.codePointAt(i);
let blocked=false;
for(const[lo,hi]of UNICODE_RANGES){if(code>=lo&&code<=hi){blocked=true;break;}}
if(!blocked)out+=str[i];
if(code>0xFFFF)i++;
}
return out;
}

function normalize(str){
if(!str)return'';
let s=str.toLowerCase();
s=stripUnicode(s);
s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
for(const[from,to]of Object.entries(LEETMAP)){
s=s.split(from).join(to);
}
s=s.replace(/(.)\1{2,}/g,'$1$1');
s=s.replace(/[^a-z]/g,'');
return s;
}

function normalizeKeepSpaces(str){
if(!str)return'';
let s=str.toLowerCase();
s=stripUnicode(s);
s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
for(const[from,to]of Object.entries(LEETMAP)){
s=s.split(from).join(to);
}
s=s.replace(/(.)\1{2,}/g,'$1$1');
s=s.replace(/[^a-z\s]/g,'');
return s;
}

function buildPatterns(){
const pats=[];
for(const word of BASE){
const parts=word.split('').map(c=>{
const m={a:'[a@4(]',e:'[e3]',i:'[i1!|]',o:'[o0()]',s:'[s$5]',t:'[t7+]',u:'[uü]',b:'[b8]',f:'[fph]',g:'[g9]',l:'[l1|]',c:'[c(k]',k:'[ck]'};
return m[c]?m[c]:c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
});
const sep='[^a-z0-9]*';
try{pats.push({word,re:new RegExp(parts.join(sep),'gi')});}catch(e){}
}
return pats;
}

const PATTERNS=buildPatterns();

const BYPASS_PATTERNS=[
/f[\W_]*u[\W_]*c[\W_]*k/gi,
/s[\W_]*h[\W_]*i[\W_]*t/gi,
/b[\W_]*i[\W_]*t[\W_]*c[\W_]*h/gi,
/n[\W_]*i[\W_]*g[\W_]*g[\W_]*[ae]/gi,
/c[\W_]*u[\W_]*n[\W_]*t/gi,
/d[\W_]*i[\W_]*c[\W_]*k/gi,
/a[\W_]*s[\W_]*s(?!i|e|o)/gi,
/f[\W_]*a[\W_]*g/gi,
];

const SPACED_WORDS=BASE.map(w=>new RegExp(w.split('').join('[\\s\\-_.]*'),'gi'));

function check(text){
if(!text||typeof text!=='string')return false;
const norm=normalize(text);
for(const w of BASE){
if(norm.includes(w))return true;
}
const ns=normalizeKeepSpaces(text);
for(const w of BASE){
const parts=ns.split(/\s+/);
const joined=parts.join('');
if(joined.includes(w))return true;
}
for(const p of PATTERNS){
p.re.lastIndex=0;
if(p.re.test(text))return true;
}
for(const p of BYPASS_PATTERNS){
p.lastIndex=0;
if(p.test(text))return true;
}
for(const p of SPACED_WORDS){
p.lastIndex=0;
if(p.test(text))return true;
}
const noVowel=text.toLowerCase().replace(/[aeiou]/g,'');
for(const w of BASE){
const wNoVowel=w.replace(/[aeiou]/g,'');
if(wNoVowel.length>2&&noVowel.includes(wNoVowel))return true;
}
return false;
}

function clean(text,replacement='***'){
if(!text||typeof text!=='string')return text;
let out=text;
for(const p of PATTERNS){p.re.lastIndex=0;out=out.replace(p.re,replacement);}
for(const p of BYPASS_PATTERNS){p.lastIndex=0;out=out.replace(p,replacement);}
return out;
}

return{check,clean,checkProjectName:check,checkContent:check,cleanText:clean};
})();