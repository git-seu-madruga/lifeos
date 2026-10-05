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
process.env.NOTION_TOKEN='test-notion-token';process.env.LIFEOS_PASSWORD='test-password-long';
const auth=require(path.join(temp,'lib/server/auth'));
const notionLib=require(path.join(temp,'lib/server/notion'));
const {synchronize}=require(path.join(temp,'lib/server/sync'));
const {diffState,hasChanges}=require(path.join(temp,'lib/notionDiff'));
process.env.NOTION_DIARY_DATABASE_ID='diary-test-db';
process.env.NOTION_INBOX_DATABASE_ID='inbox-test-db';
process.env.NOTION_FINANCE_CATEGORIES_DATABASE_ID='finance-categories-test';process.env.NOTION_FINANCE_TRANSACTIONS_DATABASE_ID='finance-transactions-test';
const databases={shopping:'shopping-test',contacts:'contacts-test',categories:'finance-categories-test',transactions:'finance-transactions-test',diary:'diary-test-db',inbox:'inbox-test-db',projects:'3ec530f0-f112-80d5-9097-ea21f9ce45d7',milestones:'3ed530f0-f112-80e0-b1e5-f2a861954669',tasks:'3ec530f0-f112-803b-a108-f7778cdee362'};
const sourceIds=Object.fromEntries(Object.keys(databases).map(k=>[k,randomUUID()]));
const specs={
 shopping:{'Nome':'title','Contexto':'select','Itens':'rich_text'},
 contacts:{'Nome':'title','Dia':'number','Mês':'number','Ano de nascimento':'number'},
 categories:{'Nome':'title','Tipo':'select'},transactions:{'Nome':'title','Categoria':'relation','Mês':'date','Valor':'number'},
 diary:{'Nome':'title','Data':'date','Conteúdo':'rich_text','Anexos':'files'},
 inbox:{'Nome':'title','Conteúdo':'rich_text'},
 projects:{'Nome':'title','Status':'select','Contexto':'select','Área':'select','Prazo final':'date','Descrição':'rich_text','Anexos':'files'},
 milestones:{'Nome':'title','Projeto':'relation','Prazo':'date','Concluído':'checkbox','Ordem':'number'},
 tasks:{'Nome':'title','Status':'status','Prioridade':'select','Contexto':'select','Projeto':'relation','Marco':'relation','Início':'date','Prazo':'date','Aguardando':'rich_text','Cobrar em':'date','Anotações':'rich_text','Concluída em':'date','Anexos':'files'},
};
const sources={};for(const [kind,spec] of Object.entries(specs))sources[kind]={id:sourceIds[kind],properties:Object.fromEntries(Object.entries(spec).map(([name,type])=>[name,{id:randomUUID(),name,type,...(type==='relation'?{relation:{data_source_id:sourceIds[name==='Categoria'?'categories':name==='Marco'?'milestones':'projects'],database_id:databases[name==='Categoria'?'categories':name==='Marco'?'milestones':'projects']}}:{})}]))};
const rows=new Map(),calls=[];let creates=0,paginate=false,failShoppingWrite=false;
const kindBySource=id=>Object.keys(sourceIds).find(kind=>sourceIds[kind]===id);
function normalizeProperties(kind,properties) {
 return Object.fromEntries(Object.entries(properties).map(([name,value])=>{
  const type=sources[kind].properties[name].type;
  if(type==='files')value={files:value.files.map(file=>file.type==='file_upload'?{name:file.name,type:'file',file:{url:`https://files.notion.test/${file.file_upload.id}?signature=current`,expiry_time:'2099-01-01'}}:file)};
  return [name,{...value,type}];
 }));
}
global.fetch=async(url,options={})=>{
 assert.equal(options.headers.Authorization,'Bearer test-notion-token');assert.equal(options.headers['Notion-Version'],'2025-09-03');
 const uri=new URL(url),route=uri.pathname.slice(3),method=options.method||'GET';
 const body=options.body instanceof FormData?options.body:options.body?JSON.parse(options.body):undefined;
 calls.push({route,method,body});
 if(failShoppingWrite&&method==='PATCH'&&body?.properties?.Itens){failShoppingWrite=false;return Response.json({message:"Falha simulada na lista"},{status:400});}
 const reply=value=>Response.json(value);
 if(route.startsWith('/databases/')){const kind=Object.keys(databases).find(kind=>databases[kind]===route.split('/')[2]);assert.ok(kind);return reply({id:databases[kind],data_sources:[{id:sourceIds[kind]}]});}
 if(route.startsWith('/data_sources/')){
  const id=route.split('/')[2],kind=kindBySource(id);assert.ok(kind);
  if(route.endsWith('/query')){
   const list=[...rows.values()].filter(row=>row.parent.data_source_id===id&&!row.in_trash);
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
 assert.throws(()=>auth.login(request,'wrong'),error=>error.status===401);
 const cookie=auth.login(request,'test-password-long').split(';')[0];
 const logged=new Request('https://lifeos.test/api/notion',{headers:{cookie}});auth.authorize(logged);
 assert.equal(auth.authenticated(new Request('https://lifeos.test/api',{headers:{cookie:cookie+'bad'}})),false);
 let {state}=await notionLib.readSnapshot();assert.deepEqual(state,{projects:[],tasks:[],inbox:[],diary:[],diaryConfigured:true,categories:[],transactions:[],financeConfigured:true,contacts:[],contactsConfigured:false,shopping:[],shoppingConfigured:false});
 const base=state;
 const file=new File(['arquivo de teste'],'ref.txt',{type:'text/plain'});
 const uploaded=await notionLib.uploadFile(file);
 await assert.rejects(()=>notionLib.uploadFile(new File([new Uint8Array(4*1024*1024+1)],'large.pdf')),error=>error.status===413);
 const next={diary:[],inbox:[],projects:[{id:'local-project',name:'Projeto',status:'active',context:'personal',area:'Casa',due:'2026-12-31',description:'Teste',attachments:[],milestones:[{id:'local-milestone',title:'Etapa',due:'2026-12-01',done:false}]}],tasks:[{id:'local-task',title:'Tarefa',status:'todo',priority:'medium',context:'personal',project:'local-project',milestone:'local-milestone',due:'2026-11-30',start:null,notes:'',waitingOn:'',followUp:null,completedAt:null,attachments:[{id:'local-file',...uploaded}]}]};
 assert.ok(hasChanges(base,next));
 const result=await synchronize(base,next);assert.equal(creates,3);assert.ok(result.bindings['local-project']);assert.ok(result.files['local-file'].url);
 await synchronize(base,next);assert.equal(creates,3,'Reenvio não deve criar duplicatas');
 ({state}=await notionLib.readSnapshot());assert.equal(state.projects.length,1);assert.equal(state.projects[0].milestones.length,1);assert.equal(state.tasks[0].project,state.projects[0].id);assert.equal(state.tasks[0].attachments.length,1);
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
 ({state}=await notionLib.readSnapshot());assert.equal(state.projects.length,0);assert.equal(state.tasks.length,2);assert.equal(state.tasks[0].project,null);
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
 const emptyDiary=structuredClone(state);emptyDiary.diary[0].attachments=[];await synchronize(state,emptyDiary);
 ({state}=await notionLib.readSnapshot());assert.equal(state.diary[0].attachments.length,0);
 delete process.env.NOTION_DIARY_DATABASE_ID;
 const withoutDiary=(await notionLib.readSnapshot()).state;assert.equal(withoutDiary.diaryConfigured,false);assert.deepEqual(withoutDiary.diary,[]);
 await assert.rejects(()=>synchronize(withoutDiary,{...withoutDiary,diary:[{id:'new-day',date:'2026-10-05',text:'Teste',attachments:[]}]}),/NOTION_DIARY_DATABASE_ID/);
 process.env.NOTION_DIARY_DATABASE_ID='diary-test-db';

 ({state}=await notionLib.readSnapshot());
 const withFinance={...state,categories:[{id:'cat-in',name:'Salário',flow:'in'},{id:'cat-out',name:'Aluguel',flow:'out'}],transactions:[{id:'tx-one',name:'Salário',category:'cat-in',month:'2026-10',amount:12345}]};
 await synchronize(state,withFinance);const countFinance=creates;await synchronize(state,withFinance);assert.equal(creates,countFinance,'Finanças não deve duplicar após reenvio');
 ({state}=await notionLib.readSnapshot());assert.equal(state.transactions[0].amount,12345);assert.equal(state.transactions[0].date,'2026-10-01');assert.equal(state.categories.length,2);assert.equal(rows.get(state.transactions[0].id).properties['Valor'].number,123.45);
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
 ({state}=await notionLib.readSnapshot());assert.equal(state.contactsConfigured,true);
 const contactNext=structuredClone(state);contactNext.contacts=[{id:'contact-known',name:'Ana',day:4,month:10,year:1990},{id:'contact-unknown',name:'João',day:29,month:2,year:null}];
 const contactStart=calls.length;await synchronize(state,contactNext);await synchronize(state,contactNext);
 ({state}=await notionLib.readSnapshot());assert.equal(state.contacts.length,2);assert.equal(state.contacts.find(p=>p.name==='Ana').year,1990);const unknown=state.contacts.find(p=>p.name==='João');assert.equal(unknown.year,null);assert.equal(rows.get(unknown.id).properties['Ano de nascimento'].number,null);
 const changedContact=structuredClone(state);changedContact.contacts.find(p=>p.name==='Ana').name='Ana Costa';await synchronize(state,changedContact);({state}=await notionLib.readSnapshot());assert.ok(state.contacts.some(p=>p.name==='Ana Costa'));
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
 const inboxNext=structuredClone(state);inboxNext.inbox.push({id:'shopping-inbox',text:'MERCADO\nBananas\nOvos',createdAt:Date.now()});await synchronize(state,inboxNext);({state}=await notionLib.readSnapshot());const source=state.inbox.find(p=>p.text==='MERCADO\nBananas\nOvos');const {shoppingFromInbox}=require(path.join(temp,'lib/shopping'));const merged=shoppingFromInbox(state.shopping,source.text,'personal');const converted={...state,shopping:merged.lists,inbox:state.inbox.filter(p=>p.id!==source.id)};failShoppingWrite=true;await assert.rejects(()=>synchronize(state,converted),/Falha simulada/);assert.equal(rows.get(source.id).in_trash,false,'Falha de gravação não exclui Inbox');const start=calls.length;await synchronize(state,converted);const writes=calls.slice(start);assert.ok(writes.findIndex(c=>c.route===`/pages/${state.shopping[0].id}`&&c.body?.properties)<writes.findIndex(c=>c.route===`/pages/${source.id}`&&c.body?.in_trash));await synchronize(state,converted);({state}=await notionLib.readSnapshot());assert.deepEqual(state.shopping[0].items.map(p=>p.text),['Café','Bananas','Ovos']);
 await synchronize(state,{...state,shopping:[]});assert.equal((await notionLib.readSnapshot()).state.shopping.length,0);delete process.env.NOTION_SHOPPING_DATABASE_ID;assert.equal((await notionLib.readSnapshot()).state.shoppingConfigured,false);
 }
 const get=require(path.join(temp,'app/api/notion/route')).GET;
 const denied=await get(request);assert.equal(denied.status,401);assert.equal(calls.some(call=>call.route.includes('undefined')),false);
 console.log('PASSOU: autenticação, origem, schemas, criação e vínculos, reenvio sem duplicação, edição parcial, conflitos, conclusão, limites de datas, upload/remover anexos, paginação, escopo de acesso, exclusão preservando tarefas e Inbox (múltiplas linhas, edição, conflitos e conversão recuperada após falha).');
 fs.rmSync(temp,{recursive:true});
})().catch(error=>{console.error(error);process.exitCode=1;});
