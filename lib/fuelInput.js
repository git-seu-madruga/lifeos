import {money,parseMoney} from './finance';

const fields=['liters','value','price'];
export function fuelDecimal(text){
 const clean=String(text).trim().replace('.',',');
 if(!/^\d+(?:,\d{0,3})?$/.test(clean))return null;
 const [whole,fraction='']=clean.split(','),value=Number(whole)*1000+Number(fraction.padEnd(3,'0'));
 return Number.isSafeInteger(value)&&value>0?value:null;
}
const amount=text=>parseMoney(String(text).replace(/,$/,',0'));
const decimal=value=>(value/1000).toFixed(3).replace('.',',');
export const completeFuelPrice=text=>fuelDecimal(text)==null?text:decimal(fuelDecimal(text));
const rounded=(numerator,denominator)=>{const result=(numerator+denominator/2n)/denominator;return result<=BigInt(Number.MAX_SAFE_INTEGER)?Number(result):null;};
export function fuelInputPart(part){
 const next={...part,price:'',edited:[]};
 const liters=fuelDecimal(part.liters),total=amount(part.value);
 if(liters&&total){const price=rounded(BigInt(total)*10000n,BigInt(liters));next.price=price==null?'':decimal(price);next.edited=['liters','value'];next.calculated='price';}
 return next;
}
// The last two fields explicitly edited are the inputs; automatic updates never change that order.
export function updateFuelInput(part,field,text){
 if(!fields.includes(field))return {...part,[field]:text};
 const next={...part,[field]:text,edited:[field,...(part.edited||[]).filter(key=>key!==field)]};
 const values={liters:fuelDecimal(next.liters),value:amount(next.value),price:fuelDecimal(next.price)};
 if(!values[field]){if(part.calculated&&part.calculated!==field)next[part.calculated]='';return next;}
 const partner=[...next.edited,...fields].find(key=>key!==field&&values[key]);
 if(!partner)return next;
 const target=fields.find(key=>key!==field&&key!==partner);
 let result;
 if(target==='value')result=rounded(BigInt(values.liters)*BigInt(values.price),10000n);
 else if(target==='liters')result=rounded(BigInt(values.value)*10000n,BigInt(values.price));
 else result=rounded(BigInt(values.value)*10000n,BigInt(values.liters));
 next[target]=result==null?'':target==='value'?money(result):decimal(result);
 next.calculated=target;return next;
}
