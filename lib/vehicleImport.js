import {fuelTotals,validateVehicleRecord,odometerError,FUEL_TYPES,categoryList,VEHICLE_CATEGORIES,normalizeStationName} from './vehicles';

export const FUEL_CSV_HEADERS=['id_origem','veiculo','data','km','litros','valor_total_rs','tanque_cheio','combustivel','posto','observacoes','abastecimento_anterior_nao_registrado','local_original','combustiveis_json'];
export const FUEL_CSV_TEMPLATE='\uFEFF'+FUEL_CSV_HEADERS.join(';')+'\r\n';
const required=['id_origem','data','km','litros','valor_total_rs','tanque_cheio'];
function csvRows(text){
 if(typeof text!=='string'||text.length>1024*1024)throw new Error('Use um CSV de até 1 MB.');
 text=text.replace(/^\uFEFF/,'');
 const head=text.split(/\r?\n/,1)[0],delimiter=head.includes(';')?';':',';
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell||closed)throw new Error('Aspas inválidas no CSV.');quoted=true;continue;}
  if(c===delimiter||c==='\n'||c==='\r'){
   row.push(cell);cell='';closed=false;
   if(c!==delimiter){if(row.some(v=>v.trim()))rows.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}
  }else{if(closed)throw new Error('Há texto após o fechamento de aspas no CSV.');cell+=c;}
 }
 if(quoted)throw new Error('Há um campo com aspas não fechadas no CSV.');
 if(cell||closed||row.length){row.push(cell);if(row.some(v=>v.trim()))rows.push(row);}
 if(rows.length<2)throw new Error('O CSV não contém registros.');
 if(rows.length>1001)throw new Error('Importe até 1.000 registros por arquivo.');
 return rows;
}
function scaled(value,places,label){
 const clean=String(value).trim();
 if(!new RegExp('^\\d+(?:[.,]\\d{1,'+places+'})?$').test(clean))throw new Error(`${label}: use números sem separador de milhar, com até ${places} casas decimais.`);
 const [whole,fraction='']=clean.replace(',','.').split('.'),n=Number(whole)*10**places+Number(fraction.padEnd(places,'0'));
 if(!Number.isSafeInteger(n)||n<=0)throw new Error(`${label}: informe um valor positivo.`);return n;
}
function yesNo(value,label,optional=false){const clean=String(value||'').trim().toLocaleLowerCase('pt-BR');if(['sim','1','true'].includes(clean))return true;if(['não','nao','0','false'].includes(clean)||optional&&!clean)return false;throw new Error(`${label}: use Sim ou Não.`);}
function fuelType(value){const t=String(value||'').trim().toLocaleLowerCase('pt-BR');if(['','unknown','não informado','nao informado'].includes(t))return 'unknown';if(['gasoline','gasolina'].includes(t))return 'gasoline';if(['ethanol','etanol','álcool','alcool'].includes(t))return 'ethanol';throw new Error('Combustível inválido: use Gasolina, Etanol ou Não informado.');}
export function parseFuelCsv(text){
 const matrix=csvRows(text),headers=matrix.shift().map(v=>v.trim());
 if(new Set(headers).size!==headers.length)throw new Error('Há colunas repetidas no CSV.');
 const missing=required.filter(k=>!headers.includes(k));if(missing.length)throw new Error('Colunas obrigatórias ausentes: '+missing.join(', '));
 const ids=new Set();return matrix.map((values,index)=>{
  try{
   if(values.length!==headers.length)throw new Error('Quantidade de colunas diferente do cabeçalho.');
   const r=Object.fromEntries(headers.map((k,i)=>[k,values[i]])),source=r.id_origem.trim();
   if(!source||source.length>150)throw new Error('id_origem deve ter de 1 a 150 caracteres.');
   if(ids.has(source))throw new Error('id_origem repetido dentro do arquivo. Use uma linha por abastecimento.');ids.add(source);
   if(!/^\d{2}\/\d{2}\/\d{4}$/.test(r.data.trim()))throw new Error('Data deve estar no formato DD/MM/AAAA.');
   const date=r.data.trim().split('/').reverse().join('-'),km=r.km.trim();
   if(!/^\d+$/.test(km))throw new Error('Quilometragem deve ser inteira, sem separador de milhar.');
   const liters=scaled(r.litros,3,'Litros')/1000,amount=scaled(r.valor_total_rs,2,'Valor'),type=fuelType(r.combustivel);
   let fuels=[{type,liters,amount}];
   if(r.combustiveis_json?.trim()){
    try{fuels=JSON.parse(r.combustiveis_json);}catch{throw new Error('combustiveis_json contém JSON inválido.');}
    if(!Array.isArray(fuels)||!fuels.length)throw new Error('combustiveis_json deve ser uma lista de combustíveis.');
    const total=fuelTotals(fuels);if(total.amount!==amount||Math.abs(total.liters-liters)>.0000001)throw new Error('Os combustíveis não correspondem ao total de litros e valor da linha.');
   }
   const local=(r.local_original||'').trim(),notes=[(r.observacoes||'').trim(),local?'Local na origem: '+local:''].filter(Boolean).join('\n');
   const record={id:'preview',type:'entry',name:'Abastecimento',date,data:{uid:'preview',vehicle:'preview',category:'fuel',fuel:true,km:Number(km),liters,amount,full:yesNo(r.tanque_cheio,'Tanque cheio'),missedPrevious:yesNo(r.abastecimento_anterior_nao_registrado,'Abastecimento anterior não registrado',true),station:(r.posto||'').trim(),notes,fuels,importSourceId:source,createdAt:date+'T12:00:00.000Z'}};
   const error=validateVehicleRecord(record);if(error)throw new Error(error);
   return {source,vehicleName:(r.veiculo||'').trim(),line:index+2,record};
  }catch(e){throw new Error(`Registro ${index+1}: ${e.message}`);}
 });
}
export async function buildFuelImport(rows,vehicle,records,{unknownType='unknown',includePossible=false}={}){
 if(!vehicle||vehicle.type!=='vehicle')throw new Error('Selecione um veículo cadastrado.');
 if(!Object.hasOwn(FUEL_TYPES,unknownType))throw new Error('Escolha um combustível válido.');
 const existing=records.filter(r=>r.type==='entry'&&r.data.vehicle===vehicle.data.uid),bySource=new Set(existing.map(r=>r.data.importSourceId).filter(Boolean));
 const odometers=new Set(existing.filter(r=>r.data.fuel).map(r=>r.date+':'+r.data.km)),uids=new Set(records.map(r=>r.data.uid));
 const expenseSignatures=new Set(existing.filter(r=>!r.data.fuel).map(r=>JSON.stringify([r.date,r.name,r.data.amount,r.data.km])));
 const result={items:[],known:0,possible:0,unknown:0,total:rows.length,labels:[...new Set(rows.map(r=>r.vehicleName).filter(Boolean))]};
 for(const row of rows){
  const digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([vehicle.data.uid,row.record.data.importSourceId]))),uid='fi-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(bySource.has(row.record.data.importSourceId)||uids.has(uid)){result.known++;continue;}
  const isExpense=!row.record.data.fuel;
  const signature=isExpense?JSON.stringify([row.record.date,row.record.name,row.record.data.amount,row.record.data.km]):row.record.date+':'+row.record.data.km,possible=isExpense?expenseSignatures.has(signature):odometers.has(signature);if(possible){result.possible++;if(!includePossible)continue;}
  if(isExpense)expenseSignatures.add(signature);else odometers.add(signature);
  const fuels=row.record.data.fuels?.map(p=>({...p,type:p.type==='unknown'?unknownType:p.type}));
  if(row.record.data.fuels?.some(p=>p.type==='unknown'))result.unknown++;
  const item={...row.record,id:uid,data:{...row.record.data,uid,vehicle:vehicle.data.uid,...(fuels?{fuels}:{category:resolveExpenseCategory(row.record.data.category,records)})}};
  const error=validateVehicleRecord(item);if(error)throw new Error(error);result.items.push(item);
 }
 const combined=[...records,...result.items];
 for(const item of result.items){const error=odometerError(combined,item);if(error)throw new Error(`${item.date.split('-').reverse().join('/')}, ${item.data.km} km: ${error}`);}
 return result;
}

export const EXPENSE_CSV_HEADERS=['id_origem','veiculo','data','descricao','categoria','km','valor_total_rs','observacoes','proxima_km','proxima_data'];
export const EXPENSE_CSV_TEMPLATE='\uFEFF'+EXPENSE_CSV_HEADERS.join(';')+'\r\n';
function resolveExpenseCategory(value,records){
 const categories=categoryList(records),normalized=normalizeStationName(value);
 const builtin=VEHICLE_CATEGORIES.find(c=>normalizeStationName(c.name)===normalized||c.uid===value);
 const uid=normalized==='documentacao'?'tax':builtin?.uid;
 const found=uid?categories.find(c=>c.uid===uid):categories.find(c=>normalizeStationName(c.name)===normalized);
 if(!found||found.uid==='fuel')throw new Error(`Categoria “${value}” indisponível. Cadastre uma categoria compartilhada ou use uma categoria de despesa existente.`);
 return found.uid;
}
export function parseExpenseCsv(text){
 const matrix=csvRows(text),headers=matrix.shift().map(v=>v.trim());
 if(new Set(headers).size!==headers.length)throw new Error('Há colunas repetidas no CSV.');
 const missing=['id_origem','data','descricao','categoria','valor_total_rs'].filter(k=>!headers.includes(k));if(missing.length)throw new Error('Colunas obrigatórias ausentes: '+missing.join(', '));
 const ids=new Set();return matrix.map((values,index)=>{try{
  if(values.length!==headers.length)throw new Error('Quantidade de colunas diferente do cabeçalho.');
  const r=Object.fromEntries(headers.map((k,i)=>[k,values[i]])),source=r.id_origem.trim();
  if(!source||source.length>142||ids.has(source))throw new Error('id_origem vazio, repetido ou maior que 142 caracteres.');ids.add(source);
  const parseDate=(text,optional=false)=>{text=String(text||'').trim();if(!text&&optional)return null;if(!/^\d{2}\/\d{2}\/\d{4}$/.test(text))throw new Error('Use datas DD/MM/AAAA.');return text.split('/').reverse().join('-');};
  const parseKm=text=>{text=String(text||'').trim();if(!text)return null;if(!/^\d+$/.test(text))throw new Error('Use km inteira, sem ponto de milhar.');return Number(text);};
  const raw=r.valor_total_rs.trim(),amount=raw===''?null:/^0(?:[.,]0{1,2})?$/.test(raw)?0:scaled(raw,2,'Valor');
  const date=parseDate(r.data),record={id:'preview',name:r.descricao.trim(),type:'entry',date,data:{uid:'preview',vehicle:'preview',category:r.categoria.trim(),fuel:false,amount,km:parseKm(r.km),notes:(r.observacoes||'').trim(),nextKm:parseKm(r.proxima_km),nextDate:parseDate(r.proxima_data,true),completed:false,importSourceId:'expense:'+source,createdAt:date+'T12:00:00.000Z'}};
  const error=validateVehicleRecord(record);if(error)throw new Error(error);
  return {source,vehicleName:(r.veiculo||'').trim(),line:index+2,record};
 }catch(e){throw new Error(`Registro ${index+1}: ${e.message}`);}});
}
