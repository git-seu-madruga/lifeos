export const INBOX_FILE_LIMIT=4*1024*1024;
export const inboxAcceptsAttachments=kind=>['task','project','diary','someday'].includes(kind);
export const validInboxAttachmentName=name=>typeof name==='string'&&name.length<=200&&(/^inbox-[\da-f-]+\.(png|jpg|webp|gif)$/i.test(name)||/^inbox-file-[\da-f-]+-[^/\\\x00-\x1f\x7f]+$/i.test(name));
export const inboxAttachmentLabel=item=>item.name?.replace(/^inbox-file-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}-/i,'')||'Arquivo';
export const isInboxImage=item=>/\.(png|jpe?g|webp|gif)$/i.test(item.name||'');
export function selectedInboxAttachments(files,existing=[]){
 const list=Array.from(files||[]);
 if(list.some(file=>!file.size||file.size>INBOX_FILE_LIMIT))throw new Error('O limite é 4 MB por arquivo. Arquivos vazios não podem ser enviados.');
 if(existing.length+list.length>100)throw new Error('O limite é 100 anexos por entrada.');
 return list.map(file=>{const id='inbox-file-'+crypto.randomUUID(),name=(file.name||'arquivo').replace(/[/\\\x00-\x1f\x7f]/g,'_').slice(-120)||'arquivo';return {id,name:id+'-'+name,file};});
}
// Destination references must never point to the Inbox page that will be removed.
export function copyInboxAttachments(item,prefix){
 return (item.attachments||[]).map(file=>{
  const {pageId,index,kind,url,...rest}=file;
  return {...rest,id:prefix+':'+item.id+':'+file.id,...(file.notion?{inboxSourceId:item._notionId||item.id}:{})};
 });
}
// Move both collections in one snapshot so autosave can never archive the source first.
export function moveInboxToPlanning(state,inboxId,kind,context='personal',status='active'){
 if(!['task','project'].includes(kind))throw new Error('Destino inválido.');
 const item=(state.inbox||[]).find(entry=>entry.id===inboxId);if(!item)throw new Error('A entrada não está mais no Inbox.');
 const [first,...rest]=item.text.trim().split('\n'),title=first.trim()||inboxAttachmentLabel(item.attachments?.[0]||{});
 if(!title)throw new Error('Informe o título na primeira linha.');
 let hash=14695981039346656037n;for(const char of (state.user?.id||'')+'\0'+item.id){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}
 const collection=kind==='task'?'tasks':'projects',id=(kind==='task'?'t':'pr')+'-inbox-'+hash.toString(16);
 if(state[collection].some(entry=>entry.id===id))throw new Error('Esta entrada já foi transformada. Confira o destino antes de continuar.');
 const attachments=copyInboxAttachments(item,kind+'-inbox'),notes=rest.join('\n').trim();
 const record=kind==='task'?{id,_createdAt:Date.now(),title,status:'todo',due:null,start:null,priority:'medium',context,project:null,milestone:null,attachments,notes,followUp:null,waitingOn:''}:{id,name:title,status,area:'',context,due:null,description:notes,milestones:[],attachments};
 return {state:{...state,[collection]:[...state[collection],record],inbox:state.inbox.filter(entry=>entry.id!==inboxId)},id};
}
