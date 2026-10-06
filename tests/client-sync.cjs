// Exercita o hook com um runtime de hooks determinístico e IndexedDB simulado.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const swc=require('next/dist/build/swc'),React=require('react');
const folder=path.resolve('.client-test');fs.mkdirSync(path.join(folder,'lib'),{recursive:true});
for(const name of ['useNotionState.js','editingGuard.js','notionDiff.js','entryDrafts.js','storage.js','api.js','finance.js'])fs.writeFileSync(path.join(folder,'lib',name),swc.transformSync(fs.readFileSync(path.join('lib',name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
require('fake-indexeddb/auto');
let loginDestination,poll;const popup={closed:false};const handlers=new Map(),documentHandlers=new Map();const originalNow=Date.now;let clockOffset=0;Date.now=()=>originalNow()+clockOffset;global.window={document:{hidden:false,addEventListener:(name,fn)=>documentHandlers.set(name,documentHandlers.has(name)?((old)=>e=>{old(e);fn(e);})(documentHandlers.get(name)):fn),removeEventListener:name=>documentHandlers.delete(name)},location:{origin:'https://lifeos.test',replace:()=>{throw Error('Login must not navigate the app');}},open:url=>{loginDestination=url;return popup;},setInterval:fn=>{poll=fn;return 1;},clearInterval:()=>{poll=null;},addEventListener:(name,fn)=>handlers.set(name,handlers.has(name)?((old)=>e=>{old(e);fn(e);})(handlers.get(name)):fn),removeEventListener:name=>handlers.delete(name)};
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
let sessionAuthenticated=false,sessionQueries=0;let remote={user:testUser,projects:[],tasks:[],inbox:[],diary:[],diaryConfigured:true,categories:[],transactions:[],financeConfigured:true},syncCount=0,uploadCount=0,failure=false,gate=null,readCount=0,readGate=null,readFailure=false;
global.fetch=async(url,options={})=>{
 if(url==='/api/backup')return Response.json({maintenance:false});
 if(url==='/api/session'){sessionQueries++;return Response.json({authenticated:sessionAuthenticated,configured:true,user:sessionAuthenticated?testUser:null});}
 if(url==='/api/notion'){readCount++;const snapshot=structuredClone(remote);if(readGate)await readGate;if(readFailure){readFailure=false;return Response.json({error:'Consulta indisponível'},{status:502});}return Response.json(snapshot);}
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
 render();for(let i=0;i<100&&hook.authenticated===null;i++)await tick();assert.equal(hook.authenticated,false);assert.equal(hook.ready,false);hook.login();assert.equal(loginDestination,'/api/auth/google?popup=1');assert.ok(poll);popup.closed=true;poll();await tick();assert.ok(poll,'Google severing the opener must not stop checking before login completes');sessionAuthenticated=true;handlers.get('message')({origin:'https://evil.test',source:popup,data:{type:'lifeos-login-complete'}});assert.equal(hook.ready,false);handlers.get('storage')({key:'lifeos-login-complete'});for(let i=0;i<100&&!hook.ready;i++)await tick();assert.equal(poll,null,'Successful login must stop polling');const queries=sessionQueries;handlers.get('focus')();handlers.get('storage')({key:'lifeos-login-complete'});await tick();assert.equal(sessionQueries,queries,'Authenticated app does not poll or reload banks on focus');assert.ok(hook.ready);assert.equal(hook.projects.length,0,'Dados locais antigos não devem ser enviados automaticamente');assert.equal(syncCount,0);
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
 const mediaItem={...hook.media[0],attachments:[]};
 hook.setEntertainment(prev=>({...prev,media:[0,1,2,3].map(n=>({...mediaItem,id:'rapid-'+n,_notionId:undefined}))}));await hook.flush();await tick();
 let unblock;gate=new Promise(resolve=>unblock=resolve);const beforeRapid=syncCount;
 hook.setEntertainment(prev=>({...prev,media:prev.media.filter(p=>p.id!=='rapid-0')}));const deleting=hook.flush();await tick();
 hook.setEntertainment(prev=>({...prev,media:prev.media.filter(p=>p.id!=='rapid-1')}));hook.setEntertainment(prev=>({...prev,media:prev.media.filter(p=>p.id!=='rapid-2')}));
 const joined=hook.flush();await tick();assert.equal(syncCount,beforeRapid+1,'Only one synchronization request may run at once');unblock();gate=null;await Promise.all([deleting,joined]);await tick();assert.deepEqual(remote.media.map(p=>p.id),['rapid-3']);assert.equal(hook.pending,false);assert.equal(syncCount,beforeRapid+2);
 const storedDraft=await readState('notion-draft:'+testUser.id);assert.equal(storedDraft.v,1);assert.ok(!JSON.stringify(storedDraft).includes('Edição durante salvamento'));await assert.rejects(()=>readPrivateDraft('notion-draft:'+testUser.id,Buffer.alloc(32,8).toString('base64')),/rascunho/);
 const legacy=await readState();assert.equal(legacy.tasks[0].id,'old-local-task');
 assert.equal((await readPrivateDraft('notion-draft:'+testUser.id,testUser.draftKey)).next.tasks[0].title,'Edição durante salvamento');
 // Untouched creation must not reach Notion, even during an unrelated save.
 const beforeDrafts=syncCount;
 const draftTask={id:'untouched-task',_untouchedDraft:true,title:'Nova tarefa',status:'todo',priority:'medium',context:'personal',project:null,milestone:null,due:null,start:null,followUp:null,waitingOn:'',notes:'',completedAt:null,attachments:[]};
 const draftProject={id:'untouched-project',_untouchedDraft:true,name:'Novo projeto',status:'active',context:'personal',area:'',due:null,description:'',milestones:[],attachments:[]};
 hook.setTasks(previous=>[...previous,draftTask]);hook.setProjects(previous=>[...previous,draftProject]);await tick();assert.equal(hook.pending,false);await hook.flush();assert.equal(syncCount,beforeDrafts);
 hook.setTasks(previous=>previous.map(task=>task.id==='t'?{...task,notes:'Edição paralela'}:task));await hook.flush();await tick();assert.equal(remote.tasks.some(task=>task.id==='untouched-task'),false);assert.equal(remote.projects.some(project=>project.id==='untouched-project'),false);
 const draftCopy=await readPrivateDraft('notion-draft:'+testUser.id,testUser.draftKey);assert.equal(draftCopy.next.tasks.some(task=>task.id==='untouched-task'),false);assert.equal(draftCopy.next.projects.some(project=>project.id==='untouched-project'),false);
 assert.ok(hook.tasks.find(task=>task.id==='untouched-task')._untouchedDraft,'O editor continua aberto durante salvamento de outro registro');
 hook.setTasks(previous=>previous.map(task=>task.id==='untouched-task'?{...task,status:'doing'}:task));await hook.flush();await tick();assert.equal(remote.tasks.find(task=>task.id==='untouched-task').status,'doing','Alterar outro campo também registra a tarefa');assert.ok(!hook.tasks.find(task=>task.id==='untouched-task')._untouchedDraft);
 hook.setProjects(previous=>previous.map(project=>project.id==='untouched-project'?{...project,name:'Projeto preenchido'}:project));await hook.flush();await tick();assert.equal(remote.projects.find(project=>project.id==='untouched-project').name,'Projeto preenchido');
 hook.setTasks(previous=>[...previous,{...draftTask,id:'discard-task'}]);hook.setProjects(previous=>[...previous,{...draftProject,id:'discard-project'}]);await tick();const beforeClose=syncCount;
 hook.setTasks(previous=>previous.filter(task=>!task._untouchedDraft));hook.setProjects(previous=>previous.filter(project=>!project._untouchedDraft));await hook.flush();await tick();assert.equal(syncCount,beforeClose,'Descartar entrada intocada não exige criação nem exclusão no Notion');assert.ok(hook.tasks.some(task=>task.id==='untouched-task'));assert.ok(hook.projects.some(project=>project.id==='untouched-project'));
 const {holdEditor}=require(path.join(folder,'lib/editingGuard'));const releaseEditor=holdEditor();const beforeEditor=readCount;clockOffset+=11000;handlers.get('focus')();await tick();assert.equal(readCount,beforeEditor,'Open forms protect local drafts not yet in autosave');releaseEditor();handlers.get('lifeos-editors-closed')();await tick();assert.equal(readCount,beforeEditor+1,'Read resumes after closing the form');
 // Resume reads do not poll, do not replace dirty edits, and preserve untouched editors.
 assert.ok(!fs.readFileSync('app/page.js','utf8').includes('if(remote.loading) return'),'Foreground synchronization keeps the application mounted');
 const beforeResume=readCount;window.document.hidden=true;clockOffset+=11000;documentHandlers.get('visibilitychange')();handlers.get('focus')();await tick();assert.equal(readCount,beforeResume,'No query while hidden');
 remote={...remote,tasks:remote.tasks.map(task=>task.id==='t'?{...task,title:'Alterado no Android'}:task)};
 hook.setTasks(previous=>[...previous,{...draftTask,id:'resume-empty'}]);await tick();const initialTime=hook.refreshedAt;
 window.document.hidden=false;documentHandlers.get('visibilitychange')();handlers.get('focus')();handlers.get('pageshow')();await tick();await tick();assert.equal(readCount,beforeResume+1,'Return events share a single request');assert.equal(hook.tasks.find(t=>t.id==='t').title,'Alterado no Android');assert.ok(hook.tasks.find(t=>t.id==='resume-empty')._untouchedDraft);assert.ok(hook.refreshedAt>initialTime);assert.equal(hook.ready,true,'No initial loading screen');
 handlers.get('focus')();await tick();assert.equal(readCount,beforeResume+1,'Rapid app switching is throttled');
 let finishRead;readGate=new Promise(resolve=>finishRead=resolve);clockOffset+=11000;handlers.get('focus')();await tick();assert.equal(hook.loading,true);
 hook.setTasks(previous=>previous.map(task=>task.id==='t'?{...task,title:'Texto digitado durante consulta'}:task));finishRead();readGate=null;await tick();assert.equal(hook.tasks.find(t=>t.id==='t').title,'Texto digitado durante consulta');assert.equal(hook.pending,true);
 await hook.flush();await tick();await tick();assert.equal(hook.tasks.find(t=>t.id==='t').title,'Texto digitado durante consulta');assert.equal(hook.pending,false);
 const beforeDirty=readCount;failure=true;hook.setTasks(previous=>previous.map(task=>task.id==='t'?{...task,title:'Preservar após falha'}:task));await assert.rejects(()=>hook.flush(),/Falha simulada/);clockOffset+=11000;handlers.get('focus')();await tick();assert.equal(readCount,beforeDirty,'Dirty state is not overwritten by a resume read');assert.equal(hook.tasks.find(t=>t.id==='t').title,'Preservar após falha');await hook.flush();await tick();await tick();assert.equal(readCount,beforeDirty+1,'Deferred query runs after saving');
 const beforeFailureTime=hook.refreshedAt;readFailure=true;clockOffset+=11000;handlers.get('focus')();await tick();assert.equal(hook.error,'Consulta indisponível');assert.equal(hook.refreshedAt,beforeFailureTime,'Failed query does not update the time');assert.equal(hook.ready,true);clockOffset+=11000;handlers.get('focus')();await tick();assert.equal(hook.error,'');
 Date.now=originalNow;
 active=false;for(const slot of slots)slot?.cleanup?.();Object.assign(React,original);fs.rmSync(folder,{recursive:true});
 console.log('PASSOU: retorno ao foco sem consultas ocultas, eventos agrupados, horário real, preservação de edições durante consulta, consulta adiada após falha/salvamento; carga remota sem importar exemplos locais, upload, autosave, IDs, rascunho após falha, reenvio e edição durante salvamento.');
})().catch(error=>{active=false;for(const slot of slots)slot?.cleanup?.();Object.assign(React,original);console.error(error);process.exitCode=1;});
