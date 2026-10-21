"use client";
import {useState} from "react";
import IdeaArt from "./IdeaArt";
import IdeaPalette from "./IdeaPalette";
import {IDEA_COLORS,makeArea,normalizeAreaName} from "../lib/someday";
export default function AreaManager({areas,onSave,onClose}){
 const [selected,setSelected]=useState(''),[name,setName]=useState(''),[style,setStyle]=useState({icon:'seedling',color:IDEA_COLORS[0]}),[error,setError]=useState('');
 const existing=areas.find(a=>a.id===selected);
 const choose=area=>{setSelected(area?.id||'');setName(area?.name||'');setStyle({icon:area?.data.icon||'seedling',color:area?.data.color||IDEA_COLORS[0]});setError('');};
 const save=event=>{
  event.preventDefault();const title=name.trim();if(!title){setError('Dê um nome à área.');return;}
  if(!existing&&areas.length>=100){setError('Use até 100 áreas de interesse.');return;}
  const duplicate=areas.find(a=>a.id!==selected&&normalizeAreaName(a.name)===normalizeAreaName(title));
  if(duplicate){setError('Esta área já existe. Selecione-a na lista para editar ou reativar.');return;}
  try{onSave(existing?{...existing,name:title,data:{...existing.data,...style,archived:false}}:makeArea(title,style.icon,style.color));choose(null);}catch(e){setError(e.message);}
 };
 return <div className="sd-area-dialog" role="dialog" aria-modal="true" aria-label="Áreas de interesse">
  <div className="sd-detail-heading"><h2>Áreas de interesse</h2><button type="button" className="sd-close" onClick={onClose} aria-label="Fechar áreas">×</button></div>
  <p className="sd-soft-copy">Organize possibilidades por assunto. Renomear atualiza os projetos e preserva as ideias vinculadas.</p>
  <div className="sd-area-layout"><div className="sd-area-list">
   <button type="button" className="ghost" onClick={()=>choose(null)}>+ Nova área</button>
   {areas.map(a=><button type="button" key={a.id} className={selected===a.id?'selected':''} onClick={()=>choose(a)}><IdeaArt icon={a.data.icon} size={28}/><span>{a.name}{a.data.archived&&<small>Oculta para novas seleções</small>}</span></button>)}
  </div><form onSubmit={save}><label>Nome da área<input className="search" value={name} maxLength={100} placeholder="Ex.: Viagens" onChange={e=>setName(e.target.value)} autoFocus/></label><IdeaPalette {...style} onChange={patch=>setStyle(s=>({...s,...patch}))}/>
   {error&&<p className="date-error" role="alert">{error}</p>}
   <button type="submit" className="primary">{existing?.data.archived?'Reativar área':existing?'Salvar área':'Criar área'}</button>
   {existing&&!existing.data.archived&&<button type="button" className="ghost" onClick={()=>{if(window.confirm('Ocultar esta área para novas ideias e projetos? Os vínculos existentes e o histórico serão preservados.')){try{onSave({...existing,data:{...existing.data,archived:true}});choose(null);}catch(e){setError(e.message);}}}}>Ocultar área</button>}
  </form></div>
  <p className="sd-soft-copy">Este cadastro organiza Projetos e Algum dia, nos contextos Pessoal e Trabalho.</p>
 </div>;
}

