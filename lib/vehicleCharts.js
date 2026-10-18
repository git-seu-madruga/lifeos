import {fuelSummary,orderedFuel,fuelTotals} from './vehicles';

export function vehicleChartData(entries,mode,month){
 const rows=entries.filter(r=>r.type==='entry');
 if(mode==='cost-km')return {title:'Custo por km',caption:'Últimos 12 intervalos completos · R$/km',unit:'R$/km',style:'line',points:fuelSummary(entries).intervals.slice(-12).map(p=>({id:p.id,label:p.date.split('-').reverse().join('/'),axis:p.date.slice(8,10)+'/'+p.date.slice(5,7),value:p.amount/p.distance}))};
 if(mode==='price-liter')return {title:'Preço do combustível por litro',caption:'Últimos 12 abastecimentos · R$/L',unit:'R$/L',style:'line',points:orderedFuel(entries).slice(-12).map(r=>{const total=Array.isArray(r.data.fuels)?fuelTotals(r.data.fuels):r.data;return {id:r.id,label:r.date.split('-').reverse().join('/'),axis:r.date.slice(8,10)+'/'+r.date.slice(5,7),value:total.amount/total.liters};})};
 const isFuel=mode.startsWith('fuel-'),yearly=mode.endsWith('-years'),selected=rows.filter(r=>!!r.data.fuel===isFuel),name=isFuel?'Combustível':'Despesas',points=[];
 if(yearly){
  const years=[...new Set(selected.map(r=>r.date.slice(0,4)))].sort();
  for(const year of years){const list=selected.filter(r=>r.date.startsWith(year+'-'));points.push({id:year,label:year,axis:year,value:list.reduce((s,r)=>s+(r.data.amount??0),0),count:list.length});}
 }else{
  const [year,m]=month.split('-').map(Number),days=new Date(Date.UTC(year,m,0)).getUTCDate();
  for(let day=1;day<=days;day++){const date=month+'-'+String(day).padStart(2,'0'),list=selected.filter(r=>r.date===date);points.push({id:date,label:date.split('-').reverse().join('/'),axis:String(day),value:list.reduce((s,r)=>s+(r.data.amount??0),0),count:list.length});}
 }
 return {title:yearly?`${name} por ano`:`${name} em ${month.slice(5,7)}/${month.slice(0,4)}`,caption:yearly?'Totais anuais de todo o histórico · R$':'Totais diários do mês selecionado · R$',unit:'R$',style:'bars',points};
}
