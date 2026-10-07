const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),React=require('react'),swc=require('next/dist/build/swc');
const folder=path.resolve('.notice-test');fs.mkdirSync(path.join(folder,'lib'),{recursive:true});
for(const name of ['useRecadoNotification.js','recados.js','api.js'])fs.writeFileSync(path.join(folder,'lib',name),swc.transformSync(fs.readFileSync('lib/'+name,'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
const original={useState:React.useState,useEffect:React.useEffect};let slots=[],index=0,scheduled=false,effects=[],result,user={email:'leticiacost3@gmail.com'},enabled=true;
function render(){index=0;effects=[];result=hook(user,enabled);effects.forEach(fn=>fn());}
React.useState=initial=>{const i=index++;if(!slots[i])slots[i]={value:initial};return[slots[i].value,next=>{slots[i].value=next;if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;render();});}}];};
React.useEffect=(fn,deps)=>{const i=index++;if(!slots[i]||deps.some((v,j)=>v!==slots[i].deps[j])){const old=slots[i];slots[i]={deps,cleanup:old?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}};
const events=new Map();global.document={hidden:false,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};global.window={location:{origin:'https://lifeos.test'},addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
const {recadoToday,hasUnreadRecadoToday}=require(path.join(folder,'lib/recados'));const {useRecadoNotification:hook}=require(path.join(folder,'lib/useRecadoNotification'));
const today=recadoToday(),incoming={id:'a',date:today,recipient:user.email,sender:'periclesbernardes@gmail.com',read:false};let items=[incoming],count=0,gate=null,failure=false;
global.fetch=async()=>{count++;const snapshot=structuredClone(items);if(gate)await gate;if(failure)return Response.json({error:'offline'},{status:502});return Response.json({items:snapshot,today,configured:true});};
const tick=()=>new Promise(r=>setTimeout(r,5));
(async()=>{
 assert.equal(hasUnreadRecadoToday([{...incoming,date:'2020-01-01'}],user.email,today),false);
 assert.equal(hasUnreadRecadoToday([{...incoming,recipient:'periclesbernardes@gmail.com'}],user.email,today),false);
 render();await tick();assert.equal(result.day,today,'Unread incoming today enables header notice');
 document.hidden=true;events.get('lifeos-refresh')();events.get('focus')();await tick();assert.equal(count,1,'No queries in background');document.hidden=false;
 let release;gate=new Promise(r=>release=r);events.get('lifeos-refresh')();await tick();events.get('lifeos-recados-updated')({detail:{item:{...incoming,read:true}}});await tick();assert.equal(result,null,'Confirmed read clears notification');release();gate=null;await tick();assert.equal(result,null,'Older query must not restore already-read notice');
 items=[incoming];events.get('lifeos-refresh')();await tick();assert.ok(result);
 failure=true;events.get('lifeos-refresh')();await tick();assert.ok(result,'Failure preserves last confirmed notice');failure=false;
 events.get('lifeos-recados-updated')({detail:{items:[],month:'2020-01'}});await tick();assert.ok(result,'Browsing old month does not clear today notice');
 events.get('lifeos-recados-updated')({detail:{items:[{...incoming,read:true}],month:today.slice(0,7)}});await tick();assert.equal(result,null);
 enabled=false;render();await tick();assert.equal(result,null);assert.equal(events.size,0,'Logout removes listeners');
 console.log('PASSOU: aviso de hoje exclusivo do destinatário, leitura confirmada, consulta atrasada ignorada, erros preservados, mês antigo isolado e nenhuma consulta oculta.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const s of slots)s.cleanup?.();Object.assign(React,original);fs.rmSync(folder,{recursive:true,force:true});});
