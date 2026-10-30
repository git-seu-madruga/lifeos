import {emptyIdeaDoc,ideaText,validateIdeaDoc} from './someday';
export const dateKey = date => `${String(date.getFullYear()).padStart(4,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function calendarDays(year,month) {
  const first=new Date(year,month,1,12);
  const start=new Date(year,month,1-first.getDay(),12);
  return Array.from({length:42},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);return {date:dateKey(date),day:date.getDate(),outside:date.getMonth()!==month};});
}
export function normalizeTabOrder(order,ids) {
  return [...new Set([...(Array.isArray(order)?order:[]).filter(id=>ids.includes(id)),...ids])];
}
export function moveTab(order,from,to) {
  if(from===to||!order.includes(from)||!order.includes(to))return order;
  const next=order.filter(id=>id!==from);next.splice(order.indexOf(to),0,from);return next;
}

// Tap ordering always inserts before the destination, in either direction.
export function moveTabBefore(order,from,to){
  if(from===to||!order.includes(from)||!order.includes(to))return order;
  const next=order.filter(id=>id!==from);
  next.splice(next.indexOf(to),0,from);
  return next;
}

// Convert the old lightweight formatting only when editing, never on load/save.
export function legacyDiaryDoc(text=''){
 const inline=value=>value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g).filter(Boolean).map(part=>{
  if(part.startsWith('**')&&part.endsWith('**'))return {type:'text',text:part.slice(2,-2),marks:[{type:'bold'}]};
  if((part.startsWith('*')&&part.endsWith('*'))||(part.startsWith('_')&&part.endsWith('_')))return {type:'text',text:part.slice(1,-1),marks:[{type:'italic'}]};
  return {type:'text',text:part.startsWith('`')&&part.endsWith('`')?part.slice(1,-1):part};
 });
 const content=[];
 for(const line of text.split('\n')){
  const paragraph={type:'paragraph',content:inline(line.startsWith('- ')?line.slice(2):line.startsWith('## ')?line.slice(3):line)};
  if(line.startsWith('- ')){let list=content.at(-1);if(list?.type!=='bulletList'){list={type:'bulletList',content:[]};content.push(list);}list.content.push({type:'listItem',content:[paragraph]});}
  else content.push(line.startsWith('## ')?{...paragraph,type:'heading',attrs:{level:2}}:paragraph);
 }
 return {type:'doc',content:content.length?content:emptyIdeaDoc().content};
}
export const diaryDoc=entry=>entry?.doc||legacyDiaryDoc(entry?.text||'');
export const diaryText=entry=>entry?.doc?ideaText(entry.doc):entry?.text||'';
export function validateDiary(entry){
 if(entry.doc!=null){const error=validateIdeaDoc(entry.doc,entry.attachments||[]);if(error)return error;if(entry.text!==ideaText(entry.doc))return 'O texto do Diário não corresponde ao documento.';}
 if(typeof entry.text!=='string'||entry.text.length>(entry.doc?30000:10000))return 'O texto do Diário ficou muito extenso.';
 if(new Set((entry.attachments||[]).map(a=>a.name)).size!==(entry.attachments||[]).length&&entry.doc)return 'Os anexos do Diário precisam de nomes únicos.';
 return '';
}
export function removeDiaryAttachments(entry,attachments){
 const names=new Set(attachments.map(a=>a.name));
 const strip=node=>({...node,...(node.content?{content:node.content.filter(n=>n.type!=='ideaImage'||names.has(n.attrs?.attachmentId)).map(strip)}:{})});
 const doc=entry.doc?strip(entry.doc):null;
 return {...entry,attachments,...(doc?{doc,text:ideaText(doc)}:{})};
}
export function appendInboxToDiary(entries,item,date) {
 const existing=entries.find(entry=>entry.date===date);
 const added=(item.attachments||[]).map(file=>({...file,id:'diary-inbox:'+item.id+':'+file.id,...(file.notion?{inboxSourceId:item._notionId||item.id}:{})}));
 const attachments=added.length?[...(existing?.attachments||[]),...added]:(existing?.attachments||[]);
 if(attachments.length>100)throw new Error('O Diário aceita até 100 anexos por dia. A entrada continua no Inbox.');
 if(added.some(file=>(existing?.attachments||[]).some(other=>other.name===file.name)))throw new Error('Já existe um anexo com este nome no Diário. A entrada continua no Inbox.');
 const doc=existing?.doc?{...existing.doc,content:[...existing.doc.content,...(item.text?item.text.split('\n'):[]).map(text=>({type:'paragraph',...(text?{content:[{type:'text',text}]}:{})}))]}:null;
 const text=doc?ideaText(doc):existing?.text?existing.text+(item.text?'\n'+item.text:''):item.text;
 const entry=existing?{...existing,text,attachments,...(doc?{doc}:{})}:{id:`d${date}`,date,text,attachments};
 if(validateDiary(entry))throw new Error('A entrada do Diário ultrapassaria o limite de conteúdo. O texto continua no Inbox.');
 return {entry,entries:existing?entries.map(other=>other.id===existing.id?entry:other):[...entries,entry]};
}

export const hasDiaryText=entry=>!!diaryText(entry).trim();
export const hasDiaryEntry=entry=>hasDiaryText(entry)||!!entry?.attachments?.length;
export function updateDiaryEntry(entries,entry){
 if(!hasDiaryText(entry)&&!entry.attachments?.length)return entries.filter(item=>item.date!==entry.date);
 const existing=entries.find(item=>item.date===entry.date);
 return existing?entries.map(item=>item.id===existing.id?entry:item):[...entries,entry];
}

const normalizeDiarySearch=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
// Keep offsets into the original text so accented matches are highlighted safely.
function diarySearchText(value){
 let folded='',offset=0;const starts=[],ends=[];
 for(const char of value){const normalized=normalizeDiarySearch(char);for(const unit of normalized){folded+=unit;for(let i=0;i<unit.length;i++){starts.push(offset);ends.push(offset+char.length);}}offset+=char.length;}
 return {folded,starts,ends};
}
function diaryMatches(text,terms){
 const {folded,starts,ends}=diarySearchText(text),ranges=[];
 for(const term of terms){let from=0,at;while((at=folded.indexOf(term,from))!==-1){ranges.push({start:starts[at],end:ends[at+term.length-1]});from=at+term.length;}}
 const merged=[];for(const range of ranges.sort((a,b)=>a.start-b.start||b.end-a.end)){const last=merged.at(-1);if(last&&range.start<=last.end)last.end=Math.max(last.end,range.end);else merged.push({...range});}return merged;
}
export function searchDiaryEntries(entries,query){
 const terms=[...new Set(normalizeDiarySearch(String(query||'').trim()).split(/\s+/).filter(Boolean))];if(!terms.length)return [];
 return entries.filter(entry=>hasDiaryText(entry)).flatMap(entry=>{
  const text=diaryText(entry).replace(/\s+/g,' ').trim(),folded=normalizeDiarySearch(text);
  if(!terms.every(term=>folded.includes(term)))return [];
  const matches=diaryMatches(text,terms),first=matches[0],words=[...text.matchAll(/\S+/g)],word=words.findIndex(w=>w.index+w[0].length>first.start);
  let start=Math.max(words[Math.max(0,word-7)].index,first.start-120),end=Math.min(words[Math.min(words.length-1,word+8)].index+words[Math.min(words.length-1,word+8)][0].length,first.end+160);
  // A long query or a single URL can cross the word window; retain the full match.
  end=Math.max(end,first.end);
  if(start>0&&/[\uDC00-\uDFFF]/.test(text[start]))start--;
  if(end<text.length&&/[\uDC00-\uDFFF]/.test(text[end]))end++;
  const parts=[];let cursor=start;
  if(start>0)parts.push({text:'… ',match:false});
  for(const range of matches){if(range.end<=start||range.start>=end)continue;const from=Math.max(start,range.start),to=Math.min(end,range.end);if(from>cursor)parts.push({text:text.slice(cursor,from),match:false});parts.push({text:text.slice(from,to),match:true});cursor=to;}
  if(cursor<end)parts.push({text:text.slice(cursor,end),match:false});if(end<text.length)parts.push({text:' …',match:false});
  return [{entry,parts}];
 }).sort((a,b)=>b.entry.date.localeCompare(a.entry.date)||a.entry.id.localeCompare(b.entry.id));
}

// One snapshot removes the source only after validating the complete destination.
export function moveInboxToDiary(state,id,date){
 if(!state.diaryConfigured)throw new Error('Configure o banco Diário no Notion. A entrada continua no Inbox.');
 const item=(state.inbox||[]).find(item=>item.id===id);if(!item)throw new Error('A entrada não está mais no Inbox.');
 const result=appendInboxToDiary(state.diary||[],item,date);
 return {...state,diary:result.entries,inbox:state.inbox.filter(item=>item.id!==id)};
}
