import {ILLUSTRATIONS} from './illustrations';
export const IDEA_ICONS=['seedling','bulb','dice','travel','home','books','palette','camera','mountain','sparkles',...ILLUSTRATIONS.map(item=>item.id)];
export const IDEA_COLORS=['#91cfa2','#bba1ef','#edc36f','#81b7ed','#ed9db7','#85cbd0'];
export const emptyIdeaDoc=()=>({type:'doc',content:[{type:'paragraph'}]});
export const ideaUid=()=>globalThis.crypto.randomUUID();
export function safeIdeaUrl(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||!u.hostname.includes('.')||u.href.length>2000)return '';return u.href;}catch{return '';}}
export function ideaText(node){
 if(!node)return '';if(node.type==='text')return node.text||'';
 if(node.type==='hardBreak')return '\n';
 if(node.type==='ideaBookmark')return [node.attrs?.title,node.attrs?.url].filter(Boolean).join(' — ');
 if(node.type==='ideaImage')return node.attrs?.alt?'[Imagem: '+node.attrs.alt+']':'[Imagem]';
 const text=(node.content||[]).map(ideaText).join(['doc','bulletList','orderedList','listItem'].includes(node.type)?'\n':'');
 return text;
}
export function ideaAttachmentIds(doc){const ids=[];const visit=node=>{if(node.type==='ideaImage')ids.push(node.attrs?.attachmentId);for(const child of node.content||[])visit(child);};if(doc)visit(doc);return ids;}
export function validateIdeaDoc(doc,attachments=[]){
 if(!doc||doc.type!=='doc'||!Array.isArray(doc.content))return 'O texto da ideia é inválido.';
 let count=0,textSize=0;const images=new Set(attachments.map(a=>a.name));let error='';
 const visit=(node,depth)=>{
  if(error)return;if(!node||typeof node!=='object'||depth>12||++count>1500){error='O texto da ideia ficou muito extenso.';return;}
  if(!['doc','paragraph','text','hardBreak','heading','bulletList','orderedList','listItem','blockquote','horizontalRule','ideaImage','ideaBookmark'].includes(node.type)){error='Há um bloco de texto não suportado.';return;}
  if(node.type==='doc'&&depth!==0){error='Documento inválido.';return;}
  if(node.type==='text'){if(typeof node.text!=='string'){error='Texto inválido.';return;}textSize+=node.text.length;}
  if(node.marks){if(!Array.isArray(node.marks)){error='Formatação inválida.';return;}for(const mark of node.marks){if(!['bold','italic','strike','underline','link'].includes(mark.type)||mark.type==='link'&&!safeIdeaUrl(mark.attrs?.href)){error='Link ou formatação inválidos.';return;}}}
  if(node.type==='heading'&&![2,3].includes(node.attrs?.level)){error='Título do texto inválido.';return;}
  if(node.type==='ideaImage'&&(!images.has(node.attrs?.attachmentId)||typeof node.attrs?.alt!=='string'||node.attrs.alt.length>300)){error='Uma imagem do texto está sem anexo. Adicione a imagem novamente.';return;}
  if(node.type==='ideaBookmark'){
   const a=node.attrs||{};if(!safeIdeaUrl(a.url)||a.image&&!safeIdeaUrl(a.image)||typeof a.title!=='string'||a.title.length>300||typeof a.description!=='string'||a.description.length>700||typeof a.id!=='string'||a.id.length>100){error='A prévia de link é inválida.';return;}
  }
  if(node.content!==undefined&&!Array.isArray(node.content)){error='Bloco inválido.';return;}
  for(const child of node.content||[])visit(child,depth+1);
 };visit(doc,0);
 if(error)return error;if(textSize>30000||JSON.stringify(doc).length>80000)return 'Use até 30.000 caracteres por ideia.';
 return '';
}
export function validateSomeday(item){
 if(!item||!['idea','area'].includes(item.type)||typeof item.name!=='string'||!item.name.trim()||item.name.length>200||!['personal','work'].includes(item.context))return 'Informe título e contexto válidos para Algum dia.';
 const d=item.data;if(!d||typeof d!=='object'||Array.isArray(d)||typeof d.uid!=='string'||d.uid.length<1||d.uid.length>100||!IDEA_ICONS.includes(d.icon)||!IDEA_COLORS.includes(d.color))return 'A ilustração ou cor da ideia/área é inválida.';
 if(JSON.stringify(d).length>100000)return 'A ideia ficou muito extensa.';
 if(new Set((item.attachments||[]).map(a=>a.name)).size!==(item.attachments||[]).length)return 'Os anexos da ideia precisam de nomes únicos.';
 if(item.type==='area'){if(d.archived!=null&&typeof d.archived!=='boolean')return 'Área inválida.';if((item.attachments||[]).length)return 'Áreas não recebem anexos.';return '';}
 if(typeof d.favorite!=='boolean'||typeof d.area!=='string'||d.area.length>100||!Number.isFinite(d.createdAt)||d.createdAt<=0)return 'Os dados da ideia são inválidos.';
 if(d.promoted&&(!['task','project'].includes(d.promoted.kind)||typeof d.promoted.id!=='string'||d.promoted.id.length>200))return 'A conversão da ideia é inválida.';
 return validateIdeaDoc(d.doc,item.attachments||[]);
}
export function makeArea(name,icon='seedling',color=IDEA_COLORS[0]){const uid=ideaUid();return {id:'sd-area:'+uid,type:'area',name:name.trim(),context:'personal',data:{uid,icon,color,archived:false},attachments:[]};}
export function makeIdea(area=null,context='personal'){const uid=ideaUid();return {id:'sd-idea:'+uid,type:'idea',name:'',context,data:{uid,area:area?.data.uid||'',icon:area?.data.icon||'seedling',color:area?.data.color||IDEA_COLORS[0],favorite:false,createdAt:Date.now(),doc:emptyIdeaDoc()},attachments:[]};}
export const normalizeAreaName=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();

// A conversion is a copy with a stable target ID. The original rich idea stays intact.
export function promoteIdea(state,id,kind){
 if(!['task','project'].includes(kind))throw new Error('Conversão inválida.');
 const idea=(state.someday||[]).find(r=>r.id===id&&r.type==='idea');if(!idea)throw new Error('A ideia não foi encontrada.');
 if(!idea.data.area)throw new Error('Escolha uma área antes de transformar esta ideia.');
 if(idea.data.promoted)throw new Error('Esta ideia já foi transformada. O original foi preservado.');
 if(idea.attachments?.some(a=>a.file&&!a.notion&&!a.uploadId))throw new Error('Aguarde o salvamento dos anexos antes de transformar a ideia.');
 const targetId='someday-'+kind+':'+idea.data.uid,area=(state.someday||[]).find(r=>r.type==='area'&&r.data.uid===idea.data.area);
 const text=ideaText(idea.data.doc),attachments=(idea.attachments||[]).map(a=>({...a,id:targetId+':'+a.id}));
 const target=kind==='task'?{id:targetId,_createdAt:Date.now(),title:idea.name,status:'todo',priority:'medium',context:idea.context,project:null,milestone:null,start:null,due:null,followUp:null,waitingOn:'',notes:text,completedAt:null,attachments,shared:false,responsible:''}:{id:targetId,name:idea.name,status:'active',context:idea.context,area:area?.name||'',due:null,description:text,attachments,milestones:[],shared:false};
 const collection=kind==='task'?'tasks':'projects';
 return {...state,[collection]:(state[collection]||[]).some(r=>r.id===targetId)?state[collection]:[...(state[collection]||[]),target],someday:state.someday.map(r=>r.id===id?{...r,data:{...r.data,promoted:{kind,id:targetId}}}:r)};
}

// Existing project names remain in their original Notion select field. Areas
// live in the private catalog; importing names never rewrites project history.
export function registerProjectAreas(state){
 if(!state.somedayConfigured||!state.user?.id)return state;
 const records=state.someday||[],areas=records.filter(r=>r.type==='area');
 const names=new Set(areas.map(a=>normalizeAreaName(a.name))),added=[];
 for(const project of state.projects||[]){
  const name=(project.area||'').trim(),key=normalizeAreaName(name);
  if(!key||names.has(key)||areas.length+added.length>=100)continue;
  // Deterministic per account/name, so parallel first loads propose the same ID.
  let hash=14695981039346656037n;
  for(const char of state.user.id+'\0'+key){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}
  const uid='project-area-'+hash.toString(16);
  added.push({id:'sd-area:'+uid,type:'area',name,context:'personal',data:{uid,icon:'seedling',color:IDEA_COLORS[0],archived:false},attachments:[]});names.add(key);
 }
 return added.length?{...state,someday:[...records,...added]}:state;
}

// Both collections change in one client snapshot/draft, and use the normal
// incremental conflict checks and retry handling on the server.
export function saveProjectArea(state,record){
 if(!state.somedayConfigured)throw new Error('Configure o banco Algum dia para gerenciar as áreas.');
 const records=state.someday||[],areas=records.filter(r=>r.type==='area');
 const previous=areas.find(a=>a.id===record.id);
 const error=validateSomeday(record);if(record.type!=='area'||error)throw new Error(error||'Área inválida.');
 if(previous&&previous.data.uid!==record.data.uid)throw new Error('O identificador da área não pode mudar.');
 if(!previous&&areas.length>=100)throw new Error('Use até 100 áreas de interesse.');
 if(areas.some(a=>a.id!==record.id&&normalizeAreaName(a.name)===normalizeAreaName(record.name)))throw new Error('Esta área já existe. Selecione-a para editar ou reativar.');
 const renamed=previous&&previous.name!==record.name;
 return {...state,someday:previous?records.map(r=>r.id===record.id?record:r):[...records,record],
  projects:renamed?(state.projects||[]).map(p=>normalizeAreaName(p.area||'')===normalizeAreaName(previous.name)?{...p,area:record.name}:p):state.projects};
}

// Move both collections in one local snapshot. A stable destination protects retries.
export function moveInboxToSomeday(state,inboxId,areaUid){
 if(!state.somedayConfigured)throw new Error('Configure o banco Algum dia no Notion. O texto continua no Inbox.');
 const item=(state.inbox||[]).find(r=>r.id===inboxId);
 if(!item)throw new Error('Esta entrada não está mais no Inbox. Confira as ideias já criadas.');
 if(typeof item.text!=='string')throw new Error('O conteúdo desta entrada é inválido.');
 const [title,...lines]=item.text.replace(/\r\n?/g,'\n').split('\n');
 if(!title.trim()||title.trim().length>200)throw new Error('Use a primeira linha como título, com até 200 caracteres. O texto continua no Inbox.');
 let hash=14695981039346656037n;
 for(const char of (state.user?.id||'')+'\0'+item.id){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}
 const uid='inbox-'+hash.toString(16),id='sd-idea:'+uid;
 const existing=(state.someday||[]).find(r=>r.id===id||r.type==='idea'&&r.data.uid===uid);
 const chosenArea=(state.someday||[]).find(r=>r.type==='area'&&r.data.uid===areaUid&&!r.data.archived);
 if((!existing||!existing.data.area)&&!chosenArea)throw new Error('Escolha uma área ativa para salvar a ideia. O texto continua no Inbox.');
 let sourceHash=14695981039346656037n;for(const char of item.text){sourceHash^=BigInt(char.codePointAt(0));sourceHash=BigInt.asUintN(64,sourceHash*1099511628211n);}
 const inboxSourceHash=sourceHash.toString(16);
 if(existing&&existing.data.inboxSourceHash!==inboxSourceHash)throw new Error('Esta entrada já foi transformada e seu conteúdo mudou depois. O texto continua no Inbox.');
 const idea=existing?(existing.data.area?existing:{...existing,data:{...existing.data,area:chosenArea.data.uid}}):{id,type:'idea',context:'personal',name:title.trim(),data:{uid,inboxSourceHash,area:chosenArea?.data.uid||'',icon:chosenArea?.data.icon||'seedling',color:chosenArea?.data.color||IDEA_COLORS[0],favorite:false,createdAt:Date.now(),doc:{type:'doc',content:(lines.length?lines:['']).map(text=>({type:'paragraph',...(text?{content:[{type:'text',text}]}:{})}))}},attachments:[]};
 const error=validateSomeday(idea);if(error)throw new Error(error+' O texto continua no Inbox.');
 return {state:{...state,someday:existing?state.someday.map(r=>r.id===existing.id?idea:r):[...(state.someday||[]),idea],inbox:state.inbox.filter(r=>r.id!==item.id)},id:idea.id};
}

// Global search intentionally ignores the drawer, context and favorites filters.
export function selectSomedayIdeas(records,{query='',area='all',context='all',favorites=false}={}){
 const areas=new Map(records.filter(r=>r.type==='area').map(r=>[r.data.uid,r]));
 const fold=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 const terms=fold(query).trim().split(/\s+/).filter(Boolean);
 return records.filter(r=>r.type==='idea').filter(r=>terms.length?terms.every(t=>fold(r.name+' '+ideaText(r.data.doc)+' '+(areas.get(r.data.area)?.name||'')).includes(t)):
  (context==='all'||r.context===context)&&(!favorites||r.data.favorite)&&(area==='all'||r.data.area===area))
 .sort((a,b)=>Number(b.data.favorite)-Number(a.data.favorite)||a.data.createdAt-b.data.createdAt||a.id.localeCompare(b.id));
}
export function somedayDrawers(records,options={}){
 const ideas=selectSomedayIdeas(records,{...options,query:'',area:'all'}),areas=records.filter(r=>r.type==='area');
 return [{id:'all',name:'Todos',icon:'books',color:IDEA_COLORS[3],count:ideas.length},
 ...areas.filter(a=>!a.data.archived||ideas.some(i=>i.data.area===a.data.uid)).map(a=>({id:a.data.uid,name:a.name,icon:a.data.icon,color:a.data.color,archived:!!a.data.archived,count:ideas.filter(i=>i.data.area===a.data.uid).length}))];
}
