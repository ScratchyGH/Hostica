'use strict'; 
const Auth=(() => {
let db,user=null;
async function init(){
db=new Dexie('hostica_auth');
db.version(1).stores({users:'username'});
}
async function hashPw(pw,salt){
const enc=new TextEncoder();
const km=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);
const sb=salt?Uint8Array.from(atob(salt),c=>c.charCodeAt(0)):crypto.getRandomValues(new Uint8Array(16));
const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:sb,iterations:100000,hash:'SHA-256'},km,256);
const hex=Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,'0')).join('');
return{hash:hex,salt:btoa(String.fromCharCode(...sb))};
}
async function register(u,pw){
if(!u||u.length<3)throw new Error('Username min 3 chars.');
if(!pw||pw.length<8)throw new Error('Password min 8 chars.');
u=u.trim().toLowerCase();
const existing=await db.users.get(u);
if(existing)throw new Error('Username taken.');
const{hash,salt}=await hashPw(pw);
const doc={username:u,passwordHash:hash,passwordSalt:salt,totpSecret:null,totpEnabled:false,createdAt:Date.now(),settings:{editorFontSize:14,editorTheme:'material-darker'}};
await db.users.add(doc);return doc;
}
async function login(u,pw,token){
u=u.trim().toLowerCase();
const doc=await db.users.get(u);
if(!doc)throw new Error('Wrong username or password.');
const{hash}=await hashPw(pw,doc.passwordSalt);
if(hash!==doc.passwordHash)throw new Error('Wrong username or password.');
if(doc.totpEnabled){
if(!token)throw new Error('2FA_REQUIRED');
const totp=new OTPAuth.TOTP({secret:OTPAuth.Secret.fromBase32(doc.totpSecret),digits:6,period:30});
if(totp.validate({token,window:1})===null)throw new Error('Invalid code.');
}
user=doc;sessionStorage.setItem('hostica_user',u);return doc;
}
async function restore(){
const s=sessionStorage.getItem('hostica_user');
if(!s)return null;
try{user=await db.users.get(s);return user;}catch{return null;}
}
function logout(){user=null;sessionStorage.removeItem('hostica_user');}
function gen2FA(u){
const sec=new OTPAuth.Secret({size:20});
const totp=new OTPAuth.TOTP({issuer:'Hostica',label:u,algorithm:'SHA1',digits:6,period:30,secret:sec});
return{secret:sec.base32,uri:totp.toString()};
}
async function enable2FA(secret,token){
const totp=new OTPAuth.TOTP({secret:OTPAuth.Secret.fromBase32(secret),digits:6,period:30});
if(totp.validate({token,window:1})===null)throw new Error('Wrong code.');
await db.users.update(user.username,{totpSecret:secret,totpEnabled:true});
user.totpSecret=secret;user.totpEnabled=true;return true;
}
async function disable2FA(){
await db.users.update(user.username,{totpSecret:null,totpEnabled:false});
user.totpSecret=null;user.totpEnabled=false;
}
async function saveSettings(s){
await db.users.update(user.username,{settings:{...user.settings,...s}});
user.settings={...user.settings,...s};
}
async function deleteAccount(){await db.users.delete(user.username);logout();}
function getUser(){return user;}
return{init,register,login,restore,logout,gen2FA,enable2FA,disable2FA,saveSettings,deleteAccount,getUser};
})();
