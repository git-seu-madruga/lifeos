import {allowedEmails,AppError,unseal} from './auth';
import {schema,notion,decode,encode,plain} from './notion';
import {withWriteLock} from './coordination';
import {recadoToday,recadoId,recadoMonthBounds,recadoName,validRecadoMonth} from '../recados';
export async function listRecados(user,month){
 const today=recadoToday();month=month||today.slice(0,7);if(!validRecadoMonth(month))throw new AppError('Mês inválido.');
 const recipient=allowedEmails().find(email=>email!==user.email);
 if(!process.env.NOTION_RECADOS_DATABASE_ID)return {configured:false,items:[],today,month,recipient};
 const source=await schema('recados'),[from,to]=recadoMonthBounds(month);let cursor;const items=[];
 do{const page=await notion(`/data_sources/${source.id}/query`,{method:'POST',body:{page_size:100,filter:{and:[{property:source.fields.date.name,date:{on_or_after:from}},{property:source.fields.date.name,date:{before:to}}]},...(cursor?{start_cursor:cursor}:{})}});for(const row of page.results){if(row.archived||row.in_trash)continue;const item=decode('recados',row,source);if((item.sender===user.email&&item.recipient===recipient)||(item.recipient===user.email&&item.sender===recipient))items.push(item);}cursor=page.has_more?page.next_cursor:null;}while(cursor);
 return {configured:true,items,today,month,recipient};
}
export async function sendRecado(user,input){
 if(typeof input.text!=='string'||!input.text.trim()||input.text.length>12000)throw new AppError('Escreva uma mensagem de até 12.000 caracteres.');
 if(input.title!==undefined&&(typeof input.title!=='string'||input.title.length>200))throw new AppError('O título deve ter até 200 caracteres.');
 const today=recadoToday();if(input.date!==today)throw new AppError('O dia mudou. Atualize os recados antes de enviar.',409);
 const attachment=input.attachment;const attachments=[];
 if(attachment){const proof=unseal(attachment.uploadProof);if(!proof||proof.user!==user.id||proof.uploadId!==attachment.uploadId||proof.kind!=='recados-image'||proof.exp<Date.now())throw new AppError('A imagem precisa ser enviada novamente.',403);attachments.push({id:proof.uploadId,name:String(attachment.name||'imagem').slice(0,180),uploadId:proof.uploadId});}
 return withWriteLock(async guard=>{
  const source=await schema('recados',true),current=await listRecados(user,today.slice(0,7));const existing=current.items.find(item=>item.sender===user.email&&item.date===today);
  if(existing){const trackingPage=await notion(`/pages/${existing.id}`);const tracked=plain(trackingPage.properties[source.tracking.name]?.rich_text);if(tracked===recadoId(today,user.email)&&existing.text===input.text.trim()&&(!input.title?.trim()||existing.name===input.title.trim()))return existing;throw new AppError('Você já enviou o recado de hoje. Amanhã poderá enviar outro.',409);}
  if(recadoToday()!==today)throw new AppError('O dia mudou. Atualize antes de enviar.',409);
  const object={name:input.title?.trim()||`${recadoName(user.email)} → ${recadoName(current.recipient)} · ${today.split('-').reverse().join('/')}`,date:today,sender:user.email,recipient:current.recipient,text:input.text.trim(),attachments,sentAt:new Date().toISOString(),read:false,readAt:null};
  const properties=encode('recados',object,source);properties[source.tracking.name]={rich_text:[{text:{content:recadoId(today,user.email)}}]};
  await guard();return decode('recados',await notion('/pages',{method:'POST',body:{parent:{type:'data_source_id',data_source_id:source.id},properties}}),source);
 });
}
export async function markRecadoRead(user,id){
 if(!/^[a-f\d-]{32,36}$/i.test(id||''))throw new AppError('Recado inválido.');
 return withWriteLock(async guard=>{
  const source=await schema('recados'),page=await notion(`/pages/${id}`);
  if(page.archived||page.in_trash||(page.parent?.data_source_id?page.parent.data_source_id!==source.id:page.parent?.database_id!==source.databaseId))throw new AppError('Recado não encontrado.',404);
  const item=decode('recados',page,source);if(item.recipient!==user.email||!allowedEmails().includes(item.sender)||item.sender===user.email)throw new AppError('Apenas quem recebeu pode marcar este recado como lido.',403);
  if(item.read)return item;await guard();return decode('recados',await notion(`/pages/${id}`,{method:'PATCH',body:{properties:encode('recados',{read:true,readAt:new Date().toISOString()},source,['read','readAt'])}}),source);
 });
}
