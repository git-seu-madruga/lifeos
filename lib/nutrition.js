import {FOOD_ILLUSTRATIONS} from './illustrations';
import {habitToday} from './habits';

export const MEALS=['Café da manhã','Almoço','Lanche','Jantar','Ceia','Outros'];
export const FOOD_ICONS=['rice','bread','fruit','banana','meat','chicken','fish','egg','milk','cheese','salad','potato','beans','pasta','cookie','coffee','plate','sweet','oil','drink','nut',...FOOD_ILLUSTRATIONS.map(item=>item.id)];
export const DEFAULT_TARGET=2412;
export const nutritionUid=()=> 'nut'+Date.now().toString(36)+Math.random().toString(36).slice(2);
export const foldFood=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const roundKcal=value=>Math.round((value+Number.EPSILON)*100)/100;
export function foodIcon(food){
 if(FOOD_ICONS.includes(food?.icon))return food.icon;
 const name=foldFood(food?.name),category=foldFood(food?.category);
 const rules=[[/arroz/,'rice'],[/banana/,'banana'],[/cafe|cha,/,'coffee'],[/frango|galinha|peru,/,'chicken'],[/queijo|requeijao/,'cheese'],[/leite|iogurte/,'milk'],[/ovo,/,'egg'],[/pao|torrada/,'bread'],[/macarrao|lasanha/,'pasta'],[/batata/,'potato'],[/feijao|lentilha|grao.de.bico/,'beans'],[/biscoito|bolacha/,'cookie'],[/chocolate|bolo|doce|acucar|sorvete/,'sweet']];
 for(const [pattern,icon] of rules)if(pattern.test(name))return icon;
 for(const [pattern,icon] of [[/fruta/,'fruit'],[/carne/,'meat'],[/pescado/,'fish'],[/verdura/,'salad'],[/leite/,'milk'],[/oleo|gordura/,'oil'],[/bebida/,'drink'],[/nozes/,'nut'],[/leguminosa/,'beans'],[/cerea/,'bread']])if(pattern.test(category))return icon;
 return 'plate';
}
export function safeFoodImage(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.hostname==='images.openfoodfacts.org'?u.href:'';}catch{return '';}}
export function normalizeFood(food){return {id:String(food.id||'').slice(0,150),name:String(food.name||'').trim().slice(0,300),category:String(food.category||'').slice(0,200),source:String(food.source||'Próprio').slice(0,80),kcal100:Number(food.kcal100),unit:food.unit==='ml'?'ml':'g',portionQuantity:food.portionQuantity>0?Number(food.portionQuantity):null,icon:foodIcon(food),image:safeFoodImage(food.image)};}
export function validFood(f){return !!f&&typeof f.id==='string'&&f.id.length>0&&f.id.length<=150&&typeof f.name==='string'&&!!f.name.trim()&&f.name.length<=300&&typeof f.kcal100==='number'&&Number.isFinite(f.kcal100)&&f.kcal100>=0&&f.kcal100<=1000&&['g','ml'].includes(f.unit)&&(!f.portionQuantity||(typeof f.portionQuantity==='number'&&Number.isFinite(f.portionQuantity)&&f.portionQuantity>0&&f.portionQuantity<=10000))&&(!f.image||safeFoodImage(f.image)===f.image)&&(!f.icon||FOOD_ICONS.includes(f.icon));}
export function foodKcal(food,quantity,measure=food.unit){const amount=Number(quantity)*(measure==='portion'?food.portionQuantity||0:1);return roundKcal(food.kcal100*amount/100);}
export function searchFoods(list,query,limit=40,showAllWhenEmpty=false){const words=foldFood(query).split(/\s+/).filter(Boolean);if(!words.length&&!showAllWhenEmpty)return [];return list.filter(f=>words.every(w=>foldFood(f.name+' '+(f.category||'')).includes(w))).sort((a,b)=>foldFood(a.name).localeCompare(foldFood(b.name),'pt-BR')).slice(0,limit);}
export function recipeFood(name,ingredients,yieldGrams,icon='plate',id=nutritionUid()){
 const total=ingredients.reduce((sum,p)=>sum+foodKcal(p.food,p.quantity,p.measure||p.food.unit),0);
 return normalizeFood({id,name,kcal100:roundKcal(total/Number(yieldGrams)*100),unit:'g',source:'Receita própria',icon});
}
export function nutritionDay(records,date,target=DEFAULT_TARGET){
 const day=records.find(r=>r.type==='day'&&r.date===date),entries=records.filter(r=>r.type==='entry'&&r.date===date);
 const total=roundKcal(entries.reduce((s,r)=>s+r.data.kcal,0)),inside=roundKcal(entries.filter(r=>r.data.inside).reduce((s,r)=>s+r.data.kcal,0));
 const limit=day?.data.target??target,adherence=total>0?inside/total:null;
 const water=!!day?.data.water,exercise=!!(day?.data.aerobic||day?.data.strength),within=total>0&&total<=limit;
 const base=(water ? 0.1 : 0)+(exercise ? 0.2 : 0)+(within ? 0.7 : 0);
 return {day,entries,total,inside,outside:roundKcal(total-inside),target:limit,remaining:roundKcal(limit-total),adherence,base,quality:adherence==null?null:base*adherence,water,exercise,within};
}
export function nutritionSummary(records,prefix,target=DEFAULT_TARGET){
 const dates=[...new Set(records.filter(r=>r.date?.startsWith(prefix)&&['day','entry'].includes(r.type)).map(r=>r.date))].sort();
 const days=dates.map(date=>({date,...nutritionDay(records,date,target)}));const scored=days.filter(d=>d.quality!=null);
 const avg=key=>scored.length?scored.reduce((sum,d)=>sum+d[key],0)/scored.length:null;
 return {days,logged:scored.length,quality:avg('quality'),adherence:avg('adherence'),kcal:avg('total'),good:scored.filter(d=>d.quality>.7).length};
}
export function validateNutrition(item){
 if(!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>300)return 'Informe um nome válido no Acompanhamento.';
 const d=item.data;if(!d||typeof d!=='object'||Array.isArray(d)||JSON.stringify(d).length>15000||typeof d.uid!=='string'||!d.uid||d.uid.length>150)return 'Dados de acompanhamento inválidos.';
 const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 if(['day','entry'].includes(item.type)){if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')||!Number.isFinite(Date.parse(item.date))||new Date(item.date).toISOString().slice(0,10)!==item.date||item.date>habitToday())return 'Escolha uma data válida até hoje.';}
 else if(item.date)return 'Alimentos e configurações não possuem data.';
 if(item.type==='settings'){if(!number(d.target,1,20000))return 'Informe a meta em kcal.';}
 else if(item.type==='day'){
  if(!number(d.target,1,20000))return 'Informe a meta em kcal.';
  for(const k of ['water','aerobic','strength'])if(d[k]!=null&&typeof d[k]!=='boolean')return 'Marcação de rotina inválida.';
  if(d.waterLiters!=null&&!number(d.waterLiters,0,20)||d.sleepHours!=null&&!number(d.sleepHours,0,24))return 'Informe água e sono válidos.';
  if(d.notes!=null&&(typeof d.notes!=='string'||d.notes.length>5000))return 'Observações devem ter até 5.000 caracteres.';
 }else if(item.type==='entry'){
  if(!validFood(d.food)||!number(d.quantity,.01,100000)||![d.food.unit,'portion'].includes(d.measure)||d.measure==='portion'&&!d.food.portionQuantity||!MEALS.includes(d.meal)||typeof d.inside!=='boolean'||!number(d.kcal,0,1000000)||Math.abs(d.kcal-foodKcal(d.food,d.quantity,d.measure))>.005)return 'Confira alimento, quantidade, refeição e calorias.';
 }else if(item.type==='food'){
  if(!validFood(d.food)||typeof d.favorite!=='boolean'||typeof d.archived!=='boolean')return 'Confira o cadastro do alimento.';
  if(d.ingredients!=null){if(!Array.isArray(d.ingredients)||d.ingredients.length<1||d.ingredients.length>40||!number(d.yieldGrams,1,100000)||d.ingredients.some(p=>!validFood(p.food)||!number(p.quantity,.01,100000)||![p.food.unit,'portion'].includes(p.measure)||p.measure==='portion'&&!p.food.portionQuantity))return 'Confira ingredientes e peso final da receita.';
   if(Math.abs(recipeFood(d.food.name,d.ingredients,d.yieldGrams,d.food.icon,d.food.id).kcal100-d.food.kcal100)>.005)return 'As calorias da receita não correspondem aos ingredientes.';}
 }else return 'Tipo de acompanhamento inválido.';
 return '';
}
