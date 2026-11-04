const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),swc=require('next/dist/build/swc');
const root=fs.mkdtempSync(path.join(process.cwd(),'.recado-draft-test-'));
const timers=new Map(),original={setTimeout:global.setTimeout,clearTimeout:global.clearTimeout};let timerId=0;
global.setTimeout=fn=>{timers.set(++timerId,fn);return timerId;};global.clearTimeout=id=>timers.delete(id);
const tick=async()=>{for(const [id,fn] of [...timers]){timers.delete(id);fn();}for(let i=0;i<12;i++)await Promise.resolve();};
let read,save;const writes=[],stored=new Map();
fs.writeFileSync(path.join(root,'recadoDraft.js'),swc.transformSync(fs.readFileSync('lib/recadoDraft.js','utf8'),{jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
fs.writeFileSync(path.join(root,'storage.js'),'');
require.cache[path.join(root,'storage.js')]={exports:{readPrivateDraft:(...args)=>read(...args),savePrivateDraft:(...args)=>save(...args)}};
const {createRecadoDraft}=require(path.join(root,'recadoDraft'));
const sessions=[];
function session(key,extra={}){const statuses=[],restored=[];const instance=createRecadoDraft({key,secret:'secret',onRestore:value=>{restored.push(value);return value;},onStatus:value=>statuses.push(value),...extra});sessions.push(instance);return {instance,statuses,restored};}
const rich={text:'Rascunho importante',doc:{type:'doc',content:[{type:'ideaImage',attrs:{attachmentId:'foto.webp'}}]},attachments:[{name:'foto.webp',file:new File(['bytes'],'foto.webp')}]};
(async()=>{try{
 read=async key=>stored.get(key)||null;save=async(value,key,secret)=>{writes.push({value,key,secret});stored.set(key,value);};
 stored.set('read-error',rich);let failRead=true;const goodRead=read;read=(...args)=>{if(failRead)return Promise.reject(new Error('private detail'));return goodRead(...args);};
 const first=session('read-error');await first.instance.load();assert.equal(first.statuses.at(-1).ready,false);assert.ok(first.statuses.at(-1).readError);assert.doesNotMatch(first.statuses.at(-1).readError,/private detail/);
 first.instance.schedule({text:''});await first.instance.saveNow({text:''});await tick();assert.equal(writes.length,0);assert.equal(stored.get('read-error'),rich,'Unread draft is never replaced');
 failRead=false;await first.instance.load();assert.equal(first.statuses.at(-1).ready,true);assert.equal(first.restored[0],rich);assert.equal(await first.restored[0].attachments[0].file.text(),'bytes');
 first.instance.schedule(rich);await tick();assert.equal(writes.length,0,'Restore alone does not rewrite storage');
 let failWrite=true;const goodSave=save;save=(...args)=>failWrite?Promise.reject(new Error('quota details')):goodSave(...args);
 const changed={...rich,text:'Texto editado'};first.instance.schedule(changed);await tick();assert.ok(first.statuses.at(-1).writeError);assert.equal(stored.get('read-error'),rich);assert.equal(changed.text,'Texto editado');
 failWrite=false;assert.equal(await first.instance.retry(changed),true);assert.equal(first.statuses.at(-1).writeError,'');assert.equal(stored.get('read-error'),changed);
 // A slow write must finish before clearing a sent message, including across remounts.
 const ordered=session('ordered');await ordered.instance.load();let release;save=async(...args)=>{if(args[0].text==='slow')await new Promise(resolve=>{release=resolve;});return goodSave(...args);};
 ordered.instance.schedule({text:'slow'});await tick();const cleared=ordered.instance.saveNow({text:''});await tick();assert.equal(stored.has('ordered'),false);release();await cleared;assert.equal(stored.get('ordered').text,'');
 ordered.instance.schedule({text:'latest before close'});ordered.instance.dispose();const remount=session('ordered');await remount.instance.load();assert.equal(remount.restored[0].text,'latest before close','Closing tab flushes last pending edit before reading again');
 // Reverting to the original text while a different save is in flight still schedules the revert.
 const revert=session('revert');stored.set('revert',{text:'original'});await revert.instance.load();let releaseRevert;save=async(...args)=>{if(args[0].text==='intermediate')await new Promise(resolve=>{releaseRevert=resolve;});return goodSave(...args);};
 revert.instance.schedule({text:'intermediate'});await tick();revert.instance.schedule({text:'original'});revert.instance.schedule({text:'original'});await tick();releaseRevert();await tick();assert.equal(stored.get('revert').text,'original');
 // Disposed account/day/secret scopes cannot restore or notify a different editor.
 let finishRead;read=()=>new Promise(resolve=>{finishRead=resolve;});const old=session('old-scope');const loading=old.instance.load();await tick();old.instance.dispose();const before=old.statuses.length;finishRead(rich);await loading;assert.equal(old.restored.length,0);assert.equal(old.statuses.length,before);old.instance.schedule({text:'must not save'});await tick();assert.equal(stored.has('old-scope'),false);
 read=goodRead;save=goodSave;const qr=session('temporary',{temporary:true});const beforeQr=writes.length;await qr.instance.load();qr.instance.schedule(rich);await qr.instance.saveNow(rich);qr.instance.dispose();await tick();assert.equal(writes.length,beforeQr);assert.deepEqual(qr.restored,[null]);assert.equal(qr.statuses.at(-1).ready,true);
 // Local cleanup failure is a local warning after a confirmed remote send, never a rejected send.
 const sent=session('sent');await sent.instance.load();save=async()=>{throw new Error('quota');};assert.equal(await sent.instance.saveNow({text:'',attachments:[]}),false);assert.ok(sent.statuses.at(-1).writeError);assert.equal(sent.statuses.at(-1).ready,true);
 console.log('PASSOU: rascunho protegido após falha de leitura, recuperação rica, erro de gravação/retentativa, fila/limpeza ordenada, saída/troca de escopo e QR sem persistência.');
}finally{for(const item of sessions)item.dispose();global.setTimeout=original.setTimeout;global.clearTimeout=original.clearTimeout;fs.rmSync(root,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1;});
