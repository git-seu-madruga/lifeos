"use client";
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import PageActions from './PageActions';
import IdeaArt from './IdeaArt';
import IdeaPalette from './IdeaPalette';
import {holdEditor} from '../lib/editingGuard';
import {useBackLayer} from '../lib/useBackNavigation';
import {makeIdea,ideaText} from '../lib/someday';
const IdeaEditor=dynamic(()=>import('./IdeaEditor'),{ssr:false,loading:()=> <p className="muted">Abrindo editor…</p>});
const fileUrl=file=>file.pageId?'/api/notion/attachment?kind=someday&id='+encodeURIComponent(file.pageId)+'&index='+file.index+'&name='+encodeURIComponent(file.name):file.notion?.[file.notion.type]?.url||'';

function IdeaDetail({record,areas,onPatch,onClose,onPromote,onDelete,onBusy,onManageAreas}){
 const [title,setTitle]=useState(record.name),[palette,setPalette]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[promoting,setPromoting]=useState(false);
 const current=useRef(record);current.current=record;
 const update=patch=>onPatch(record.id,patch);
 const editDoc=doc=>{setError('');update({data:{doc}});};
 const removeFile=file=>{
  if(!window.confirm('Excluir esta imagem/anexo da ideia e retirá-la do texto?'))return;
  const remove=node=>({...node,...(node.content?{content:node.content.filter(n=>!(n.type==='ideaImage'&&n.attrs?.attachmentId===file.name)).map(remove)}:{})});
  update({attachments:record.attachments.filter(a=>a.name!==file.name),data:{doc:remove(record.data.doc)}});
 };
 const promote=async kind=>{
  if(busy||promoting)return;
  if(!window.confirm(`Transformar esta ideia em ${kind==='task'?'uma tarefa':'um projeto'}? O título, o texto e os anexos serão copiados. A ideia original será preservada com sua formatação.`))return;
  setPromoting(true);setError('');try{await onPromote(record.id,kind);}catch(e){setError(e.message);}finally{setPromoting(false);}
 };
 useEffect(()=>()=>onBusy(false),[onBusy]);
 return <section className="sd-detail" style={{'--sd-tone':record.data.color}} aria-label="Editar ideia">
  <div className="sd-detail-heading"><span className="sd-art"><IdeaArt icon={record.data.icon} size={52}/></span><button type="button" className="sd-close" disabled={busy||promoting} onClick={onClose} aria-label="Fechar ideia">×</button></div>
  <input className="sd-title-input" aria-label="Título da ideia" placeholder="Dê um nome à sua ideia" value={title} maxLength={200} autoFocus={!record.name} onChange={e=>{setTitle(e.target.value);if(e.target.value.trim())update({name:e.target.value});}} onBlur={()=>{if(!title.trim())setTitle(current.current.name);}}/>
  <div className="sd-detail-options"><label><span className="sd-caption">ÁREA</span><select value={record.data.area} onChange={e=>{const a=areas.find(a=>a.data.uid===e.target.value);update({data:{area:e.target.value,...(a?{icon:a.data.icon,color:a.data.color}:{})}});}}><option value="">Sem área</option>{areas.filter(a=>!a.data.archived||a.data.uid===record.data.area).map(a=><option key={a.id} value={a.data.uid}>{a.name}{a.data.archived?' (oculta)':''}</option>)}</select></label><button type="button" className="sd-style-button" aria-label="Escolher ilustração e cor" aria-expanded={palette} onClick={()=>setPalette(v=>!v)}>✎</button></div>
  <button type="button" className="ghost small" disabled={busy||promoting} onClick={onManageAreas}>Gerenciar áreas</button>
  {palette&&<IdeaPalette icon={record.data.icon} color={record.data.color} onChange={data=>update({data})}/>}
  <label className="sd-context-label">Contexto<select value={record.context} onChange={e=>update({context:e.target.value})}><option value="personal">Pessoal</option><option value="work">Trabalho</option></select></label>
  <span className="sd-caption">ANOTAÇÕES E REFERÊNCIAS</span>
  <IdeaEditor doc={record.data.doc} attachments={record.attachments} onError={setError} onBusy={value=>{setBusy(value);onBusy(value);}} onChange={editDoc} onImage={image=>onPatch(record.id,previous=>({attachments:[...previous.attachments,image]}))}/>
  {busy&&<p className="sd-uploading" role="status">Enviando imagem ao Notion… mantenha esta ideia aberta.</p>}
  {error&&<p className="date-error" role="alert">{error}</p>}
  {!!record.attachments.length&&<details className="sd-attachments"><summary>{record.attachments.length} anexo(s) da ideia</summary>{record.attachments.map(file=><div key={file.id}><a href={fileUrl(file)} target="_blank" rel="noopener noreferrer">Imagem / referência ↗</a><button type="button" aria-label="Excluir anexo da ideia" onClick={()=>removeFile(file)}>Excluir</button></div>)}</details>}
  <div className="sd-detail-foot"><small>Guardada em {new Date(record.data.createdAt).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}</small>
   {record.data.promoted?<p className="sd-promoted">✓ Transformada em {record.data.promoted.kind==='task'?'tarefa':'projeto'}. A ideia original foi preservada.</p>:<><span className="sd-soft-copy">Quando fizer sentido dar o próximo passo</span><button type="button" className="primary" disabled={busy||promoting||!record.name.trim()} onClick={()=>promote('project')}>▱ Transformar em projeto</button><button type="button" className="ghost" disabled={busy||promoting||!record.name.trim()} onClick={()=>promote('task')}>☑ Transformar em tarefa</button></>}
   <button type="button" className="sd-delete" disabled={busy||promoting} onClick={()=>{if(window.confirm('Excluir esta ideia e seus anexos? Não dá para desfazer.'))onDelete(record.id);}}>Excluir ideia</button>
  </div>
 </section>;
}

export default function SomedayView({records,setRecords,configured,context,onManageAreas,onPromote}){
 const [query,setQuery]=useState(''),[area,setArea]=useState('all'),[favorites,setFavorites]=useState(false),[selected,setSelected]=useState(null),[draft,setDraft]=useState(null),[busy,setBusy]=useState(false);
 const areas=records.filter(r=>r.type==='area'),ideas=records.filter(r=>r.type==='idea');
 const current=records.find(r=>r.id===selected)||draft;
 useEffect(()=>{if(current)return holdEditor();},[!!current]);
 const close=()=>{if(busy)return;setSelected(null);setDraft(null);};
 useBackLayer(!!current,close,12);
 const patch=(id,change)=>setRecords(previous=>{
  const old=previous.find(r=>r.id===id)||draft;if(!old)return previous;
  const value=typeof change==='function'?change(old):change,next={...old,...value,data:{...old.data,...value.data}};
  if(!next.name.trim())next.name='Sem título';
  return previous.some(r=>r.id===id)?previous.map(r=>r.id===id?next:r):[...previous,next];
 });
 const openNew=()=>{if(busy)return;const a=areas.find(a=>a.data.uid===area&&!a.data.archived),idea=makeIdea(a,context==='work'?'work':'personal');setDraft(idea);setSelected(idea.id);};
 const visible=ideas.filter(r=>(context==='all'||r.context===context)&&(area==='all'||(area==='none'?!r.data.area:r.data.area===area))&&(!favorites||r.data.favorite)).filter(r=>{const q=query.trim().toLocaleLowerCase('pt-BR');return !q||(r.name+' '+ideaText(r.data.doc)+' '+(areas.find(a=>a.data.uid===r.data.area)?.name||'')).toLocaleLowerCase('pt-BR').includes(q);}).sort((a,b)=>Number(b.data.favorite)-Number(a.data.favorite)||a.data.createdAt-b.data.createdAt||a.id.localeCompare(b.id));
 const detail=current&&<IdeaDetail key={current.id} record={current} areas={areas} onPatch={patch} onClose={close} onPromote={onPromote} onBusy={setBusy} onManageAreas={onManageAreas} onDelete={id=>{setRecords(previous=>previous.filter(r=>r.id!==id));close();}}/>;
 return <section className="someday">
  <PageActions><button type="button" className="sd-new-button" onClick={openNew} disabled={!configured||busy}>+ Nova ideia</button></PageActions>
  {!configured?<div className="sd-setup"><IdeaArt icon="seedling" size={84}/><h2>Um lugar para guardar possibilidades</h2><p>Crie o banco Algum dia no Notion e configure NOTION_SOMEDAY_DATABASE_ID na Vercel. O passo a passo está no README desta versão.</p></div>:<>
   {!current&&<div className="sd-layout">
    <div className="sd-collection"><div className="sd-search-row"><input className="search" type="search" value={query} placeholder="Buscar ideias e inspirações…" aria-label="Buscar ideias" onChange={e=>setQuery(e.target.value)}/><button type="button" className="sd-favorite-filter" aria-label="Mostrar favoritas" aria-pressed={favorites} onClick={()=>setFavorites(v=>!v)}>☆</button></div>
     <div className="sd-areas" aria-label="Filtrar por área"><button type="button" aria-pressed={area==='all'} onClick={()=>setArea('all')}>Todas</button>{areas.filter(a=>!a.data.archived||ideas.some(i=>i.data.area===a.data.uid)).map(a=><button type="button" key={a.id} style={{'--sd-tone':a.data.color}} aria-pressed={area===a.data.uid} onClick={()=>setArea(a.data.uid)}><IdeaArt icon={a.data.icon} size={23}/>{a.name}</button>)}<button type="button" aria-pressed={area==='none'} onClick={()=>setArea('none')}>Sem área</button><button type="button" onClick={onManageAreas}>+ Áreas</button></div>
     <p className="sd-intro"><IdeaArt icon="seedling" size={26}/>Um lugar para guardar possibilidades, sem prazo e sem pressa.</p>
     {!ideas.length&&<div className="sd-empty"><IdeaArt icon="bulb" size={76}/><h2>O que você gostaria de cultivar?</h2><p>Sonhos, inspirações e projetos que ainda precisam de tempo podem começar por aqui.</p><button type="button" className="primary" onClick={openNew}>Guardar minha primeira ideia</button>{!areas.length&&<button type="button" className="ghost" onClick={onManageAreas}>Organizar áreas de interesse</button>}</div>}
     {ideas.length>0&&!visible.length&&<p className="empty">Nenhuma ideia com esses filtros.</p>}
     <div className="sd-grid">{visible.map(idea=>{const a=areas.find(a=>a.data.uid===idea.data.area);return <article key={idea.id} className={'sd-card'+(selected===idea.id?' selected':'')} style={{'--sd-tone':idea.data.color}}>
      <button type="button" className="sd-card-main" disabled={busy} onClick={()=>{setDraft(null);setSelected(idea.id);}}><span className="sd-card-heading"><span className="sd-art"><IdeaArt icon={idea.data.icon}/></span><strong>{idea.name}</strong></span><span className="sd-area-chip" style={{'--sd-tone':a?.data.color||idea.data.color}}>{a?.name||'Sem área'}</span><span className="sd-card-preview">{ideaText(idea.data.doc).slice(0,180)||'Uma possibilidade esperando novas referências.'}</span><span className="sd-card-meta">{idea.attachments.length?`${idea.attachments.length} anexo(s)`:'Sem prazo'}{idea.data.promoted&&' · Transformada'}</span></button>
      <button type="button" className="sd-card-star" aria-label={(idea.data.favorite?'Desfavoritar ':'Favoritar ')+idea.name} aria-pressed={idea.data.favorite} onClick={()=>patch(idea.id,{data:{favorite:!idea.data.favorite}})}>{idea.data.favorite?'★':'☆'}</button>
     </article>;})}</div>
    </div>
   </div>}
   {current&&<div className="sd-editor-workspace"><button type="button" className="ghost" disabled={busy} onClick={close}>← Algum dia</button>{detail}</div>}
  </>}
 </section>;
}
