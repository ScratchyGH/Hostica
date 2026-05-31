'use strict';

const MAX_FILE_BYTES=62914560;

const OW=`const CACHE='hostica-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>fetch('/').then(r=>c.put('/',r)).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(CACHE).then(async c=>{const r=await c.match(e.request);if(r)return r;try{const res=await fetch(e.request);if(res.ok)c.put(e.request,res.clone());return res;}catch{return r||new Response('Offline',{status:503});}}));});`;

const SW_TAG=`\n<script>if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./offlineworker.js'));<\/script>`;

const TPLS={
blank:{
'index.html':`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>My Site</title>\n<link rel="stylesheet" href="style.css"/>\n</head>\n<body>\n<h1>Hello world</h1>\n<script src="main.js"><\/script>\n</body>\n</html>`,
'style.css':`body{font-family:system-ui,sans-serif;margin:0;padding:32px;background:#f8fafc;color:#1e293b}\nh1{font-size:2rem}`,
'main.js':`console.log('ready');`
},
basic:{
'index.html':`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>Basic Site</title>\n<link rel="stylesheet" href="style.css"/>\n</head>\n<body>\n<header><nav><div class="logo">MySite</div><ul><li><a href="#">Home</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul></nav></header>\n<main><section class="hero"><h1>Welcome</h1><p>Built with Hostica</p><a href="#" class="btn">Get started</a></section><section class="cards"><div class="card"><h3>Feature</h3><p>Description here.</p></div><div class="card"><h3>Feature</h3><p>Description here.</p></div><div class="card"><h3>Feature</h3><p>Description here.</p></div></section></main>\n<footer><p>&copy; 2025</p></footer>\n<script src="main.js"><\/script>\n</body>\n</html>`,
'style.css':`*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui,sans-serif;color:#1e293b;line-height:1.6}\nnav{display:flex;justify-content:space-between;align-items:center;padding:16px 32px;background:#fff;border-bottom:1px solid #e2e8f0}\nnav ul{list-style:none;display:flex;gap:24px}\nnav a{text-decoration:none;color:#64748b}\n.hero{text-align:center;padding:80px 32px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe)}\n.hero h1{font-size:2.5rem;margin-bottom:12px}\n.hero p{color:#64748b;margin-bottom:24px}\n.btn{display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none}\n.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;padding:48px 32px}\n.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px}\n.card h3{margin-bottom:8px}\n.card p{color:#64748b;font-size:14px}\nfooter{text-align:center;padding:24px;color:#94a3b8;font-size:13px}`,
'main.js':`document.addEventListener('DOMContentLoaded',()=>console.log('loaded'));`
},
landing:{
'index.html':`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>Landing</title>\n<link rel="stylesheet" href="style.css"/>\n</head>\n<body>\n<header><div class="c nav-row"><div class="logo">Brand</div><a href="#" class="btn-nav">Get started</a></div></header>\n<section class="hero"><div class="c"><span class="pill">Now live</span><h1>Build something great</h1><p>Fast, offline-first, and easy to use.</p><div class="btns"><a href="#" class="btn-p">Start free</a><a href="#" class="btn-s">See demo</a></div></div></section>\n<section class="feats"><div class="c"><h2>Why it works</h2><div class="grid"><div class="f"><b>Fast</b><p>Optimized from the start.</p></div><div class="f"><b>Secure</b><p>Your data, your control.</p></div><div class="f"><b>Offline</b><p>Works anywhere.</p></div></div></div></section>\n<script src="main.js"><\/script>\n</body>\n</html>`,
'style.css':`*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui,sans-serif;color:#0f172a}\n.c{max-width:1080px;margin:0 auto;padding:0 24px}\nheader{border-bottom:1px solid #f1f5f9;padding:16px 0}\n.nav-row{display:flex;justify-content:space-between;align-items:center}\n.logo{font-weight:700;font-size:1.2rem}\n.btn-nav{padding:8px 18px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-size:14px}\n.hero{text-align:center;padding:100px 24px 80px;background:radial-gradient(circle at 50% 0%,#ede9fe,#f8fafc 60%)}\n.pill{display:inline-block;padding:4px 12px;background:#ede9fe;color:#7c3aed;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:20px}\n.hero h1{font-size:3rem;font-weight:800;max-width:600px;margin:0 auto 16px;line-height:1.15}\n.hero p{color:#64748b;font-size:1.1rem;max-width:440px;margin:0 auto 32px}\n.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}\n.btn-p{padding:13px 28px;background:#7c3aed;color:#fff;border-radius:10px;text-decoration:none;font-weight:500}\n.btn-s{padding:13px 28px;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:10px;text-decoration:none;font-weight:500}\n.feats{padding:80px 0}\n.feats h2{text-align:center;font-size:2rem;margin-bottom:48px}\n.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px}\n.f{background:#f8fafc;border-radius:16px;padding:28px}\n.f b{display:block;font-size:1.1rem;margin-bottom:8px}\n.f p{color:#64748b;font-size:14px}`,
'main.js':`console.log('landing ready');`
},
portfolio:{
'index.html':`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>Portfolio</title>\n<link rel="stylesheet" href="style.css"/>\n</head>\n<body>\n<aside class="side"><div class="av">JD</div><h1>Jane Doe</h1><p class="role">Developer</p><nav><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></nav></aside>\n<main>\n<section id="about"><h2>About</h2><p>I build fast, clean, accessible web experiences.</p></section>\n<section id="work"><h2>Work</h2><div class="grid"><div class="card"><div class="thumb" style="background:#e0f2fe"></div><h3>Project A</h3><p>Web app</p></div><div class="card"><div class="thumb" style="background:#f0fdf4"></div><h3>Project B</h3><p>Design</p></div><div class="card"><div class="thumb" style="background:#fdf4ff"></div><h3>Project C</h3><p>Mobile</p></div></div></section>\n<section id="contact"><h2>Contact</h2><p>hello@janedoe.com</p></section>\n</main>\n<script src="main.js"><\/script>\n</body>\n</html>`,
'style.css':`*{box-sizing:border-box;margin:0;padding:0}\nbody{display:flex;min-height:100vh;font-family:system-ui,sans-serif;color:#1e293b;background:#f8fafc}\n.side{width:260px;min-height:100vh;background:#fff;border-right:1px solid #f1f5f9;padding:48px 28px;position:sticky;top:0;height:100vh;overflow-y:auto}\n.av{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;margin-bottom:16px}\n.side h1{font-size:1.2rem;font-weight:700}\n.role{color:#64748b;font-size:13px;margin:4px 0 28px}\nnav{display:flex;flex-direction:column;gap:6px}\nnav a{color:#64748b;text-decoration:none;font-size:14px;padding:6px 8px;border-radius:6px}\nnav a:hover{background:#f1f5f9;color:#1e293b}\nmain{flex:1;padding:48px}\nsection{margin-bottom:64px}\nh2{font-size:1.4rem;margin-bottom:16px;font-weight:700}\np{color:#64748b;line-height:1.6}\n.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-top:16px}\n.card{background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden}\n.thumb{height:120px}\n.card h3{font-size:14px;padding:12px 14px 2px;font-weight:600}\n.card p{font-size:12px;color:#94a3b8;padding:0 14px 12px}`,
'main.js':`console.log('portfolio ready');`
}
};

const App=(() => {
let db,projects=[],activeProject=null,activeFile=null,selTpl='blank',confirmCb=null;

async function init(){
await Auth.init();
await registerVirtualServer();
const u=await Auth.restore();
if(u){await boot(u);}else{showAuth('login');}
wireAuth();wireApp();
updateNet();
window.addEventListener('online',updateNet);
window.addEventListener('offline',updateNet);
}

async function registerVirtualServer(){
if(!('serviceWorker'in navigator))return;
try{await navigator.serviceWorker.register('./hostica-sw-server.js',{scope:'./'});await navigator.serviceWorker.ready;}
catch(e){console.warn('SW virtual server unavailable',e);}
}

function updateNet(){
const el=document.getElementById('stat-offline');
el.textContent=navigator.onLine?'Online':'Offline';
el.style.color=navigator.onLine?'var(--success)':'var(--accent)';
}

function wireAuth(){
document.getElementById('go-register').addEventListener('click',e=>{e.preventDefault();showAuth('register');});
document.getElementById('go-login').addEventListener('click',e=>{e.preventDefault();showAuth('login');});
document.getElementById('btn-login').addEventListener('click',doLogin);
document.getElementById('btn-register').addEventListener('click',doRegister);
document.getElementById('btn-enable-2fa').addEventListener('click',doEnable2FA);
document.getElementById('btn-skip-2fa').addEventListener('click',doSkip2FA);
['login-username','login-password','login-totp'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();}));
['reg-username','reg-password','reg-confirm'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')doRegister();}));
}

function showAuth(form){
document.getElementById('auth-login').style.display=form==='login'?'':'none';
document.getElementById('auth-register').style.display=form==='register'?'':'none';
document.getElementById('auth-2fa-setup').style.display=form==='2fa-setup'?'':'none';
}

async function doLogin(){
const u=document.getElementById('login-username').value;
const pw=document.getElementById('login-password').value;
const tok=document.getElementById('login-totp').value;
const err=document.getElementById('login-error');
err.textContent='';
try{const user=await Auth.login(u,pw,tok);await boot(user);}
catch(e){
if(e.message==='2FA_REQUIRED'){document.getElementById('login-2fa-wrap').style.display='';err.textContent='Enter your auth code.';}
else err.textContent=e.message;
}
}

async function doRegister(){
const u=document.getElementById('reg-username').value;
const pw=document.getElementById('reg-password').value;
const c=document.getElementById('reg-confirm').value;
const err=document.getElementById('reg-error');
err.textContent='';
if(pw!==c){err.textContent='Passwords do not match.';return;}
try{
await Auth.register(u,pw);
const{secret,uri}=Auth.gen2FA(u);
document.getElementById('totp-secret-display').value=secret;
try{
const el=document.getElementById('qr-canvas');
el.innerHTML='';
new QRCode(el,{text:uri,width:180,height:180,correctLevel:QRCode.CorrectLevel.M});
}catch(e){}
const btn=document.getElementById('btn-enable-2fa');
btn.dataset.secret=secret;btn.dataset.username=u;btn.dataset.password=pw;
document.getElementById('btn-skip-2fa').dataset.username=u;
document.getElementById('btn-skip-2fa').dataset.password=pw;
showAuth('2fa-setup');
}catch(e){err.textContent=e.message;}
}

async function doEnable2FA(){
const btn=document.getElementById('btn-enable-2fa');
const err=document.getElementById('setup-2fa-error');
err.textContent='';
try{
await Auth.login(btn.dataset.username,btn.dataset.password);
await Auth.enable2FA(btn.dataset.secret,document.getElementById('setup-totp').value);
await boot(Auth.getUser());
toast('2FA on','success');
}catch(e){err.textContent=e.message;}
}

async function doSkip2FA(){
const btn=document.getElementById('btn-skip-2fa');
try{const u=await Auth.login(btn.dataset.username,btn.dataset.password);await boot(u);}
catch(e){document.getElementById('setup-2fa-error').textContent=e.message;}
}

async function boot(user){
db=new Dexie('hostica_'+user.username);
db.version(1).stores({projects:'id,name,updatedAt',files:'[projectId+name],projectId,name,updatedAt'});
db.version(2).stores({projects:'id,name,updatedAt,visibility',files:'[projectId+name],projectId,name,updatedAt'}).upgrade(tx=>{return tx.table('files').toCollection().modify(f=>{if(f.content===undefined)f.content='';});});
Editor.init(saveFile);
if(user.settings)Editor.apply(user.settings);
document.getElementById('user-display-name').textContent=(user.settings&&user.settings.displayName)||user.username;
document.getElementById('user-avatar-text').textContent=user.username[0].toUpperCase();
greet();
document.getElementById('auth-screen').style.display='none';
document.getElementById('app-screen').style.display='flex';
await loadProjects();
showView('dashboard');
showTutorialIfNew();
}

function wireApp(){
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.getElementById('btn-logout').addEventListener('click',()=>confirm('Sign out?','',async()=>{Auth.logout();location.reload();},'Sign out',false));
document.getElementById('btn-settings').addEventListener('click',openSettings);
document.getElementById('btn-save-settings').addEventListener('click',saveSettings);
document.getElementById('btn-toggle-2fa').addEventListener('click',toggle2FA);
document.getElementById('btn-delete-account').addEventListener('click',()=>confirm('Delete account?','This removes all your data permanently.',async()=>{
await db.projects.clear();await db.files.clear();await Auth.deleteAccount();location.reload();
}));
document.getElementById('btn-new-project').addEventListener('click',()=>openModal('modal-new-project'));
document.getElementById('btn-create-project').addEventListener('click',createProject);
document.getElementById('new-project-name').addEventListener('keydown',e=>{if(e.key==='Enter')createProject();});
document.getElementById('template-grid').addEventListener('click',e=>{const it=e.target.closest('.template-item');if(!it)return;document.querySelectorAll('.template-item').forEach(i=>i.classList.remove('selected'));it.classList.add('selected');selTpl=it.dataset.template;});
document.getElementById('btn-import-project').addEventListener('click',()=>document.getElementById('import-file-input').click());
document.getElementById('import-file-input').addEventListener('change',handleImport);
document.getElementById('project-search').addEventListener('input',e=>renderProjects(e.target.value));
document.getElementById('editor-back').addEventListener('click',()=>Editor.save().then(()=>{showView('dashboard');loadProjects();}));
document.getElementById('btn-add-file').addEventListener('click',()=>openModal('modal-add-file'));
document.getElementById('btn-create-file').addEventListener('click',createFile);
document.getElementById('new-file-name').addEventListener('keydown',e=>{if(e.key==='Enter')createFile();});
document.getElementById('btn-preview').addEventListener('click',togglePreview);
document.getElementById('btn-run').addEventListener('click',runCurrentFile);
document.getElementById('btn-close-terminal').addEventListener('click',()=>{document.getElementById('terminal-panel').style.display='none';});
document.getElementById('btn-close-preview').addEventListener('click',()=>document.getElementById('preview-panel').style.display='none');
document.getElementById('btn-play').addEventListener('click',openPlay);
document.getElementById('btn-share').addEventListener('click',openShare);
document.getElementById('btn-export').addEventListener('click',exportProject);
document.getElementById('btn-copy-share').addEventListener('click',()=>{navigator.clipboard.writeText(document.getElementById('share-url').value);toast('Copied');});
document.getElementById('btn-copy-site').addEventListener('click',()=>{navigator.clipboard.writeText(document.getElementById('share-site-url').value);toast('Copied');});
document.getElementById('btn-upload-file').addEventListener('click',()=>document.getElementById('upload-file-input').click());
document.getElementById('upload-file-input').addEventListener('change',handleFileUpload);
document.querySelectorAll('.modal-close,[data-modal]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.modal)closeModal(b.dataset.modal);}));
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeModal(o.id);}));
document.getElementById('confirm-cancel').addEventListener('click',()=>closeModal('modal-confirm'));
document.getElementById('confirm-ok').addEventListener('click',async()=>{closeModal('modal-confirm');if(confirmCb){await confirmCb();confirmCb=null;}});
wireDragDrop();
document.getElementById('btn-import-files')?.addEventListener('click',()=>document.getElementById('import-files-input').click());
document.getElementById('import-files-input')?.addEventListener('change',handleFileUpload);
document.getElementById('nav-profile')?.addEventListener('click',()=>showView('profile'));
wireVisButtons();
wireTutorial();
wireLicenseChooser();
wireRepoView();
}

function showView(name){
document.querySelectorAll('.view').forEach(v=>v.style.display='none');
document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
document.getElementById('view-'+name).style.display='flex';
document.querySelector(`.nav-item[data-view="${name}"]`)?.classList.add('active');
if(name==='dashboard')document.getElementById('nav-editor').style.display='none';
if(name==='profile')loadProfileView();
}

function greet(){
const h=new Date().getHours();
const g=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
const u=Auth.getUser();
document.getElementById('dashboard-greeting').textContent=g+(u?', '+u.username[0].toUpperCase()+u.username.slice(1):'');
}

async function loadProjects(){
const rows=await db.projects.orderBy('updatedAt').reverse().toArray();
projects=rows;
renderProjects();setTimeout(updateStats,0);
}

function renderProjects(q=''){
const grid=document.getElementById('projects-grid');
const empty=document.getElementById('projects-empty');
const filtered=projects.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
if(!filtered.length){grid.innerHTML='';empty.style.display='flex';return;}
empty.style.display='none';
grid.innerHTML=filtered.map(p=>{
const d=new Date(p.updatedAt||p.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const visCls=p.visibility==='private'?'vis-private':p.visibility==='unlisted'?'vis-unlisted':'vis-public';
const visLabel=p.visibility||'public';
return`<div class="project-card" data-id="${p.id}">
<div class="project-thumb"><div class="project-thumb-letter">${p.name[0].toUpperCase()}</div><span class="vis-badge ${visCls} project-vis">${visLabel}</span></div>
<div class="project-body"><div class="project-name">${esc(p.name)}</div><div class="project-meta">${d}</div></div>
<div class="project-footer">
<button class="btn-secondary sm" data-action="view" data-id="${p.id}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>View</button>
<button class="btn-secondary sm" data-action="play" data-id="${p.id}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Play</button>
<button class="btn-secondary sm" data-action="license" data-id="${p.id}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>License</button>
<button class="btn-secondary sm" data-action="share" data-id="${p.id}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share</button>
<button class="btn-secondary sm" data-action="export" data-id="${p.id}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export</button>
<button class="btn-secondary sm" data-action="delete" data-id="${p.id}" style="color:var(--danger)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
</div></div>`;
}).join('');
grid.querySelectorAll('.project-card').forEach(card=>{
card.addEventListener('click',e=>{if(e.target.closest('[data-action]'))return;openProject(card.dataset.id);});
});
grid.querySelectorAll('[data-action="view"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();openRepoView(b.dataset.id);}));
grid.querySelectorAll('[data-action="play"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();getFullProject(b.dataset.id).then(launchPlay);}));
grid.querySelectorAll('[data-action="license"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();getFullProject(b.dataset.id).then(p=>{activeProject=p;openModal('modal-license');});}));
grid.querySelectorAll('[data-action="share"]').forEach(b=>b.addEventListener('click',e=>{
e.stopPropagation();
const proj=projects.find(x=>x.id===b.dataset.id);
if(proj&&proj.visibility==='private'){toast('Private projects cannot be shared','error');return;}
shareById(b.dataset.id);
}));
grid.querySelectorAll('[data-action="export"]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();exportById(b.dataset.id);}));
grid.querySelectorAll('[data-action="delete"]').forEach(b=>b.addEventListener('click',e=>{
e.stopPropagation();
const p=projects.find(x=>x.id===b.dataset.id);
confirm(`Delete "${p?.name}"?`,'This cannot be undone.',async()=>{
await db.files.where('projectId').equals(b.dataset.id).delete();
await db.projects.delete(b.dataset.id);
toast('Deleted');await loadProjects();
});
}));
}

async function updateStats(){
const fc=await db.files.count();
document.getElementById('stat-projects').textContent=projects.length;
document.getElementById('stat-files').textContent=fc;
document.getElementById('stat-size').textContent='...';
db.files.toArray().then(allFiles=>{
const bytes=allFiles.reduce((a,f)=>(a+(f.content||'').length),0);
document.getElementById('stat-size').textContent=fmtBytes(bytes);
}).catch(()=>{});
}
function fmtBytes(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(2)+' MB';}

async function createProject(){
const el=document.getElementById('new-project-name');
const name=el.value.trim();
if(!name){el.focus();return;}
const id='proj_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
const tpl=TPLS[selTpl]||TPLS.blank;
const now=Date.now();
const visibility=document.querySelector('input[name="proj-visibility"]:checked')?.value||'public';
await db.projects.add({id,name,createdAt:now,updatedAt:now,template:selTpl,visibility});
for(const[fname,content]of Object.entries(tpl)){
await db.files.add({projectId:id,name:fname,content:fname==='index.html'?injectSW(content):content,updatedAt:now,locked:false});
}
await db.files.add({projectId:id,name:'offlineworker.js',content:OW,updatedAt:now,locked:true});
closeModal('modal-new-project');el.value='';
toast(`"${name}" created`,'success');
await loadProjects();openProject(id);
}

function injectSW(html){
if(html.includes('serviceWorker'))return html;
return html.replace('</body>',SW_TAG+'\n</body>');
}

async function getFullProject(id){
if(activeProject&&activeProject.id===id){
const allLoaded=Object.values(activeProject.files).every(f=>f._contentLoaded);
if(allLoaded)return activeProject;
const unloaded=Object.values(activeProject.files).filter(f=>!f._contentLoaded);
if(unloaded.length>0){
await Promise.all(unloaded.map(f=>ensureFileContent(f)));
}
return activeProject;
}
const proj=await db.projects.get(id);
const files=await db.files.where('projectId').equals(id).toArray();
return{...proj,files:Object.fromEntries(files.map(f=>[f.name,f]))};
}

async function getProjectMeta(id){
const proj=await db.projects.get(id);
const files=await db.files.where('projectId').equals(id).toArray();
const meta={};
for(const f of files){
meta[f.name]={name:f.name,projectId:f.projectId,locked:f.locked||false,updatedAt:f.updatedAt,_contentLoaded:f.content!==undefined,content:f.content};
}
return{...proj,files:meta};
}

async function ensureFileContent(file){
if(file._contentLoaded||file.content!==undefined)return file;
const rows=await db.files.where('[projectId+name]').equals([file.projectId,file.name]).toArray();
if(rows[0]){
file.content=rows[0].content;
file._contentLoaded=true;
if(activeProject&&activeProject.files[file.name]){
activeProject.files[file.name].content=rows[0].content;
activeProject.files[file.name]._contentLoaded=true;
}
}
return file;
}

async function openProject(id){
const proj=await db.projects.get(id);
if(!proj)return;
const fileRows=await db.files.where('projectId').equals(id).toArray();
const files={};
for(const f of fileRows){
files[f.name]={
name:f.name,
projectId:f.projectId,
locked:f.locked||false,
updatedAt:f.updatedAt,
_contentLoaded:f.content!==undefined&&f.content!==null,
content:f.content
};
}
activeProject={...proj,files};
document.getElementById('nav-editor').style.display='flex';
showView('editor');
renderFileTree();
const first=files['index.html']||Object.values(files).find(f=>!f.locked)||Object.values(files)[0];
if(first)openFile(first);
}

function renderFileTree(){
const tree=document.getElementById('file-tree');
const sorted=Object.values(activeProject.files||{}).sort((a,b)=>{if(a.locked&&!b.locked)return 1;if(!a.locked&&b.locked)return -1;return a.name.localeCompare(b.name);});
tree.innerHTML=sorted.map(f=>`<li data-file="${f.name}"${f.locked?' class="locked"':''}>${fileIcon(f.name)}<span>${esc(f.name)}</span>${f.locked?'':`<button class="file-delete" data-file="${f.name}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`}</li>`).join('');
if(activeFile)tree.querySelectorAll('li').forEach(li=>li.classList.toggle('active',li.dataset.file===activeFile.name));
tree.querySelectorAll('li').forEach(li=>li.addEventListener('click',e=>{if(e.target.closest('.file-delete'))return;const f=activeProject.files[li.dataset.file];if(f)openFile(f);}));
tree.querySelectorAll('.file-delete').forEach(btn=>btn.addEventListener('click',e=>{
e.stopPropagation();const fn=btn.dataset.file;
confirm(`Delete "${fn}"?`,'File will be removed.',async()=>{
await db.files.where('[projectId+name]').equals([activeProject.id,fn]).delete();
delete activeProject.files[fn];renderFileTree();
if(activeFile?.name===fn){const rem=Object.values(activeProject.files).filter(f=>!f.locked);if(rem[0])openFile(rem[0]);else activeFile=null;}
toast(`${fn} deleted`);
});
}));
}

function fileIcon(n){
if(/\.html?$/.test(n))return`<svg class="file-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e77c3e" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
if(/\.css$/.test(n))return`<svg class="file-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>`;
if(/\.js$/.test(n))return`<svg class="file-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
return`<svg class="file-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
}

async function openFile(f){
await ensureFileContent(f);
activeFile=f;
document.querySelectorAll('#file-tree li').forEach(li=>li.classList.toggle('active',li.dataset.file===f.name));
Editor.load(activeProject,f);
if(document.getElementById('preview-panel').style.display!=='none')refreshPreview();
}

async function saveFile(proj,file){
try{
const now=Date.now();
await db.files.where('[projectId+name]').equals([proj.id,file.name]).modify({content:file.content,updatedAt:now});
await db.projects.update(proj.id,{updatedAt:now});
file.updatedAt=now;
file._contentLoaded=true;
if(activeProject)activeProject.files[file.name]=file;
if(document.getElementById('preview-panel').style.display!=='none')refreshPreview();
}catch(e){}
}

async function createFile(){
const el=document.getElementById('new-file-name');
let name=el.value.trim();
if(!name){el.focus();return;}
if(!name.includes('.'))name+='.html';
if(activeProject.files[name]){toast('Already exists','error');return;}
const f={projectId:activeProject.id,name,content:defaultContent(name),updatedAt:Date.now(),locked:false,_contentLoaded:true};
await db.files.add(f);
activeProject.files[name]=f;
el.value='';closeModal('modal-add-file');
renderFileTree();openFile(f);toast(`${name} created`);
}

function defaultContent(n){
if(/\.html?$/.test(n))return`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<title>Page</title>\n</head>\n<body>\n\n</body>\n</html>`;
if(/\.css$/.test(n))return`body{}\n`;
if(/\.js$/.test(n))return``;
return '';
}

function togglePreview(){
const p=document.getElementById('preview-panel');
if(p.style.display==='none'||!p.style.display){p.style.display='flex';refreshPreview();}
else p.style.display='none';
}

async function refreshPreview(){
if(!activeProject)return;
const frame=document.getElementById('preview-frame');
const html=await buildHTMLCompiled(activeProject);
const blob=new Blob([html],{type:'text/html'});
const url=URL.createObjectURL(blob);
frame.src=url;setTimeout(()=>URL.revokeObjectURL(url),3000);
}

function buildHTML(proj){
let html=proj.files['index.html']?.content||'';
const compiled={...Object.fromEntries(Object.entries(proj.files).map(([k,v])=>[k,v.content||'']))};
html=html.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi,(m,href)=>{
const f=proj.files[href];if(!f)return m;
return`<style>${compiled[href]||f.content}</style>`;
});
html=html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi,(m,src)=>{
if(/offlineworker/.test(src))return'';
const f=proj.files[src];if(!f)return m;
return`<script>${compiled[src]||f.content}<\/script>`;
});
return html;
}

async function buildHTMLCompiled(proj){
if(typeof Compiler==='undefined')return buildHTML(proj);
const outputFiles={};
for(const[fn,f]of Object.entries(proj.files||{})){
const mode=Compiler.getMode(fn);
if(['typescript','babel','sass','less','coffeescript','markdown','svelte'].includes(mode)){
const result=await Compiler.compile(fn,f.content||'',outputFiles);
if(result.ok&&!result.deferred&&!result.passthrough){
outputFiles[fn]=result.js||result.css||result.html||f.content;
}
}
}
let html=proj.files['index.html']?.content||'';
const getContent=(fn)=>outputFiles[fn]||outputFiles[fn.replace(/\.[^.]+$/,'.js')]||outputFiles[fn.replace(/\.[^.]+$/,'.css')]||proj.files[fn]?.content||'';
html=html.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi,(m,href)=>`<style>${getContent(href)}</style>`);
html=html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi,(m,src)=>{if(/offlineworker/.test(src))return'';return`<script>${getContent(src)}<\/script>`;});
return html;
}

function openPlay(){if(activeProject)launchPlay(activeProject);}

async function launchPlay(proj){
document.getElementById('play-modal-title').textContent=proj.name;
const frame=document.getElementById('play-frame');
const html=await buildHTMLCompiled(proj);
const blob=new Blob([html],{type:'text/html'});
const url=URL.createObjectURL(blob);
frame.src=url;setTimeout(()=>URL.revokeObjectURL(url),8000);
openModal('modal-play');
}

async function runCurrentFile(){
if(!activeFile||!activeProject)return;
const mode=typeof Compiler!=='undefined'?Compiler.getMode(activeFile.name):'text';
const source=Editor.val();
const term=document.getElementById('terminal-panel');
const out=document.getElementById('terminal-output');
term.style.display='flex';
out.textContent='';
if(mode==='python'){
out.textContent='Loading Python runtime...';
const result=await Compiler.runPython(source,out);
if(!result.ok)out.textContent+='Error: '+result.error;
}else if(mode==='sql'){
out.textContent='Running SQL...';
const result=await Compiler.runSQL(source);
if(result.ok){
result.results.forEach(r=>{
out.textContent+=r.columns.join(' | ')+'\n';
out.textContent+='---'+'\n';
r.rows.forEach(row=>out.textContent+=Object.values(row).join(' | ')+'\n');
out.textContent+='\n';
});
if(!result.results.length)out.textContent='No results.';
}else{out.textContent='Error: '+result.error;}
}else if(mode==='lua'){
out.textContent='Lua runtime not available in run mode. Use Preview to run Lua inline.';
}else{
out.textContent='Compiling...';
const outputFiles={};
const result=await Compiler.compile(activeFile.name,source,outputFiles);
if(result.ok&&result.output&&outputFiles[result.output]!==undefined){
const outName=result.output;
if(activeProject.files[outName]){
await saveFile(activeProject,{...activeProject.files[outName],content:outputFiles[outName],updatedAt:Date.now()});
}else{
const rec={projectId:activeProject.id,name:outName,content:outputFiles[outName],updatedAt:Date.now(),locked:false};
await db.files.add(rec);
activeProject.files[outName]=rec;
}
renderFileTree();
out.textContent='Compiled to: '+outName;
}else if(result.passthrough){
out.textContent='File is valid.';
}else if(!result.ok){
out.textContent='Error: '+result.error;
}else{
out.textContent='No runtime available for this file type.';
}
}
}

async function exportProject(){if(activeProject)await exportById(activeProject.id);}

async function exportById(id){
const proj=await getFullProject(id);
const zip=new JSZip();
const folder=zip.folder(proj.name.replace(/[^a-zA-Z0-9_-]/g,'_'));
for(const f of Object.values(proj.files||{}))folder.file(f.name,f.content||'');
const blob=await zip.generateAsync({type:'blob'});
const a=document.createElement('a');
a.href=URL.createObjectURL(blob);
a.download=proj.name.replace(/[^a-zA-Z0-9_-]/g,'_')+'.zip';
a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
toast(`"${proj.name}" exported`,'success');
}

async function handleImport(e){
const files=Array.from(e.target.files);e.target.value='';
for(const f of files){
if(f.size>MAX_FILE_BYTES){toast(`"${f.name}" exceeds 60 MB`,'error');continue;}
try{if(f.name.endsWith('.zip'))await importZip(f);else if(f.name.endsWith('.html'))await importHTML(f);}
catch(err){toast('Import failed: '+err.message,'error');}
}
}

async function importZip(file){
const zip=await JSZip.loadAsync(file);
const name=file.name.replace(/\.zip$/i,'');
const id='proj_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
const now=Date.now();
await db.projects.add({id,name,createdAt:now,updatedAt:now});
const promises=[];
zip.forEach((path,entry)=>{
if(!entry.dir){const parts=path.split('/');const fn=parts.length>1?parts.slice(1).join('/'):path;if(!fn)return;
promises.push(entry.async('text').then(async c=>{
if(fn==='index.html')c=injectSW(c);
await db.files.add({projectId:id,name:fn,content:c,updatedAt:now,locked:false});
}));}
});
await Promise.all(promises);
const owExists=await db.files.where('[projectId+name]').equals([id,'offlineworker.js']).count();
if(!owExists)await db.files.add({projectId:id,name:'offlineworker.js',content:OW,updatedAt:now,locked:true});
toast(`"${name}" imported`,'success');await loadProjects();
}

async function importHTML(file){
const content=await file.text();
const name=file.name.replace(/\.html$/i,'');
const id='proj_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
const now=Date.now();
await db.projects.add({id,name,createdAt:now,updatedAt:now});
await db.files.add({projectId:id,name:'index.html',content:injectSW(content),updatedAt:now,locked:false});
await db.files.add({projectId:id,name:'offlineworker.js',content:OW,updatedAt:now,locked:true});
toast(`"${name}" imported`,'success');await loadProjects();
}

async function handleFileUpload(e){
const files=Array.from(e.target.files);e.target.value='';
if(!activeProject){toast('Open a project first','error');return;}
await addFilesToProject(files);
}

async function addFilesToProject(files){
if(!activeProject)return;
let added=0;
for(const file of files){
if(file.size>MAX_FILE_BYTES){toast(`"${file.name}" exceeds 60 MB`,'error');continue;}
const text=await readFileAsText(file);
const rec={projectId:activeProject.id,name:file.name,content:text,updatedAt:Date.now(),locked:false,_contentLoaded:true};
const exists=await db.files.where('[projectId+name]').equals([activeProject.id,file.name]).count();
if(exists)await db.files.where('[projectId+name]').equals([activeProject.id,file.name]).modify({content:text,updatedAt:Date.now()});
else await db.files.add(rec);
activeProject.files[file.name]=rec;added++;
}
if(!added)return;
await db.projects.update(activeProject.id,{updatedAt:Date.now()});
renderFileTree();toast(`${added} file${added!==1?'s':''} added`,'success');
}

function readFileAsText(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('Read failed'));r.readAsText(f);});}

function wireDragDrop(){
const panel=document.getElementById('file-panel');
if(!panel)return;
panel.addEventListener('dragover',e=>{e.preventDefault();if(activeProject)panel.classList.add('drop-zone-active');});
panel.addEventListener('dragleave',()=>panel.classList.remove('drop-zone-active'));
panel.addEventListener('drop',async e=>{
e.preventDefault();panel.classList.remove('drop-zone-active');
if(!activeProject){toast('Open a project first','error');return;}
await addFilesToProject(Array.from(e.dataTransfer.files));
});
}

function openSettings(){
const u=Auth.getUser();
document.getElementById('settings-username').value=u.username;
document.getElementById('2fa-status-label').textContent=u.totpEnabled?'On':'Off';
document.getElementById('btn-toggle-2fa').textContent=u.totpEnabled?'Disable':'Enable';
const s=u.settings||{};
document.getElementById('settings-font-size').value=s.editorFontSize||14;
document.getElementById('settings-theme').value=s.editorTheme||'material-darker';
document.getElementById('settings-displayname').value=s.displayName||'';
document.getElementById('settings-bio').value=s.bio||'';
document.getElementById('settings-avatar').value=s.avatar||'';
document.getElementById('settings-banner').value=s.banner||'';
document.getElementById('settings-website').value=s.website||'';
openModal('modal-settings');
}

async function saveSettings(){
const fs=parseInt(document.getElementById('settings-font-size').value);
const th=document.getElementById('settings-theme').value;
const dn=document.getElementById('settings-displayname').value.trim();
const bio=document.getElementById('settings-bio').value.trim();
const avatar=document.getElementById('settings-avatar').value.trim();
const banner=document.getElementById('settings-banner').value.trim();
const website=document.getElementById('settings-website').value.trim();
await Auth.saveSettings({editorFontSize:fs,editorTheme:th,displayName:dn,bio,avatar,banner,website});
Editor.apply({editorFontSize:fs,editorTheme:th});
closeModal('modal-settings');toast('Saved','success');
updateUserChip();
}

function updateUserChip(){
const u=Auth.getUser();
if(!u)return;
const s=u.settings||{};
const avatarEl=document.getElementById('user-avatar-text');
if(s.avatar){
avatarEl.innerHTML='<img src="'+s.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.style.display=\'none\'">';
}else{
avatarEl.textContent=u.username[0].toUpperCase();
}
document.getElementById('user-display-name').textContent=s.displayName||u.username;
}

async function toggle2FA(){
const u=Auth.getUser();
if(u.totpEnabled){
confirm('Disable 2FA?','2FA will be removed.',async()=>{await Auth.disable2FA();toast('2FA off');openSettings();},'Disable',false);
}else{
closeModal('modal-settings');
const{secret,uri}=Auth.gen2FA(u.username);
const code=prompt('Scan QR in your auth app.\n\nSecret: '+secret+'\n\nEnter the 6-digit code:');
if(!code)return;
try{await Auth.enable2FA(secret,code.trim());toast('2FA on','success');}
catch(e){toast(e.message,'error');}
}
}

function openShare(){if(activeProject)shareById(activeProject.id);}

function getGun(){
if(window._hosticaGun)return window._hosticaGun;
try{
if(!window._gunOptSet){
window._gunOptSet=true;
Gun.on('opt',function(ctx){if(ctx.once)return;ctx.opt.localStorage=false;this.to.next(ctx);});
}
window._hosticaGun=Gun({
peers:['wss://relay.peer.ooo/gun'],
localStorage:false,
radisk:false,
store:{put:function(k,v,cb){if(cb)cb();},get:function(k,cb){if(cb)cb(null);}},
multicast:false
});
}catch(e){
window._hosticaGun={get:()=>({get:()=>({put:()=>{},once:()=>{},on:()=>{}})})};
}
return window._hosticaGun;
}

function gunSlug(user,name){
return(user+'-'+name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
}

async function shareById(id){
const user=Auth.getUser();
const proj=await getFullProject(id);
const files={};
for(const[fn,f]of Object.entries(proj.files||{})){
if(!f.locked)files[fn]=f.content||'';
}
const visBtn=document.querySelector('.vis-btn.active');
const visibility=(visBtn&&visBtn.dataset.vis)||proj.visibility||'public';
const description=(document.getElementById('share-description')?.value||proj.description||'').trim();
const tagsRaw=document.getElementById('share-tags')?.value||'';
const tags=tagsRaw.split(',').map(t=>t.trim()).filter(Boolean).slice(0,8);
if(visibility==='private'){
toast('Private projects cannot be shared','error');
closeModal('modal-share');
return;
}
if(typeof Anticurse!=='undefined'){
if(Anticurse.check(proj.name)||Anticurse.check(description)){
toast('Project name or description contains blocked content','error');
closeModal('modal-share');
return;
}
}
const languages=Object.values(proj.files||{}).reduce((acc,f)=>{
const ext=(f.name||'').split('.').pop().toLowerCase();
const map={js:'javascript',ts:'typescript',py:'python',html:'html',css:'css',rs:'rust',cpp:'c++',lua:'lua',rb:'ruby',php:'php',svelte:'svelte',md:'markdown',sql:'sql',go:'go',java:'java',coffee:'coffeescript',less:'less',scss:'scss',xml:'xml',json:'json'};
if(map[ext]&&!acc.includes(map[ext]))acc.push(map[ext]);
return acc;
},[]);
const payload=JSON.stringify({owner:user.username,project:proj.name,files,created:Date.now(),updated:Date.now(),visibility,description,tags,languages,stars:0,views:0});
const slug=gunSlug(user.username,proj.name);
const viewEl=document.getElementById('share-url');
const siteEl=document.getElementById('share-site-url');
viewEl.value='Publishing…';siteEl.value='Publishing…';
document.getElementById('share-proj-name').textContent=proj.name;
document.getElementById('share-proj-author').textContent=user.username;
openModal('modal-share');
try{
const gun=getGun();
await new Promise((resolve,reject)=>{
const timeout=setTimeout(()=>reject(new Error('Timed out — check your connection')),15000);
const gunData={data:payload,owner:user.username,project:proj.name,ts:Date.now()};
gun.get('hostica').get(slug).put(gunData,function(ack){
clearTimeout(timeout);
if(ack.err)reject(new Error(ack.err));
else{
if(visibility==='public'){
gun.get('hostica-community').get(slug).put({data:payload,ts:Date.now()},function(){});
}
resolve();
}
});
});
const base=window.location.origin+window.location.pathname.replace(/[^/]*$/,'');
viewEl.value=base+'view.html?id='+slug;
siteEl.value=base+'site.html?id='+slug;
toast('Published!','success');
}catch(e){
viewEl.value='Failed: '+e.message;
siteEl.value='Failed: '+e.message;
toast('Publish failed: '+e.message,'error');
}
}

function openModal(id){document.getElementById(id).style.display='flex';}
function closeModal(id){document.getElementById(id).style.display='none';}

function confirm(title,msg,cb,okLabel='Delete',isDanger=true){
document.getElementById('confirm-title').textContent=title;
document.getElementById('confirm-message').textContent=msg;
const ok=document.getElementById('confirm-ok');
ok.textContent=okLabel;ok.className=isDanger?'btn-danger':'btn-primary';
confirmCb=cb;openModal('modal-confirm');
}

function toast(msg,type=''){
const c=document.getElementById('toast-container');
const el=document.createElement('div');
el.className='toast'+(type?' '+type:'');el.textContent=msg;c.appendChild(el);
setTimeout(()=>{el.style.animation='toast-out 200ms ease forwards';setTimeout(()=>el.remove(),200);},3000);
}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function wireTutorial(){
let slide=0;
function slides(){return document.querySelectorAll('.tut-slide');}
function dots(){return document.querySelectorAll('.tut-dot');}
const next=document.getElementById('tut-next');
const prev=document.getElementById('tut-prev');
if(!next)return;
function goTo(n){
slides().forEach(s=>s.style.display='none');
dots().forEach(d=>d.classList.remove('active'));
const sl=slides();const dt=dots();
if(sl[n])sl[n].style.display='';
if(dt[n])dt[n].classList.add('active');
slide=n;
if(prev)prev.style.display=n===0?'none':'';
next.textContent=n>=sl.length-1?'Get started':'Next';
}
next.addEventListener('click',()=>{
const total=slides().length;
if(slide>=total-1){closeModal('modal-tutorial');localStorage.setItem('hostica_tutdone','1');}
else goTo(slide+1);
});
if(prev)prev.addEventListener('click',()=>goTo(Math.max(0,slide-1)));
document.querySelectorAll('.tut-dot').forEach(d=>d.addEventListener('click',()=>goTo(parseInt(d.dataset.dot))));
goTo(0);
}

function showTutorialIfNew(){
if(!localStorage.getItem('hostica_tutdone'))setTimeout(()=>openModal('modal-tutorial'),600);
}

function wireVisButtons(){
const VIS_DESC={
public:'Searchable in Community. Anyone with the link can view it.',
unlisted:'Hostable via share link but not listed in Community search.',
private:'Stays local only. No sharing or hosting.'
};
document.querySelectorAll('.vis-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
document.querySelectorAll('.vis-btn').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
const desc=document.getElementById('vis-desc');
if(desc)desc.textContent=VIS_DESC[btn.dataset.vis]||'';
});
});
}

function wireLicenseChooser(){
if(typeof Licenses==='undefined')return;
let selectedLicense=null;
let licenseFilter='all';
function renderLicenses(){
const list=document.getElementById('license-list');
if(!list)return;
const all=Licenses.getAll();
const filtered=licenseFilter==='open'?all.filter(l=>l.isOSI&&l.canCopy):licenseFilter==='restricted'?all.filter(l=>!l.canCopy):all;
list.innerHTML=filtered.map(l=>`<div class="license-item${selectedLicense===l.id?' selected':''}" data-lid="${l.id}"><div class="license-tag" style="background:${l.color}">${l.tag}</div><div><div class="license-name">${l.name}</div><div class="license-desc">${l.desc}</div><div class="license-perms"><span class="lperm ${l.canCopy?'yes':'no'}">${l.canCopy?'Copy':'No copy'}</span><span class="lperm ${l.canModify?'yes':'no'}">${l.canModify?'Modify':'No modify'}</span><span class="lperm ${l.canCommercial?'yes':'no'}">${l.canCommercial?'Commercial':'No commercial'}</span>${l.isOSI?'<span class="lperm yes">OSI</span>':''}</div></div></div>`).join('');
list.querySelectorAll('.license-item').forEach(el=>{
el.addEventListener('click',()=>{selectedLicense=el.dataset.lid;list.querySelectorAll('.license-item').forEach(e=>e.classList.remove('selected'));el.classList.add('selected');});
});
}
document.querySelectorAll('[data-lf]').forEach(btn=>{
btn.addEventListener('click',()=>{document.querySelectorAll('[data-lf]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');licenseFilter=btn.dataset.lf;renderLicenses();});
});
const applyBtn=document.getElementById('btn-apply-license');
if(applyBtn)applyBtn.addEventListener('click',async()=>{
if(!selectedLicense||!activeProject)return;
const user=Auth.getUser();
const licenseText=Licenses.getText(selectedLicense,user.username);
const licenseFile={projectId:activeProject.id,name:'LICENSE',content:licenseText,updatedAt:Date.now(),locked:false};
const exists=await db.files.where('[projectId+name]').equals([activeProject.id,'LICENSE']).count();
if(exists)await db.files.where('[projectId+name]').equals([activeProject.id,'LICENSE']).modify({content:licenseText,updatedAt:Date.now()});
else await db.files.add(licenseFile);
activeProject.files['LICENSE']=licenseFile;
await db.projects.update(activeProject.id,{license:selectedLicense,updatedAt:Date.now()});
renderFileTree();
closeModal('modal-license');
toast('License set to '+Licenses.getById(selectedLicense).name,'success');
});
const el=document.getElementById('license-list');
if(el)renderLicenses();
}

function wireRepoView(){
document.querySelectorAll('.repo-tab').forEach(btn=>{
btn.addEventListener('click',()=>{
document.querySelectorAll('.repo-tab').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
const tab=btn.dataset.tab;
document.getElementById('repo-tab-files').style.display=tab==='files'?'':'none';
document.getElementById('repo-tab-readme').style.display=tab==='readme'?'':'none';
});
});
document.getElementById('btn-repo-edit')?.addEventListener('click',()=>{closeModal('modal-repo-view');if(activeProject)openProject(activeProject.id);});
document.getElementById('btn-repo-play')?.addEventListener('click',()=>{closeModal('modal-repo-view');if(activeProject)launchPlay(activeProject);});
document.getElementById('btn-repo-share')?.addEventListener('click',()=>{closeModal('modal-repo-view');if(activeProject)shareById(activeProject.id);});
}

async function openRepoView(id){
const proj=await getFullProject(id);
activeProject=proj;
const LC={javascript:'#f7df1e',typescript:'#3178c6',python:'#3572a5',html:'#e34c26',css:'#563d7c',rust:'#dea584','c++':'#f34b7d',lua:'#000080',ruby:'#701516',php:'#4f5d95',svelte:'#ff3e00',markdown:'#083fa1',sql:'#e38c00',go:'#00add8'};
document.getElementById('repo-view-name').textContent=proj.name;
const vis=proj.visibility||'public';
const visEl=document.getElementById('repo-view-vis');
visEl.textContent=vis.charAt(0).toUpperCase()+vis.slice(1);
visEl.className='repo-visibility '+(vis==='public'?'vis-public':vis==='unlisted'?'vis-unlisted':'');
document.getElementById('repo-view-desc').textContent=proj.description||'No description.';
document.getElementById('repo-view-tags').innerHTML=(proj.tags||[]).map(t=>`<span class="repo-tag">${t}</span>`).join('');
const langs=Object.values(proj.files||{}).reduce((acc,f)=>{const ext=(f.name||'').split('.').pop().toLowerCase();const map={js:'javascript',ts:'typescript',py:'python',html:'html',css:'css',rs:'rust',cpp:'c++',lua:'lua',rb:'ruby',php:'php',svelte:'svelte',md:'markdown',sql:'sql',go:'go'};if(map[ext]&&!acc.includes(map[ext]))acc.push(map[ext]);return acc;},[]);
document.getElementById('repo-view-langs').innerHTML=langs.map(l=>`<span style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-3)"><span style="width:9px;height:9px;border-radius:50%;background:${LC[l]||'#888'};display:inline-block"></span>${l}</span>`).join('');
const licEl=document.getElementById('repo-view-license');
if(proj.license&&typeof Licenses!=='undefined'){const lic=Licenses.getById(proj.license);if(lic)licEl.innerHTML=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span style="color:var(--text-2)">${lic.name}</span>`;}else{licEl.innerHTML='';}
const fc=Object.keys(proj.files||{}).length;
const updated=new Date(proj.updatedAt||proj.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
document.getElementById('repo-view-meta').innerHTML=`<span>${fc} file${fc!==1?'s':''}</span><span>Updated ${updated}</span>`;
const filesEl=document.getElementById('repo-tab-files');
const sorted=Object.values(proj.files||{}).sort((a,b)=>{if(a.locked&&!b.locked)return 1;if(!a.locked&&b.locked)return -1;return a.name.localeCompare(b.name);});
filesEl.innerHTML=sorted.map(f=>`<div class="repo-file-row" data-file="${f.name}">${fileIcon(f.name)}<span class="repo-file-name">${f.name}${f.locked?' <span style="font-size:10px;color:var(--text-3)">(locked)</span>':''}</span><span class="repo-file-size">${fmtBytes((f.content||'').length)}</span></div>`).join('');
filesEl.querySelectorAll('.repo-file-row').forEach(row=>{
row.addEventListener('click',()=>{closeModal('modal-repo-view');const file=proj.files[row.dataset.file];if(file)openProject(proj.id).then(()=>openFile(file));});
});
const readmeFile=proj.files['README.md']||proj.files['readme.md']||proj.files['README.txt'];
document.getElementById('repo-tab-readme').textContent=readmeFile?readmeFile.content:'No README found.';
openModal('modal-repo-view');
}


async function loadProfileView(){
const u=Auth.getUser();
if(!u)return;
const s=u.settings||{};
const banner=document.getElementById('profile-banner');
const avatarEl=document.getElementById('profile-avatar');
if(s.banner){banner.style.background='url('+s.banner+') center/cover no-repeat';}
else{banner.style.background='linear-gradient(135deg,var(--bg-3),var(--bg-4))';}
if(s.avatar){
const img2=document.createElement('img');
img2.src=s.avatar;
img2.style.cssText='width:100%;height:100%;object-fit:cover';
img2.onerror=()=>{img2.remove();avatarEl.textContent=u.username[0].toUpperCase();};
avatarEl.innerHTML='';
avatarEl.appendChild(img2);
}
else{avatarEl.textContent=u.username[0].toUpperCase();}
document.getElementById('profile-displayname').textContent=s.displayName||u.username;
document.getElementById('profile-username').textContent='@'+u.username;
document.getElementById('profile-bio').textContent=s.bio||'';
const wsEl=document.getElementById('profile-website');
wsEl.innerHTML=s.website?'<a href="'+s.website+'" target="_blank" style="font-size:12px;color:var(--accent);display:flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>'+s.website+'</a>':'';
const rows=await db.projects.orderBy('updatedAt').reverse().toArray();
const pub=rows.filter(p=>p.visibility==='public');
const grid=document.getElementById('profile-projects');
const empty=document.getElementById('profile-empty');
if(!pub.length){grid.innerHTML='';empty.style.display='flex';return;}
empty.style.display='none';
grid.innerHTML=pub.map(p=>{
const d=new Date(p.updatedAt||p.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
return '<div class="project-card" style="cursor:pointer" data-pid="'+p.id+'">'
+'<div class="project-thumb"><div class="project-thumb-letter">'+p.name[0].toUpperCase()+'</div></div>'
+'<div class="project-body"><div class="project-name">'+esc(p.name)+'</div><div class="project-meta">'+d+'</div></div>'
+'</div>';
}).join('');
grid.querySelectorAll('.project-card[data-pid]').forEach(card=>{
card.addEventListener('click',()=>openRepoView(card.dataset.pid));
});
}

window.openRepoView=openRepoView;
window.openModal=openModal;

window.toast=toast;window.App={confirm};
return{init};
})();

document.addEventListener('DOMContentLoaded',()=>App.init());
