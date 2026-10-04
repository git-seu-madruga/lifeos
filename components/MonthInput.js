"use client";
import {useEffect,useState} from 'react';
import {maskMonth,parseMonth,formatMonth} from '../lib/finance';
export default function MonthInput({value,onChange,label='Mês',onValidityChange=()=>{}}){
 const [text,setText]=useState(formatMonth(value)),[error,setError]=useState('');
 useEffect(()=>{setText(formatMonth(value));setError('');},[value]);
 function commit(){const result=parseMonth(text);setError(result.error||'');onValidityChange(!result.error);if(!result.error){setText(formatMonth(result.value));onChange(result.value);}}
 return <span className="month-field"><input className="search" inputMode="numeric" aria-label={label} placeholder="MM/AAAA" value={text} aria-invalid={!!error} onChange={e=>{setText(maskMonth(e.target.value));setError('');onValidityChange(false);}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit();}}}/>{error&&<span className="date-error" role="alert">{error}</span>}</span>;
}
