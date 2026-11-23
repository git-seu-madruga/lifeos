import {useState} from 'react';
import {pressureHistogram} from '../lib/measurementChart';

const countLabel = count => `${count} ${count === 1 ? 'medição' : 'medições'}`;
const rangeLabel = (start,unit) => `de ${start} a menos de ${start+5} ${unit}`;
const meanOutline = '#e8bd5a';

export default function PressureHistogram({readings=[],days,series,fullHistory,recentMeans}) {
 const [selected,setSelected] = useState(null);
 const {total,histograms} = pressureHistogram(readings,days,series);
 const maxCount = Math.max(1,...histograms.flatMap(metric=>metric.bins.map(bin=>bin.count)));
 const step = Math.ceil(maxCount / 4);
 const ceiling = step * Math.ceil(maxCount / step);
 const ticks = Array.from({length: ceiling / step + 1},(_,index)=>index*step);
 const currentMetric = histograms.find(metric=>metric.key===selected?.key);
 const currentBin = currentMetric?.bins.find(bin=>bin.start===selected.start);
 const top = 8, bottom = 88, left = 42, right = 22;
 const y = count => bottom - count / ceiling * (bottom-top);

 return <div className="well-pressure-distribution">
  <p className="muted small well-chart-period">
   {fullHistory?'Histórico completo · ':'Últimos '}{days.length} dias com medições · {countLabel(total)}
  </p>
  <p className="muted small well-chart-period">Cada barra conta as medições entre dois números do eixo. O valor da direita entra na faixa seguinte.</p>
  <p className="muted small well-chart-period">Dourado indica a faixa da média dos últimos 12 dias com medições.</p>
  {histograms.map(metric=>{
   const mean = recentMeans?.[metric.key];
   const width = Math.max(300, left+right+metric.bins.length*38);
   const slot = (width-left-right)/Math.max(1,metric.bins.length);
   const boundaries = metric.bins.map(bin=>bin.start);
   if(boundaries.length) boundaries.push(boundaries.at(-1)+5);
   return <section key={metric.key} className="well-pressure-histogram">
    <h3><i style={{background:metric.color}}/>{metric.label} · {metric.unit}</h3>
    {metric.bins.length ? <div className="well-histogram-scroll">
     <svg viewBox={`0 0 ${width} 115`} style={{minWidth:width}} role="group" aria-label={`Distribuição de ${metric.label} por faixa em ${metric.unit}`}>
      {ticks.map(tick=><g key={tick}>
       <line x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} stroke="#ffffff25"/>
       <text x={left-6} y={y(tick)+4} textAnchor="end">{tick}</text>
      </g>)}
      {metric.bins.map(({start,count},index)=>{
       const x = left + (index+.5)*slot;
       const isMean = Number.isFinite(mean) && mean >= start && mean < start+5;
       const label = `${metric.label}, ${rangeLabel(start,metric.unit)}: ${countLabel(count)}${isMean?' · Faixa da média recente':''}`;
       const barLeft = x-slot*.43, barWidth = slot*.86;
       function select(){setSelected({key:metric.key,start});}
       return <g key={start} role="button" tabIndex={0} aria-label={label}
        aria-pressed={selected?.key===metric.key&&selected.start===start}
        onClick={select} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}}}>
        <rect className="well-histogram-target" x={x-slot/2} y={top} width={slot} height={bottom-top} fill="transparent"/>
        <rect x={barLeft} y={y(count)} width={barWidth} height={bottom-y(count)} fill={metric.color}
         stroke={isMean?meanOutline:undefined} strokeWidth={isMean?2:undefined}/>
        {isMean&&count===0&&<line x1={barLeft} x2={barLeft+barWidth} y1={bottom} y2={bottom} stroke={meanOutline} strokeWidth={2}/>}
        <title>{label}</title>
       </g>;
      })}
      <g className="well-histogram-axis" aria-hidden="true">
       {boundaries.map((value,index)=>{
        const x = left+index*slot;
        return <g key={value}>
         <line x1={x} x2={x} y1={bottom} y2={bottom+4} stroke="#ffffff40"/>
         <text x={x} y={bottom+19} textAnchor="middle">{value}</text>
        </g>;
       })}
      </g>
     </svg>
    </div>:<p className="muted small">Nenhuma medição nesta série.</p>}
   </section>;
  })}
  <p className="small well-chart-detail" aria-live="polite">{currentBin
   ? `${currentMetric.label} · ${rangeLabel(currentBin.start,currentMetric.unit)} · ${countLabel(currentBin.count)}`
   : 'Toque em uma faixa para ver a contagem.'}</p>
 </div>;
}
