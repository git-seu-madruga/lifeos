export function chartScale(values,{minimumSpan=10,integer=false,ceiling=Infinity}={}){
 const finite=values.filter(Number.isFinite);if(!finite.length)return null;
 const low=Math.min(...finite),high=Math.max(...finite),span=Math.max(high-low,minimumSpan),center=(low+high)/2;
 const lower=Math.max(0,Math.min(low-span*.12,center-span/2)),upper=Math.min(ceiling,Math.max(high+span*.12,center+span/2));
 const raw=(upper-lower)/4,power=10**Math.floor(Math.log10(raw||1)),ratio=raw/power;
 let step=([1,2,2.5,5,10].find(v=>v>=ratio)||10)*power;if(integer)step=Math.max(1,Math.ceil(step));
 let min=Math.max(0,Math.floor(lower/step)*step),max=Math.min(ceiling,Math.ceil(upper/step)*step);if(max<=min)max=Math.min(ceiling,min+step);
 const ticks=[];for(let n=min;n<=max+step*.01;n+=step)ticks.push(Number(n.toFixed(6)));if(ticks.at(-1)!==max)ticks.push(max);
 return {min,max,ticks,step};
}
export const CHART_SERIES={pressure:[{key:'systolic',label:'Sistólica',unit:'mmHg',color:'#81bdff',axis:'left'},{key:'diastolic',label:'Diastólica',unit:'mmHg',color:'#b9a0f5',axis:'left'},{key:'bpm',label:'BPM',unit:'bpm',color:'#f69cbc',axis:'right'}],body:[{key:'weight',label:'Peso',unit:'kg',color:'#81bdff',axis:'left'},{key:'fat',label:'Gordura',unit:'%',color:'#f69cbc',axis:'right'}]};
export function measurementScales(records,type){const series=CHART_SERIES[type];return Object.fromEntries(['left','right'].map(axis=>{const keys=series.filter(s=>s.axis===axis).map(s=>s.key);return [axis,chartScale(records.flatMap(p=>keys.map(key=>p.data[key])),{minimumSpan:type==='pressure'?(axis==='left'?20:10):2,integer:type==='pressure',ceiling:type==='body'&&axis==='right'?100:Infinity})];}));}
