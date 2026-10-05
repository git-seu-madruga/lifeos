// Exercita o hook com um runtime de hooks determinístico e IndexedDB simulado.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const swc=require('next/dist/build/swc'),React=require('react');
const folder=path.resolve('.client-test');fs.mkdirSync(path.join(folder,'lib'),{recursive:true});
for(const name of ['useNotionState.js','notionDiff.js','storage.js','api.js','finance.js'])fs.writeFileSync(path.join(folder,'lib',name),swc.transformSync(fs.readFileSync(path.join('lib',name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
require('fake-indexeddb/auto');
global.window={addEventListener(){},removeEventListener(){}};
const original={useState:React.useState,useRef:React.useRef,useCallback:React.useCallback,useEffect:React.useEffect};
const slots=[];let index=0,scheduled=false,effects=[],hook,active=true;
const changed=(a,b)=>!a||!b||a.length!==b.length||a.some((value,i)=>!Object.is(value,b[i]));
function schedule(){if(scheduled||!active)return;scheduled=true;queueMicrotask(()=>{scheduled=false;render();});}
React.useState=initial=>{const i=index++;if(!slots[i])slots[i]={value:typeof initial==='function'?initial():initial};return [slots[i].value,update=>{const next=typeof update==='function'?update(slots[i].value):update;if(!Object.is(next,slots[i].value)){slots[i].value=next;schedule();}}];};
React.useRef=value=>{const i=index++;if(!slots[i])slots[i]={current:value};return slots[i];};
React.useCallback=(fn,deps)=>{const i=index++;if(!slots[i]||changed(slots[i].deps,deps))slots[i]={value:fn,deps};return slots[i].value;};
React.useEffect=(fn,deps)=>{const i=index++;if(!slots[i]||changed(slots[i].deps,deps)){const old=slots[i];slots[i]={deps,cleanup:old?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}};
const {useNotionState}=require(path.join(folder,'lib/useNotionState'));
function render(){if(!active)return;index=0;effects=[];hook=useNotionState();const pending=effects;effects=[];pending.forEach(effect=>effect());}
const {readState,saveState,readPrivateDraft}=require(path.join(folder,'lib/storage'));
const testUser={id:'google:test-user',email:'periclesbernardes@gmail.com',name:'Péricles',isLegacyOwner:true,draftKey:Buffer.alloc(32,7).toString('base64')};
let remote={user:testUser,projects:[],tasks:[],inbox:[],diary:[],diaryConfigured:true,categories:[],transactions:[],financeConfigured:true},syncCount=0,uploadCount=0,failure=false,gate=null;
global.fetch=async(url,options={})=>{
 if(url==='/api/session')return Response.json({authenticated:true,configured:true,user:testUser});
 if(url==='/api/notion')return Response.json(remote);
 if(url==='/api/notion/upload'){uploadCount++;return Response.json({uploadId:'uploaded-file',name:'ref.txt'});}
 if(url==='/api/notion/sync'){
  syncCount++;if(gate)await gate;
  if(failure){failure=false;return Response.json({error:'Falha simulada'},{status:502});}
  const {next}=JSON.parse(options.body),bindings={},files={};
  for(const item of [...(next.mediaSections||[]),...(next.media||[]),...next.projects,...next.projects.flatMap(project=>project.milestones),...next.tasks,...next.inbox,...next.diary,...(next.shopping || []),...next.categories,...next.transactions,...(next.habits||[]),...(next.habitLogs||[])]){
   bindings[item.id]=item._notionId||`remote-${item.id}`;
   for(const file of item.attachments||[])if(file.uploadId)files[file.id]={id:file.id,name:file.name,notion:{type:'file',name:file.name,file:{url:'https://files.test/ref'}},pageId:bindings[item.id],index:0,kind:(next.media||[]).includes(item)?'media':next.diary.includes(item)?'diary':next.tasks.includes(item)?'tasks':'projects',url:'https://files.test/ref'};
  }
  remote={...next,user:testUser};return Response.json({bindings,files});
 }
 throw new Error(`Rota inesperada ${url}`);
};
const tick=()=>new Promise(resolve=>setTimeout(resolve,5));
(async()=>{
 await saveState({projects:[{id:'old-local'}],tasks:[{id:'old-local-task'}],inbox:[]});
 render();for(let i=0;i<100&&!hook.ready;i++)await tick();assert.ok(hook.ready);assert.equal(hook.projects.length,0,'Dados locais antigos não devem ser enviados automaticamente');assert.equal(syncCount,0);
 hook.setProjects([{id:'p',name:'Projeto',status:'active',context:'work',area:'',due:null,description:'',milestones:[],attachments:[]}]);
 hook.setTasks([{id:'t',title:'Primeira versão',status:'todo',priority:'medium',context:'work',project:'p',milestone:null,due:null,start:null,followUp:null,waitingOn:'',notes:'',completedAt:null,attachments:[{id:'a',name:'ref.txt',file:new File(['test'],'ref.txt',{type:'text/plain'})}]}]);
 await hook.flush();await tick();assert.equal(syncCount,1);assert.equal(uploadCount,1);assert.equal(hook.tasks[0]._notionId,'remote-t');assert.ok(hook.tasks[0].attachments[0].notion);assert.equal(hook.pending,false);
 failure=true;hook.setTasks(previous=>previous.map(task=>({...task,title:'Após erro'})));
 await assert.rejects(()=>hook.flush(),/Falha simulada/);await tick();assert.equal(hook.tasks[0].title,'Após erro');assert.ok(hook.pending);assert.ok((await readPrivateDraft('notion-draft:'+testUser.id,testUser.draftKey)).next.tasks[0].title==='Após erro');
 await hook.flush();await tick();assert.equal(hook.pending,false);assert.equal(uploadCount,1,'O arquivo já salvo não deve ser reenviado');
 let release;gate=new Promise(resolve=>release=resolve);
 hook.setTasks(previous=>previous.map(task=>({...task,title:'Em voo'})));
 const saving=hook.flush();await tick();hook.setTasks(previous=>previous.map(task=>({...task,title:'Edição durante salvamento'})));release();gate=null;
 await saving;await tick();assert.equal(hook.tasks[0].title,'Edição durante salvamento');assert.equal(remote.tasks[0].title,'Edição durante salvamento');assert.equal(hook.pending,false);
 hook.setInbox([{id:'i',text:'Entrada\ncom duas linhas',createdAt:Date.now()}]);await hook.flush();await tick();assert.equal(remote.inbox[0].text,'Entrada\ncom duas linhas');assert.equal(hook.inbox[0]._notionId,'remote-i');
 hook.setInbox([]);await hook.flush();await tick();assert.equal(remote.inbox.length,0);
 hook.setDiary([{id:'d2026-10-04',date:'2026-10-04',text:'**Anotação**\nSegunda linha',attachments:[]}]);await hook.flush();await tick();assert.equal(remote.diary[0].date,'2026-10-04');assert.equal(hook.diary[0]._notionId,'remote-d2026-10-04');assert.equal(hook.pending,false);
 hook.setFinance({categories:[{id:'c',name:'Salário',flow:'in'}],transactions:[{id:'tx',name:'Salário',category:'c',month:'2026-10',amount:12345}]});await hook.flush();await tick();assert.equal(hook.transactions[0]._notionId,'remote-tx');assert.equal(remote.transactions[0].amount,12345);assert.equal(hook.pending,false);
 hook.setShopping([{id:'shop-client',name:'Mercado',context:'personal',items:[{id:'a',text:'Leite'}]}]);await hook.flush();await tick();assert.equal(remote.shopping[0].items[0].text,'Leite');assert.equal(hook.shopping[0]._notionId,'remote-shop-client');assert.equal(hook.pending,false);hook.setShopping(prev=>prev.map(p=>({...p,items:[]})));await hook.flush();await tick();assert.equal(remote.shopping[0].items.length,0);
 hook.setHabits({habits:[{id:'hc',name:'Hábito',context:'personal',color:'blue',icon:'book',start:'2026-10-05'}],habitLogs:[{id:'hl',name:'Hábito',habit:'hc',date:'2026-10-05'}]});await hook.flush();await tick();assert.equal(remote.habitLogs[0].habit,'hc');assert.equal(hook.habits[0]._notionId,'remote-hc');assert.equal(hook.pending,false);
 hook.setEntertainment({mediaSections:[{id:'section-client',name:'Leitura',type:'book',icon:'book',color:'#6ea8fe'}],media:[{id:'content-client',name:'Duna',section:'section-client',author:'Frank Herbert',status:'planned',rating:4,comment:'Teste',coverUrl:'',sourceUrl:'',provider:'',attachments:[{id:'cover-client',name:'cover.png',file:new File(['cover'],'cover.png',{type:'image/png'})}]}]});await hook.flush();await tick();assert.equal(hook.media[0]._notionId,'remote-content-client');assert.equal(hook.media[0].attachments[0].kind,'media');assert.equal(remote.media[0].rating,4);assert.equal(hook.pending,false);
 const storedDraft=await readState('notion-draft:'+testUser.id);assert.equal(storedDraft.v,1);assert.ok(!JSON.stringify(storedDraft).includes('Edição durante salvamento'));await assert.rejects(()=>readPrivateDraft('notion-draft:'+testUser.id,Buffer.alloc(32,8).toString('base64')),/rascunho/);
 const legacy=await readState();assert.equal(legacy.tasks[0].id,'old-local-task');
 assert.equal((await readPrivateDraft('notion-draft:'+testUser.id,testUser.draftKey)).next.tasks[0].title,'Edição durante salvamento');
 active=false;for(const slot of slots)slot?.cleanup?.();Object.assign(React,original);fs.rmSync(folder,{recursive:true});
 console.log('PASSOU: carga remota sem importar exemplos locais, upload, autosave, IDs, rascunho após falha, reenvio e edição durante salvamento.');
})().catch(error=>{active=false;for(const slot of slots)slot?.cleanup?.();Object.assign(React,original);console.error(error);process.exitCode=1;});
