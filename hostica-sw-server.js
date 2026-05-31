const store=new Map();
self.addEventListener('message',e=>{
if(e.data.type==='LOAD'){
store.clear();
for(const[k,v]of Object.entries(e.data.files))store.set(k,v);
e.source?.postMessage({type:'READY'});
}
if(e.data.type==='CLEAR')store.clear();
});
self.addEventListener('fetch',e=>{
const url=new URL(e.request.url);
if(!url.searchParams.has('__hostica'))return;
const key=url.searchParams.get('__hostica')||'index.html';
e.respondWith((async()=>{
const content=store.get(key)||store.get(key.replace(/^\//,''));
if(content===undefined){
return new Response('404 Not found',{status:404,headers:{'Content-Type':'text/plain'}});
}
const mime=mimeFor(key);
return new Response(content,{status:200,headers:{'Content-Type':mime,'Cache-Control':'no-store'}});
})());
});
function mimeFor(n){
if(/\.html?$/.test(n))return'text/html;charset=utf-8';
if(/\.css$/.test(n))return'text/css';
if(/\.js$/.test(n))return'application/javascript';
if(/\.json$/.test(n))return'application/json';
if(/\.svg$/.test(n))return'image/svg+xml';
if(/\.png$/.test(n))return'image/png';
if(/\.jpe?g$/.test(n))return'image/jpeg';
if(/\.gif$/.test(n))return'image/gif';
if(/\.webp$/.test(n))return'image/webp';
if(/\.woff2?$/.test(n))return'font/woff2';
return'application/octet-stream';
}