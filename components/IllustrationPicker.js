"use client";
import {useId,useState} from 'react';
import {ILLUSTRATION_CATEGORIES,illustrationById,filterIllustrations} from '../lib/illustrations';
import HabitIcon from './HabitIcon';

export default function IllustrationPicker({value,ids,labels={},kind='idea',onChange}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),uid=useId();
 const choices=ids.map(id=>{const art=illustrationById(id);return art||{id,label:labels[id]||id,category:'original',keywords:labels[id]||id,src:kind==='habit'?'':`/emoji/${kind==='food'?'fluent-food':'fluent-ideas'}/${id}.png`};});
 const categories=[{id:'original',label:'Clássicos'},...ILLUSTRATION_CATEGORIES].filter(c=>choices.some(item=>item.category===c.id));
 const visible=filterIllustrations(choices,query,category),selected=choices.find(item=>item.id===value);
 const art=(item,size)=>item.src?<img src={item.src} width={size} height={size} alt="" loading="lazy" draggable={false}/>:<HabitIcon id={item.id} size={size}/>;
 return <div className="illustration-picker">
  <div className="illustration-controls"><label htmlFor={uid+'-query'}>Buscar ilustração<input id={uid+'-query'} type="search" className="search" placeholder="Ex.: viagem, videogame, morango…" value={query} onChange={e=>setQuery(e.target.value)}/></label><label htmlFor={uid+'-category'}>Tema<select id={uid+'-category'} className="search" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Todos os temas</option>{categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label></div>
  <div className="illustration-selection">{selected&&<span>{art(selected,27)}<span>Selecionado: <strong>{selected.label}</strong></span></span>}<small role="status">{visible.length} opções</small></div>
  <div className="illustration-grid" role="group" aria-label="Ilustrações disponíveis">{visible.map(item=><button type="button" key={item.id} aria-label={item.label} title={item.label} aria-pressed={value===item.id} onClick={()=>onChange(item.id)}>{art(item,38)}<small>{item.label}</small></button>)}{!visible.length&&<p className="muted">Nenhuma ilustração encontrada. Tente outro termo ou tema.</p>}</div>
 </div>;
}
