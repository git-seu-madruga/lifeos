// Contratos da integração, sem acessar o workspace real.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const root=process.cwd(),temp=path.join(root,'.test-build');
const swc=require('next/dist/build/swc');
for(const folder of ['lib','app/api']) {
 function compile(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
   const filename=path.join(dir,entry.name);
   if(entry.isDirectory()){compile(filename);continue;}
   if(!filename.endsWith('.js'))continue;
   const target=path.join(temp,filename);fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,swc.transformSync(fs.readFileSync(filename,'utf8'),{filename,jsc:{parser:{syntax:'ecmascript',jsx:true},target:'es2022'},module:{type:'commonjs'}}).code);
  }
 }
 compile(folder);
}
process.env.NOTION_TOKEN='test-notion-token';process.env.GOOGLE_CLIENT_ID='client.apps.googleusercontent.com';process.env.GOOGLE_CLIENT_SECRET='test-secret';process.env.LIFEOS_SESSION_SECRET='a'.repeat(40);process.env.LIFEOS_ALLOWED_GOOGLE_EMAILS='periclesbernardes@gmail.com,leticiacost3@gmail.com';process.env.LIFEOS_LEGACY_OWNER_EMAIL='periclesbernardes@gmail.com';process.env.LIFEOS_APP_URL='https://lifeos.test';
const auth=require(path.join(temp,'lib/server/auth'));
const notionLib=require(path.join(temp,'lib/server/notion'));
const {synchronize}=require(path.join(temp,'lib/server/sync'));
const {diffState,hasChanges}=require(path.join(temp,'lib/notionDiff'));
process.env.NOTION_DIARY_DATABASE_ID='diary-test-db';
process.env.NOTION_INBOX_DATABASE_ID='inbox-test-db';
process.env.NOTION_FINANCE_CATEGORIES_DATABASE_ID='finance-categories-test';process.env.NOTION_FINANCE_TRANSACTIONS_DATABASE_ID='finance-transactions-test';
const databases={reference:'reference-test',someday:'someday-test',nutrition:"nutrition-test",vehicles:"vehicles-test",wellness:"wellness-test",cycle:"cycle-test",mediaSections:"media-sections-test",media:"media-test",habits:'habits-test',habitLogs:'habit-logs-test',shopping:'shopping-test',contacts:'contacts-test',categories:'finance-categories-test',transactions:'finance-transactions-test',diary:'diary-test-db',inbox:'inbox-test-db',projects:'3ec530f0-f112-80d5-9097-ea21f9ce45d7',milestones:'3ed530f0-f112-80e0-b1e5-f2a861954669',tasks:'3ec530f0-f112-803b-a108-f7778cdee362'};
const sourceIds=Object.fromEntries(Object.keys(databases).map(k=>[k,randomUUID()]));
const specs={
 reference:{Nome:"title",Tipo:"rich_text",Dados:"rich_text",Anexos:"files"},
 someday:{Nome:"title",Tipo:"rich_text",Contexto:"select",Dados:"rich_text",Anexos:"files"},
 nutrition:{Nome:"title",Data:"date",Tipo:"rich_text",Dados:"rich_text"},
 vehicles:{Nome:"title",Data:"date",Tipo:"rich_text",Dados:"rich_text"},
 wellness:{Nome:"title",Data:"date",Tipo:"rich_text",Dados:"rich_text"},cycle:{Nome:"title",Data:"date",Tipo:"rich_text",Dados:"rich_text"},
 mediaSections:{'Nome':'title','Tipo':'rich_text','Ícone':'rich_text','Cor':'rich_text'},media:{'Nome':'title','Seção':'relation','Autor':'rich_text','Status':'select','Avaliação':'number','Comentário':'rich_text','URL da capa':'rich_text','Link de origem':'rich_text','Fonte':'rich_text','Capa':'files'},
 habits:{'Nome':'title','Contexto':'select','Cor':'rich_text','Ícone':'rich_text','Início':'date'},habitLogs:{'Nome':'title','Hábito':'relation','Data':'date'},
 shopping:{'Nome':'title','Contexto':'select','Itens':'rich_text'},
 contacts:{'Nome':'title','Dia':'number','Mês':'number','Ano de nascimento':'number'},
 categories:{'Nome':'title','Tipo':'select'},transactions:{'Nome':'title','Categoria':'relation','Mês':'date','Valor':'number'},
 diary:{'Nome':'title','Data':'date','Conteúdo':'rich_text','Anexos':'files'},
 inbox:{'Nome':'title','Conteúdo':'rich_text'},
 projects:{'Nome':'title','Status':'select','Contexto':'select','Área':'select','Prazo final':'date','Descrição':'rich_text','Anexos':'files'},
 milestones:{'Nome':'title','Projeto':'relation','Prazo':'date','Concluído':'checkbox','Ordem':'number'},
 tasks:{'Nome':'title','Status':'status','Prioridade':'select','Contexto':'select','Projeto':'relation','Marco':'relation','Início':'date','Prazo':'date','Aguardando':'rich_text','Cobrar em':'date','Anotações':'rich_text','Concluída em':'date','Anexos':'files'},
};
const sources={};for(const [kind,spec] of Object.entries(specs))sources[kind]={id:sourceIds[kind],properties:Object.fromEntries(Object.entries(spec).map(([name,type])=>[name,{id:randomUUID(),name,type,...(type==='relation'?{relation:{data_source_id:sourceIds[name==='Seção'?'mediaSections':name==='Hábito'?'habits':name==='Categoria'?'categories':name==='Marco'?'milestones':'projects'],database_id:databases[name==='Seção'?'mediaSections':name==='Hábito'?'habits':name==='Categoria'?'categories':name==='Marco'?'milestones':'projects']}}:{})}]))};
process.env.UPSTASH_REDIS_REST_URL='https://redis.test';process.env.UPSTASH_REDIS_REST_TOKEN='redis-test-token';
const rows=new Map(),calls=[],redisRows=new Map();let creates=0,paginate=false,failShoppingWrite=false,failCompletionTaskWrite=false,failCompletionProjectWrite=false,normalizeCompletionDates=false,failSomedayMarker=false,failInboxArchive=false;
const kindBySource=id=>Object.keys(sourceIds).find(kind=>sourceIds[kind]===id);
function normalizeProperties(kind,properties) {
 return Object.fromEntries(Object.entries(properties).map(([name,value])=>{
  const type=sources[kind].properties[name].type;
  if(type==='files')value={files:value.files.map(file=>file.type==='file_upload'?{name:file.name,type:'file',file:{url:`https://files.notion.test/${file.file_upload.id}?signature=current`,expiry_time:'2099-01-01'}}:file)};
  if(normalizeCompletionDates&&kind==='tasks'&&name==='Concluída em'&&value.date?.start)value={date:{...value.date,start:new Date(Math.floor(Date.parse(value.date.start)/60000)*60000).toISOString()}};
  return [name,{...value,type}];
 }));
}
global.fetch=async(url,options={})=>{
 if(String(url).startsWith('https://covers.openlibrary.org/'))return new Response(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=','base64'),{headers:{'content-type':'image/png'}});
 if(url==='https://redis.test'){
  const cmd=JSON.parse(options.body);let result=null;
  if(cmd[0]==='GET')result=redisRows.get(cmd[1])||null;
  if(cmd[0]==='SET'){if(!cmd.includes('NX')||!redisRows.has(cmd[1])){redisRows.set(cmd[1],cmd[2]);result='OK';}}
  if(cmd[0]==='EVAL'){if(redisRows.get(cmd[3])===cmd[4]){redisRows.delete(cmd[3]);result=1;}else result=0;}
  return Response.json({result});
 }

 assert.equal(options.headers.Authorization,'Bearer test-notion-token');assert.equal(options.headers['Notion-Version'],'2025-09-03');
 const uri=new URL(url),route=uri.pathname.slice(3),method=options.method||'GET';
 const body=options.body instanceof FormData?options.body:options.body?JSON.parse(options.body):undefined;
 calls.push({route,method,body});
 if(failShoppingWrite&&method==='PATCH'&&body?.properties?.Itens){failShoppingWrite=false;return Response.json({message:"Falha simulada na lista"},{status:400});}
 if(failCompletionTaskWrite&&method==='PATCH'&&body?.properties?.Status&&kindBySource(rows.get(route.split('/')[2])?.parent.data_source_id)==='tasks'){failCompletionTaskWrite=false;return Response.json({message:'Falha simulada ao concluir tarefa'},{status:400});}
 if(failCompletionProjectWrite&&method==='PATCH'&&['Concluído','Cancelado'].includes(body?.properties?.Status?.select?.name)&&kindBySource(rows.get(route.split('/')[2])?.parent.data_source_id)==='projects'){failCompletionProjectWrite=false;return Response.json({message:'Falha simulada após concluir filhos'},{status:400});}
 if(failSomedayMarker&&method==='PATCH'&&kindBySource(rows.get(route.split('/')[2])?.parent.data_source_id)==='someday'&&body?.properties?.Dados&&JSON.parse(notionLib.plain(body.properties.Dados.rich_text)).promoted){failSomedayMarker=false;return Response.json({message:'Falha simulada na conversão da ideia'},{status:400});}
 if(failInboxArchive&&method==='PATCH'&&body?.in_trash&&kindBySource(rows.get(route.split('/')[2])?.parent.data_source_id)==='inbox'){failInboxArchive=false;return Response.json({message:'Falha simulada ao arquivar Inbox'},{status:400});}
 const reply=value=>Response.json(value);
 if(route.startsWith('/databases/')){const kind=Object.keys(databases).find(kind=>databases[kind]===route.split('/')[2]);assert.ok(kind);return reply({id:databases[kind],data_sources:[{id:sourceIds[kind]}]});}
 if(route.startsWith('/data_sources/')){
  const id=route.split('/')[2],kind=kindBySource(id);assert.ok(kind);
  if(route.endsWith('/query')){
   const matches=(row,filter)=>{if(!filter)return true;if(filter.or)return filter.or.some(f=>matches(row,f));if(filter.and)return filter.and.every(f=>matches(row,f));const value=row.properties[filter.property];if(filter.rich_text)return filter.rich_text.contains!=null?notionLib.plain(value?.rich_text).includes(filter.rich_text.contains):notionLib.plain(value?.rich_text)===filter.rich_text.equals;if(filter.date)return value?.date?.start===filter.date.equals;if(filter.relation)return (value?.relation||[]).some(p=>p.id===filter.relation.contains);throw Error('Filtro de teste não suportado');};
   const list=[...rows.values()].filter(row=>row.parent.data_source_id===id&&!row.in_trash&&matches(row,body.filter));
   const start=body.start_cursor?Number(body.start_cursor):0,size=paginate?1:100,end=start+size;
   return reply({results:list.slice(start,end),has_more:end<list.length,next_cursor:end<list.length?String(end):null});
  }
  if(method==='PATCH')for(const [name,property]of Object.entries(body.properties))sources[kind].properties[name]={id:randomUUID(),name,type:Object.keys(property)[0]};
  return reply(sources[kind]);
 }
 if(route==='/pages'&&method==='POST'){
  creates++;const kind=kindBySource(body.parent.data_source_id);assert.ok(kind);
  const row={id:randomUUID(),parent:body.parent,last_edited_time:new Date().toISOString(),properties:normalizeProperties(kind,body.properties),in_trash:false};rows.set(row.id,row);return reply(row);
 }
 if(route.startsWith('/pages/')){
  const row=rows.get(route.split('/')[2]);assert.ok(row);
  if(method==='PATCH'){
   if(body.properties)Object.assign(row.properties,normalizeProperties(kindBySource(row.parent.data_source_id),body.properties));
   if(body.in_trash)row.in_trash=true;
  }
  return reply(row);
 }
 if(route==='/file_uploads'){return reply({id:randomUUID(),status:'pending'});}
 if(route.startsWith('/file_uploads/')&&route.endsWith('/send')){assert.ok(body.get('file'));return reply({status:'uploaded'});}
 throw new Error(`Rota inesperada ${method} ${route}`);
};
(async()=>{
 const request=new Request('https://lifeos.test/api/session',{method:'POST',headers:{origin:'https://lifeos.test'}});
 assert.throws(()=>auth.authorize(request),error=>error.status===401);
 assert.throws(()=>auth.checkOrigin(new Request('https://lifeos.test/api',{headers:{origin:'https://evil.test'}})),error=>error.status===403);
 const cookie=auth.sessionCookie({id:'google:test-pericles',email:'periclesbernardes@gmail.com',name:'Péricles'}).split(';')[0];
 const logged=new Request('https://lifeos.test/api/notion',{headers:{cookie}});auth.authorize(logged);
 assert.equal(auth.authenticated(new Request('https://lifeos.test/api',{headers:{cookie:cookie+'bad'}})),false);
 let {state}=await notionLib.readSnapshot();assert.deepEqual(state,{reference:[],referenceConfigured:false,someday:[],somedayConfigured:false,nutrition:[],nutritionConfigured:false,vehicles:[],vehiclesConfigured:false,wellness:[],cycle:[],wellnessConfigured:false,cycleConfigured:false,mediaSections:[],media:[],mediaConfigured:false,projects:[],tasks:[],inbox:[],diary:[],diaryConfigured:true,categories:[],transactions:[],financeConfigured:true,contacts:[],contactsConfigured:false,shopping:[],shoppingConfigured:false,habits:[],habitLogs:[],habitsConfigured:false});
 const base=state;
 const file=new File(['arquivo de teste'],'ref.txt',{type:'text/plain'});
 const uploaded=await notionLib.uploadFile(file);
 await assert.rejects(()=>notionLib.uploadFile(new File([new Uint8Array(4*1024*1024+1)],'large.pdf')),error=>error.status===413);
 const next={diary:[],inbox:[],projects:[{id:'local-project',name:'Projeto',status:'active',context:'personal',area:'Casa',due:'2026-12-31',description:'Teste',attachments:[],milestones:[{id:'local-milestone',title:'Etapa',due:'2026-12-01',done:false}]}],tasks:[{id:'local-task',title:'Tarefa',status:'todo',priority:'medium',context:'personal',project:'local-project',milestone:'local-milestone',due:'2026-11-30',start:null,notes:'',waitingOn:'',followUp:null,completedAt:null,attachments:[{id:'local-file',...uploaded}]}]};
 assert.ok(hasChanges(base,next));
 const result=await synchronize(base,next);assert.equal(creates,3);assert.ok(result.bindings['local-project']);assert.ok(result.files['local-file'].url);
 await synchronize(base,next);assert.equal(creates,3,'Reenvio não deve criar duplicatas');
 ({state}=await notionLib.readSnapshot());assert.equal(state.projects.length,1);assert.equal(state.projects[0].milestones.length,1);assert.equal(state.tasks[0].project,state.projects[0].id);assert.equal(state.tasks[0].attachments.length,1);
 {
  const source=await notionLib.schema('tasks',true),row=structuredClone(rows.get(state.tasks[0].id));
  const stamp=Date.parse('2026-10-20T14:35:46.123Z');
  row.created_time='2026-10-20T14:35:00.000Z';
  for(const suffix of ['1','123','abcd']){
   row.properties[source.tracking.name]={rich_text:[{text:{content:'t'+stamp.toString(36)+suffix}}]};
   assert.equal(notionLib.decode('tasks',row,source)._createdAt,stamp,'Recupera sequência e horário original pelo ID estável');
  }
  row.properties[source.tracking.name]={rich_text:[{text:{content:'legacy-task'}}]};
  assert.equal(notionLib.decode('tasks',row,source)._createdAt,Date.parse(row.created_time),'Tarefas externas usam data de criação do Notion');
  row.properties['LifeOS Criado originalmente']={date:{start:'2025-01-01T10:00:00.000Z'}};
  assert.equal(notionLib.decode('tasks',row,source)._createdAt,Date.parse('2025-01-01T10:00:00.000Z'),'Restauração preserva criação original');
 }
 const edited=structuredClone(state);edited.tasks[0].notes='Nova anotação';
 const beforeCalls=calls.length;await synchronize(state,edited);
 const patches=calls.slice(beforeCalls).filter(call=>call.route.startsWith('/pages/')&&call.body.properties);
 assert.equal(patches.length,1);assert.deepEqual(Object.keys(patches[0].body.properties),['Anotações'],'Edição parcial preserva campos não alterados');
 ({state}=await notionLib.readSnapshot());
 const completed=structuredClone(state);completed.tasks[0].status='done';completed.tasks[0].completedAt=Date.now();await synchronize(state,completed);
 ({state}=await notionLib.readSnapshot());assert.equal(state.tasks[0].status,'done');assert.equal(typeof state.tasks[0].completedAt,'number');
 const invalid=structuredClone(state);invalid.projects[0].milestones[0].due='2027-01-01';
 await assert.rejects(()=>synchronize(state,invalid),/ultrapassa/);
 const conflicted=structuredClone(state);conflicted.tasks[0].notes='Edição no app';
 rows.get(state.tasks[0].id).properties['Anotações']={type:'rich_text',rich_text:[{text:{content:'Edição externa'}}]};
 await assert.rejects(()=>synchronize(state,conflicted),error=>error.status===409);
 ({state}=await notionLib.readSnapshot());
 const noFiles=structuredClone(state);noFiles.tasks[0].attachments=[];await synchronize(state,noFiles);
 ({state}=await notionLib.readSnapshot());assert.equal(state.tasks[0].attachments.length,0);
 paginate=true;
 const extra={...rows.get(state.tasks[0].id),id:randomUUID()};extra.properties=structuredClone(extra.properties);rows.set(extra.id,extra);
 ({state}=await notionLib.readSnapshot());assert.equal(state.tasks.length,2,'A consulta precisa seguir a paginação');
 await assert.rejects(()=>notionLib.ownedPage('projects',state.tasks[0].id),error=>error.status===403);
 const deleted={diary:[],inbox:[],projects:[],tasks:state.tasks.map(task=>({...task,project:null,milestone:null}))};
 await synchronize(state,deleted);
 ({state}=await notionLib.readSnapshot());assert.equal(state.projects.length,0);assert.equal(state.tasks.length,0,'Excluir projeto remove tarefas vinculadas');
 const empty={projects:[],tasks:[],inbox:[],diary:[],diaryConfigured:true};await synchronize(state,empty);({state}=await notionLib.readSnapshot());assert.equal(state.tasks.length,0);

 const inboxNext={...state,inbox:[{id:'inbox-local',text:'Primeira linha\nSegunda linha\nTerceira linha',createdAt:Date.now()}]};
 await synchronize(state,inboxNext);await synchronize(state,inboxNext);
 ({state}=await notionLib.readSnapshot());assert.equal(state.inbox.length,1);assert.equal(state.inbox[0].text,inboxNext.inbox[0].text);assert.equal(state.inbox[0].name,'Primeira linha');assert.equal(state.inbox[0].legacyId,'inbox-local');
 const inboxEdited=structuredClone(state);inboxEdited.inbox[0].text='Novo título\nNovo conteúdo';await synchronize(state,inboxEdited);
 ({state}=await notionLib.readSnapshot());assert.equal(state.inbox[0].name,'Novo título');assert.equal(state.inbox[0].text,'Novo título\nNovo conteúdo');
 const inboxConflict=structuredClone(state);inboxConflict.inbox[0].text='Edição local';rows.get(state.inbox[0].id).properties['Conteúdo']={type:'rich_text',rich_text:[{text:{content:'Edição externa'}}]};
 await assert.rejects(()=>synchronize(state,inboxConflict),error=>error.status===409);
 ({state}=await notionLib.readSnapshot());
 const converted={...state,inbox:[],tasks:[{id:'converted-task',title:'Edição externa',status:'todo',priority:'medium',context:'work',project:null,milestone:null,notes:'',attachments:[]}]};
 const workingFetch=global.fetch;let interrupt=true;global.fetch=async(url,options)=>{const response=await workingFetch(url,options);if(interrupt&&options?.method==='POST'&&new URL(url).pathname==='/v1/pages'){interrupt=false;return Response.json({message:'Falha depois de criar o destino'},{status:502});}return response;};
 const countBefore=creates;await assert.rejects(()=>synchronize(state,converted),/Falha depois/);global.fetch=workingFetch;assert.equal((await notionLib.readSnapshot()).state.inbox.length,1,'Uma falha na conversão deve manter o Inbox');
 const conversionStart=calls.length;await synchronize(state,converted);assert.equal(creates,countBefore+1,'Reenvio da conversão não deve duplicar o destino');
 const conversionCalls=calls.slice(conversionStart);const createIndex=conversionCalls.findIndex(call=>call.route.startsWith('/pages')&&call.body?.properties);const deleteIndex=conversionCalls.findIndex(call=>call.body?.in_trash);assert.ok(createIndex>=0&&deleteIndex>createIndex,'A conversão cria o destino antes de remover o Inbox');
 ({state}=await notionLib.readSnapshot());assert.equal(state.inbox.length,0);assert.equal(state.tasks.length,1);
 await synchronize(state,{projects:[],tasks:[],inbox:[],diary:[],diaryConfigured:true});

 ({state}=await notionLib.readSnapshot());
 const daily={...state,diary:[{id:'d2026-10-04',date:'2026-10-04',text:'## Meu dia\n**Bom** e *tranquilo*\n- Caminhada',attachments:[{id:'diary-file',...uploaded}]}]};
 await synchronize(state,daily);await synchronize(state,daily);
 ({state}=await notionLib.readSnapshot());assert.equal(state.diary.length,1);assert.equal(state.diary[0].date,'2026-10-04');assert.equal(state.diary[0].name,'04/10/2026');assert.equal(state.diary[0].text,daily.diary[0].text);assert.equal(state.diary[0].attachments[0].kind,'diary');
 const duplicate={...state,diary:[...state.diary,{id:'different-id',date:'2026-10-04',text:'Outra',attachments:[]}]};await assert.rejects(()=>synchronize(state,duplicate),/uma entrada/);
 const competing={...state,diary:[{id:'different-id',date:'2026-10-04',text:'Outra',attachments:[]}]};await assert.rejects(()=>synchronize(state,competing),/Já existe/);
 const changedDiary=structuredClone(state);changedDiary.diary[0].text='Texto editado';await synchronize(state,changedDiary);
 ({state}=await notionLib.readSnapshot());assert.equal(state.diary[0].text,'Texto editado');
 // Rich diary persists structured formatting independently of its searchable plain text.
 const richDiary=structuredClone(state),richEntry=richDiary.diary[0];
 richEntry.doc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Dia especial',marks:[{type:'bold'}]}]},{type:'ideaImage',attrs:{attachmentId:richEntry.attachments[0].name,alt:'Recordação'}},{type:'ideaBookmark',attrs:{id:'diary-link',url:'https://example.com/consulta',title:'Consulta',description:'Descrição',image:''}}]};
 richEntry.text=require(path.join(temp,'lib/diary')).diaryText(richEntry);
 await synchronize(state,richDiary);({state}=await notionLib.readSnapshot());assert.deepEqual(state.diary[0].doc,richEntry.doc);assert.equal(state.diary[0].text,richEntry.text);assert.ok(state.diary[0].attachments[0].pageId);assert.equal(state.diary[0].attachments[0].kind,'diary');
 const replayRich=structuredClone(richDiary);await synchronize(richDiary,replayRich);
 const badRich=structuredClone(state);badRich.diary[0].doc.content[1].attrs.attachmentId='missing.webp';await assert.rejects(()=>synchronize(state,badRich),/sem anexo/);
 const staleRich=structuredClone(state),newRich=structuredClone(state);newRich.diary[0].doc.content[0].content[0].marks=[{type:'italic'}];await synchronize(state,newRich);
 const competingRich=structuredClone(staleRich);competingRich.diary[0].doc.content[0].content[0].marks=[{type:'strike'}];await assert.rejects(()=>synchronize(staleRich,competingRich),e=>e.status===409);
 ({state}=await notionLib.readSnapshot());
 const {moveInboxToDiary}=require(path.join(temp,'lib/diary'));
 const inboxWithImage={...state,inbox:[...state.inbox,{id:'inbox-diary-image',text:'Texto e imagem do Inbox',attachments:[{id:'inbox-diary-attachment',...uploaded,name:'inbox-12345678-1234-1234-1234-123456789abc.png'}]}]};
 await synchronize(state,inboxWithImage);const imageSource=(await notionLib.readSnapshot()).state;
 const sourceImage=imageSource.inbox.find(i=>i.text==='Texto e imagem do Inbox');sourceImage.attachments[0].notion.file.url+='&expired=1';
 const imageMoved=moveInboxToDiary(imageSource,sourceImage.id,'2026-10-04');failInboxArchive=true;
 await assert.rejects(()=>synchronize(imageSource,imageMoved),/Falha simulada/);
 let recoveredImages=(await notionLib.readSnapshot()).state;assert.ok(recoveredImages.inbox.some(i=>i.id===sourceImage.id));assert.equal(recoveredImages.diary[0].attachments.length,2,'Destino salvo antes de arquivar origem');
 const createdBeforeRetry=creates;await synchronize(imageSource,imageMoved);assert.equal(creates,createdBeforeRetry);({state}=await notionLib.readSnapshot());assert.ok(!state.inbox.some(i=>i.id===sourceImage.id));assert.equal(state.diary[0].attachments.length,2);assert.ok(state.diary[0].attachments.every(a=>a.kind==='diary'&&a.pageId===state.diary[0].id));assert.ok(state.diary[0].text.includes('Texto e imagem do Inbox'));assert.ok(state.diary[0].doc.content.some(n=>n.type==='ideaImage'&&n.attrs.attachmentId===sourceImage.attachments[0].name));
 // A new image-only day embeds the image with a backing file owned by the Diary.
 await synchronize(state,{...state,inbox:[{id:'inbox-only-image',text:'',attachments:[{id:'image-only-file',...uploaded,name:'inbox-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png'}]}]});
 const onlyImageBase=(await notionLib.readSnapshot()).state,onlyImageMove=moveInboxToDiary(onlyImageBase,onlyImageBase.inbox[0].id,'2026-10-05');await synchronize(onlyImageBase,onlyImageMove);({state}=await notionLib.readSnapshot());assert.equal(state.diary.find(i=>i.date==='2026-10-05').attachments.length,1);assert.ok(state.diary.find(i=>i.date==='2026-10-05').doc.content.some(n=>n.type==='ideaImage'));
 // Keep subsequent fixture assertions scoped to the original day.
 const clearOnlyImage={...state,diary:state.diary.filter(i=>i.date==='2026-10-04')};await synchronize(state,clearOnlyImage);({state}=await notionLib.readSnapshot());
 const emptyDiary=structuredClone(state);emptyDiary.diary[0]=require(path.join(temp,'lib/diary')).removeDiaryAttachments(emptyDiary.diary[0],[]);await synchronize(state,emptyDiary);
 ({state}=await notionLib.readSnapshot());assert.equal(state.diary[0].attachments.length,0);
 delete process.env.NOTION_DIARY_DATABASE_ID;
 const withoutDiary=(await notionLib.readSnapshot()).state;assert.equal(withoutDiary.diaryConfigured,false);assert.deepEqual(withoutDiary.diary,[]);
 await assert.rejects(()=>synchronize(withoutDiary,{...withoutDiary,diary:[{id:'new-day',date:'2026-10-05',text:'Teste',attachments:[]}]}),/NOTION_DIARY_DATABASE_ID/);
 process.env.NOTION_DIARY_DATABASE_ID='diary-test-db';

 ({state}=await notionLib.readSnapshot());
 const withFinance={...state,categories:[{id:'cat-in',name:'Salário',flow:'in'},{id:'cat-out',name:'Aluguel',flow:'out'}],transactions:[{id:'tx-one',name:'Salário',category:'cat-in',month:'2026-10',amount:12345}]};
 await synchronize(state,withFinance);const countFinance=creates;await synchronize(state,withFinance);assert.equal(creates,countFinance,'Finanças não deve duplicar após reenvio');
 ({state}=await notionLib.readSnapshot());assert.equal(state.transactions[0].amount,12345);assert.equal(state.transactions[0].date,'2026-10-01');assert.equal(state.categories.length,2);assert.equal(rows.get(state.transactions[0].id).properties['Valor'].number,123.45);
 const financialCategory=state.categories[0],financeRows=structuredClone(state.transactions),hiddenFinance=structuredClone(state);hiddenFinance.categories[0].archived=true;await synchronize(state,hiddenFinance);
 ({state}=await notionLib.readSnapshot());assert.equal(state.categories[0].archived,true);assert.deepEqual(state.transactions,financeRows,'Hiding category preserves all transactions');assert.equal(sources.categories.properties.Inativa.type,'checkbox');
 const reactivatedFinance=structuredClone(state);reactivatedFinance.categories[0].archived=false;await synchronize(state,reactivatedFinance);({state}=await notionLib.readSnapshot());assert.equal(state.categories[0].id,financialCategory.id);assert.equal(state.categories[0].archived,false);assert.equal(state.transactions.length,1);
 const editFinance=structuredClone(state);editFinance.transactions[0].amount=30000;editFinance.transactions[0].notes='Observação financeira\nCom duas linhas';editFinance.transactions[0].date='2026-11-18';await synchronize(state,editFinance);
 ({state}=await notionLib.readSnapshot());assert.equal(state.transactions[0].amount,30000);assert.equal(state.transactions[0].notes,'Observação financeira\nCom duas linhas');assert.equal(sources.transactions.properties['Observação'].type,'rich_text');assert.equal(state.transactions[0].date,'2026-11-18');
 assert.equal(rows.get(state.transactions[0].id).properties['Mês'].date.start,'2026-11-18');
 const clearedNote=structuredClone(state);clearedNote.transactions[0].notes='';await synchronize(state,clearedNote);({state}=await notionLib.readSnapshot());assert.equal(state.transactions[0].notes,'');
 const invalidDateFinance=structuredClone(state);invalidDateFinance.transactions[0].date='2026-02-30';await assert.rejects(()=>synchronize(state,invalidDateFinance),/Data inválida/);
 const invalidFinance=structuredClone(state);invalidFinance.transactions[0].amount=-1;await assert.rejects(()=>synchronize(state,invalidFinance),/valor positivo/);
 const missingCategory=structuredClone(state);missingCategory.categories=[];await assert.rejects(()=>synchronize(state,missingCategory),/categoria/);
 const financeDeleteStart=calls.length;await synchronize(state,{...state,categories:[],transactions:[]});const trashCalls=calls.slice(financeDeleteStart).filter(call=>call.body?.in_trash);assert.equal(trashCalls[0].route,`/pages/${state.transactions[0].id}`,'Lançamentos excluídos antes das categorias');
 delete process.env.NOTION_FINANCE_CATEGORIES_DATABASE_ID;delete process.env.NOTION_FINANCE_TRANSACTIONS_DATABASE_ID;const optionalFinance=(await notionLib.readSnapshot()).state;assert.equal(optionalFinance.financeConfigured,false);assert.deepEqual(optionalFinance.categories,[]);assert.deepEqual(optionalFinance.transactions,[]);
 {
 process.env.NOTION_CONTACTS_DATABASE_ID='contacts-test';
 ({state}=await notionLib.readSnapshot());assert.equal(state.contactsConfigured,true);assert.equal(sources.contacts.properties['Observações'].type,'rich_text','Campo novo criado no banco legado');
 const contactNext=structuredClone(state);contactNext.contacts=[{id:'contact-known',name:'Ana',day:4,month:10,year:1990,notes:'Prima\nhttps://example.com'},{id:'contact-unknown',name:'João',day:29,month:2,year:null}];
 const contactStart=calls.length;await synchronize(state,contactNext);await synchronize(state,contactNext);
 ({state}=await notionLib.readSnapshot());assert.equal(state.contacts.length,2);assert.equal(state.contacts.find(p=>p.name==='Ana').year,1990);assert.equal(state.contacts.find(p=>p.name==='Ana').notes,'Prima\nhttps://example.com');const unknown=state.contacts.find(p=>p.name==='João');assert.equal(unknown.year,null);assert.equal(rows.get(unknown.id).properties['Ano de nascimento'].number,null);
 const changedContact=structuredClone(state);changedContact.contacts.find(p=>p.name==='Ana').name='Ana Costa';await synchronize(state,changedContact);({state}=await notionLib.readSnapshot());assert.ok(state.contacts.some(p=>p.name==='Ana Costa'));
 const notesOnly=structuredClone(state);notesOnly.contacts.find(p=>p.name==='Ana Costa').notes='Informação atualizada';assert.deepEqual(diffState(state,notesOnly).contacts.upserts[0].keys,['notes']);await synchronize(state,notesOnly);({state}=await notionLib.readSnapshot());assert.equal(state.contacts.find(p=>p.name==='Ana Costa').notes,'Informação atualizada');
 const clearedNotes=structuredClone(state);clearedNotes.contacts.find(p=>p.name==='Ana Costa').notes='';await synchronize(state,clearedNotes);({state}=await notionLib.readSnapshot());assert.equal(state.contacts.find(p=>p.name==='Ana Costa').notes,'');
 const badContact=structuredClone(state);badContact.contacts[0].day=32;await assert.rejects(()=>synchronize(state,badContact),/inválida/);
 const inboxContact=structuredClone(state);inboxContact.inbox.push({id:'inbox-contact',text:'Bia\n12/12',createdAt:Date.now()});await synchronize(state,inboxContact);({state}=await notionLib.readSnapshot());
 const conversion=structuredClone(state);const source=conversion.inbox.find(p=>p.text==='Bia\n12/12');conversion.inbox=conversion.inbox.filter(p=>p.id!==source.id);conversion.contacts.push({id:'bia-contact',name:'Bia',day:12,month:12,year:null});const conversionStart=calls.length;await synchronize(state,conversion);const conversionCalls=calls.slice(conversionStart);assert.ok(conversionCalls.findIndex(c=>c.route==='/pages'&&c.body?.parent?.data_source_id===sourceIds.contacts)<conversionCalls.findIndex(c=>c.route===`/pages/${source.id}`&&c.body?.in_trash),'Contato salvo antes da remoção do Inbox');
 ({state}=await notionLib.readSnapshot());await synchronize(state,{...state,contacts:[]});assert.equal((await notionLib.readSnapshot()).state.contacts.length,0);
 delete process.env.NOTION_CONTACTS_DATABASE_ID;assert.equal((await notionLib.readSnapshot()).state.contactsConfigured,false);
 }
 {
 process.env.NOTION_SHOPPING_DATABASE_ID='shopping-test';({state}=await notionLib.readSnapshot());assert.equal(state.shoppingConfigured,true);
 const draft=structuredClone(state);draft.shopping=[{id:'shopping-test-list',name:'Mercado',context:'personal',items:[{id:'one',text:'Leite'},{id:'two',text:'Café'}]}];await synchronize(state,draft);await synchronize(state,draft);({state}=await notionLib.readSnapshot());assert.equal(state.shopping.length,1);assert.equal(state.shopping[0].items[1].text,'Café');assert.equal(state.shopping[0].context,'personal');
 const reordered=structuredClone(state);reordered.shopping[0].items.reverse();await synchronize(state,reordered);({state}=await notionLib.readSnapshot());assert.deepEqual(state.shopping[0].items.map(p=>p.text),['Café','Leite']);const restored=structuredClone(state);restored.shopping[0].items.reverse();await synchronize(state,restored);({state}=await notionLib.readSnapshot());const edited=structuredClone(state);edited.shopping[0].items.shift();await synchronize(state,edited);({state}=await notionLib.readSnapshot());assert.equal(state.shopping[0].items.length,1);
 const conflictBase=structuredClone(state),desired=structuredClone(state);desired.shopping[0].items.push({id:'three',text:'Ovos'});const row=rows.get(state.shopping[0].id);const prior=row.properties.Itens;row.properties.Itens={type:'rich_text',rich_text:[{text:{content:JSON.stringify([{id:'remote',text:'Arroz'}])}}]};await assert.rejects(()=>synchronize(conflictBase,desired),/alterado no Notion/);row.properties.Itens=prior;
 const inboxNext=structuredClone(state);inboxNext.inbox.push({id:'shopping-inbox',text:'MERCADO\nBananas\nOvos',createdAt:Date.now()});await synchronize(state,inboxNext);({state}=await notionLib.readSnapshot());const source=state.inbox.find(p=>p.text==='MERCADO\nBananas\nOvos');const {shoppingFromInbox}=require(path.join(temp,'lib/shopping'));const merged=shoppingFromInbox(state.shopping,source.text,'personal');const converted={...state,shopping:merged.lists,inbox:state.inbox.filter(p=>p.id!==source.id)};failShoppingWrite=true;await assert.rejects(()=>synchronize(state,converted),/Falha simulada/);assert.equal(rows.get(source.id).in_trash,false,'Falha de gravação não exclui Inbox');const start=calls.length;await synchronize(state,converted);const writes=calls.slice(start);assert.ok(writes.findIndex(c=>c.route===`/pages/${state.shopping[0].id}`&&c.body?.properties)<writes.findIndex(c=>c.route===`/pages/${source.id}`&&c.body?.in_trash));await synchronize(state,converted);({state}=await notionLib.readSnapshot());assert.deepEqual(state.shopping[0].items.map(p=>p.text),['Bananas','Ovos','Café']);
 await synchronize(state,{...state,shopping:[]});assert.equal((await notionLib.readSnapshot()).state.shopping.length,0);delete process.env.NOTION_SHOPPING_DATABASE_ID;assert.equal((await notionLib.readSnapshot()).state.shoppingConfigured,false);
 }
 {
 process.env.NOTION_HABITS_DATABASE_ID='habits-test';process.env.NOTION_HABIT_LOGS_DATABASE_ID='habit-logs-test';({state}=await notionLib.readSnapshot());assert.equal(state.habitsConfigured,true);
 const {habitToday}=require(path.join(temp,'lib/habits'));const day=habitToday(),next=structuredClone(state);next.habits=[{id:'habit-one',name:'Leitura',context:'personal',color:'blue',icon:'book',start:day}];next.habitLogs=[{id:'habit-log-one',name:'Leitura',habit:'habit-one',date:day}];const writesBefore=calls.length;await synchronize(state,next);await synchronize(state,next);({state}=await notionLib.readSnapshot());assert.equal(state.habits.length,1);assert.equal(state.habitLogs.length,1);assert.equal(state.habitLogs[0].habit,state.habits[0].id);assert.equal(state.habits[0].color,'blue');
 const remarked=structuredClone(state);remarked.habitLogs=[{...remarked.habitLogs[0],id:'rapid-remark',_notionId:undefined}];
 const remarkResult=await synchronize(state,remarked);assert.equal(remarkResult.bindings['rapid-remark'],state.habitLogs[0].id);
 ({state}=await notionLib.readSnapshot());assert.equal(state.habitLogs.length,1,'Rapid uncheck/recheck reuses the same daily completion');
 const retryBase={...state,habitLogs:[]},retryNext={...state,habitLogs:[{...state.habitLogs[0],id:'retry-other-id',_notionId:undefined}]};
 await synchronize(retryBase,retryNext);assert.equal((await notionLib.readSnapshot()).state.habitLogs.length,1,'Existing completion is idempotent even with a new local ID');
 const edited=structuredClone(state);edited.habits[0].color='green';edited.habits[0].icon='water';await synchronize(state,edited);({state}=await notionLib.readSnapshot());assert.equal(state.habits[0].icon,'water');assert.equal(state.habitLogs.length,1);
 const ended=structuredClone(state);ended.habits[0].archived=true;await synchronize(state,ended);({state}=await notionLib.readSnapshot());assert.equal(state.habits[0].archived,true);assert.equal(state.habitLogs.length,1);const originalHabitId=state.habits[0].id;const recovered=structuredClone(state);recovered.habits[0].archived=false;await synchronize(state,recovered);({state}=await notionLib.readSnapshot());assert.equal(state.habits[0].archived,false);assert.equal(state.habits[0].id,originalHabitId);assert.equal(state.habitLogs.length,1);
 const duplicate=structuredClone(state);duplicate.habitLogs.push({...duplicate.habitLogs[0],id:'duplicate-log',_notionId:undefined});await assert.rejects(()=>synchronize(state,duplicate),/marcação por dia/);
 const invalid=structuredClone(state);invalid.habits[0].color='invalid';await assert.rejects(()=>synchronize(state,invalid),/cor e um ícone/);
 const trashStart=calls.length;await synchronize(state,{...state,habits:[],habitLogs:[]});const trash=calls.slice(trashStart).filter(p=>p.body?.in_trash);assert.equal(trash[0].route,`/pages/${state.habitLogs[0].id}`);assert.equal((await notionLib.readSnapshot()).state.habits.length,0);
 delete process.env.NOTION_HABITS_DATABASE_ID;delete process.env.NOTION_HABIT_LOGS_DATABASE_ID;assert.equal((await notionLib.readSnapshot()).state.habitsConfigured,false);
 }
 {
 process.env.UPSTASH_REDIS_REST_URL='https://redis.test';process.env.UPSTASH_REDIS_REST_TOKEN='redis-test-token';process.env.NOTION_SHOPPING_DATABASE_ID='shopping-test';process.env.NOTION_CONTACTS_DATABASE_ID='contacts-test';process.env.NOTION_FINANCE_CATEGORIES_DATABASE_ID='finance-categories-test';process.env.NOTION_FINANCE_TRANSACTIONS_DATABASE_ID='finance-transactions-test';process.env.NOTION_HABITS_DATABASE_ID='habits-test';process.env.NOTION_HABIT_LOGS_DATABASE_ID='habit-logs-test';
 const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
 const {habitToday}=require(path.join(temp,'lib/habits')),day=habitToday();let stateA=(await notionLib.readSnapshot(false,A)).state;
 const initialB=(await notionLib.readSnapshot(false,B)).state;assert.equal(initialB.projects.length,0);assert.equal(initialB.tasks.length,0);assert.equal(initialB.inbox.length,0);assert.equal(initialB.diary.length,0);
 function privateNext(base,prefix){const next=structuredClone(base);next.projects.push({id:prefix+'p',name:prefix+'projeto',status:'active',context:'personal',area:'',due:null,description:'',attachments:[],milestones:[{id:prefix+'m',title:'Marco',due:null,done:false}]});next.tasks.push({id:prefix+'t',title:prefix+'tarefa',status:'todo',priority:'medium',context:'personal',project:prefix+'p',milestone:prefix+'m',attachments:[],notes:'',due:null,start:null,followUp:null,waitingOn:'',completedAt:null});next.inbox.push({id:prefix+'i',text:prefix+'segredo',createdAt:Date.now()});next.diary.push({id:prefix+'d',date:'2026-09-17',text:prefix+'diário',attachments:[]});next.habits.push({id:prefix+'h',name:prefix+'hábito',context:'personal',color:'blue',icon:'book',start:day});next.habitLogs.push({id:prefix+'l',name:'Hábito',habit:prefix+'h',date:day});return next;}
 let nextA=privateNext(stateA,'A');nextA.shopping.push({id:'shared-shop',name:'Mercado compartilhado',context:'personal',items:[{id:'milk',text:'Leite'}]});nextA.contacts.push({id:'shared-contact',name:'Contato compartilhado',day:1,month:1,year:null});nextA.categories.push({id:'shared-cat',name:'Receita compartilhada',flow:'in'});nextA.transactions.push({id:'shared-tx',name:'Receita compartilhada',category:'shared-cat',date:day,amount:10000,notes:''});await synchronize(stateA,nextA,A);
 const stateB=(await notionLib.readSnapshot(false,B)).state;assert.equal(stateB.projects.length,0);assert.equal(stateB.habits.length,0);assert.equal(stateB.shopping.length,1);assert.equal(stateB.contacts.length,1);assert.equal(stateB.transactions.length,1);let nextB=privateNext(stateB,'B');await synchronize(stateB,nextB,B);
 stateA=(await notionLib.readSnapshot(false,A)).state;const readB=(await notionLib.readSnapshot(false,B)).state;assert.ok(stateA.projects.some(p=>p.name==='Aprojeto'));assert.ok(!JSON.stringify(stateA).includes('Bsegredo'));assert.ok(!JSON.stringify(readB).includes('Asegredo'));assert.equal(readB.diary.length,1);assert.equal(readB.habitLogs.length,1);const projectA=stateA.projects.find(p=>p.name==='Aprojeto');await assert.rejects(()=>notionLib.ownedPage('projects',projectA.id,B),error=>error.status===403);
 const stolen=structuredClone(readB);stolen.projects.push({...projectA,name:'Ataque'});await assert.rejects(()=>synchronize(readB,stolen,B),error=>error.status===403);const deleteOther=structuredClone(readB);deleteOther.projects.push(projectA);await assert.rejects(()=>synchronize(deleteOther,readB,B),error=>error.status===403);
 const forgedUpload=structuredClone(readB);forgedUpload.tasks[0].attachments=[{id:'forged',name:'file.txt',uploadId:'secret-file',uploadProof:auth.seal({user:A.id,uploadId:'secret-file',exp:Date.now()+10000})}];await assert.rejects(()=>synchronize(readB,forgedUpload,B),error=>error.status===403);
 const sharedEdit=structuredClone(readB);sharedEdit.shopping[0].items.push({id:'eggs',text:'Ovos'});await synchronize(readB,sharedEdit,B);const after=(await notionLib.readSnapshot(false,A)).state;assert.equal(after.shopping[0].items.length,2);const editor=rows.get(after.shopping[0].id).properties['LifeOS Último editor'];assert.ok(notionLib.plain(editor.rich_text).includes('Letícia'));const activity=await require(path.join(temp,'lib/server/coordination')).sharedActivity();assert.equal(activity.shopping.email,B.email);
 // Measure the actual queried sources with populated unrelated private banks.
 const scopedBase=(await notionLib.readSnapshot(false,B)).state;
 const scenarios=[['shopping',value=>value.shopping[0].name+=' teste',['shopping']],['diary',value=>value.diary[0].text+=' teste',['diary']],['transactions',value=>value.transactions[0].notes='teste',['categories','transactions']],['tasks',value=>value.tasks[0].notes='teste',['projects','milestones','tasks']],['habitLogs',value=>value.habitLogs=[],['habits','habitLogs']]];
 for(const [label,edit,expected] of scenarios){
   const current=(await notionLib.readSnapshot(false,B)).state,next=structuredClone(current);edit(next);
   const start=calls.length;await synchronize(current,next,B);
   const queried=calls.slice(start).filter(c=>c.route.endsWith('/query')).map(c=>Object.keys(sourceIds).find(kind=>c.route.includes(sourceIds[kind])));
   assert.deepEqual([...new Set(queried)].sort(),expected.sort(),'Somente bancos necessários: '+label);
 }
 const noOp=(await notionLib.readSnapshot(false,B)).state,noOpStart=calls.length;await synchronize(noOp,noOp,B);assert.equal(calls.slice(noOpStart).filter(c=>c.route.endsWith('/query')).length,0);
 const staleDelete=structuredClone(readB);staleDelete.shopping=[];await assert.rejects(()=>synchronize(readB,staleDelete,B),/alterado desde/);
 const {withWriteLock}=require(path.join(temp,'lib/server/coordination'));let release;const pending=withWriteLock(async guard=>{await guard();await new Promise(resolve=>release=resolve);});for(let i=0;i<5&&!release;i++)await new Promise(resolve=>setImmediate(resolve));await assert.rejects(()=>withWriteLock(async()=>{}),/Outro usuário/);release();await pending;assert.equal(redisRows.has('lifeos:write:v1'),false);
 }
 {
 process.env.NOTION_MEDIA_DATABASE_ID='media-test';process.env.NOTION_MEDIA_SECTIONS_DATABASE_ID='media-sections-test';
 const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
 let state=(await notionLib.readSnapshot(false,B)).state;const next=structuredClone(state);
 next.mediaSections=[{id:'section-book',name:'Leitura',type:'book',icon:'book',color:'#6ea8fe'}];
 next.media=[{id:'media-book',name:'Duna',year:1998,platforms:'Nintendo 64, Nintendo Switch',section:'section-book',author:'Frank Herbert',status:'planned',rating:0,comment:'',coverUrl:'https://covers.openlibrary.org/b/id/123-M.jpg',sourceUrl:'https://openlibrary.org/works/OL1W',provider:'Open Library',attachments:[]}];
 const start=calls.length;await synchronize(state,next,B);await synchronize(state,next,B);
 assert.ok(calls.slice(start).filter(c=>c.route.endsWith('/query')).every(c=>c.route.includes(sourceIds.media)||c.route.includes(sourceIds.mediaSections)));
 state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.media.length,1);assert.equal(state.media[0].section,state.mediaSections[0].id);assert.equal(state.media[0].author,'Frank Herbert');assert.equal(state.media[0].year,1998);assert.equal(state.media[0].platforms,'Nintendo 64, Nintendo Switch');assert.equal((await notionLib.readSnapshot(false,A)).state.media.length,0);
 const noDate=structuredClone(state);noDate.media[0].status='done';await assert.rejects(()=>synchronize(state,noDate,B),/data de conclusão/);const rated=structuredClone(state);rated.media[0].rating=5;rated.media[0].status='done';rated.media[0].completedOn='2026-10-05';rated.media[0].comment='Gostei';await synchronize(state,rated,B);
 const stale=structuredClone(state);stale.media[0].rating=3;await assert.rejects(()=>synchronize(state,stale,B),/alterado no Notion/);
 state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.media[0].rating,5);assert.equal(state.media[0].status,'done');assert.equal(state.media[0].completedOn,'2026-10-05');
 await assert.rejects(()=>notionLib.ownedPage('media',state.media[0].id,A),e=>e.status===403);
 const invalid=structuredClone(state);invalid.media[0].rating=6;await assert.rejects(()=>synchronize(state,invalid,B),/inválidos/);
 const ownUpload=structuredClone(state);ownUpload.media[0].coverUrl='';ownUpload.media[0].attachments=[{id:'cover',name:'capa.png',uploadId:'cover-upload',uploadProof:auth.seal({user:B.id,uploadId:'cover-upload',exp:Date.now()+60000})}];await synchronize(state,ownUpload,B);
 state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.media[0].attachments[0].kind,'media');assert.equal(state.media[0].attachments[0].pageId,state.media[0].id);
 const foreign=structuredClone((await notionLib.readSnapshot(false,A)).state);foreign.mediaSections.push(state.mediaSections[0]);foreign.media.push(state.media[0]);const foreignBase=(await notionLib.readSnapshot(false,A)).state;await assert.rejects(()=>synchronize(foreignBase,foreign,A),e=>e.status===403);
 const blankSection=rows.get(state.mediaSections[0].id);for(const name of ['Nome','Tipo','Ícone','Cor']){const type=name==='Nome'?'title':'rich_text';blankSection.properties[name]={type,[type]:[]};}state=(await notionLib.readSnapshot(false,B)).state;const {createMainSections}=require(path.join(temp,'lib/entertainment'));const repaired={...state,mediaSections:createMainSections(state.mediaSections,()=> 'new-section-'+randomUUID())};await synchronize(state,repaired,B);state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.mediaSections.length,4);assert.equal(state.media[0].section,blankSection.id);assert.equal(state.media[0].name,'Duna');assert.equal(state.mediaSections.find(p=>p.id===blankSection.id).name,'Leitura');
 const changedCover=structuredClone(state);changedCover.media[0].attachments[0].notion.file.url='https://files.test/different-cover';await assert.rejects(()=>synchronize(changedCover,{...changedCover,media:[]},B),e=>e.status===409);
 state.media[0].attachments[0].id='local-cover-id';state.media[0].attachments[0].notion.file.url+='?expired=1';
 const beforeTrash=calls.length;await synchronize(state,{...state,media:[],mediaSections:[]},B);const trash=calls.slice(beforeTrash).filter(c=>c.body?.in_trash);assert.equal(trash[0].route,'/pages/'+state.media[0].id);assert.equal(trash[1].route,'/pages/'+state.mediaSections[0].id);await synchronize(state,{...state,media:[],mediaSections:[]},B);await assert.rejects(()=>synchronize(state,{...state,media:[],mediaSections:[]},A),e=>e.status===403);
 assert.equal((await notionLib.readSnapshot(false,B)).state.media.length,0);
 delete process.env.NOTION_MEDIA_DATABASE_ID;delete process.env.NOTION_MEDIA_SECTIONS_DATABASE_ID;
 }
 // Sparse saves preserve unrelated rows and retain conflict/access checks.
 {
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const startState=(await notionLib.readSnapshot()).state;
  const added={...startState,inbox:[...startState.inbox,{id:'delta-inbox',text:'Entrada incremental'}]};
  const delta=compactSyncState(startState,added);assert.equal(delta.next.inbox.length,1);assert.equal(delta.next.tasks.length,0);
  let start=calls.length;await synchronize(delta.base,delta.next,null,async()=>{},true);
  assert.ok(calls.slice(start).filter(c=>c.route.endsWith('/query')).every(c=>c.body.filter),'Toda consulta incremental usa filtro');
  const full=(await notionLib.readSnapshot()).state;
  assert.equal(full.inbox.length,startState.inbox.length+1);assert.deepEqual(full.tasks,startState.tasks);
  const entry=full.inbox.find(p=>p.text==='Entrada incremental');
  const changed={...full,inbox:full.inbox.map(p=>p.id===entry.id?{...p,text:'Texto editado'}:p)};
  const edit=compactSyncState(full,changed);start=calls.length;await synchronize(edit.base,edit.next,null,async()=>{},true);
  assert.equal(calls.slice(start).filter(c=>c.route.endsWith('/query')).length,0,'Edição por ID não varre o banco');
  await assert.rejects(()=>synchronize(edit.base,{...edit.next,inbox:edit.next.inbox.map(p=>({...p,text:'Edição antiga'}))},null,async()=>{},true),e=>e.status===409);
  const done=(await notionLib.readSnapshot()).state;const deletion=compactSyncState(done,{...done,inbox:done.inbox.filter(p=>p.id!==entry.id)});await synchronize(deletion.base,deletion.next,null,async()=>{},true);
  assert.equal((await notionLib.readSnapshot()).state.inbox.length,startState.inbox.length);
  const lots={...startState,inbox:Array.from({length:1000},(_,n)=>({id:'bulk-'+n,text:'x'.repeat(1000)}))};
  const tiny=compactSyncState(lots,{...lots,inbox:lots.inbox.map((p,n)=>n===3?{...p,text:'mudou'}:p)});
  assert.ok(JSON.stringify(tiny).length<3000,'Payload não cresce com mil registros intocados');
 }
 {
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const before=(await notionLib.readSnapshot(false,A)).state;
  const project={id:'delta-related-project',name:'Projeto incremental',status:'active',context:'personal',area:'',due:null,description:'',milestones:[{id:'delta-related-milestone',title:'Referência',due:null,done:false}],attachments:[]};
  const task={id:'delta-related-task',title:'Tarefa incremental',status:'todo',priority:'medium',context:'personal',project:project.id,milestone:project.milestones[0].id,start:null,due:null,waitingOn:'',followUp:null,notes:'',completedAt:null,attachments:[]};
  const delta=compactSyncState(before,{...before,projects:[...before.projects,project],tasks:[...before.tasks,task]});await synchronize(delta.base,delta.next,A,async()=>{},true);
  const saved=(await notionLib.readSnapshot(false,A)).state,linked=saved.tasks.find(p=>p.title===task.title);assert.ok(linked?.project&&linked.milestone,'Novas relações são resolvidas no mesmo salvamento');
  const edit=compactSyncState(saved,{...saved,tasks:saved.tasks.map(p=>p.id===linked.id?{...p,notes:'Atualizada'}:p)});
  assert.equal(edit.next.projects.length,1);await synchronize(edit.base,edit.next,A,async()=>{},true);
  await assert.rejects(()=>synchronize(edit.base,edit.next,B,async()=>{},true),e=>e.status===403);
 }
 // Shared projects and tasks: visibility, ownership, assignee and concurrent children.
 {
  const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const save=async(before,after,user)=>{const d=compactSyncState(before,after);return synchronize(d.base,d.next,user,async()=>{},true);};
  let a=(await notionLib.readSnapshot(false,A)).state;
  const p={id:'shared-test-project',shared:true,name:'Projeto do casal',status:'active',context:'personal',area:'',due:null,description:'',milestones:[{id:'shared-test-ms',title:'Marco compartilhado',done:false,due:null}],attachments:[]};
  const t={id:'shared-test-task',shared:true,responsible:B.email,title:'Tarefa do casal',status:'todo',priority:'medium',context:'personal',project:p.id,milestone:'shared-test-ms',start:null,due:null,waitingOn:'',followUp:null,notes:'',completedAt:null,attachments:[]};
  await save(a,{...a,projects:[...a.projects,p],tasks:[...a.tasks,t]},A);
  let b=(await notionLib.readSnapshot(false,B)).state;const project=b.projects.find(v=>v.name===p.name),task=b.tasks.find(v=>v.title===t.title);assert.equal(project?._ownerEmail,A.email);assert.equal(task?._ownerEmail,A.email);assert.equal(project?.responsible,undefined,'Projeto compartilhado não tem responsável');assert.ok(project&&task&&project.milestones.length===1,'As duas contas veem projeto, marcos e tarefas compartilhados');
  const originalOwner=rows.get(project.id).properties['LifeOS Usuário'];await save(b,{...b,tasks:b.tasks.map(v=>v.id===task.id?{...v,notes:'Editada por Letícia'}:v)},B);assert.deepEqual(rows.get(project.id).properties['LifeOS Usuário'],originalOwner);
  b=(await notionLib.readSnapshot(false,B)).state;await assert.rejects(()=>save(b,{...b,tasks:b.tasks.map(v=>v.id===task.id?{...v,responsible:'intruso@example.com'}:v)},B),e=>e.status===422);
  a=(await notionLib.readSnapshot(false,A)).state;
  const extra={...task,id:'shared-concurrent-child',_notionId:undefined,title:'Tarefa criada na outra instância',notes:'',milestone:null};await save(b,{...b,tasks:[...b.tasks,extra]},B);
  await save(a,{...a,projects:a.projects.map(v=>v.id===project.id?{...v,shared:false,responsible:''}:v),tasks:a.tasks.map(v=>v.project===project.id?{...v,shared:false,responsible:''}:v)},A);
  b=(await notionLib.readSnapshot(false,B)).state;assert.ok(!b.projects.some(v=>v.id===project.id));assert.ok(!b.tasks.some(v=>v.project===project.id),'Descompartilhar protege também os filhos criados em outra instância');
  a=(await notionLib.readSnapshot(false,A)).state;assert.equal(a.tasks.filter(v=>v.project===project.id).length,2);assert.ok(a.tasks.filter(v=>v.project===project.id).every(v=>!v.shared));
  await assert.rejects(()=>save(a,{...a,tasks:a.tasks.map(v=>v.project===project.id?{...v,shared:true,responsible:A.email}:v)},A),e=>e.status===422);
 }
 // Cascade deletion also finds children absent from the client's snapshot.
 {
  const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'};const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const save=async(before,after)=>{const d=compactSyncState(before,after);return synchronize(d.base,d.next,A,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;const project=state.projects.find(p=>p.name==='Projeto do casal');const child=state.tasks.find(t=>t.project===project.id);
  await save(state,{...state,projects:state.projects.map(p=>p.id===project.id?{...p,status:'done'}:p)});state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.tasks.filter(t=>t.project===project.id).length,2,'Concluir preserva tarefas');
  await save(state,{...state,projects:state.projects.map(p=>p.id===project.id?{...p,status:'cancelled'}:p)});state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.tasks.filter(t=>t.project===project.id).length,2,'Cancelar preserva tarefas');
  const stale=structuredClone(state);await save(state,{...state,tasks:[...state.tasks,{...child,id:'later-child',_notionId:undefined,title:'Tarefa concorrente'}]});
  const next={...stale,projects:stale.projects.filter(p=>p.id!==project.id),tasks:stale.tasks.filter(t=>t.project!==project.id)};const start=calls.length;await save(stale,next);
  const actual=(await notionLib.readSnapshot(false,A)).state;assert.ok(!actual.projects.some(p=>p.id===project.id));assert.ok(!actual.tasks.some(t=>t.project===project.id));assert.ok(!actual.tasks.some(t=>t.title==='Tarefa concorrente'));assert.equal(actual.tasks.length,stale.tasks.filter(t=>t.project!==project.id).length,'Tarefas de outros projetos permanecem');
  const deletions=calls.slice(start).filter(c=>c.body?.in_trash);assert.equal(deletions.at(-1).route,'/pages/'+project.id,'Projeto é excluído após os filhos');await save(stale,next);
 }
 // Bem-estar: dados privados e ciclo exclusivo da Letícia, compartilhado nesta versão.
 {
  process.env.NOTION_WELLNESS_DATABASE_ID=databases.wellness;process.env.NOTION_CYCLE_DATABASE_ID=databases.cycle;
  const A={id:'google:well-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:well-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff')),day=require(path.join(temp,'lib/habits')).habitToday();
  const save=async(before,after,user)=>{const d=compactSyncState(before,after);return synchronize(d.base,d.next,user,async()=>{},true);};
  let a=(await notionLib.readSnapshot(false,A)).state;
  const daily={id:'well-day-A-'+day,name:'Meu dia',date:day,type:'day',data:{humor:'Bem',hours:8}},measurement={id:'well-pressure-A',name:'Pressão',date:day,type:'pressure',data:{systolic:124,diastolic:76,bpm:62,time:'08:10'}},cycle={id:'well-cycle-leticia-'+day,name:'Ciclo da Letícia',date:day,type:'cycle',data:{subject:B.email,menstruation:'Não',flow:'—',cramps:'Nenhuma'}};
  const original=structuredClone(a),desired={...a,wellness:[daily,measurement],cycle:[cycle]};await save(a,desired,A);await save(original,desired,A);
  a=(await notionLib.readSnapshot(false,A)).state;let b=(await notionLib.readSnapshot(false,B)).state;
  assert.equal(a.wellness.length,2,'Retry must not duplicate measurements');assert.equal(b.wellness.length,0,'Private measures invisible to second account');assert.equal(a.cycle.length,1);assert.deepEqual(a.cycle,b.cycle,'Both accounts see the same Letícia record');
  await assert.rejects(()=>save(b,{...b,wellness:a.wellness},B),e=>e.status===403);
  await save(b,{...b,cycle:b.cycle.map(p=>({...p,data:{...p.data,flow:'Leve'}}))},B);
  const stale=structuredClone(a);await assert.rejects(()=>save(stale,{...stale,cycle:stale.cycle.map(p=>({...p,data:{...p.data,flow:'Intenso'}}))},A),e=>e.status===409);
  a=(await notionLib.readSnapshot(false,A)).state;assert.equal(a.cycle[0].data.flow,'Leve');
  await assert.rejects(()=>save(a,{...a,cycle:a.cycle.map(p=>({...p,data:{...p.data,subject:A.email}}))},A),/Letícia/);
  await assert.rejects(()=>save(a,{...a,wellness:[...a.wellness,{...measurement,id:'invalid',data:{...measurement.data,bpm:-1}}]},A),/válidos/);
  const start=calls.length;await save(a,{...a,wellness:a.wellness.map(p=>p.type==='pressure'?{...p,data:{...p.data,bpm:64}}:p)},A);assert.ok(!calls.slice(start).some(c=>c.route.includes('/query')&&!c.body.filter),'Incremental saves never enumerate whole bank');
  a=(await notionLib.readSnapshot(false,A)).state;await save(a,{...a,wellness:a.wellness.filter(p=>p.type!=='pressure')},A);assert.equal((await notionLib.readSnapshot(false,A)).state.wellness.length,1);
  a=(await notionLib.readSnapshot(false,A)).state;
  const weight={id:'weight-one',name:'Peso e gordura',type:'body',date:day,data:{weight:80,fat:20}};
  const old=structuredClone(a),want={...a,wellness:[...a.wellness,weight]};await save(a,want,A);await save(old,want,A);
  await assert.rejects(()=>save(old,{...old,wellness:[...old.wellness,{...weight,id:'weight-other',data:{weight:90,fat:22}}]},A),e=>e.status===409);
  a=(await notionLib.readSnapshot(false,A)).state;assert.equal(a.wellness.filter(p=>p.type==='body').length,1);
  await save(a,{...a,wellness:a.wellness.map(p=>p.type==='body'?{...p,data:{...p.data,weight:81}}:p)},A);
  a=(await notionLib.readSnapshot(false,A)).state;
  const yesterday=new Date(Date.parse(day)-86400000).toISOString().slice(0,10);
  await save(a,{...a,wellness:[...a.wellness,{...weight,id:'weight-yesterday',date:yesterday}]},A);
  a=(await notionLib.readSnapshot(false,A)).state;
  await assert.rejects(()=>save(a,{...a,wellness:a.wellness.map(p=>p.type==='body'&&p.date===yesterday?{...p,date:day}:p)},A),e=>e.status===409);
  const secondPressure={...measurement,id:'another-pressure',data:{systolic:120,diastolic:70,bpm:60}};
  await save(a,{...a,wellness:[...a.wellness,measurement,secondPressure]},A);
  assert.equal((await notionLib.readSnapshot(false,A)).state.wellness.filter(p=>p.type==='pressure').length,2);

 }

 for(const closingStatus of ['done','cancelled']){
 const A={id:'google:completion-A-'+closingStatus,email:'periclesbernardes@gmail.com',name:'Péricles'};
 const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
 const save=async(base,next)=>{const d=compactSyncState(base,next);return synchronize(d.base,d.next,A,async()=>{},true);};
 let state=(await notionLib.readSnapshot(false,A)).state;
 const project={id:'completion-project-'+closingStatus,name:'Conclusão '+closingStatus,status:'active',context:'personal',area:'',description:'',due:null,attachments:[],milestones:[{id:'completion-ms',title:'Marco aberto',due:null,done:false}]};
 const task={id:'completion-task',title:'Aberta',project:project.id,milestone:'completion-ms',status:'todo',priority:'medium',context:'personal',notes:'',attachments:[],completedAt:null};
 await save(state,{...state,projects:[...state.projects,project],tasks:[...state.tasks,task]});
 const stale=(await notionLib.readSnapshot(false,A)).state,pid=stale.projects.find(p=>p.name===project.name).id;
 await save(stale,{...stale,projects:stale.projects.map(p=>p.id===pid?{...p,milestones:[...p.milestones,{id:'remote-completion-ms',title:'Novo marco remoto',due:null,done:false}]}:p),tasks:[...stale.tasks,{...task,id:'remote-completion-task',project:pid,milestone:null,title:'Nova tarefa remota'},{...task,id:'already-complete-task',project:pid,milestone:null,title:'Já concluída',status:'done',completedAt:123000}]});
 const desired={...stale,projects:stale.projects.map(p=>p.id===pid?{...p,status:closingStatus}:p)};
 failCompletionTaskWrite=true;
 await assert.rejects(()=>save(stale,desired),/Falha simulada/);
 let actual=(await notionLib.readSnapshot(false,A)).state;assert.equal(actual.projects.find(p=>p.id===pid).status,'active','Falha em filho não conclui o projeto');
 const mark=calls.length;await save(stale,desired);await save(stale,desired);
 actual=(await notionLib.readSnapshot(false,A)).state;
 assert.equal(actual.projects.find(p=>p.id===pid).status,closingStatus);assert.equal(actual.projects.find(p=>p.id===pid).milestones.length,2);assert.ok(actual.projects.find(p=>p.id===pid).milestones.every(m=>m.done));
 const children=actual.tasks.filter(t=>t.project===pid);assert.equal(children.length,3);assert.ok(children.every(t=>t.status==='done'));assert.equal(children.find(t=>t.title==='Já concluída').completedAt,123000);
 const writes=calls.slice(mark).filter(c=>c.method==='PATCH'&&c.body?.properties);const firstProject=writes.findIndex(c=>c.route===`/pages/${pid}`);assert.ok(firstProject>writes.findIndex(c=>kindBySource(rows.get(c.route.split('/')[2])?.parent.data_source_id)==='tasks'),'Filhos são salvos antes do projeto');
 const reopened={...actual,projects:actual.projects.map(p=>p.id===pid?{...p,status:'active'}:p)};await save(actual,reopened);actual=(await notionLib.readSnapshot(false,A)).state;assert.ok(actual.tasks.filter(t=>t.project===pid).every(t=>t.status==='done'));
 }

 for(const closingStatus of ['done','cancelled']){
 const A={id:'google:completion-precision-'+closingStatus,email:'periclesbernardes@gmail.com',name:'Péricles'};
 const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
 const save=async(base,next)=>{const d=compactSyncState(base,next);return synchronize(d.base,d.next,A,async()=>{},true);};
 let initial=(await notionLib.readSnapshot(false,A)).state;
 const project={id:'precision-project-'+closingStatus,name:'Conclusão com data normalizada '+closingStatus,status:'active',context:'personal',area:'',description:'',due:null,attachments:[],milestones:[]};
 const task={id:'precision-task',title:'Tarefa da interface',project:project.id,milestone:null,status:'todo',priority:'medium',context:'personal',notes:'',attachments:[],completedAt:null};
 await save(initial,{...initial,projects:[...initial.projects,project],tasks:[...initial.tasks,task]});
 const base=(await notionLib.readSnapshot(false,A)).state,pid=base.projects.find(p=>p.name===project.name).id;
 const time=Date.parse('2026-10-20T13:59:28.437Z');
 const desired={...base,projects:base.projects.map(p=>p.id===pid?{...p,status:closingStatus}:p),tasks:base.tasks.map(t=>t.project===pid?{...t,status:'done',completedAt:time}:t)};
 normalizeCompletionDates=true;failCompletionProjectWrite=true;
 await assert.rejects(()=>save(base,desired),/Falha simulada após concluir filhos/);
 assert.equal((await notionLib.readSnapshot(false,A)).state.projects.find(p=>p.id===pid).status,'active');
 const recovered=await save(base,desired); // Must recover a pending draft with the UI's original timestamp.
 const actual=(await notionLib.readSnapshot(false,A)).state;
 assert.equal(actual.projects.find(p=>p.id===pid).status,closingStatus);
 const completedTask=actual.tasks.find(t=>t.project===pid),canonical=Math.floor(time/60000)*60000;
 assert.equal(completedTask.completedAt,canonical);assert.deepEqual(recovered.taskCompletions[completedTask.id],{status:'done',completedAt:canonical});
 await save(base,desired); // Repeating the original request must remain safe.
 // Older browser drafts can contain a date with more precision than the remote field.
 const oldPrecision={...actual,tasks:actual.tasks.map(t=>t.id===completedTask.id?{...t,completedAt:time}:t)};
 const reopen={...oldPrecision,tasks:oldPrecision.tasks.map(t=>t.id===completedTask.id?{...t,status:'todo',completedAt:null}:t)};
 await save(oldPrecision,reopen);
 const open=(await notionLib.readSnapshot(false,A)).state;
 const finish={...open,tasks:open.tasks.map(t=>t.id===completedTask.id?{...t,status:'done',completedAt:time}:t)};
 const response=await save(open,finish);assert.equal(response.taskCompletions[completedTask.id].completedAt,canonical);
 await save(open,finish); // Standalone retry also accepts the returned date representation.
 const original=(await notionLib.readSnapshot(false,A)).state;
 rows.get(completedTask.id).properties['Concluída em'].date.start='2026-10-19T13:59:00.000Z';
 const conflicting={...original,tasks:original.tasks.map(t=>t.id===completedTask.id?{...t,status:'todo',completedAt:null}:t)};
 await assert.rejects(()=>save(original,conflicting),/Concluída em/,'Mudança real de data remota continua protegida');
 rows.get(completedTask.id).properties['Concluída em'].date.start=new Date(canonical).toISOString();
 const {sameCompletionTime}=require(path.join(temp,'lib/tasks'));
 assert.equal(sameCompletionTime(canonical,time),true);assert.equal(sameCompletionTime(canonical+1000,time),false);assert.equal(sameCompletionTime(canonical+50,time),false);assert.equal(sameCompletionTime(null,time),false);
 normalizeCompletionDates=false;
 }

 {process.env.NOTION_NUTRITION_DATABASE_ID=databases.nutrition;
 const A={id:'google:nutrition-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:nutrition-B',email:'leticiacost3@gmail.com',name:'Letícia'};
 const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
 const save=async(base,next,user=A)=>{const d=compactSyncState(base,next);return synchronize(d.base,d.next,user,async()=>{},true);};
 const food={id:'taco:3',name:'Arroz, tipo 1, cozido',kcal100:128,unit:'g',icon:'rice',image:'',source:'TACO'};
 let state=(await notionLib.readSnapshot(false,A)).state;
 const day={id:'nutrition-day',name:'Rotina',type:'day',date:'2026-10-01',data:{uid:'day:2026-10-01',target:2200,water:true,sleepHours:7}},entry={id:'nutrition-entry',name:food.name,type:'entry',date:day.date,data:{uid:'entry-uid',food,quantity:100,measure:'g',meal:'Almoço',inside:true,kcal:128}},favorite={id:'nutrition-favorite',name:food.name,type:'food',date:null,data:{uid:'food:taco:3',food,favorite:true,archived:false}};
 const desired={...state,nutrition:[day,entry,favorite]};const mark=calls.length;
 await save(state,desired);await save(state,desired);const endQueries=calls.length;state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.nutrition.length,3);assert.equal(state.nutritionConfigured,true);assert.equal((await notionLib.readSnapshot(false,B)).state.nutrition.length,0,'Alimentação é privada por conta');
 const querySources=calls.slice(mark,endQueries).filter(c=>c.route.includes('/query')).map(c=>c.route.split('/')[2]);assert.ok(querySources.every(id=>id===sourceIds.nutrition),'Edição de alimentação não consulta outros bancos');
 await save(state,{...state,nutrition:state.nutrition.map(r=>r.type==='food'?{...r,data:{...r.data,food:{...r.data.food,kcal100:200},archived:true,favorite:false}}:r)});state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.nutrition.find(r=>r.type==='entry').data.kcal,128,'Editar/retirar alimento preserva o histórico');
 const other=(await notionLib.readSnapshot(false,B)).state;await save(other,{...other,nutrition:[{...day,id:'nutrition-day-B'}]},B);assert.equal((await notionLib.readSnapshot(false,B)).state.nutrition.length,1,'Mesma data permitida por usuário');
 await assert.rejects(()=>save(state,{...state,nutrition:[...state.nutrition,{...day,id:'duplicate-day'}]}),e=>e.status===409);
 await assert.rejects(()=>save(state,{...state,nutrition:state.nutrition.map(r=>r.type==='entry'?{...r,data:{...r.data,kcal:200}}:r)}),/Confira alimento/);
 const stale=structuredClone(state);await save(state,{...state,nutrition:state.nutrition.map(r=>r.type==='day'?{...r,data:{...r.data,water:false}}:r)});
 await assert.rejects(()=>save(stale,{...stale,nutrition:stale.nutrition.map(r=>r.type==='day'?{...r,data:{...r.data,sleepHours:8}}:r)}),e=>e.status===409,'JSON concorrente não sobrescreve outra instância');
 const denied=structuredClone(other);denied.nutrition=[state.nutrition.find(r=>r.type==='entry')];await assert.rejects(()=>save(other,denied,B),e=>e.status===403);
 }

 {process.env.NOTION_VEHICLES_DATABASE_ID=databases.vehicles;
 const A={id:'google:vehicle-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:vehicle-B',email:'leticiacost3@gmail.com',name:'Letícia'};
 const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
 const save=async(base,next,user=A)=>{const delta=compactSyncState(base,next);return synchronize(delta.base,delta.next,user,async()=>{},true);};
 let base=(await notionLib.readSnapshot(false,A)).state;
 const vehicle={id:'local-vehicle',type:'vehicle',date:null,name:'Meu carro',data:{uid:'car-A',kind:'car',model:'hatch',color:'#58a6ff',context:'personal',plate:'ABC1D23',km:1000,warningKm:500}};
 const fuel={id:'local-fuel',type:'entry',date:'2026-10-01',name:'Abastecimento',data:{uid:'fuel-A',vehicle:'car-A',category:'fuel',fuel:true,full:true,km:1000,liters:38.125,amount:23000}};
 const desired={...base,vehicles:[vehicle,fuel]};await save(base,desired);await save(base,desired);
 let state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.length,2,'Retry binds original records');assert.equal((await notionLib.readSnapshot(false,B)).state.vehicles.length,2,'Both users see shared vehicle data');
 const sharedRead=(await notionLib.readSnapshot(false,B)).state;await save(sharedRead,{...sharedRead,vehicles:sharedRead.vehicles.map(p=>p.type==='vehicle'?{...p,name:'Carro compartilhado'}:p)},B);state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.find(p=>p.type==='vehicle').name,'Carro compartilhado');assert.ok([...rows.values()].some(p=>p.parent.data_source_id===sourceIds.vehicles&&notionLib.plain(p.properties['LifeOS Último editor']?.rich_text).includes('Letícia')));
 assert.equal(state.vehicles.find(p=>p.type==='entry').data.vehicle,'car-A','JSON uid survives page ID binding');
 const changed={...state,vehicles:state.vehicles.map(p=>p.type==='vehicle'?{...p,data:{...p.data,color:'#ec6c70',model:'suv'}}:p)};
 const before=calls.length;await save(state,changed);const writes=calls.slice(before).filter(c=>c.route.startsWith('/pages/')&&c.body?.properties);assert.equal(writes.length,1);assert.deepEqual(Object.keys(writes[0].body.properties).filter(k=>!k.startsWith('LifeOS')),['Dados'],'Only changed JSON field written');
 state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.find(p=>p.type==='vehicle').data.color,'#ec6c70');
 const custom={id:'custom-cat',name:'Pneus',type:'category',date:null,data:{uid:'tires',archived:false}},expense={id:'new-expense',name:'Troca de pneus',type:'entry',date:'2026-10-02',data:{uid:'tires-entry',vehicle:'car-A',category:'tires',fuel:false,km:1500,amount:150000,nextKm:41500}};
 await save(state,{...state,vehicles:[...state.vehicles,custom,expense]});state=(await notionLib.readSnapshot(false,A)).state;
 const retired={...state,vehicles:state.vehicles.map(p=>p.type==='category'?{...p,name:'Pneus e rodas',data:{...p.data,archived:true}}:p)};await save(state,retired);state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.find(p=>p.data.uid==='tires-entry').data.amount,150000);
 await assert.rejects(()=>save(state,{...state,vehicles:state.vehicles.filter(p=>p.type!=='vehicle')}),/veículo.*não existe/);
 await assert.rejects(()=>save(state,{...state,vehicles:[...state.vehicles,{...expense,id:'orphan',data:{...expense.data,uid:'orphan',vehicle:'unknown'}}]}),/veículo.*não existe/);
 await assert.rejects(()=>save(state,{...state,vehicles:state.vehicles.map(p=>p.data.uid==='tires-entry'?{...p,data:{...p.data,amount:-1}}:p)}),/valor válido/);
 const mixedFuel={id:'mixed-stop',name:'Abastecimento misto',type:'entry',date:'2026-10-03',data:{uid:'mixed-stop-uid',vehicle:'car-A',category:'fuel',fuel:true,full:true,km:1800,liters:35.5,amount:18000,fuels:[{type:'ethanol',liters:20,amount:8000},{type:'gasoline',liters:15.5,amount:10000}]}};
 await save(state,{...state,vehicles:[...state.vehicles,mixedFuel]},B);state=(await notionLib.readSnapshot(false,A)).state;const persistedMixed=state.vehicles.find(p=>p.data.uid==='mixed-stop-uid');assert.deepEqual(persistedMixed.data.fuels,mixedFuel.data.fuels);assert.equal(persistedMixed.data.liters,35.5);assert.equal(persistedMixed.data.amount,18000);
 await assert.rejects(()=>save(state,{...state,vehicles:state.vehicles.map(p=>p.id===persistedMixed.id?{...p,data:{...p.data,amount:1}}:p)}),/total.*litros/);
 const favorite={id:'favorite-station',name:'Posto São Paulo',type:'station',date:null,data:{uid:'favorite-station-uid',favorite:true}};
 let beforeStation=structuredClone(state),withStation={...state,vehicles:[...state.vehicles,favorite]};await save(state,withStation,B);await save(beforeStation,withStation,B);state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.filter(r=>r.type==='station').length,1);
 await assert.rejects(()=>save(state,{...state,vehicles:[...state.vehicles,{...favorite,id:'station-duplicate',name:' POSTO SAO  PAULO ',data:{uid:'duplicate-station-uid',favorite:true}}]},A),e=>e.status===409);
 await save(state,{...state,vehicles:state.vehicles.map(p=>p.type==='vehicle'?{...p,data:{...p.data,year:2021}}:p.data.uid==='mixed-stop-uid'?{...p,data:{...p.data,station:'Posto São Paulo'}}:p)},A);state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.vehicles.find(p=>p.type==='vehicle').data.year,2021);assert.equal(state.vehicles.find(p=>p.data.uid==='mixed-stop-uid').data.station,'Posto São Paulo');
 await save(state,{...state,vehicles:state.vehicles.map(p=>p.type==='station'?{...p,name:'Posto renomeado',data:{...p.data,favorite:false}}:p)},B);state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.find(p=>p.data.uid==='mixed-stop-uid').data.station,'Posto São Paulo','Renaming favorite preserves historical names');await save(state,{...state,vehicles:state.vehicles.filter(p=>p.type!=='station')},A);state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.vehicles.find(p=>p.data.uid==='mixed-stop-uid').data.station,'Posto São Paulo','Deleting favorite preserves fuel stop');
 const importBase=structuredClone(state),imported={id:'fi-test-import',name:'Abastecimento',type:'entry',date:'2026-10-04',data:{uid:'fi-test-import',vehicle:'car-A',category:'fuel',fuel:true,full:true,missedPrevious:true,importSourceId:'csv-source-1',km:2000,liters:10,amount:5000,fuels:[{type:'unknown',liters:10,amount:5000}]}};
 const importNext={...importBase,vehicles:[...importBase.vehicles,imported]};await save(importBase,importNext,A);await save(importBase,importNext,A);
 state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.vehicles.filter(p=>p.data.importSourceId==='csv-source-1').length,1);assert.equal(state.vehicles.find(p=>p.data.importSourceId==='csv-source-1').data.missedPrevious,true);
 await save(state,{...state,vehicles:state.vehicles.map(p=>p.data.importSourceId==='csv-source-1'?{...p,data:{...p.data,notes:'Alterado em outro aparelho'}}:p)},B);
 await assert.rejects(()=>save(importBase,importNext,A),e=>e.status===409,'Retry must preserve edits made after import');
 state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.vehicles.find(p=>p.data.importSourceId==='csv-source-1').data.notes,'Alterado em outro aparelho');
 const noCost={id:'expense-no-cost',type:'entry',date:'2026-10-04',name:'Serviço em garantia',data:{uid:'expense-no-cost',vehicle:'car-A',category:'maintenance',fuel:false,km:2000,amount:0,durationKm:8000,nextKm:10000,importSourceId:'expense:no-cost'}},unknownCost={...noCost,id:'expense-unknown',name:'Serviço sem valor',data:{...noCost.data,uid:'expense-unknown',amount:null,importSourceId:'expense:unknown'}};
 const expenseBase=structuredClone(state),expenseNext={...state,vehicles:[...state.vehicles,noCost,unknownCost]};await save(expenseBase,expenseNext,A);await save(expenseBase,expenseNext,A);state=(await notionLib.readSnapshot(false,B)).state;assert.equal(state.vehicles.find(p=>p.data.uid==='expense-no-cost').data.amount,0);assert.equal(state.vehicles.find(p=>p.data.uid==='expense-unknown').data.amount,null);assert.equal(state.vehicles.filter(p=>p.data.uid==='expense-unknown').length,1);assert.equal(state.vehicles.find(p=>p.data.uid==='expense-no-cost').data.nextKm,10000);await assert.rejects(()=>save(state,{...state,vehicles:state.vehicles.map(p=>p.data.uid==='expense-no-cost'?{...p,data:{...p.data,nextKm:9999}}:p)},A),/duração positiva/);
 const fresh=structuredClone(state);await save(state,{...state,vehicles:state.vehicles.map(p=>p.type==='vehicle'?{...p,name:'Renomeado no outro aparelho'}:p)});
 await assert.rejects(()=>save(fresh,{...fresh,vehicles:fresh.vehicles.map(p=>p.type==='vehicle'?{...p,name:'Edição antiga'}:p)}),e=>e.status===409);
 }
 const copyRoute=require(path.join(temp,'app/api/notion/media-cover/route')).POST;
 const copied=await copyRoute(new Request('https://lifeos.test/api/notion/media-cover',{method:'POST',headers:{cookie,origin:'https://lifeos.test','content-type':'application/json'},body:JSON.stringify({url:'https://covers.openlibrary.org/b/id/123-M.jpg',name:'Duna'})}));assert.equal(copied.status,200);const coverResult=await copied.json();assert.equal(auth.unseal(coverResult.uploadProof).user,'google:test-pericles');assert.ok(coverResult.uploadId);
 const copyDenied=await copyRoute(new Request('https://lifeos.test/api/notion/media-cover',{method:'POST',body:'{}'}));assert.equal(copyDenied.status,401);
 const copyOrigin=await copyRoute(new Request('https://lifeos.test/api/notion/media-cover',{method:'POST',headers:{cookie,origin:'https://evil.test'},body:'{}'}));assert.equal(copyOrigin.status,403);
 const get=require(path.join(temp,'app/api/notion/route')).GET;
 const denied=await get(request);assert.equal(denied.status,401);assert.equal(calls.some(call=>call.route.includes('undefined')),false);
 {
  process.env.NOTION_SOMEDAY_DATABASE_ID=databases.someday;
  const {makeArea,makeIdea,validateSomeday,promoteIdea,saveProjectArea}=require(path.join(temp,'lib/someday'));
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const A={id:'google:ideas-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:ideas-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const save=async(base,next,user=A)=>{const d=compactSyncState(base,next);return synchronize(d.base,d.next,user,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;const area=makeArea('Criação'),idea=makeIdea(area);idea.name='Uma possibilidade';idea.attachments=[{id:'image-id',name:'stable.png',notion:{type:'external',external:{url:'https://files.notion.test/idea.png'}}}];idea.data.doc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Anotações com formatação',marks:[{type:'bold'}]}]},{type:'ideaImage',attrs:{attachmentId:'stable.png',alt:'Esboço'}}]};
  const desired={...state,someday:[area,idea]};await save(state,desired);await save(state,desired);
  state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.someday.length,2);assert.equal(state.somedayConfigured,true);assert.ok(state.someday.every(r=>!validateSomeday(r)));assert.equal((await notionLib.readSnapshot(false,B)).state.someday.length,0);
  let loaded=state.someday.find(r=>r.type==='idea'),loadedArea=state.someday.find(r=>r.type==='area');
  assert.notEqual(loaded.attachments[0].id,'image-id');assert.equal(loaded.data.doc.content[1].attrs.attachmentId,loaded.attachments[0].name);
  const linkedProject={id:'linked-area-project',name:'Um projeto da área',status:'active',context:'work',area:loadedArea.name,description:'',due:null,milestones:[],attachments:[]};
  await save(state,{...state,projects:[...state.projects,linkedProject]});state=(await notionLib.readSnapshot(false,A)).state;
  const renamed=saveProjectArea(state,{...loadedArea,name:'Projetos criativos'});await save(state,renamed);await save(state,renamed);state=(await notionLib.readSnapshot(false,A)).state;
  assert.equal(state.someday.find(r=>r.type==='idea').data.area,loadedArea.data.uid);
  assert.equal(state.projects.find(p=>p.name===linkedProject.name).area,'Projetos criativos','Renomear persiste o seletor Notion e permite repetir envio');
  const userB=(await notionLib.readSnapshot(false,B)).state;await assert.rejects(()=>save({...userB,someday:[loaded]},{...userB,someday:[{...loaded,name:'Tentativa de outra conta'}]},B),e=>e.status===403);
  const duplicate=makeArea('Projetos criativos');await assert.rejects(()=>save(state,{...state,someday:[...state.someday,duplicate]}),/Já existe uma área/);
  loaded=state.someday.find(r=>r.type==='idea');const converted=promoteIdea(state,loaded.id,'task'),beforeTasks=state.tasks.length;failSomedayMarker=true;
  await assert.rejects(()=>save(state,converted),/Falha simulada na conversão/);
  const partial=(await notionLib.readSnapshot(false,A)).state;assert.equal(partial.tasks.length,beforeTasks+1);assert.equal(partial.someday.find(r=>r.id===loaded.id).data.promoted,undefined,'Marcador só é gravado depois da tarefa');
  await save(state,converted);await save(state,converted);state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.tasks.length,beforeTasks+1,'Retentativa não duplica a tarefa');assert.equal(state.someday.find(r=>r.id===loaded.id).data.promoted.kind,'task');assert.equal(state.tasks.at(-1).attachments.length,1);
  assert.ok(state.someday.find(r=>r.id===loaded.id).data.doc.content[1],'Ideia rica original é preservada');
  const archived={...state,someday:state.someday.map(r=>r.type==='area'?{...r,data:{...r.data,archived:true}}:r)};await save(state,archived);state=(await notionLib.readSnapshot(false,A)).state;
  const otherIdea=makeIdea(state.someday.find(r=>r.type==='area'));otherIdea.name='Nova';await assert.rejects(()=>save(state,{...state,someday:[...state.someday,otherIdea]}),/Reative a área/);
  const favorite={...state,someday:state.someday.map(r=>r.type==='idea'?{...r,data:{...r.data,favorite:true}}:r)};await save(state,favorite);
  await assert.rejects(()=>save(state,{...state,someday:state.someday.filter(r=>r.type!=='area')}),/área desta ideia/);
  const areaMissing=makeIdea();areaMissing.name='Sem área não pode salvar';
  const beforeMissing=(await notionLib.readSnapshot(false,A)).state;
  await assert.rejects(()=>save(beforeMissing,{...beforeMissing,someday:[...beforeMissing.someday,areaMissing]}),/Escolha uma área/);
  // If archiving Inbox fails after saving the idea, retry keeps one destination and the full content.
  const {moveInboxToSomeday,ideaText}=require(path.join(temp,'lib/someday'));
  let inboxState=(await notionLib.readSnapshot(false,A)).state;
  const inboxArea=makeArea('Ideias do Inbox');
  const inboxIdea={id:'inbox-someday-retry',text:'Ideia do Inbox\nPrimeiro parágrafo\n\nSegundo parágrafo',createdAt:Date.now()};
  await save(inboxState,{...inboxState,someday:[...inboxState.someday,inboxArea],inbox:[...inboxState.inbox,inboxIdea]});inboxState=(await notionLib.readSnapshot(false,A)).state;
  const inboxSource=inboxState.inbox.find(i=>i.text===inboxIdea.text),movedInbox=moveInboxToSomeday(inboxState,inboxSource.id,inboxArea.data.uid);failInboxArchive=true;
  await assert.rejects(()=>save(inboxState,movedInbox.state),/Falha simulada ao arquivar Inbox/);
  const partiallyMoved=(await notionLib.readSnapshot(false,A)).state;assert.ok(partiallyMoved.inbox.some(i=>i.id===inboxSource.id));assert.equal(partiallyMoved.someday.filter(i=>i.data.uid===movedInbox.state.someday.at(-1).data.uid).length,1);
  await save(inboxState,movedInbox.state);await save(inboxState,movedInbox.state);
  const fullyMoved=(await notionLib.readSnapshot(false,A)).state;assert.equal(fullyMoved.inbox.some(i=>i.id===inboxSource.id),false);const savedIdeas=fullyMoved.someday.filter(i=>i.data.uid===movedInbox.state.someday.at(-1).data.uid);assert.equal(savedIdeas.length,1);assert.equal(ideaText(savedIdeas[0].data.doc),'Primeiro parágrafo\n\nSegundo parágrafo');assert.equal((await notionLib.readSnapshot(false,B)).state.someday.some(i=>i.data.uid===savedIdeas[0].data.uid),false);
  delete process.env.NOTION_SOMEDAY_DATABASE_ID;
 }
 {
  process.env.NOTION_REFERENCE_DATABASE_ID=databases.reference;
  const {makeReferenceCategory,makeReferenceMaterial,validateReference}=require(path.join(temp,'lib/reference'));
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const A={id:'google:reference-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:reference-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const save=async(base,next,user=A)=>{const d=compactSyncState(base,next);return synchronize(d.base,d.next,user,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;
  const category=makeReferenceCategory('Documentos'),material=makeReferenceMaterial(category);material.name='Manual de consulta';material.data.doc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Texto importante',marks:[{type:'bold'}]}]},{type:'ideaImage',attrs:{attachmentId:'manual.png',alt:'Figura do manual'}},{type:'ideaBookmark',attrs:{id:'url',url:'https://example.com/manual',title:'Documentação',description:'Fonte',image:''}}]};
  material.attachments=[{id:'ref-attach',name:'manual.png',uploadId:'upload-ref',uploadProof:auth.seal({user:A.id,uploadId:'upload-ref',exp:Date.now()+100000})}];
  const desired={...state,reference:[category,material]},beforeCalls=calls.length;await save(state,desired);await save(state,desired);
  assert.ok(calls.slice(beforeCalls).filter(c=>c.route.includes('/query')).every(c=>c.route.includes(sourceIds.reference)),'Alterar biblioteca não consulta outras coleções');
  state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.referenceConfigured,true);assert.equal(state.reference.length,2);assert.ok(state.reference.every(r=>!validateReference(r)));
  const loaded=state.reference.find(r=>r.type==='material'),cat=state.reference.find(r=>r.type==='category');assert.deepEqual(loaded.data.doc,material.data.doc);assert.equal(loaded.attachments[0].kind,'reference');assert.equal(loaded.data.category,cat.data.uid);assert.equal((await notionLib.readSnapshot(false,B)).state.reference.length,0);
  const other=(await notionLib.readSnapshot(false,B)).state;await assert.rejects(()=>save({...other,reference:[cat,loaded]},{...other,reference:[cat,{...loaded,name:'Tentativa'}]},B),e=>e.status===403);
  // Access is exercised by synchronize/ownedPage; the route also accepts the new kind.
  await assert.rejects(()=>notionLib.ownedPage('reference',loaded.id,B),e=>e.status===403);
  await assert.rejects(()=>save(state,{...state,reference:[...state.reference,makeReferenceCategory('documentos')]}),/Já existe uma categoria/);
  await assert.rejects(()=>save(state,{...state,reference:[loaded]}),/categoria.*não existe/);
  await assert.rejects(()=>save(state,{...state,reference:state.reference.map(r=>r.id===loaded.id?{...r,data:{...r.data,category:'missing'}}:r)}),/categoria.*não existe/);
  const renamed={...state,reference:state.reference.map(r=>r.id===cat.id?{...r,name:'Casa'}:r)};await save(state,renamed);state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.reference.find(r=>r.type==='material').data.category,cat.data.uid);
  const stale=state,updated={...state,reference:state.reference.map(r=>r.type==='material'?{...r,name:'Atualizado no outro navegador'}:r)};await save(state,updated);
  await assert.rejects(()=>save(stale,{...stale,reference:stale.reference.map(r=>r.type==='material'?{...r,name:'Edição antiga'}:r)}),e=>e.status===409);
  state=(await notionLib.readSnapshot(false,A)).state;await save(state,{...state,reference:state.reference.filter(r=>r.type!=='material')});assert.equal((await notionLib.readSnapshot(false,A)).state.reference.length,1);
  delete process.env.NOTION_REFERENCE_DATABASE_ID;
 }
 {
  const get=require(path.join(temp,'app/api/notion/route')).GET,start=calls.length;
  const group=await get(new Request('https://lifeos.test/api/notion?group=inbox',{headers:{cookie}}));assert.equal(group.status,200);const value=await group.json();assert.equal(value._startupGroup,'inbox');assert.equal(value.projects.length,0);assert.ok(calls.slice(start).filter(c=>c.route.endsWith('/query')).every(c=>c.route.includes(sourceIds.inbox)),'Inbox inicial não consulta os bancos das abas');
  assert.equal((await get(new Request('https://lifeos.test/api/notion?group=__proto__',{headers:{cookie}}))).status,400);
  assert.equal((await get(new Request('https://lifeos.test/api/notion?group=desconhecido',{headers:{cookie}}))).status,400);
  assert.equal((await get(new Request('https://lifeos.test/api/notion?group=inbox'))).status,401);
 }
 {
  const A={id:'google:lock-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:lock-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const {compactSyncState,sameField}=require(path.join(temp,'lib/notionDiff'));assert.equal(sameField('locked',undefined,false),true);
  const save=async(base,next,user=A)=>{const d=compactSyncState(base,next);return synchronize(d.base,d.next,user,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;const task={id:'shared-lock-test',title:'Original',status:'todo',priority:'medium',context:'personal',project:null,milestone:null,start:null,due:null,waitingOn:'',followUp:null,notes:'Conteúdo significativo',completedAt:null,attachments:[],shared:true,responsible:A.email,locked:false};
  await save(state,{...state,tasks:[...state.tasks,task]});const stale=(await notionLib.readSnapshot(false,A)).state;
  let b=(await notionLib.readSnapshot(false,B)).state,loaded=b.tasks.find(t=>t.title==='Original');await save(b,{...b,tasks:b.tasks.map(t=>t.id===loaded.id?{...t,locked:true}:t)},B);
  state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.tasks.find(t=>t.id===loaded.id).locked,true,'Bloqueio por quem não é responsável chega ao dono');assert.equal(rows.get(loaded.id).properties['Edição bloqueada'].checkbox,true);
  const writes=calls.filter(c=>c.route.startsWith('/pages')&&['POST','PATCH'].includes(c.method)).length;
  await assert.rejects(()=>save(stale,{...stale,tasks:stale.tasks.map(t=>t.id===loaded.id?{...t,notes:'Edição desatualizada'}:t)}),/bloqueada para edição/);assert.equal(calls.filter(c=>c.route.startsWith('/pages')&&['POST','PATCH'].includes(c.method)).length,writes);
  await assert.rejects(()=>save(state,{...state,tasks:state.tasks.filter(t=>t.id!==loaded.id)}),/Desbloqueie a tarefa/);
  await save(state,{...state,tasks:state.tasks.map(t=>t.id===loaded.id?{...t,locked:false}:t)});b=(await notionLib.readSnapshot(false,B)).state;assert.equal(b.tasks.find(t=>t.id===loaded.id).locked,false);
  const combined={...b,tasks:b.tasks.map(t=>t.id===loaded.id?{...t,title:'Salvo e bloqueado',locked:true}:t)};await save(b,combined,B);await save(b,combined,B);assert.equal((await notionLib.readSnapshot(false,A)).state.tasks.find(t=>t.id===loaded.id).title,'Salvo e bloqueado','Retentativa após salvar e bloquear é idempotente');
  b=(await notionLib.readSnapshot(false,B)).state;await save(b,{...b,tasks:b.tasks.map(t=>t.id===loaded.id?{...t,locked:false}:t)},B);assert.equal((await notionLib.readSnapshot(false,A)).state.tasks.find(t=>t.id===loaded.id).locked,false,'Ambos também desbloqueiam');
  state=(await notionLib.readSnapshot(false,A)).state;const privateTask={...task,id:'private-lock-test',title:'Particular',shared:false,responsible:'',locked:true};await save(state,{...state,tasks:[...state.tasks,privateTask]});state=(await notionLib.readSnapshot(false,A)).state;const privateId=state.tasks.find(t=>t.title==='Particular').id;
  const get=require(path.join(temp,'app/api/notion/task-lock/route')).GET,cookieA=auth.sessionCookie(A).split(';')[0],cookieB=auth.sessionCookie(B).split(';')[0];const response=await get(new Request('https://lifeos.test/api/notion/task-lock?id='+privateId,{headers:{cookie:cookieA}}));assert.equal(response.status,200);assert.equal((await response.json()).locked,true);assert.equal((await get(new Request('https://lifeos.test/api/notion/task-lock?id='+privateId,{headers:{cookie:cookieB}}))).status,403);assert.equal((await get(new Request('https://lifeos.test/api/notion/task-lock?id='+privateId))).status,401);
  const parent={id:'lock-parent',name:'Projeto protegido',status:'active',context:'personal',area:'',due:null,description:'',attachments:[],milestones:[],shared:true},child={...task,id:'lock-child',title:'Filha bloqueada',project:parent.id,locked:true};await save(state,{...state,projects:[...state.projects,parent],tasks:[...state.tasks,child]});state=(await notionLib.readSnapshot(false,A)).state;const project=state.projects.find(p=>p.name===parent.name);
  await assert.rejects(()=>save(state,{...state,projects:state.projects.map(p=>p.id===project.id?{...p,status:'done'}:p)}),/Desbloqueie as tarefas/);await assert.rejects(()=>save(state,{...state,projects:state.projects.filter(p=>p.id!==project.id),tasks:state.tasks.filter(t=>t.project!==project.id)}),/Desbloqueie as tarefas/);
 }

 {
  // Binary Inbox image: persistence, private download, conflicts, deletion and retries.
  const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff'));
  const save=async(base,next,user=A)=>{const delta=compactSyncState(base,next);return synchronize(delta.base,delta.next,user,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;assert.equal(sources.inbox.properties.Anexos.type,'files','Campo técnico criado automaticamente');
  const name='inbox-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png';const entry={id:'inbox-image-test',text:'',createdAt:Date.now(),attachments:[{id:'clip',name,uploadId:'clipboard-upload',uploadProof:auth.seal({user:A.id,uploadId:'clipboard-upload',exp:Date.now()+100000})}]};
  const desired={...state,inbox:[...state.inbox,entry]};await save(state,desired);await save(state,desired);state=(await notionLib.readSnapshot(false,A)).state;
  let loaded=state.inbox.find(i=>i.legacyId===entry.id);assert.ok(loaded);assert.equal(loaded.text,'');assert.equal(loaded.attachments[0].name,name);assert.equal(loaded.attachments[0].kind,'inbox');assert.equal(state.inbox.filter(i=>i.legacyId===entry.id).length,1);assert.equal((await notionLib.readSnapshot(false,B)).state.inbox.some(i=>i.id===loaded.id),false);
  const get=require(path.join(temp,'app/api/notion/attachment/route')).GET;const url='https://lifeos.test/api/notion/attachment?kind=inbox&id='+loaded.id+'&index=0&name='+name;
  const cookieA=auth.sessionCookie(A).split(';')[0],cookieB=auth.sessionCookie(B).split(';')[0];assert.equal((await get(new Request(url,{headers:{cookie:cookieA}}))).status,302);assert.equal((await get(new Request(url,{headers:{cookie:cookieB}}))).status,403);assert.equal((await get(new Request(url))).status,401);
  await save(state,{...state,inbox:state.inbox.map(i=>i.id===loaded.id?{...i,text:'Texto simples **literal**'}:i)});state=(await notionLib.readSnapshot(false,A)).state;loaded=state.inbox.find(i=>i.id===loaded.id);assert.equal(loaded.attachments[0].name,name);assert.equal(loaded.text,'Texto simples **literal**');
  const bad={...entry,id:'inbox-wrong-format',attachments:[{...entry.attachments[0],name:'document.pdf'}]};await assert.rejects(()=>save(state,{...state,inbox:[...state.inbox,bad]}),/Imagem do Inbox inválida/);
  const changed=structuredClone(state);changed.inbox=changed.inbox.map(i=>i.id===loaded.id?{...i,attachments:[]}:i);const row=rows.get(loaded.id),original=structuredClone(row.properties.Anexos);row.properties.Anexos={type:'files',files:[{name:'inbox-bbbbbbbb.png',type:'external',external:{url:'https://files.notion.test/replacement.png'}}]};await assert.rejects(()=>save(state,changed),e=>e.status===409);row.properties.Anexos=original;
  await save(state,{...state,inbox:state.inbox.filter(i=>i.id!==loaded.id)});state=(await notionLib.readSnapshot(false,A)).state;assert.equal(state.inbox.some(i=>i.id===loaded.id),false);assert.equal(rows.get(loaded.id).in_trash,true);assert.equal((await get(new Request(url,{headers:{cookie:cookieA}}))).status,404);
 }

 {
  // Follow-ups share task authorization/locks and preserve recurrence through sync.
  const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff')),{makeFollowup,completeFollowup,followupToday}=require(path.join(temp,'lib/followups'));
  const save=async(base,next,user=A)=>{const delta=compactSyncState(base,next);return synchronize(delta.base,delta.next,user,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;
  assert.equal(sources.tasks.properties['Recorrência'].type,'rich_text');
  const template={title:'Follow-up de concurso',status:'hold',priority:'medium',context:'personal',project:null,milestone:null,start:null,due:'2020-01-01',waitingOn:'',followUp:null,notes:'https://example.com',completedAt:null,attachments:[],shared:true,responsible:A.email,locked:false,recurrence:makeFollowup(followupToday())};
  await save(state,{...state,tasks:[...state.tasks,{...template,id:'recurring-test'}]});
  state=(await notionLib.readSnapshot(false,A)).state;let loaded=state.tasks.find(t=>t.title===template.title);assert.deepEqual(loaded.recurrence,template.recurrence);assert.equal(loaded.status,'hold');
  const readB=(await notionLib.readSnapshot(false,B)).state;assert.ok(readB.tasks.some(t=>t.id===loaded.id),'Shared follow-up visible to both users');
  const completed=completeFollowup(loaded,'Sem novas publicações'),desired={...state,tasks:state.tasks.map(t=>t.id===loaded.id?completed:t)};
  const createdBefore=creates;await save(state,desired);await save(state,desired);assert.equal(creates,createdBefore);let fresh=(await notionLib.readSnapshot(false,A)).state;assert.equal(fresh.tasks.find(t=>t.id===loaded.id).recurrence.total,1);assert.equal(fresh.tasks.find(t=>t.id===loaded.id).status,'hold');assert.equal(fresh.tasks.find(t=>t.id===loaded.id).due,'2020-01-01');
  const competing=completeFollowup(loaded,'Outra consulta');await assert.rejects(()=>save(state,{...state,tasks:state.tasks.map(t=>t.id===loaded.id?competing:t)}),e=>e.status===409);
  // An older client cannot set done without explicitly ending the persisted rule.
  const oldClient=structuredClone(fresh);oldClient.tasks=oldClient.tasks.map(t=>{const {recurrence,...rest}=t;return t.id===loaded.id?rest:t;});
  await assert.rejects(()=>save(oldClient,{...oldClient,tasks:oldClient.tasks.map(t=>t.id===loaded.id?{...t,status:'done',completedAt:Date.now()}:t)}),/manualmente|On hold/);
  let b=(await notionLib.readSnapshot(false,B)).state;await save(b,{...b,tasks:b.tasks.map(t=>t.id===loaded.id?{...t,locked:true}:t)},B);
  await assert.rejects(()=>save(fresh,{...fresh,tasks:fresh.tasks.map(t=>t.id===loaded.id?{...t,recurrence:{...t.recurrence,every:3}}:t)}),/bloqueada/);
  b=(await notionLib.readSnapshot(false,B)).state;await save(b,{...b,tasks:b.tasks.map(t=>t.id===loaded.id?{...t,locked:false}:t)},B);
  for(const finalStatus of ['done','cancelled']){
   state=(await notionLib.readSnapshot(false,A)).state;
   const parent={id:'followup-parent-'+finalStatus,name:'Projeto follow-up '+finalStatus,status:'active',context:'personal',area:'',due:null,description:'',attachments:[],milestones:[],shared:true};
   await save(state,{...state,projects:[...state.projects,parent],tasks:[...state.tasks,{...template,id:'followup-child-'+finalStatus,title:'Filha '+finalStatus,project:parent.id}]});
   const stale=(await notionLib.readSnapshot(false,A)).state,project=stale.projects.find(p=>p.name===parent.name),child=stale.tasks.find(t=>t.title==='Filha '+finalStatus);
   const closing={...stale,projects:stale.projects.map(p=>p.id===project.id?{...p,status:finalStatus}:p)};
   // Include a fresh remote child omitted by the caller, as in real partial sync.
   const remoteExtra={...template,id:'late-followup-'+finalStatus,title:'Remota '+finalStatus,project:project.id};await save(stale,{...stale,tasks:[...stale.tasks,remoteExtra]});
   failCompletionProjectWrite=true;await assert.rejects(()=>save(stale,closing),/Falha simulada/);
   const partial=(await notionLib.readSnapshot(false,A)).state;assert.equal(partial.tasks.find(t=>t.id===child.id).recurrence.state,'ended');const completion=partial.tasks.find(t=>t.id===child.id).completedAt;
   await save(stale,closing);const finished=(await notionLib.readSnapshot(false,A)).state;
   assert.equal(finished.projects.find(p=>p.id===project.id).status,finalStatus);assert.ok(finished.tasks.filter(t=>t.project===project.id).every(t=>t.status==='done'&&t.recurrence.state==='ended'));assert.equal(finished.tasks.find(t=>t.id===child.id).completedAt,completion);
   const reopened={...finished,projects:finished.projects.map(p=>p.id===project.id?{...p,status:'active'}:p)};await save(finished,reopened);assert.equal((await notionLib.readSnapshot(false,A)).state.tasks.find(t=>t.id===child.id).recurrence.state,'ended','Reopening project never resumes follow-ups');
   const beforeDelete=(await notionLib.readSnapshot(false,A)).state;await save(beforeDelete,{...beforeDelete,projects:beforeDelete.projects.filter(p=>p.id!==project.id),tasks:beforeDelete.tasks.filter(t=>t.project!==project.id)});assert.ok(!(await notionLib.readSnapshot(false,A)).state.tasks.some(t=>t.project===project.id));
  }
 }

 {
  const A={id:'google:user-A',email:'periclesbernardes@gmail.com',name:'Péricles'},B={id:'google:user-B',email:'leticiacost3@gmail.com',name:'Letícia'};
  const {compactSyncState}=require(path.join(temp,'lib/notionDiff')),{moveInboxToDiary}=require(path.join(temp,'lib/diary'));
  const save=async(base,next)=>{const delta=compactSyncState(base,next);return synchronize(delta.base,delta.next,A,async()=>{},true);};
  let state=(await notionLib.readSnapshot(false,A)).state;const name='inbox-cccccccc-cccc-cccc-cccc-cccccccccccc.png',image={id:'inline-regression-file',name,uploadId:'inline-regression-upload',uploadProof:auth.seal({user:A.id,uploadId:'inline-regression-upload',exp:Date.now()+100000})};
  await save(state,{...state,inbox:[...state.inbox,{id:'inline-regression-inbox',text:'Imagem independente do Inbox',attachments:[image]}]});
  state=(await notionLib.readSnapshot(false,A)).state;const source=state.inbox.find(i=>i.legacyId==='inline-regression-inbox'),target=moveInboxToDiary(state,source.id,'2026-08-18'),file=target.diary.find(i=>i.date==='2026-08-18').attachments[0];
  const result=await save(state,target),confirmed=result.files[file.id];assert.equal(confirmed.kind,'diary');assert.notEqual(confirmed.pageId,source.id);assert.equal(rows.get(source.id).in_trash,true);
  const GET=require(path.join(temp,'app/api/notion/attachment/route')).GET,cookie=auth.sessionCookie(A).split(';')[0],address='https://lifeos.test/api/notion/attachment?kind=diary&id='+confirmed.pageId+'&index='+confirmed.index+'&name='+encodeURIComponent(name);
  assert.equal((await GET(new Request(address,{headers:{cookie}}))).status,302,'Diary image opens after source is archived');assert.equal((await GET(new Request(address,{headers:{cookie:auth.sessionCookie(B).split(';')[0]}}))).status,403,'Diary image remains private');
  const oldAddress='https://lifeos.test/api/notion/attachment?kind=inbox&id='+source.id+'&index=0&name='+encodeURIComponent(name);assert.equal((await GET(new Request(oldAddress,{headers:{cookie}}))).status,404,'Deleted source stays inaccessible');
 }
 console.log('PASSOU: autenticação, origem, schemas, criação e vínculos, reenvio sem duplicação, edição parcial, conflitos, conclusão, limites de datas, upload/remover anexos, paginação, escopo de acesso, exclusão de projeto com tarefas e Inbox (múltiplas linhas, edição, conflitos e conversão recuperada após falha).');
 fs.rmSync(temp,{recursive:true});
})().catch(error=>{console.error(error);process.exitCode=1;});

