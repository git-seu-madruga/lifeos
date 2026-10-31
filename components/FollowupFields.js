"use client";
import {useState} from 'react';
import DateInput from './DateInput';
import {completeFollowup,compactFollowup,followupDue,followupLabel} from '../lib/followups';
export default function FollowupFields({task,set}){
 const r=task.recurrence,[error,setError]=useState('');
 const change=patch=>set({recurrence:{...compactFollowup(r),...patch}});
 // The parent list refreshes at midnight; completion itself always reads today's date.
 function done(){try{const next=completeFollowup(task);if(next!==task){set({status:next.status,completedAt:next.completedAt,recurrence:next.recurrence});setError('');}}catch(e){setError(e.message);}}
 return <section className="followup-fields" aria-label="Configuração de follow-up">
  <div className="field-row">
   <label className="field"><span className="label">Repetir a cada</span><input className="search" aria-label="Intervalo do follow-up" type="number" min="1" max="365" value={r.every} onChange={e=>{const every=Number(e.target.value);if(Number.isInteger(every)&&every>=1&&every<=365)change({every});}}/></label>
   <label className="field"><span className="label">Unidade</span><select aria-label="Unidade de repetição" value={r.unit} onChange={e=>change({unit:e.target.value})}><option value="days">Dias</option><option value="weeks">Semanas</option><option value="months">Meses</option></select></label>
  </div>
  <label className="field"><span className="label">Regra de repetição</span><select aria-label="Regra de repetição" value={r.mode} onChange={e=>change({mode:e.target.value})}><option value="after">Após a consulta realizada</option><option value="fixed">Calendário fixo</option></select></label>
  {r.mode==='fixed'&&r.unit==='weeks'&&<div className="field"><span className="label">Dias da semana</span><div className="seg-row">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day,i)=><label key={day} className="followup-weekday"><input type="checkbox" checked={r.weekdays.includes(i)} onChange={e=>{const weekdays=e.target.checked?[...r.weekdays,i].sort():r.weekdays.filter(d=>d!==i);if(weekdays.length)change({weekdays});}}/>{day}</label>)}</div></div>}
  <label className="field"><span className="label">Próxima consulta</span><DateInput className="search" aria-label="Próxima consulta" value={r.next} onChange={e=>{if(e.target.value)change({next:e.target.value,anchor:e.target.value});}}/></label>
  <p className="muted small">{followupLabel(r)}. Consultas atrasadas geram uma única pendência. O prazo não encerra o acompanhamento.</p>
  <div className="seg-row followup-actions"><button type="button" className="primary" disabled={!!task.locked||!followupDue(task)} onClick={done}>Acompanhamento feito</button></div>
  {error&&<p role="alert" className="date-error">{error}</p>}

 </section>;
}
