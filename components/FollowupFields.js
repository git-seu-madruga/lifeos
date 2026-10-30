"use client";
import {useState} from 'react';
import DateInput from './DateInput';
import {completeFollowup,endFollowup,followupDue,followupLabel} from '../lib/followups';
import {formatDateInput} from '../lib/dateInput';
export default function FollowupFields({task,set}){
 const r=task.recurrence,[note,setNote]=useState(''),[error,setError]=useState('');
 const change=patch=>set({recurrence:{...r,...patch}});
 // The parent list refreshes at midnight; completion itself always reads today's date.
 function done(){try{const next=completeFollowup(task,note);if(next!==task){set({status:next.status,completedAt:next.completedAt,recurrence:next.recurrence});setNote('');setError('');}}catch(e){setError(e.message);}}
 return <section className="followup-fields" aria-label="Configuração de follow-up">
  <div className="field-row">
   <label className="field"><span className="label">Repetir a cada</span><input className="search" aria-label="Intervalo do follow-up" type="number" min="1" max="365" value={r.every} onChange={e=>{const every=Number(e.target.value);if(Number.isInteger(every)&&every>=1&&every<=365)change({every});}}/></label>
   <label className="field"><span className="label">Unidade</span><select aria-label="Unidade de repetição" value={r.unit} onChange={e=>change({unit:e.target.value})}><option value="days">Dias</option><option value="weeks">Semanas</option><option value="months">Meses</option></select></label>
  </div>
  <label className="field"><span className="label">Regra de repetição</span><select aria-label="Regra de repetição" value={r.mode} onChange={e=>change({mode:e.target.value})}><option value="after">Após a consulta realizada</option><option value="fixed">Calendário fixo</option></select></label>
  {r.mode==='fixed'&&r.unit==='weeks'&&<div className="field"><span className="label">Dias da semana</span><div className="seg-row">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day,i)=><label key={day} className="followup-weekday"><input type="checkbox" checked={r.weekdays.includes(i)} onChange={e=>{const weekdays=e.target.checked?[...r.weekdays,i].sort():r.weekdays.filter(d=>d!==i);if(weekdays.length)change({weekdays});}}/>{day}</label>)}</div></div>}
  <label className="field"><span className="label">Próxima consulta</span><DateInput className="search" aria-label="Próxima consulta" value={r.next} onChange={e=>{if(e.target.value)change({next:e.target.value,anchor:e.target.value});}}/></label>
  <p className="muted small">{followupLabel(r)}. Consultas atrasadas geram uma única pendência. O prazo não encerra o acompanhamento.</p>
  {r.state!=='ended'&&<>
   <label className="field"><span className="label">Observação desta consulta (opcional)</span><textarea className="search notes" aria-label="Observação da consulta" rows={2} maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex.: sem novas publicações"/></label>
   <div className="seg-row followup-actions"><button type="button" className="primary" disabled={!followupDue(task)} onClick={done}>Acompanhamento feito</button><button type="button" className="ghost" onClick={()=>change({state:r.state==='paused'?'active':'paused'})}>{r.state==='paused'?'Retomar acompanhamento':'Pausar acompanhamento'}</button><button type="button" className="ghost" onClick={()=>{if(window.confirm('Encerrar este acompanhamento? Ele deixará de gerar cobranças. O histórico será preservado.')){const next=endFollowup(task);set({status:next.status,completedAt:next.completedAt,recurrence:next.recurrence});}}}>Encerrar acompanhamento</button></div>
  </>}
  {r.state==='ended'&&<div className="field"><p className="muted small">Acompanhamento encerrado manualmente.</p><button type="button" className="ghost" onClick={()=>set({status:'hold',completedAt:null,recurrence:{...r,state:'active'}})}>Retomar acompanhamento</button></div>}
  {r.state==='paused'&&<p className="muted small">Pausado: não aparece nas cobranças até ser retomado.</p>}
  {error&&<p role="alert" className="date-error">{error}</p>}
  <details className="followup-history"><summary>Histórico · {r.total} {r.total===1?'consulta':'consultas'}</summary><p className="muted small">Últimas 200 consultas. O total inclui todas as consultas registradas.</p>{!r.history.length&&<p className="muted small">Nenhuma consulta registrada.</p>}<ul>{[...r.history].reverse().map(h=><li key={h.id}><time dateTime={h.date}>{formatDateInput(h.date)}</time>{h.note&&<p>{h.note}</p>}<small className="muted">Próxima: {formatDateInput(h.next)}</small></li>)}</ul></details>
 </section>;
}
