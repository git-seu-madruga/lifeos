export const money=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export const currentMonth=()=>`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
export const formatMonth=value=>value?`${value.slice(5,7)}/${value.slice(0,4)}`:'';
export function maskMonth(text){const digits=text.replace(/\D/g,'').slice(0,6);return digits.slice(0,2)+(digits.length>2?'/'+digits.slice(2):'');}
export function parseMonth(text,year=new Date().getFullYear()) {
 const match=text.trim().match(/^(\d{1,2})(?:\/(\d{4}))?$/);if(!match)return {error:'Use MM ou MM/AAAA.'};
 const month=Number(match[1]),y=Number(match[2]||year);if(month<1||month>12||y<1000||y>9999)return {error:'Mês ou ano inválido.'};
 return {value:`${y}-${String(month).padStart(2,'0')}`};
}
export function parseMoney(text){const normalized=text.trim().replace(/R\$\s*/g,'').replace(/\s/g,'');if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(normalized))return null;const [whole,decimal='']=normalized.replace(/\./g,'').split(',');const cents=Number(whole)*100+Number(decimal.padEnd(2,'0'));return Number.isSafeInteger(cents)&&cents>0&&cents<=1000000000000?cents:null;}
export const normalizeTransaction=row=>{const {month,...rest}=row;return {...rest,notes:row.notes || '',date:row.date || (month ? month+'-01' : '')};};
export const startOfMonth=month=>month+'-01';
export function endOfMonth(month){const [year,m]=month.split('-').map(Number);const last=new Date(year,m,0).getDate();return month+'-'+String(last).padStart(2,'0');}
export const sortedCategories=categories=>[...categories].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base',numeric:true}));
export function consolidate(categories,transactions,start,end){
 start=start.length===7?startOfMonth(start):start;end=end.length===7?endOfMonth(end):end;
 const totals=new Map();for(const input of transactions){const row=normalizeTransaction(input);if(row.date>=start&&row.date<=end)totals.set(row.category,(totals.get(row.category)||0)+row.amount);}
 const nodes=sortedCategories(categories).map(category=>({...category,value:totals.get(category.id)||0})).filter(node=>node.value>0);
 const income=nodes.filter(n=>n.flow==='in').reduce((sum,n)=>sum+n.value,0),expense=nodes.filter(n=>n.flow==='out').reduce((sum,n)=>sum+n.value,0),balance=income-expense;
 const left=nodes.filter(n=>n.flow==='in'),right=nodes.filter(n=>n.flow==='out');
 if(balance>0)right.push({id:'system-balance',name:'Saldo restante',value:balance,system:true,flow:'balance'});
 if(balance<0)left.push({id:'system-deficit',name:'Saldo faltante',value:-balance,system:true,flow:'deficit'});
 return {income,expense,balance,left,right,total:Math.max(income,expense)};
}
export function sankeyLayout(summary) {
 const gap=44,height=Math.max(440,Math.max(summary.left.length,summary.right.length)*70+80),available=height-100;
 const scale=summary.total?(available-gap*Math.max(0,Math.max(summary.left.length,summary.right.length)-1))/summary.total:0;
 const centralHeight=summary.total*scale,centerY=(height-centralHeight)/2;
 const side=nodes=>{let y=(height-(centralHeight+gap*Math.max(0,nodes.length-1)))/2,center=centerY;return nodes.map(node=>{const h=node.value*scale;const item={...node,y:Math.max(20,Math.min(height-20-h,y)),h,center};y+=h+gap;center+=h;return item;});};
 return {height,centerY,centralHeight,left:side(summary.left),right:side(summary.right)};
}

export function maskReal(text) {
 const clean=String(text).replace(/[^0-9,]/g,'');
 if(!clean)return '';
 const [digits,...decimals]=clean.split(',');
 const whole=(digits || '0').replace(/^0+(?=\d)/,'');
 const grouped=whole.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
 return 'R$ '+grouped+(decimals.length?','+decimals.join('').slice(0,2):'');
}
export function completeReal(text) {
 const masked=maskReal(text);if(!masked)return '';
 const [whole,decimal='']=masked.split(',');return whole+','+decimal.padEnd(2,'0');
}
