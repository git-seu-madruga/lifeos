"use client";
import {useState} from "react";
import IdeaArt from "./IdeaArt";
import IdeaPalette from "./IdeaPalette";
import {IDEA_COLORS,normalizeAreaName} from "../lib/someday";
import {makeReferenceCategory} from "../lib/reference";
export default function ReferenceCategoryManager({areas,onSave,onClose}){
 const [selected,setSelected]=useState(''),[description,setDescription]=useState(''),[name,setName]=useState(''),[style,setStyle]=useState({icon:'art-books',color:IDEA_COLORS[3]}),[error,setError]=useState('');
 const existing=areas.find(a=>a.id===selected);
 const choose=area=>{setSelected(area?.id||'');setName(area?.name||'');setDescription(area?.data.description||'');setStyle({icon:area?.data.icon||'art-books',color:area?.data.color||IDEA_COLORS[3]});setError('');};
 const save=event=>{
  event.preventDefault();const title=name.trim();if(!title){setError('Dê um nome à categoria.');return;}
  if(!existing&&areas.length>=100){setError('Use até 100 categorias de referência.');return;}
  const duplicate=areas.find(a=>a.id!==selected&&normalizeAreaName(a.name)===normalizeAreaName(title));
  if(duplicate){setError('Esta categoria já existe. Selecione-a na lista para editar ou reativar.');return;}
  try{const value=existing||makeReferenceCategory(title,style.icon,style.color);onSave({...value,name:title,data:{...value.data,...style,description,archived:false}});choose(null);}catch(e){setError(e.message);}
 };
 return <div className="sd-area-dialog" role="dialog" aria-modal="true" aria-label="Categorias de referência">
  <div className="sd-detail-heading"><h2>Categorias de referência</h2><button type="button" className="sd-close" onClick={onClose} aria-label="Fechar categorias">×</button></div>
  <p className="sd-soft-copy">Crie gavetas para seus materiais de consulta. Renomear preserva os materiais vinculados.</p>
  <div className="sd-area-layout"><div className="sd-area-list">
   <button type="button" className="ghost" onClick={()=>choose(null)}>+ Nova categoria</button>
   {areas.map(a=><button type="button" key={a.id} className={selected===a.id?'selected':''} onClick={()=>choose(a)}><IdeaArt icon={a.data.icon} size={28}/><span>{a.name}{a.data.archived&&<small>Oculta para novas seleções</small>}</span></button>)}
  </div><form onSubmit={save}><label>Nome da categoria<input className="search" value={name} maxLength={100} placeholder="Ex.: Manuais e tutoriais" onChange={e=>setName(e.target.value)} autoFocus/></label><label>Descrição (opcional)<input className="search" value={description} maxLength={300} placeholder="O que você quer guardar nesta gaveta?" onChange={e=>setDescription(e.target.value)}/></label><IdeaPalette {...style} onChange={patch=>setStyle(s=>({...s,...patch}))}/>
   {error&&<p className="date-error" role="alert">{error}</p>}
   <button type="submit" className="primary">{existing?.data.archived?'Reativar categoria':existing?'Salvar categoria':'Criar categoria'}</button>
   {existing&&!existing.data.archived&&<button type="button" className="ghost" onClick={()=>{if(window.confirm('Ocultar esta categoria para novos materiais? Os materiais existentes serão preservados.')){try{onSave({...existing,data:{...existing.data,archived:true}});choose(null);}catch(e){setError(e.message);}}}}>Ocultar categoria</button>}
  </form></div>
  <p className="sd-soft-copy">Estas categorias pertencem somente à biblioteca de Referência Geral.</p>
 </div>;
}

