import {validateVehicleRecord,odometerError} from './vehicles';
// Each confirmed batch uses the normal incremental sync and its persistent draft.
export async function runFuelImport(items,{read,append,flush,onProgress=()=>{},shouldPause=()=>false}){
 if(!Array.isArray(items)||!items.length||items.length>1000)throw new Error('Selecione de 1 a 1.000 abastecimentos.');
 const vehicle=items[0].data.vehicle;
 for(const item of items){const error=validateVehicleRecord(item);if(error||!item.data.fuel||!item.data.importSourceId||item.data.vehicle!==vehicle)throw new Error(error||'Arquivo de importação inválido.');}
 await flush();onProgress({done:0,total:items.length});
 for(let offset=0;offset<items.length;offset+=5){
  if(shouldPause())throw new Error('Importação pausada. Volte ao aplicativo e retome com o mesmo arquivo.');
  const records=read();if(!records?.some(r=>r.type==='vehicle'&&r.data.uid===vehicle))throw new Error('O veículo ou a sessão mudou. Entre novamente e confira os dados.');
  const batch=items.slice(offset,offset+5).filter(item=>!records.some(r=>r.data.uid===item.data.uid||r.type==='entry'&&r.data.vehicle===vehicle&&r.data.importSourceId===item.data.importSourceId));
  const combined=[...records,...batch];
  for(const item of batch){const message=odometerError(combined,item);if(message)throw new Error(message);}
  if(batch.length){append(batch);await flush();}
  if(shouldPause())throw new Error('Importação pausada. Os dados do último lote foram mantidos; retome com o mesmo arquivo.');
  onProgress({done:Math.min(offset+5,items.length),total:items.length});
 }
}
