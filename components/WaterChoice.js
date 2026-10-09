"use client";
import {useEffect,useState} from 'react';
import {holdEditor} from '../lib/editingGuard';
export default function WaterChoice({value,date,disabled,onSave}){
 const [text,setText]=useState(value==null?'':String(value).replace('.',',')),[error,setError]=useState('');
 const dirty=text!==(value==null?'':String(value).replace('.',','));
 useEffect(()=>{if(dirty)return holdEditor();},[dirty]);
 useEffect(()=>{setText(value==null?'':String(value).replace('.',','));setError('');},[value,date]);
 function save(e){e.preventDefault();const amount=Number(text.replace(',','.'));if(!text||!Number.isFinite(amount)||amount<0||amount>20){setError('Informe a quantidade em litros, entre 0 e 20.');return;}onSave(amount);setText(String(amount).replace('.',','));setError('');}
 return <form className="well-water-choice" aria-label="Quantidade de água" onSubmit={save}><label>Água (litros)<input className="search" inputMode="decimal" placeholder="Ex.: 2,5" value={text} disabled={disabled} onChange={e=>{setText(e.target.value.replace(/[^\d,.]/g,''));setError('');}}/></label><button className="primary" disabled={disabled||!text}>Salvar água</button>{dirty&&<button type="button" className="ghost" onClick={()=>{setText(value==null?'':String(value).replace('.',','));setError('');}}>Limpar preenchimento</button>}{error&&<p className="date-error" role="alert">{error}</p>}</form>;
}
