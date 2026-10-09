import {habitToday} from './habits';
export const ASPECTS=[['humor','Humor','sun','#f4cf57',['Muito mal','Mal','Neutro','Bem','Muito bem']],['mente','Mente','meditate','#b9a0f5',['Calma','Ansiosa','Focada','Distraída','Irritada','Sobrecarregada']],['sono','Sono','sleep','#81bdff',['Ruim','Regular','Boa','Muito boa']],['movimento','Movimento','walk','#83dfa7',['Não','Sim']],['intestino','Intestino','food','#ffb392',['Não','Normal','Ressecado','Solto']],['dores','Dores','heart','#f69cbc',['Nenhuma','Cabeça','Barriga','Costas','Muscular','Outra']],['energy','Energia','sun','#ffcc81',[1,2,3,4,5]],['water','Água','water','#7bdbe4',[]],['stress','Estresse','meditate','#c3b1f4',[1,2,3,4,5]]];
export function validateWellness(item,kind='wellness'){
 if(!item||!/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')||!Number.isFinite(Date.parse(item.date))||new Date(item.date).toISOString().slice(0,10)!==item.date||item.date>habitToday())return 'Informe uma data válida até hoje.';
 const d=item.data;if(!d||typeof d!=='object'||Array.isArray(d)||JSON.stringify(d).length>10000)return 'Dados de bem-estar inválidos.';
 if(typeof d.notes!=='undefined'&&(typeof d.notes!=='string'||d.notes.length>5000))return 'A observação deve ter até 5.000 caracteres.';
 const number=(key,min,max,required=false)=>d[key]==null||d[key]===''?!required:typeof d[key]==='number'&&Number.isFinite(d[key])&&d[key]>=min&&d[key]<=max;
 if(kind==='cycle'){
  if(item.type!=='cycle'||d.subject!=='leticiacost3@gmail.com')return 'O acompanhamento do ciclo pertence à Letícia.';
  if(!['',undefined,'Não','Sim'].includes(d.menstruation)||!['',undefined,'—','Leve','Moderado','Intenso'].includes(d.flow)||!['',undefined,'Nenhuma','Leve','Moderada','Forte'].includes(d.cramps))return 'Selecione os dados do ciclo.';
 }else if(item.type==='day'){
  for(const [key,,, ,options] of ASPECTS.filter(p=>!['water','energy','stress'].includes(p[0])))if(d[key]!=null&&d[key]!==''&&!options.includes(d[key]))return 'Selecione uma opção válida.';
  if(d.painLocations!=null&&(!Array.isArray(d.painLocations)||d.painLocations.length>5||new Set(d.painLocations).size!==d.painLocations.length||d.painLocations.some(v=>!['Cabeça','Barriga','Costas','Muscular','Outra'].includes(v))))return 'Selecione locais de dor válidos.';
  if(d.sleepDuration!=null&&d.sleepDuration!==''&&!['6-','7','8','9+'].includes(d.sleepDuration))return 'Escolha uma duração de sono válida.';
  if(d.painIntensity!=null&&d.painIntensity!==''&&!['Nenhuma','Leve','Moderada','Forte'].includes(d.painIntensity))return 'Escolha uma intensidade válida.';
  if(!number('hours',0,24)||!number('minutes',0,1440)||!number('water',0,20)||!number('energy',0,10)||!number('stress',0,10))return 'Informe valores válidos para o registro diário.';
 }else if(item.type==='pressure'){
  if(!number('systolic',1,400,true)||!number('diastolic',1,300,true)||!number('bpm',1,300,true))return 'Informe pressão e BPM válidos.';
 }else if(item.type==='body'){
  if(!number('weight',1,600,true)||!number('fat',0,100))return 'Informe peso válido e gordura entre 0 e 100%.';
 }else return 'Tipo de registro inválido.';
 return '';
}
export const recordUid=()=> 'well'+Date.now().toString(36)+Math.random().toString(36).slice(2);
export function upsertWellness(list,item){return list.some(p=>p.id===item.id)?list.map(p=>p.id===item.id?item:p):[...list,item];}
export function latestMeasurements(records,type){return records.filter(p=>p.type===type).sort((a,b)=>(b.date+(b.data?.time||'')+(b.data?.createdAt||'')).localeCompare(a.date+(a.data?.time||'')+(a.data?.createdAt||'')));}
// Separate measurements remain intact; only the display groups them by day.
export function dailyPressure(records){
 const groups=new Map();
 for(const item of records.filter(p=>p.type==='pressure')){const group=groups.get(item.date)||[];group.push(item);groups.set(item.date,group);}
 return [...groups].sort(([a],[b])=>b.localeCompare(a)).map(([date,items])=>({id:'pressure-average-'+date,type:'pressure',date,count:items.length,data:Object.fromEntries(['systolic','diastolic','bpm'].map(key=>[key,Math.round(items.reduce((sum,item)=>sum+item.data[key],0)/items.length)]))}));
}
export function maskPressure(value){
 const text=String(value||'');if(text.includes('/')){const [a,...b]=text.split('/');return a.replace(/\D/g,'').slice(0,3)+'/'+b.join('').replace(/\D/g,'').slice(0,2);}
 const digits=text.replace(/\D/g,'').slice(0,5);return digits.length>3?digits.slice(0,3)+'/'+digits.slice(3):digits;
}
export function parsePressure(value){const match=String(value||'').match(/^(\d{2,3})\/(\d{2})$/);return match?{systolic:Number(match[1]),diastolic:Number(match[2])}:null;}

export function aspectFilled(data,key){return key==='dores'?!!(painLocations(data).length||data?.painIntensity||data?.dores==='Nenhuma'):data?.[key]!=null&&data[key]!==''||key==='sono'&&!!data?.sleepDuration;}
export const ASPECT_LABELS={mente:{Calma:'Tranquila',Sobrecarregada:'Sobrecarregada'},movimento:{Não:'Não fiz exercício',Sim:'Fiz exercício'},intestino:{Não:'Não evacuei',Normal:'Evacuação normal',Ressecado:'Fezes ressecadas',Solto:'Fezes soltas'}};

export const CYCLE_CHOICES=[['Menstruação','menstruation',['Não','Sim']],['Fluxo','flow',['—','Leve','Moderado','Intenso']],['Cólicas','cramps',['Nenhuma','Leve','Moderada','Forte']]];
export function updateCycleChoice(records,date,key,value){
 const existing=records.find(item=>item.date===date),item=existing||{id:`well-cycle-leticia-${date}`,name:'Ciclo da Letícia',type:'cycle',date,data:{subject:'leticiacost3@gmail.com',menstruation:'',flow:'',cramps:''}};
 return upsertWellness(records,{...item,data:{...item.data,[key]:value,...(key==='menstruation'&&value==='Não'?{flow:'—'}:{})}});
}

export function painLocations(data){return Array.isArray(data?.painLocations)?data.painLocations:data?.dores&&data.dores!=='Nenhuma'?[data.dores]:[];}
export function togglePainLocation(data,location){const current=painLocations(data);return {...data,dores:'',painLocations:current.includes(location)?current.filter(v=>v!==location):[...current,location]};}
export function deletePetalDay(records,date){return records.filter(item=>!(item.type==='day'&&item.date===date));}
