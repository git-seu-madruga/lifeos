"use client";
import {useEffect,useRef,useState} from 'react';
import {useBackLayer} from '../lib/useBackNavigation';
const months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
export default function MonthPicker({value,onChange}){
 const [open,setOpen]=useState(false),[year,setYear]=useState(()=>Number(value.slice(0,4))),[yearText,setYearText]=useState(()=>value.slice(0,4));const ref=useRef(null);
 useBackLayer(open,()=>setOpen(false),25);
 useEffect(()=>{const y=Number(value.slice(0,4));setYear(y);setYearText(String(y));},[value]);
 useEffect(()=>{if(!open)return;const close=e=>{if(!ref.current?.contains(e.target))setOpen(false);},key=e=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key);};},[open]);
 const changeYear=n=>{setYear(n);setYearText(String(n));};
 return <span className="month-picker-control" ref={ref}><button type="button" className="month-calendar-button" aria-label="Selecionar mês e ano" aria-expanded={open} onClick={()=>setOpen(!open)}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18"/></svg></button>{open&&<span className="month-calendar-panel" role="dialog" aria-label="Mês e ano do acompanhamento"><span className="month-calendar-year"><button type="button" className="ghost" disabled={year<=1000} aria-label="Ano anterior" onClick={()=>changeYear(year-1)}>‹</button><input className="search" aria-label="Ano do calendário" inputMode="numeric" maxLength={4} value={yearText} onChange={e=>setYearText(e.target.value.replace(/\D/g,''))} onBlur={()=>{const y=Number(yearText);changeYear(y>=1000&&y<=9999?y:year);}}/><button type="button" className="ghost" disabled={year>=9999} aria-label="Próximo ano" onClick={()=>changeYear(year+1)}>›</button></span><span className="month-calendar-grid">{months.map((name,i)=>{const v=`${year}-${String(i+1).padStart(2,'0')}`;return <button type="button" className={'ghost'+(v===value?' selected':'')} key={name} aria-pressed={v===value} onClick={()=>{onChange(v);setOpen(false);}}>{name}</button>;})}</span></span>}</span>;
}
