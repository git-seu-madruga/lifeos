"use client";
import {useEffect,useState} from 'react';
import DateInput from './DateInput';
import {holdEditor} from '../lib/editingGuard';
import {habitToday} from '../lib/habits';
import {maskPressure,parsePressure,recordUid,upsertWellness,validateWellness} from '../lib/wellness';
const number=text=>text===''?null:Number(String(text).replace(',','.'));
export default function InlineMeasurement({type,date,configured,setWellness}){
 const [day,setDay]=useState(date),[first,setFirst]=useState(''),[second,setSecond]=useState(''),[notes,setNotes]=useState(''),[valid,setValid]=useState(true),[error,setError]=useState(''),[dateTouched,setDateTouched]=useState(false);
 const dirty=!!(first||second||notes||!valid||dateTouched);
 useEffect(()=>{if(dirty)return holdEditor();},[dirty]);
 useEffect(()=>{if(!dirty)setDay(date);},[date,dirty]);
 function clear(){setFirst('');setSecond('');setNotes('');setDay(date);setValid(true);setError('');setDateTouched(false);}
 function save(event){event.preventDefault();if(!valid){setError('Confira a data.');return;}const data=type==='pressure'?{...parsePressure(first),bpm:number(second)}:{weight:number(first),fat:number(second)};
 const item={id:recordUid(),name:type==='pressure'?'Pressão e BPM':'Peso e gordura',type,date:day,data:{...data,notes,createdAt:new Date().toISOString()}};
 const message=validateWellness(item);if(message){setError(message);return;}setWellness(previous=>({...previous,wellness:upsertWellness(previous.wellness,item)}));clear();}
 return <form className="well-inline-form" aria-label={type==='pressure'?'Registrar pressão na tela':'Registrar peso na tela'} onSubmit={save}><div className="well-inline-fields"><label>Data<DateInput className="search" value={day} max={habitToday()} onValidityChange={setValid} onChange={e=>{setDay(e.target.value);setDateTouched(true);}}/></label><label>{type==='pressure'?'Pressão (mmHg)':'Peso (kg)'}<input className="search" aria-label={type==='pressure'?'Pressão na tela':'Peso na tela'} inputMode={type==='pressure'?'numeric':'decimal'} placeholder={type==='pressure'?'000/00':'136,0'} maxLength={type==='pressure'?6:undefined} required disabled={!configured} value={first} onChange={e=>{setFirst(type==='pressure'?maskPressure(e.target.value):e.target.value.replace(/[^\d,.]/g,''));setError('');}}/></label><label>{type==='pressure'?'BPM':'Gordura (%)'}<input className="search" inputMode={type==='pressure'?'numeric':'decimal'} aria-label={type==='pressure'?'BPM na tela':'Gordura na tela'} placeholder={type==='pressure'?'62':'28,4'} required={type==='pressure'} disabled={!configured} value={second} onChange={e=>{setSecond(e.target.value.replace(type==='pressure'?/\D/g:/[^\d,.]/g,''));setError('');}}/></label></div><label className="well-inline-notes">Observação<input className="search" maxLength={5000} disabled={!configured} value={notes} onChange={e=>setNotes(e.target.value)}/></label>{error&&<p className="date-error" role="alert">{error}</p>}<div className="finance-period"><button className="primary" disabled={!configured||!valid}>{type==='pressure'?'Salvar medição':'Salvar medidas'}</button>{dirty&&<button className="ghost" type="button" onClick={clear}>Limpar</button>}</div></form>;
}
