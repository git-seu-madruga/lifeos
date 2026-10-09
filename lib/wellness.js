import {habitToday} from './habits';
export const ASPECTS=[['humor','Humor','sun','#f4cf57',['Muito mal','Mal','Neutro','Bem','Muito bem']],['mente','Mente','meditate','#b9a0f5',['Calma','Ansiosa','Focada','Distraída','Irritada']],['sono','Sono','sleep','#81bdff',['Ruim','Regular','Boa','Muito boa']],['movimento','Movimento','walk','#83dfa7',['Não','Sim']],['intestino','Intestino','food','#ffb392',['Não','Normal','Ressecado','Solto']],['dores','Dores','heart','#f69cbc',['Nenhuma','Cabeça','Barriga','Costas','Muscular','Outra']]];
export function validateWellness(item,kind='wellness'){
 if(!item||!/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')||!Number.isFinite(Date.parse(item.date))||new Date(item.date).toISOString().slice(0,10)!==item.date||item.date>habitToday())return 'Informe uma data válida até hoje.';
 const d=item.data;if(!d||typeof d!=='object'||Array.isArray(d)||JSON.stringify(d).length>10000)return 'Dados de bem-estar inválidos.';
 if(typeof d.notes!=='undefined'&&(typeof d.notes!=='string'||d.notes.length>5000))return 'A observação deve ter até 5.000 caracteres.';
 const number=(key,min,max,required=false)=>d[key]==null||d[key]===''?!required:typeof d[key]==='number'&&Number.isFinite(d[key])&&d[key]>=min&&d[key]<=max;
 if(kind==='cycle'){
  if(item.type!=='cycle'||d.subject!=='leticiacost3@gmail.com')return 'O acompanhamento do ciclo pertence à Letícia.';
  if(!['Não','Sim'].includes(d.menstruation)||!['—','Leve','Moderado','Intenso'].includes(d.flow)||!['Nenhuma','Leve','Moderada','Forte'].includes(d.cramps))return 'Selecione os dados do ciclo.';
 }else if(item.type==='day'){
  for(const [key,,, ,options] of ASPECTS)if(d[key]!=null&&d[key]!==''&&!options.includes(d[key]))return 'Selecione uma opção válida.';
  if(!number('hours',0,24)||!number('minutes',0,1440)||!number('water',0,20)||!number('energy',0,10)||!number('stress',0,10))return 'Informe valores válidos para o registro diário.';
 }else if(item.type==='pressure'){
  if(!number('systolic',1,400,true)||!number('diastolic',1,300,true)||!number('bpm',1,300,true)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.time||''))return 'Informe pressão, BPM e horário válidos.';
 }else if(item.type==='body'){
  if(!number('weight',1,600,true)||!number('fat',0,100))return 'Informe peso válido e gordura entre 0 e 100% (opcional).';
 }else return 'Tipo de registro inválido.';
 return '';
}
export const recordUid=()=> 'well'+Date.now().toString(36)+Math.random().toString(36).slice(2);
export function upsertWellness(list,item){return list.some(p=>p.id===item.id)?list.map(p=>p.id===item.id?item:p):[...list,item];}
export function latestMeasurements(records,type){return records.filter(p=>p.type===type).sort((a,b)=>(b.date+(b.data?.time||'')+(b.data?.createdAt||'')).localeCompare(a.date+(a.data?.time||'')+(a.data?.createdAt||'')));}
