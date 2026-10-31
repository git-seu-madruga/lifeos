// A follow-up is a task with recurrence metadata; its informational due date
// never ends the recurrence. Calendar math uses ISO days and UTC, not elapsed hours.
const DAY=86400000;
const stamp=iso=>Date.parse(iso+'T12:00:00Z');
const iso=value=>new Date(value).toISOString().slice(0,10);
export const followupToday=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export const isFollowup=task=>!!task?.recurrence;
export const followupDue=(task,today=followupToday())=>!!task.recurrence&&task.recurrence.state!=='ended'&&task.status!=='done'&&task.recurrence.next<=today;
// Visual receipt for the current cycle, derived from the latest receipt only.
// Rescheduling starts a different cycle; a future task without a check stays empty.
export function followupChecked(task,today=followupToday()){
 const rule=task.recurrence,last=rule?.version===1?rule.history?.at(-1):rule?.lastCheck;
 return !!last&&last.date<=today&&today<rule.next&&last.next===rule.next;
}
export const validFollowupDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1000-01-01'&&value<='9999-12-31'&&Number.isFinite(stamp(value))&&iso(stamp(value))===value;
const shift=(date,days)=>iso(stamp(date)+days*DAY);
const weekday=date=>new Date(stamp(date)).getUTCDay();
const monday=date=>stamp(date)-((weekday(date)+6)%7)*DAY;
function monthDate(anchor,offset){
 const d=new Date(stamp(anchor)),index=d.getUTCFullYear()*12+d.getUTCMonth()+offset,y=Math.floor(index/12),m=index%12;
 if(y>9999)return null;
 return iso(Date.UTC(y,m,Math.min(d.getUTCDate(),new Date(Date.UTC(y,m+1,0)).getUTCDate()),12));
}
export function makeFollowup(today=followupToday()){
 return {version:2,mode:'after',unit:'days',every:7,anchor:today,next:today,weekdays:[weekday(today)],lastCheck:null};
}
export function nextFollowupDate(rule,checkedOn){
 if(rule.mode==='after')return rule.unit==='months'?monthDate(checkedOn,rule.every):shift(checkedOn,rule.every*(rule.unit==='weeks'?7:1));
 const after=checkedOn>rule.next?checkedOn:rule.next;
 if(rule.unit==='weeks'){
  for(let day=1;day<=rule.every*7+7;day++){
   const date=shift(after,day),week=Math.round((monday(date)-monday(rule.anchor))/(7*DAY));
   if(week>=0&&week%rule.every===0&&rule.weekdays.includes(weekday(date)))return date;
  }
 }
 if(rule.unit==='months'){
  const a=new Date(stamp(rule.anchor)),b=new Date(stamp(after));let n=Math.max(0,Math.floor(((b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth())/rule.every));
  let date=monthDate(rule.anchor,n*rule.every);while(date&&date<=after)date=monthDate(rule.anchor,++n*rule.every);return date;
 }
 const step=rule.every*DAY,n=Math.max(1,Math.floor((stamp(after)-stamp(rule.anchor))/step)+1);return iso(stamp(rule.anchor)+n*step);
}
// Read legacy rules without mutating hydration/baselines; drop old history on edits.
export function compactFollowup(rule){
 const last=rule.version===1?rule.history?.at(-1):rule.lastCheck;
 return {version:2,mode:rule.mode,unit:rule.unit,every:rule.every,anchor:rule.anchor,next:rule.next,weekdays:rule.weekdays,lastCheck:last?{id:last.id,date:last.date,next:last.next}:null};
}
export function completeFollowup(task,today=followupToday()){
 if(task.locked||!followupDue(task,today))return task;
 const rule=compactFollowup(task.recurrence),next=nextFollowupDate(rule,today);
 if(!validFollowupDate(next))throw new Error('A próxima consulta ultrapassa o intervalo de datas permitido. Ajuste a repetição.');
 return {...task,status:'hold',completedAt:null,recurrence:{...rule,next,lastCheck:{id:crypto.randomUUID(),date:today,next}}};
}
export function followupLabel(rule){
 const units={days:['dia','dias'],weeks:['semana','semanas'],months:['mês','meses']};
 const period=rule.every===1?(rule.unit==='weeks'?'Toda semana':'Todo '+units[rule.unit][0]):'A cada '+rule.every+' '+units[rule.unit][1];
 if(rule.mode==='fixed'&&rule.unit==='weeks')return period+' · '+rule.weekdays.map(d=>['dom','seg','ter','qua','qui','sex','sáb'][d]).join(', ');
 return period+(rule.mode==='after'?' após consulta':' · calendário fixo');
}
export function validateFollowup(task){
 const r=task.recurrence;if(r==null)return '';
 if(typeof r!=='object'||Array.isArray(r)||![1,2].includes(r.version)||(r.version===1&&!['active','paused','ended'].includes(r.state))||(r.version===2&&('state' in r||'history' in r||'total' in r))||!['after','fixed'].includes(r.mode)||!['days','weeks','months'].includes(r.unit)||!Number.isInteger(r.every)||r.every<1||r.every>365||!validFollowupDate(r.next)||!validFollowupDate(r.anchor))return 'Configure uma repetição e uma próxima consulta válidas para o follow-up.';
 if(!Array.isArray(r.weekdays)||!r.weekdays.length||r.weekdays.length>7||new Set(r.weekdays).size!==r.weekdays.length||r.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6))return 'Selecione ao menos um dia da semana.';
 if((r.version===2||r.state!=='ended')&&task.status!=='hold')return 'Follow-ups abertos permanecem em On hold / Follow-up.';
 if((r.version===1&&r.state==='ended')!==(task.status==='done'))return 'Desative o toggle para transformar o acompanhamento em tarefa comum.';
 if(r.version===2){
  if(Object.keys(r).some(key=>!['version','mode','unit','every','anchor','next','weekdays','lastCheck'].includes(key)))return 'Configuração de acompanhamento inválida.';
  const h=r.lastCheck;
  if(h!==null&&(!h||typeof h.id!=='string'||!h.id||h.id.length>100||!validFollowupDate(h.date)||!validFollowupDate(h.next)||h.next<=h.date||Object.keys(h).some(key=>!['id','date','next'].includes(key))))return 'Indicação da última consulta inválida.';
  return '';
 }
 if(!Array.isArray(r.history)||r.history.length>200||!Number.isSafeInteger(r.total)||r.total<r.history.length||r.total<0)return 'Histórico de acompanhamento inválido.';
 const ids=new Set();
 for(const h of r.history){if(!h||typeof h.id!=='string'||h.id.length>100||ids.has(h.id)||!validFollowupDate(h.date)||!validFollowupDate(h.scheduledFor)||!validFollowupDate(h.next)||h.next<=h.date||h.date<h.scheduledFor||!Number.isFinite(h.at)||h.at<=0||typeof h.note!=='string'||h.note.length>500)return 'Registro de acompanhamento inválido.';ids.add(h.id);}
 if(JSON.stringify(r).length>180000)return 'As anotações do acompanhamento ficaram muito extensas.';
 return '';
}

// A paused project only changes visibility, never task dates or recurrence state.
export function taskVisibleOutsideProject(task,projects=[]){
 const project=projects.find(p=>p.id===task.project||p._notionId&&p._notionId===task.project);
 return project?.status!=='paused';
}
export const hasFollowupNotice=(tasks,projects,today=followupToday())=>tasks.some(t=>!t._untouchedDraft&&taskVisibleOutsideProject(t,projects)&&followupDue(t,today));
export function followupDateInfo(task,today=followupToday()){
 const r=task.recurrence;
 if(r.state==='ended')return {text:'Encerrado',tone:'muted'};
 const days=Math.round((stamp(r.next)-stamp(today))/DAY);
 return {text:days<0?`${-days}d atrasado`:days===0?'Hoje':days===1?'Amanhã':r.next.split('-').reverse().join('/'),tone:days<0?'late':days===0?'today':days<=7?'soon':'muted'};
}
