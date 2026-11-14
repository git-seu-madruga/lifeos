const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc'),React=require('react');
const root=fs.mkdtempSync(path.join(process.cwd(),'.explicit-save-test-'));
for(const dir of ['lib','components']){fs.mkdirSync(path.join(root,dir));for(const name of fs.readdirSync(dir))if(name.endsWith('.js'))fs.writeFileSync(path.join(root,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}
const saved={useState:React.useState,useRef:React.useRef,useEffect:React.useEffect},oldWindow=global.window;
const Views={reference:require(path.join(root,'components/ReferenceView')).default,someday:require(path.join(root,'components/SomedayView')).default};
let active,allow=false,prompts=0,events=new Map();
global.window={confirm(message){assert.match(message,/não salvas/);prompts++;return allow;},addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},removeEventListener(type,fn){events.get(type)?.delete(fn);},dispatchEvent(){}};
React.useState=initial=>{const h=active,i=h.at++;if(!(i in h.slots))h.slots[i]=typeof initial==='function'?initial():initial;return [h.slots[i],value=>h.slots[i]=typeof value==='function'?value(h.slots[i]):value];};
React.useRef=value=>{const h=active,i=h.at++;if(!(i in h.slots))h.slots[i]={current:value};return h.slots[i];};
React.useEffect=(effect,deps)=>{const h=active,i=h.at++,old=h.effects[i];if(!old||deps.some((v,n)=>!Object.is(v,old.deps[n])))h.pending.push(()=>{old?.cleanup?.();h.effects[i]={deps,cleanup:effect()};});};
const harness=()=>({slots:[],effects:[],pending:[],at:0,render(fn){active=this;this.at=0;const value=fn();for(const run of this.pending.splice(0))run();return value;},unmount(){this.effects.forEach(e=>e?.cleanup?.());}});
const walk=(node,result=[])=>{if(Array.isArray(node))node.forEach(n=>walk(n,result));else if(node?.props){result.push(node);walk(node.props.children,result);}return result;};
const text=node=>typeof node==='string'?node:typeof node==='number'?String(node):Array.isArray(node)?node.map(text).join(''):text(node?.props?.children||'');
(async()=>{try{
 const {useEntryDraft}=require(path.join(root,'lib/useEntryDraft')),guard=require(path.join(root,'lib/editingGuard'));
 const sd=require(path.join(root,'lib/someday')),ref=require(path.join(root,'lib/reference'));
 // Exercise both real screens, not just the draft utility: no collection write on edit,
 // discard cancels/reopens, rich files stay local, and only the explicit button saves.
 for(const kind of ['reference','someday']){
  const h=harness(),category=kind==='reference'?ref.makeReferenceCategory('Manuais'):sd.makeArea('Ideias');
  const record=kind==='reference'?ref.makeReferenceMaterial(category):sd.makeIdea(category);record.name='Original';
  let records=[category,record],writes=0,flushes=0;
  const View=Views[kind];
  const render=()=>h.render(()=>walk(View({records,setRecords:fn=>{writes++;records=fn(records);},configured:true,context:'personal',onFlush:async()=>{flushes++;},onManageAreas(){},onPromote(){}})));
  let nodes=render();nodes.find(n=>n.type==='button'&&text(n)==='Mostrar todos').props.onClick();nodes=render();
  const open=()=>{const list=render();list.find(n=>n.props.className===(kind==='reference'?'ref-material-open':'sd-card-main')).props.onClick();return render().find(n=>n.type?.name===(kind==='reference'?'MaterialDetail':'IdeaDetail'));};
  let detail=open();detail.props.onPatch(record.id,{name:'Alterado',data:{favorite:true}});
  const image={id:'image',name:'pasted.webp',uploadId:'upload'};
  detail.props.onPatch(record.id,previous=>({attachments:[...previous.attachments,image]}));
  detail.props.onPatch(record.id,{data:{doc:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Texto novo',marks:[{type:'bold'}]}]},{type:'ideaImage',attrs:{attachmentId:image.name,alt:'Imagem'}}]}}});
  nodes=render();detail=nodes.find(n=>n.type?.name===(kind==='reference'?'MaterialDetail':'IdeaDetail'));
  assert.equal(writes,0);assert.equal(records[1].name,'Original');assert.equal(detail.props.record.attachments.length,1);
  allow=false;const before=prompts;detail.props.onClose();assert.equal(prompts,before+1);assert.ok(render().some(n=>n.type===detail.type));
  assert.equal(guard.confirmLeaveEditors(),false,'Tab navigation respects discard cancellation');
  let prevented=false;for(const listener of events.get('beforeunload')||[])listener({preventDefault(){prevented=true;},returnValue:undefined});assert.ok(prevented);
  allow=true;detail.props.onClose();assert.ok(!render().some(n=>n.type===detail.type));assert.equal(writes,0);assert.equal(records[1].attachments.length,0);
  detail=open();assert.equal(detail.props.record.name,'Original');const cleanPrompts=prompts;detail.props.onClose();render();assert.equal(prompts,cleanPrompts,'Untouched closes without warning');
  detail=open();detail.props.onPatch(record.id,{name:'Rascunho'});render();detail=render().find(n=>n.type===detail.type);detail.props.onPatch(record.id,{name:'Original'});render();const revertedPrompts=prompts;detail.props.onClose();render();assert.equal(prompts,revertedPrompts,'Reverted edit closes without warning');
  detail=open();detail.props.onPatch(record.id,{name:'Salvo'});render();detail=render().find(n=>n.type===detail.type);await detail.props.onSave();render();assert.equal(records[1].name,'Salvo');assert.equal(writes,1);assert.equal(flushes,1);
  h.unmount();assert.equal(guard.confirmLeaveEditors(),true,'Unmount cleans navigation guard');
 }
 // Save conflicts and transport failures preserve the editor. Upload callbacks can
 // add their file and document while navigation is blocked.
 const h=harness(),category=ref.makeReferenceCategory('Guias'),record=ref.makeReferenceMaterial(category);record.name='Base';let records=[category,record],busy=false,fail=false,writes=0;
 const render=()=>h.render(()=>useEntryDraft({setRecords:fn=>{records=fn(records);writes++;},validate:ref.validateReference,onFlush:async()=>{if(fail)throw Error('offline');},busy,timestamp:true}));
 let draft=render();draft.begin(record);draft=render();busy=true;draft=render();draft.patch(record.id,{name:'Durante upload'});draft=render();assert.equal(draft.record.name,'Durante upload');assert.equal(draft.close(),false,'Upload blocks discard');busy=false;draft=render();
 records=records.map(r=>r.id===record.id?{...r,name:'Editado em outra instância'}:r);await assert.rejects(()=>draft.save(),/mudou/);draft=render();assert.equal(draft.record.name,'Durante upload');assert.equal(writes,0);
 records=[category,record];fail=true;await assert.rejects(()=>draft.save(),/offline/);draft=render();assert.equal(records[1].name,'Durante upload');assert.equal(draft.dirty,false,'Explicitly submitted save is never presented as discardable');assert.ok(draft.record);fail=false;await draft.save();render();assert.equal(writes,1,'Retry does not republish or duplicate');
 draft=render();const fresh=ref.makeReferenceMaterial(category);draft.begin(fresh,true);draft=render();draft.patch(fresh.id,{name:'Novo material'});draft=render();assert.equal(records.length,2);await draft.save();render();assert.equal(records.length,3);h.unmount();
 console.log('PASSOU: salvar explícito nas duas telas, texto rico/anexos locais, descarte confirmado/cancelado, navegação, beforeunload, intocado/revertido, upload, conflito e falha/reenvio sem duplicação.');
}finally{Object.assign(React,saved);if(oldWindow===undefined)delete global.window;else global.window=oldWindow;fs.rmSync(root,{recursive:true,force:true});}})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
