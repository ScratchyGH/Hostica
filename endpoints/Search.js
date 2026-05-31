'use strict';
const Search=(()=>{
let _index=[];

function tokenize(text){
if(!text)return[];
return text
.toLowerCase()
.replace(/[^a-z0-9\s]/g,' ')
.split(/\s+/)
.filter(t=>t.length>1);
}

function score(proj,query){
const tokens=tokenize(query);
if(!tokens.length)return 0;
const name=tokenize(proj.name||'');
const desc=tokenize(proj.description||'');
const owner=tokenize(proj.owner||'');
const tags=tokenize((proj.tags||[]).join(' '));
const langs=tokenize((proj.languages||[]).join(' '));
let s=0;
for(const t of tokens){
for(const n of name){
if(n===t)s+=10;
else if(n.startsWith(t))s+=6;
else if(n.includes(t))s+=3;
}
for(const d of desc){
if(d===t)s+=4;
else if(d.startsWith(t))s+=2;
else if(d.includes(t))s+=1;
}
for(const o of owner){
if(o===t)s+=8;
else if(o.startsWith(t))s+=4;
}
for(const tg of tags){
if(tg===t)s+=7;
else if(tg.startsWith(t))s+=4;
}
for(const l of langs){
if(l===t)s+=5;
}
}
s+=Math.log10(1+(proj.stars||0))*2;
s+=Math.log10(1+(proj.views||0));
const age=(Date.now()-(proj.updatedAt||proj.createdAt||0))/86400000;
if(age<7)s+=5;
else if(age<30)s+=2;
return s;
}

function index(projects){
_index=Array.isArray(projects)?[...projects]:[];
}

function search(query,opts={}){
if(!query||!query.trim())return sort(_index,opts);
const results=_index
.map(p=>({...p,_score:score(p,query)}))
.filter(p=>p._score>0)
.sort((a,b)=>b._score-a._score);
return applyFilters(results,opts);
}

function sort(projects,opts={}){
const list=[...projects];
const by=opts.sortBy||'updated';
if(by==='stars')list.sort((a,b)=>(b.stars||0)-(a.stars||0));
else if(by==='name')list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
else if(by==='created')list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
else list.sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));
return applyFilters(list,opts);
}

function applyFilters(list,opts={}){
let out=list;
if(opts.language)out=out.filter(p=>(p.languages||[]).map(l=>l.toLowerCase()).includes(opts.language.toLowerCase()));
if(opts.owner)out=out.filter(p=>(p.owner||'').toLowerCase()===opts.owner.toLowerCase());
if(opts.tag)out=out.filter(p=>(p.tags||[]).map(t=>t.toLowerCase()).includes(opts.tag.toLowerCase()));
const limit=opts.limit||100;
const offset=opts.offset||0;
return out.slice(offset,offset+limit);
}

function suggest(query,max=5){
if(!query||query.length<2)return[];
const q=query.toLowerCase();
const matches=new Set();
for(const p of _index){
if((p.name||'').toLowerCase().startsWith(q))matches.add(p.name);
if((p.owner||'').toLowerCase().startsWith(q))matches.add(p.owner);
for(const t of(p.tags||[])){if(t.toLowerCase().startsWith(q))matches.add(t);}
}
return[...matches].slice(0,max);
}

return{index,search,sort,suggest,tokenize};
})();