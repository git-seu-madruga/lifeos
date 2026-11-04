const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=fs.mkdtempSync(path.join(process.cwd(),'.planning-rich-test-'));
for(const dir of ['lib','components']){fs.mkdirSync(path.join(root,dir));for(const name of fs.readdirSync(dir)){if(!name.endsWith('.js'))continue;fs.writeFileSync(path.join(root,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
const saved={useState:React.useState,useRef:React.useRef,useEffect:React.useEffect};
const walk=(node,out=[])=>{if(Array.isArray(node))node.forEach(child=>walk(child,out));else if(node?.props){out.push(node);walk(node.props.children,out);}return out;};
try{
 const d=require(path.join(root,'lib/planningDocument')),rich=require(path.join(root,'lib/someday')),diff=require(path.join(root,'lib/notionDiff')),View=require(path.join(root,'components/PlanningDescription')).default;
 const file={id:'photo',name:'planning-inline-photo.webp',pageId:'11111111-1111-4111-8111-111111111111',index:0,kind:'tasks',notion:{type:'file',file:{url:'https://files.test/photo'}}},manual={id:'pdf',name:'consulta.pdf',notion:{type:'file',file:{url:'https://files.test/pdf'}}};
 const doc={type:'doc',content:[{type:'heading',attrs:{level:2},content:[{type:'text',text:'Descrição rica',marks:[{type:'bold'}]}]},{type:'paragraph',content:[{type:'ideaEmoji',attrs:{id:'art-3d-filament-blue'}}]},{type:'ideaImage',attrs:{attachmentId:file.name,alt:'Foto colada'}},{type:'ideaBookmark',attrs:{id:'link',url:'https://example.com/material',title:'Consulta',description:'Material de apoio',image:''}}]};
 for(const kind of ['tasks','projects']){
  const textKey=d.planningTextField(kind),legacy={id:'item',[textKey]:'Linha 1\n**Literal**\n<nao e HTML>',attachments:[manual]},copy=structuredClone(legacy);
  assert.equal(rich.ideaText(d.planningDoc(legacy,kind)),legacy[textKey]);assert.deepEqual(legacy,copy);assert.equal(d.validatePlanningDocument(legacy,kind),'');assert.equal(legacy.doc,undefined,'Opening is not a migration');
  const item=d.setPlanningDocument({...legacy,attachments:[file,manual]},kind,doc);assert.equal(d.validatePlanningDocument(item,kind),'');assert.equal(item[textKey],rich.ideaText(doc));assert.deepEqual(d.planningManualAttachments(item),[manual]);
  assert.match(d.validatePlanningDocument({...item,[textKey]:'Divergente'},kind),/não corresponde/);assert.match(d.validatePlanningDocument({...item,attachments:[manual]},kind),/sem anexo/);
  const removed=d.setPlanningDocument(item,kind,{type:'doc',content:[doc.content[0]]});assert.deepEqual(removed.attachments,[manual]);assert.deepEqual(d.setPlanningManualAttachments(item,[]).attachments,[file]);
  const base={projects:[],tasks:[],inbox:[],diary:[],[kind]:[{...item,doc:{...doc,content:[...doc.content]}}]},next=structuredClone(base);next[kind][0].doc.content[0].content[0].marks=[{type:'italic'}];assert.deepEqual(diff.diffState(base,next)[kind].upserts[0].keys,['doc'],'Formatting alone is an incremental change');
  const html=renderToStaticMarkup(React.createElement(View,{item,kind,readOnly:true}));assert.match(html,/<h2><strong>Descrição rica/);assert.match(html,/sd-inline-emoji/);assert.match(html,new RegExp('kind='+kind));assert.doesNotMatch(html,/contenteditable|Retirar imagem|Incluir anexos|Abrindo editor/);assert.match(html,/consulta.pdf/);
  React.useRef=value=>({current:value});React.useState=value=>[typeof value==='function'?value():value,()=>{}];React.useEffect=()=>{};
  let patches=[];const nodes=walk(View({item:legacy,kind,onChange:patch=>patches.push(patch)})),editor=nodes.find(node=>node.props.label===(kind==='tasks'?'Anotações da tarefa':'Descrição do projeto'));
  assert.equal(editor.props.emojiPicker,true);assert.equal(patches.length,0);editor.props.onImage(file);editor.props.onChange(doc);assert.equal(patches.at(-1).attachments.length,2);assert.equal(patches.at(-1).doc,doc,'Consecutive callbacks preserve the new image and manual files');assert.equal(patches.at(-1)[textKey],rich.ideaText(doc));
  const locked=walk(View({item,kind,readOnly:true,onChange:patch=>patches.push(patch)}));const count=patches.length;locked.find(node=>node.type?.name==='ProjectAttachments').props.onChange([]);assert.equal(patches.length,count,'Read-only rejects attachment mutations even if a callback is invoked');
  Object.assign(React,saved);
 }
 console.log('PASSOU: descrições ricas de tarefas/projetos, legados sem migração, imagens e anexos manuais, emojis/links, cadeado, callbacks consecutivos e diff somente de formatação.');
}finally{Object.assign(React,saved);fs.rmSync(root,{recursive:true,force:true});}
