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

export function appendInboxToDiary(entries,item,date) {
  const existing=entries.find(entry=>entry.date===date);
  const text=existing?.text ? existing.text+'\n'+item.text : item.text;
  if(text.length>10000)throw new Error('A entrada do Diário ultrapassaria o limite de 10.000 caracteres. O texto continua no Inbox.');
  const entry=existing?{...existing,text}:{id:`d${date}`,date,text,attachments:[]};
  return {entry,entries:existing?entries.map(other=>other.id===existing.id?entry:other):[...entries,entry]};
}

export const hasDiaryText=entry=>!!entry?.text?.trim();
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
  const text=entry.text.replace(/\s+/g,' ').trim(),folded=normalizeDiarySearch(text);
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
