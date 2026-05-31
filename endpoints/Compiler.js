'use strict';
const Compiler=(()=>{
const RUNTIMES={};
const CDNS={
typescript:'https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.js',
babel:'https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.0/babel.min.js',
sass:'https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.js',
less:'https://cdn.jsdelivr.net/npm/less@4.2.0/dist/less.min.js',
coffeescript:'https://cdn.jsdelivr.net/npm/coffeescript@2.7.0/lib/coffeescript-browser-compiler-legacy/coffeescript.js',
marked:'https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js',
svelte:'https://cdn.jsdelivr.net/npm/svelte@4.2.18/compiler.cjs',
fengari:'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js',
pyodide:'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js',
sqljs:'https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/sql-wasm.js',
};

function loadScript(url){
return new Promise((res,rej)=>{
if(document.querySelector(`script[src="${url}"]`)){res();return;}
const s=document.createElement('script');
s.src=url;s.onload=res;s.onerror=()=>rej(new Error('Failed to load: '+url));
document.head.appendChild(s);
});
}

async function ensureRuntime(name){
if(RUNTIMES[name])return RUNTIMES[name];
const url=CDNS[name];
if(!url)throw new Error('No CDN for runtime: '+name);
await loadScript(url);
RUNTIMES[name]=true;
return true;
}

function getMode(filename){
const ext=filename.split('.').pop().toLowerCase();
const map={
ts:'typescript',tsx:'typescript',
jsx:'babel',
scss:'sass',sccs:'sass',
less:'less',
coffee:'coffeescript',
md:'markdown',markdown:'markdown',
svelte:'svelte',
lua:'lua',
py:'python',python:'python',
sql:'sql',
rb:'ruby',
php:'php',
xml:'xml',
json:'json',
html:'html',htm:'html',
css:'css',
js:'javascript',mjs:'javascript',
cpp:'cpp',cc:'cpp',cxx:'cpp',
c:'c',
rs:'rust',
go:'go',
java:'java',
kt:'kotlin',
};
return map[ext]||'text';
}

async function compile(filename,source,outputFiles){
const mode=getMode(filename);
try{
switch(mode){

case'typescript':{
await ensureRuntime('typescript');
const result=window.ts.transpileModule(source,{
compilerOptions:{
target:window.ts.ScriptTarget.ES2020,
module:window.ts.ModuleKind.None,
jsx:filename.endsWith('.tsx')?window.ts.JsxEmit.React:window.ts.JsxEmit.None,
strict:false,esModuleInterop:true
}
});
const outName=filename.replace(/\.tsx?$/,'.js');
outputFiles[outName]=result.outputText;
return{ok:true,output:outName,js:result.outputText};
}

case'babel':{
await ensureRuntime('babel');
const result=window.Babel.transform(source,{
presets:['react','env'],
filename
});
const outName=filename.replace(/\.jsx?$/,'.js');
outputFiles[outName]=result.code;
return{ok:true,output:outName,js:result.code};
}

case'sass':{
await ensureRuntime('sass');
return new Promise(res=>{
window.Sass.compile(source,result=>{
if(result.status===0){
const outName=filename.replace(/\.s[ac]ss$/,'.css');
outputFiles[outName]=result.text;
res({ok:true,output:outName,css:result.text});
}else{
res({ok:false,error:result.formatted});
}
});
});
}

case'less':{
await ensureRuntime('less');
const result=await window.less.render(source);
const outName=filename.replace(/\.less$/,'.css');
outputFiles[outName]=result.css;
return{ok:true,output:outName,css:result.css};
}

case'coffeescript':{
await ensureRuntime('coffeescript');
const js=window.CoffeeScript.compile(source);
const outName=filename.replace(/\.coffee$/,'.js');
outputFiles[outName]=js;
return{ok:true,output:outName,js};
}

case'markdown':{
await ensureRuntime('marked');
const html=window.marked.parse(source);
const wrapped=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow:auto}code{background:#f4f4f4;padding:2px 5px;border-radius:3px}</style></head><body>${html}</body></html>`;
const outName=filename.replace(/\.md$/,'.html');
outputFiles[outName]=wrapped;
return{ok:true,output:outName,html:wrapped};
}

case'svelte':{
await ensureRuntime('svelte');
const result=window.svelte.compile(source,{generate:'dom',format:'iife',name:'App'});
const outName=filename.replace(/\.svelte$/,'.js');
const css=result.css&&result.css.code?result.css.code:'';
if(css){outputFiles[filename.replace(/\.svelte$/,'.css')]=css;}
outputFiles[outName]=result.js.code;
return{ok:true,output:outName,js:result.js.code,css};
}

case'python':{
return{ok:true,runtime:'pyodide',deferred:true,source,filename};
}

case'sql':{
return{ok:true,runtime:'sqljs',deferred:true,source,filename};
}

case'lua':{
return{ok:true,runtime:'fengari',deferred:true,source,filename};
}

case'xml':{
try{
const parser=new DOMParser();
const doc=parser.parseFromString(source,'application/xml');
const err=doc.querySelector('parsererror');
if(err)return{ok:false,error:'XML parse error: '+err.textContent.slice(0,100)};
return{ok:true,output:filename,passthrough:true};
}catch(e){return{ok:false,error:e.message};}
}

case'json':{
try{JSON.parse(source);return{ok:true,output:filename,passthrough:true};}
catch(e){return{ok:false,error:'JSON error: '+e.message};}
}

default:
return{ok:true,output:filename,passthrough:true};
}
}catch(e){
return{ok:false,error:e.message};
}
}

async function runPython(source,outputEl){
if(!window.loadPyodide){
await loadScript(CDNS.pyodide);
}
if(!RUNTIMES.pyodideInstance){
const toast=window.toast;
if(toast)toast('Loading Python runtime…');
RUNTIMES.pyodideInstance=await window.loadPyodide({stdout:t=>{if(outputEl)outputEl.textContent+=t+'\n';},stderr:t=>{if(outputEl)outputEl.textContent+='ERR: '+t+'\n';}});
}
try{
await RUNTIMES.pyodideInstance.runPythonAsync(source);
return{ok:true};
}catch(e){
return{ok:false,error:e.message};
}
}

async function runSQL(source){
if(!window.initSqlJs){await loadScript(CDNS.sqljs);}
const SQL=await window.initSqlJs({locateFile:f=>`https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/${f}`});
const db=new SQL.Database();
const results=[];
try{
const stmts=db.iterateStatements(source);
for(const stmt of stmts){
const cols=stmt.getColumnNames();
const rows=[];
while(stmt.step())rows.push(stmt.getAsObject());
stmt.free();
if(cols.length)results.push({columns:cols,rows});
}
db.close();
return{ok:true,results};
}catch(e){
db.close();
return{ok:false,error:e.message};
}
}

function getSupportedLanguages(){
return[
{ext:'html',label:'HTML',mode:'htmlmixed'},
{ext:'css',label:'CSS',mode:'css'},
{ext:'js',label:'JavaScript',mode:'javascript'},
{ext:'ts',label:'TypeScript',mode:'text/typescript',compile:true},
{ext:'tsx',label:'TypeScript JSX',mode:'text/typescript',compile:true},
{ext:'jsx',label:'JSX/React',mode:'javascript',compile:true},
{ext:'scss',label:'SCSS/Sass',mode:'text/x-scss',compile:true},
{ext:'less',label:'Less CSS',mode:'text/x-less',compile:true},
{ext:'coffee',label:'CoffeeScript',mode:'coffeescript',compile:true},
{ext:'md',label:'Markdown',mode:'markdown',compile:true},
{ext:'svelte',label:'Svelte',mode:'htmlmixed',compile:true},
{ext:'py',label:'Python',mode:'python',runtime:'pyodide'},
{ext:'sql',label:'SQL',mode:'sql',runtime:'sqljs'},
{ext:'lua',label:'Lua',mode:'text/x-lua',runtime:'fengari'},
{ext:'xml',label:'XML',mode:'xml'},
{ext:'json',label:'JSON',mode:'application/json'},
{ext:'rb',label:'Ruby',mode:'ruby',note:'via ruby.wasm'},
{ext:'php',label:'PHP',mode:'text/x-php',note:'via php-wasm'},
{ext:'cpp',label:'C++',mode:'text/x-c++src',note:'via CheerpJ'},
{ext:'c',label:'C',mode:'text/x-csrc',note:'via CheerpJ'},
{ext:'rs',label:'Rust',mode:'rust',note:'compile locally'},
{ext:'go',label:'Go',mode:'go',note:'compile locally'},
{ext:'java',label:'Java',mode:'text/x-java',note:'via CheerpJ'},
];
}

return{compile,runPython,runSQL,getMode,getSupportedLanguages,ensureRuntime,CDNS};
})();