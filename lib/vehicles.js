export const normalizeStationName=value=>String(value||'').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export const stationList=records=>records.filter(r=>r.type==='station').sort((a,b)=>Number(!!b.data.favorite)-Number(!!a.data.favorite)||a.name.localeCompare(b.name,'pt-BR'));
export const matchingStation=(records,name)=>stationList(records).find(r=>normalizeStationName(r.name)===normalizeStationName(name));
export const FUEL_TYPES={ethanol:'Etanol',gasoline:'Gasolina',unknown:'Não informado'};
export const defaultFuelType=vehicle=>vehicle?.data?.kind==='moto'?'gasoline':'ethanol';
export const fuelTotals=parts=>({liters:parts.reduce((sum,p)=>sum+Math.round((Number(p.liters)||0)*1000),0)/1000,amount:parts.reduce((sum,p)=>sum+(Number(p.amount)||0),0)});
export const fuelTypesLabel=data=>Array.isArray(data.fuels)&&data.fuels.length?[...new Set(data.fuels.map(p=>FUEL_TYPES[p.type]||'Não informado'))].join(' + '):'Não informado';
export function validateFuelParts(parts){if(!Array.isArray(parts)||!parts.length||parts.length>20)return 'Inclua de 1 a 20 linhas de combustível no abastecimento.';for(const p of parts){if(!p||!Object.hasOwn(FUEL_TYPES,p.type))return 'Escolha Etanol, Gasolina ou Não informado em cada linha do abastecimento.';if(typeof p.liters!=='number'||!Number.isFinite(p.liters)||p.liters<=0||p.liters>2000||Math.abs(p.liters*1000-Math.round(p.liters*1000))>.00001)return 'Informe litros positivos, com até três casas decimais, em cada linha.';if(!Number.isSafeInteger(p.amount)||p.amount<=0||p.amount>1000000000000)return 'Informe o valor positivo em reais de cada linha de combustível.';}const totals=fuelTotals(parts);return totals.liters>2000||totals.amount>1000000000000?'O total do abastecimento excede o limite permitido.':'';}
export const VEHICLE_COLORS=['#58a6ff','#ec6c70','#f6c85f','#62c9a0','#b69bf5','#e8edf5','#7b8798','#303947'];
export const VEHICLE_MODELS={car:[['hatch','Hatch'],['sedan','Sedã'],['suv','SUV'],['pickup','Picape']],moto:[['street','Street'],['scooter','Scooter'],['trail','Trail'],['sport','Esportiva']]};
export const VEHICLE_CATEGORIES=[['fuel','Combustível'],['maintenance','Manutenção'],['tax','Impostos'],['toll','Pedágio'],['insurance','Seguro'],['parking','Estacionamento'],['wash','Lavagem'],['other','Outros']].map(([uid,name])=>({uid,name}));
export const vehicleUid=()=>`v-${globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}`;
export const categoryList=records=>{const overrides=new Map(records.filter(r=>r.type==='category').map(r=>[r.data.uid,{...r.data,name:r.name,id:r.id,record:r}]));return [...VEHICLE_CATEGORIES.map(c=>overrides.get(c.uid)||c),...[...overrides.values()].filter(c=>!VEHICLE_CATEGORIES.some(p=>p.uid===c.uid))].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));};
export const vehicleEntries=(records,uid)=>records.filter(r=>['entry','reminder'].includes(r.type)&&r.data.vehicle===uid);
export const vehicleKm=(vehicle,records)=>Math.max(vehicle.data.km||0,...vehicleEntries(records,vehicle.data.uid).filter(r=>r.type==='entry').map(r=>r.data.km??0));
export const orderedFuel=entries=>entries.filter(r=>r.type==='entry'&&r.data.fuel).sort((a,b)=>a.date.localeCompare(b.date)||a.data.km-b.data.km||String(a.data.createdAt||'').localeCompare(String(b.data.createdAt||''))||a.data.uid.localeCompare(b.data.uid));
export function fuelSummary(entries){let anchor=null,milliliters=0,amount=0,latest=null;const intervals=[];for(const row of orderedFuel(entries)){if(row.data.missedPrevious){latest=null;anchor=row.data.full?row:null;milliliters=0;amount=0;continue;}if(!anchor){if(row.data.full)anchor=row;continue;}const totals=Array.isArray(row.data.fuels)?fuelTotals(row.data.fuels):row.data;milliliters+=Math.round(totals.liters*1000);amount+=totals.amount;if(row.data.full){const distance=row.data.km-anchor.data.km,liters=milliliters/1000;if(distance>0&&liters>0){latest=distance/liters;intervals.push({id:row.id,date:row.date,distance,liters,amount,average:latest});}anchor=row;milliliters=0;amount=0;}}const distance=intervals.reduce((s,p)=>s+p.distance,0),totalMl=intervals.reduce((s,p)=>s+Math.round(p.liters*1000),0),totalAmount=intervals.reduce((s,p)=>s+p.amount,0);return {intervals,latest,average:totalMl?distance/(totalMl/1000):null,cost:distance?totalAmount/distance:null};}
// Derived from all loaded history, including records created before these columns.
export function fuelEntryMetrics(entries,summary=fuelSummary(entries)){
 const averages=new Map(summary.intervals.map(interval=>[interval.id,interval.average])),previousByVehicle=new Map();
 return new Map(orderedFuel(entries).map(row=>{
  const previous=previousByVehicle.get(row.data.vehicle),km=row.data.km;
  const distance=Number.isSafeInteger(previous)&&previous>=0&&Number.isSafeInteger(km)&&km>=previous?km-previous:null;
  previousByVehicle.set(row.data.vehicle,km);
  const total=Array.isArray(row.data.fuels)?fuelTotals(row.data.fuels):row.data;
  return [row.id,{pricePerLiter:total.liters>0?total.amount/total.liters:null,average:averages.get(row.id)??null,distance}];
 }));
}
export function maintenanceAlerts(vehicle,records,today){const km=vehicleKm(vehicle,records);return vehicleEntries(records,vehicle.data.uid).filter(r=>!r.data.completed&&(r.data.nextKm!=null||r.data.nextDate)).map(r=>{const remainingKm=r.data.nextKm!=null?r.data.nextKm-km:null,days=r.data.nextDate?Math.round((Date.parse(r.data.nextDate)-Date.parse(today))/86400000):null;const overdue=(remainingKm!=null&&remainingKm<=0)||(days!=null&&days<=0),near=(remainingKm!=null&&remainingKm<=(vehicle.data.warningKm??500))||(days!=null&&days<=30);return {...r,remainingKm,days,state:overdue?'overdue':near?'near':'scheduled'};}).sort((a,b)=>['overdue','near','scheduled'].indexOf(a.state)-['overdue','near','scheduled'].indexOf(b.state)||(a.remainingKm??Infinity)-(b.remainingKm??Infinity)||(a.days??Infinity)-(b.days??Infinity));}
// The navigation notice covers the whole garage, not only the selected vehicle.
export function hasVehicleMaintenanceAlert(records,today){return records.filter(record=>record.type==='vehicle').some(vehicle=>maintenanceAlerts(vehicle,records,today).some(alert=>alert.state==='near'||alert.state==='overdue'));}
const dateValid=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const kmValid=value=>Number.isSafeInteger(value)&&value>=0&&value<=10000000;
export function validateVehicleRecord(item){
 const d=item?.data;if(!d||typeof d!=='object'||Array.isArray(d)||typeof d.uid!=='string'||!/^[-\w]{1,100}$/.test(d.uid)||!['vehicle','category','station','entry','reminder'].includes(item.type))return 'Registro de veículo inválido.';
 if(typeof item.name!=='string'||!item.name.trim()||item.name.length>150)return 'Informe um nome ou descrição com até 150 caracteres.';
 if(JSON.stringify(d).length>20000)return 'O registro excede o tamanho permitido.';
 if(item.type==='vehicle'){if(!VEHICLE_MODELS[d.kind]?.some(([key])=>key===d.model)||!VEHICLE_COLORS.includes(d.color)||!kmValid(d.km)||!kmValid(d.warningKm)||d.context!=='personal'||typeof d.plate!=='string'||d.plate.length>12)return 'Confira modelo, cor, contexto, placa e quilometragem do veículo.';}
 if(item.type==='vehicle'&&d.year!=null&&(!Number.isInteger(d.year)||d.year<1886||d.year>new Date().getFullYear()+2))return 'Informe um ano de veículo válido com quatro dígitos.';
 if(item.type==='station'&&typeof d.favorite!=='boolean')return 'Marque se o posto é favorito.';
 if(item.type==='category'&&d.archived!=null&&typeof d.archived!=='boolean')return 'Categoria inválida.';
 if(['entry','reminder'].includes(item.type)){
  if(!dateValid(item.date)||typeof d.vehicle!=='string'||!d.vehicle)return 'Informe o veículo e uma data válida.';
  if(d.notes!=null&&(typeof d.notes!=='string'||d.notes.length>5000))return 'A observação deve ter até 5.000 caracteres.';
  if(d.nextKm!=null&&!kmValid(d.nextKm)||d.nextDate&&!dateValid(d.nextDate)||d.completed!=null&&typeof d.completed!=='boolean')return 'Confira a próxima quilometragem e a data do lembrete.';
  if(item.type==='reminder'&&d.nextKm==null&&!d.nextDate)return 'Informe a próxima quilometragem ou data do lembrete.';
 }
 if(item.type==='entry'){
  if(d.durationKm!=null&&(!Number.isSafeInteger(d.durationKm)||d.durationKm<=0||!kmValid(d.km)||!kmValid(d.km+d.durationKm)||d.nextKm!==d.km+d.durationKm||d.fuel))return 'Informe a km do serviço e uma duração positiva. O lembrete deve ser a km do serviço mais a duração.';
  if(d.missedPrevious!=null&&(typeof d.missedPrevious!=='boolean'||!d.fuel))return 'A interrupção da média só pode ser marcada em um abastecimento.';
  if(d.importSourceId!=null&&(typeof d.importSourceId!=='string'||!d.importSourceId.trim()||d.importSourceId.length>150))return 'Identificador de importação inválido.';
  if(d.station!=null&&(typeof d.station!=='string'||d.station.length>150))return 'O nome do posto deve ter até 150 caracteres.';
  if(d.fuels!=null){if(!d.fuel)return 'Linhas de combustível só podem pertencer a um abastecimento.';const message=validateFuelParts(d.fuels);if(message)return message;const total=fuelTotals(d.fuels);if(total.amount!==d.amount||Math.abs(total.liters-d.liters)>.0000001||typeof d.liters!=='number')return 'O total de litros e valores deve corresponder às linhas do abastecimento.';}
  if((d.fuel?(!Number.isSafeInteger(d.amount)||d.amount<=0):d.amount!==null&&(!Number.isSafeInteger(d.amount)||d.amount<0))||d.amount>1000000000000||typeof d.category!=='string'||!d.category||d.km!=null&&!kmValid(d.km)||typeof d.fuel!=='boolean')return 'Informe categoria, valor válido (positivo para combustível) e quilometragem válida.';
  if(d.fuel&&(!kmValid(d.km)||typeof d.liters!=='number'||!Number.isFinite(d.liters)||d.liters<=0||d.liters>2000||Math.abs(d.liters*1000-Math.round(d.liters*1000))>.00001||typeof d.full!=='boolean'))return 'Informe km, litros positivos (até três casas decimais) e a condição do tanque.';
 }
 return '';
}
export function vehicleReferencesError(records){const vehicles=new Set(records.filter(r=>r.type==='vehicle').map(r=>r.data.uid)),categories=new Set(categoryList(records).map(c=>c.uid));for(const r of records){if(['entry','reminder'].includes(r.type)&&!vehicles.has(r.data.vehicle))return 'O veículo deste registro não existe. Atualize os dados.';if(r.type==='entry'&&!categories.has(r.data.category))return 'A categoria deste lançamento não existe.';}return '';}
export function odometerError(records,item){
 if(item.type!=='entry'||!item.date||item.data.km==null)return '';
 const conflicts=records.filter(r=>r.id!==item.id&&r.type==='entry'&&r.data.vehicle===item.data.vehicle&&r.data.km!=null),previous=conflicts.filter(r=>r.date<item.date&&r.data.km>item.data.km).sort((a,b)=>b.date.localeCompare(a.date)||b.data.km-a.data.km)[0],later=conflicts.filter(r=>r.date>item.date&&r.data.km<item.data.km).sort((a,b)=>a.date.localeCompare(b.date)||a.data.km-b.data.km)[0];
 const fmt=r=>`${r.data.km.toLocaleString('pt-BR')} km em ${r.date.split('-').reverse().join('/')}`;
 if(previous)return `A quilometragem deve ser maior ou igual a ${fmt(previous)}, já registrado antes desta data.`;
 if(later)return `A quilometragem não pode superar ${fmt(later)}, registrado em data posterior. Confira a data e o odômetro.`;
 return '';
}

export function parseVehicleExpenseAmount(value){
 const clean=String(value).trim().replace(/R\$\s*/g,'').replace(/\s/g,'').replace(/\./g,'');
 if(!clean)return null;
 if(!/^\d+(?:,\d{1,2})?$/.test(clean))return NaN;
 const [whole,fraction='']=clean.split(',');const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(cents)?cents:NaN;
}

export function vehicleExpenseTotals(entries,month,year){
 const rows=entries.filter(r=>r.type==='entry'),expenses=rows.filter(r=>!r.data.fuel),fuel=rows.filter(r=>r.data.fuel),sum=list=>list.reduce((s,r)=>s+(r.data.amount??0),0);
 const expenseTotal=sum(expenses),fuelTotal=sum(fuel);
 return {fuelMonth:sum(fuel.filter(r=>r.date.startsWith(month+'-'))),fuelYear:sum(fuel.filter(r=>r.date.startsWith(year+'-'))),month:sum(expenses.filter(r=>r.date.startsWith(month+'-'))),year:sum(expenses.filter(r=>r.date.startsWith(year+'-'))),expenses:expenseTotal,fuel:fuelTotal,total:expenseTotal+fuelTotal,unknown:expenses.filter(r=>r.data.amount==null).length};
}

export function sortVehicleRows(rows,sort,value){
 if(!sort?.key||!sort.direction)return rows;
 return [...rows].sort((a,b)=>{const x=value(a,sort.key),y=value(b,sort.key);if(x==null||!Number.isFinite(x))return y==null||!Number.isFinite(y)?0:1;if(y==null||!Number.isFinite(y))return -1;return (x-y)*(sort.direction==='asc'?1:-1);});
}
export const nextVehicleSort=(sort,key)=>sort.key!==key?{key,direction:'asc'}:sort.direction==='asc'?{key,direction:'desc'}:{key:null,direction:null};
