import {ideaText,ideaAttachmentIds,validateIdeaDoc} from './someday';
export const planningTextField=kind=>kind==='tasks'?'notes':'description';
// Opening a legacy record only presents literal paragraphs; it does not migrate it.
export function planningDoc(item,kind){return item.doc||{type:'doc',content:String(item[planningTextField(kind)]||'').split('\n').map(text=>({type:'paragraph',...(text?{content:[{type:'text',text}]}:{})}))};}
export function validatePlanningDocument(item,kind){
 if(!Array.isArray(item.attachments||[]))return 'Anexos inválidos.';
 if((item.attachments||[]).length>100)return 'Use até 100 anexos por entrada.';
 if(item.doc==null)return '';
 const files=item.attachments||[],error=validateIdeaDoc(item.doc,files);if(error)return error;
 if(item[planningTextField(kind)]!==ideaText(item.doc))return 'A descrição não corresponde ao documento.';
 if(ideaAttachmentIds(item.doc).some(name=>files.filter(file=>file.name===name).length!==1))return 'Uma imagem tem nomes de anexos ambíguos.';
 return '';
}
export function setPlanningDocument(item,kind,doc){
 const before=new Set(ideaAttachmentIds(item.doc)),after=new Set(ideaAttachmentIds(doc));
 return {...item,doc,[planningTextField(kind)]:ideaText(doc),attachments:(item.attachments||[]).filter(file=>!before.has(file.name)||after.has(file.name))};
}
export function planningManualAttachments(item){const inline=new Set(ideaAttachmentIds(item.doc));return (item.attachments||[]).filter(file=>!inline.has(file.name));}
export function setPlanningManualAttachments(item,files){
 const manualIds=new Set(planningManualAttachments(item).map(file=>file.id));
 return {...item,attachments:[...(item.attachments||[]).filter(file=>!manualIds.has(file.id)),...files]};
}
export const planningDocumentPatch=(item,kind)=>({doc:item.doc??null,[planningTextField(kind)]:item[planningTextField(kind)]||'',attachments:item.attachments||[]});
