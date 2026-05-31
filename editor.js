'use strict';
const Editor=(() => {
let cm=null,proj=null,file=null,saveTimer=null,undos=[],redos=[],lastSaved='',onSave=null,ready=false,savedSettings={};
function init(onSaveCb){
onSave=onSaveCb;
if(ready)return;
ready=true; 
cm=CodeMirror(document.getElementById('cm-wrapper'),{
mode:'htmlmixed',theme:'material-darker',lineNumbers:true,lineWrapping:false,
autoCloseTags:true,matchBrackets:true,tabSize:2,indentWithTabs:false,
extraKeys:{'Ctrl-Z':()=>undo(),'Ctrl-Y':()=>redo(),'Cmd-Z':()=>undo(),'Cmd-Shift-Z':()=>redo(),
'Ctrl-S':(c)=>{save();return false;},'Cmd-S':(c)=>{save();return false;}}
});
cm.on('change',(c,ch)=>{
if(ch.origin==='setValue')return;
pushUndo(c.getValue());schedule();badge('saving');
});
document.getElementById('btn-undo').addEventListener('click',undo);
document.getElementById('btn-redo').addEventListener('click',redo);
}
function load(p,f){
proj=p;file=f;undos=[];redos=[];lastSaved=f.content||'';
cm.setOption('mode',modeFor(f.name));
cm.setValue(f.content||'');
cm.clearHistory();
if(Object.keys(savedSettings).length)apply(savedSettings);
cm.focus();badge('saved');
document.getElementById('editor-project-name').textContent=p.name;
document.getElementById('editor-file-name').textContent=f.name;
}
function modeFor(n){
const ext=n.split('.').pop().toLowerCase();
const map={
html:'htmlmixed',htm:'htmlmixed',
css:'css',scss:'text/x-scss',less:'text/x-less',
js:'javascript',mjs:'javascript',cjs:'javascript',
ts:'text/typescript',tsx:'text/typescript',jsx:'text/jsx',
json:{name:'javascript',json:true},
xml:'xml',svg:'xml',
md:'markdown',markdown:'markdown',
py:'python',
sql:'text/x-sql',
lua:'text/x-lua',
rb:'ruby',
php:'application/x-httpd-php',
rs:'rust',
go:'go',
java:'text/x-java',
cpp:'text/x-c++src',cc:'text/x-c++src',cxx:'text/x-c++src',
c:'text/x-csrc',h:'text/x-csrc',
coffee:'coffeescript',
svelte:'htmlmixed',
sh:'shell',bash:'shell',
yaml:'yaml',yml:'yaml',
toml:'toml',
kt:'text/x-kotlin',
swift:'swift',
r:'r',
};
return map[ext]||'htmlmixed';
}
function pushUndo(v){
if(undos.length&&undos[undos.length-1]===v)return;
undos.push(v);if(undos.length>200)undos.shift();redos=[];
}
function undo(){
if(undos.length<2)return;
const cur=undos.pop();redos.push(cur);
set(undos[undos.length-1]);schedule();
}
function redo(){
if(!redos.length)return;
const n=redos.pop();undos.push(n);set(n);schedule();
}
function set(v){const c=cm.getCursor();cm.setValue(v);cm.setCursor(c);}
function schedule(){clearTimeout(saveTimer);saveTimer=setTimeout(save,1200);}
async function save(){
if(!proj||!file)return;
const v=cm.getValue();
if(v===lastSaved){badge('saved');return;}
lastSaved=v;file.content=v;file.updatedAt=Date.now();
await onSave(proj,file);badge('saved');
}
function badge(s){
const b=document.getElementById('autosave-badge');
b.className='badge';
if(s==='saved'){b.classList.add('badge-saved');b.textContent='Saved';}
else{b.classList.add('badge-saving');b.textContent='Saving…';}
}
function apply(s){
if(!cm)return;
Object.assign(savedSettings,s);
if(s.editorFontSize){
const el=cm.getWrapperElement();
el.style.fontSize=s.editorFontSize+'px';
el.style.lineHeight='normal';
}
if(s.editorTheme)cm.setOption('theme',s.editorTheme);
cm.refresh();
}
function val(){return cm?cm.getValue():'';}
function getFile(){return file;}
function getProj(){return proj;}
return{init,load,save,apply,val,getFile,getProj};
})();
