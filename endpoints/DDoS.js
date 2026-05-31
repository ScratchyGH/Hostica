'use strict';
const DDoS=(()=>{
const WINDOW_MS=10000;
const MAX_ACTIONS=60;
const MAX_GUN_WRITES=5;
const MAX_SEARCH=20;
const BLOCK_MS=30000;

const buckets={};
const blocked={};

function now(){return Date.now();}

function isBlocked(key){
if(!blocked[key])return false;
if(now()-blocked[key]>BLOCK_MS){delete blocked[key];return false;}
return true;
}

function block(key){
blocked[key]=now();
console.warn('[DDoS] blocked:',key);
}

function hit(key,max,windowMs){
if(isBlocked(key))return false;
if(!buckets[key])buckets[key]=[];
const win=now()-windowMs;
buckets[key]=buckets[key].filter(t=>t>win);
buckets[key].push(now());
if(buckets[key].length>max){
block(key);
return false;
}
return true;
}

function checkAction(userId){
return hit('action:'+userId,MAX_ACTIONS,WINDOW_MS);
}

function checkGunWrite(userId){
return hit('gun:'+userId,MAX_GUN_WRITES,60000);
}

function checkSearch(userId){
return hit('search:'+userId,MAX_SEARCH,WINDOW_MS);
}

function checkGuest(){
return hit('guest',MAX_ACTIONS*2,WINDOW_MS);
}

function getStatus(userId){
const key='action:'+userId;
const b=buckets[key]||[];
const win=now()-WINDOW_MS;
const count=b.filter(t=>t>win).length;
return{
blocked:isBlocked(key),
count,
max:MAX_ACTIONS,
remaining:Math.max(0,MAX_ACTIONS-count),
blockedUntil:blocked[key]?blocked[key]+BLOCK_MS:null
};
}

function wrap(fn,userId,type='action'){
const checks={action:checkAction,gun:checkGunWrite,search:checkSearch,guest:checkGuest};
const check=checks[type]||checkAction;
return async function(...args){
if(!check(userId)){
const remaining=blocked[`${type==='action'?'action:':''}${userId}`];
const secs=remaining?Math.ceil((remaining+BLOCK_MS-now())/1000):30;
throw new Error(`Too many requests. Try again in ${secs}s.`);
}
return fn(...args);
};
}

function rateLimitGun(gun,userId){
const origGet=gun.get.bind(gun);
let writeCount=0;
return{
get:(key)=>{
const node=origGet(key);
const origPut=node.put.bind(node);
node.put=(data,cb)=>{
if(!checkGunWrite(userId)){
if(cb)cb({err:'Rate limited. Try again in 60s.'});
return node;
}
return origPut(data,cb);
};
return node;
}
};
}

return{checkAction,checkGunWrite,checkSearch,checkGuest,isBlocked,getStatus,wrap,rateLimitGun};
})();