"use client";
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import PageActions from './PageActions';
import ModalLayer from './ModalLayer';
import IdeaArt from './IdeaArt';
import IdeaPalette from './IdeaPalette';
import {holdEditor} from '../lib/editingGuard';
import {useBackLayer} from '../lib/useBackNavigation';
import {makeIdea,ideaText,selectSomedayIdeas,somedayDrawers} from '../lib/someday';
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
  <input className="sd-title-input" aria-label="Título da ideia" placeholder="Dê um nome à sua ideia" value={title} maxLength={200} autoFocus={!record.name} disabled={!record.data.area} onChange={e=>{setTitle(e.target.value);if(e.target.value.trim())update({name:e.target.value});}} onBlur={()=>{if(!title.trim())setTitle(current.current.name);}}/>
  <div className="sd-detail-options"><label><span className="sd-caption">ÁREA</span><select required aria-label="Área da ideia (obrigatória)" value={record.data.area} onChange={e=>{const a=areas.find(a=>a.data.uid===e.target.value);update({data:{area:e.target.value,...(a?{icon:a.data.icon,color:a.data.color}:{})}});}}><option value="" disabled>Selecione uma área</option>{areas.filter(a=>!a.data.archived||a.data.uid===record.data.area).map(a=><option key={a.id} value={a.data.uid}>{a.name}{a.data.archived?' (oculta)':''}</option>)}</select></label><button type="button" className="sd-style-button" aria-label="Escolher ilustração e cor" aria-expanded={palette} disabled={!record.data.area} onClick={()=>setPalette(v=>!v)}>✎</button></div>
  <div className="sd-edit-controls"><button type="button" className="ghost small" disabled={busy||promoting} onClick={onManageAreas}>Gerenciar áreas</button><label className="sd-context-label"><span>Contexto</span><select disabled={!record.data.area} value={record.context} onChange={e=>update({context:e.target.value})}><option value="personal">Pessoal</option><option value="work">Trabalho</option></select></label></div>
  {palette&&<IdeaPalette icon={record.data.icon} color={record.data.color} onChange={data=>update({data})}/>}
  {!record.data.area&&<p role="status" className="sd-area-required">Escolha uma área para organizar e salvar esta ideia. O conteúdo anterior será preservado.</p>}
  <span className="sd-caption">ANOTAÇÕES E REFERÊNCIAS</span>
  {record.data.area?<IdeaEditor doc={record.data.doc} attachments={record.attachments} onError={setError} onBusy={value=>{setBusy(value);onBusy(value);}} onChange={editDoc} onImage={image=>onPatch(record.id,previous=>({attachments:[...previous.attachments,image]}))}/>:<p className="sd-legacy-content">{ideaText(record.data.doc)||'Selecione a área acima para continuar.'}</p>}
  {busy&&<p className="sd-uploading" role="status">Enviando imagem ao Notion… mantenha esta ideia aberta.</p>}
  {error&&<p className="date-error" role="alert">{error}</p>}
  {!!record.attachments.length&&<details className="sd-attachments"><summary>{record.attachments.length} anexo(s) da ideia</summary>{record.attachments.map(file=><div key={file.id}><a href={fileUrl(file)} target="_blank" rel="noopener noreferrer">Imagem / referência ↗</a><button type="button" aria-label="Excluir anexo da ideia" onClick={()=>removeFile(file)}>Excluir</button></div>)}</details>}
  <div className="sd-detail-foot"><small>Guardada em {new Date(record.data.createdAt).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}</small>
   {record.data.promoted?<p className="sd-promoted">✓ Transformada em {record.data.promoted.kind==='task'?'tarefa':'projeto'}. A ideia original foi preservada.</p>:<><span className="sd-soft-copy">Quando fizer sentido dar o próximo passo</span><button type="button" className="primary" disabled={busy||promoting||!record.name.trim()||!record.data.area} onClick={()=>promote('project')}>▱ Transformar em projeto</button><button type="button" className="ghost" disabled={busy||promoting||!record.name.trim()||!record.data.area} onClick={()=>promote('task')}>☑ Transformar em tarefa</button></>}
   <button type="button" className="sd-delete" disabled={busy||promoting} onClick={()=>{if(window.confirm('Excluir esta ideia e seus anexos? Não dá para desfazer.'))onDelete(record.id);}}>Excluir ideia</button>
  </div>
 </section>;
}

export default function SomedayView({records,setRecords,configured,context,onManageAreas,onPromote,openRequest,onOpenHandled}){
 const [query,setQuery]=useState(''),[area,setArea]=useState(null),[favorites,setFavorites]=useState(false),[selected,setSelected]=useState(null),[draft,setDraft]=useState(null),[busy,setBusy]=useState(false);
 const [choosingArea,setChoosingArea]=useState(false);
 const openedRequest=useRef(null);
 useEffect(()=>{
  if(!openRequest||openedRequest.current===openRequest.token||busy||!records.some(r=>r.id===openRequest.id&&r.type==='idea'))return;
  openedRequest.current=openRequest.token;setDraft(null);setSelected(openRequest.id);setQuery('');setArea(records.find(r=>r.id===openRequest.id)?.data.area||'all');onOpenHandled?.();
 },[openRequest,records,busy,onOpenHandled]);
 const areas=records.filter(r=>r.type==='area'),ideas=records.filter(r=>r.type==='idea');
 const current=records.find(r=>r.id===selected)||draft;
 useEffect(()=>{if(current)return holdEditor();},[!!current]);
 const close=()=>{if(busy)return;setSelected(null);setDraft(null);};
 useBackLayer(!!current,close,12);
 const patch=(id,change)=>setRecords(previous=>{
  const old=previous.find(r=>r.id===id)||draft;if(!old)return previous;
  const value=typeof change==='function'?change(old):change,next={...old,...value,data:{...old.data,...value.data}};
  if(!next.data.area)return previous;
  if(!next.name.trim())next.name='Sem título';
  return previous.some(r=>r.id===id)?previous.map(r=>r.id===id?next:r):[...previous,next];
 });
 const startIdea=chosen=>{const idea=makeIdea(chosen,context==='work'?'work':'personal');setDraft(idea);setSelected(idea.id);setChoosingArea(false);};
 const openNew=()=>{if(busy)return;const chosen=areas.find(a=>a.data.uid===area&&!a.data.archived);if(chosen)startIdea(chosen);else setChoosingArea(true);};
 useBackLayer(!current&&!!area&&!query.trim(),()=>setArea(null),10);

 const visible=selectSomedayIdeas(records,{query,area:area||'all',context,favorites}),drawers=somedayDrawers(records,{context,favorites});
 const drawer=drawers.find(d=>d.id===area),searching=!!query.trim(),showIdeas=searching||!!area;
 const detail=current&&<IdeaDetail key={current.id} record={current} areas={areas} onPatch={patch} onClose={close} onPromote={onPromote} onBusy={setBusy} onManageAreas={onManageAreas} onDelete={id=>{setRecords(previous=>previous.filter(r=>r.id!==id));close();}}/>;
 return <section className="someday">
  <PageActions><button type="button" className="sd-new-button" onClick={openNew} disabled={!configured||busy}>+ Nova ideia</button></PageActions>
  {!configured?<div className="sd-setup"><IdeaArt icon="seedling" size={84}/><h2>Um lugar para guardar possibilidades</h2><p>Crie o banco Algum dia no Notion e configure NOTION_SOMEDAY_DATABASE_ID na Vercel. O passo a passo está no README desta versão.</p></div>:<>
   {!current&&<div className="sd-layout">
    <div className="sd-collection"><div className="sd-search-row"><input className="search" type="search" value={query} placeholder="Pesquisar em todas as ideias…" aria-label="Buscar ideias" onChange={e=>setQuery(e.target.value)}/><button type="button" className="sd-favorite-filter" aria-label="Mostrar favoritas" aria-pressed={favorites} disabled={searching} onClick={()=>setFavorites(v=>!v)}>☆</button></div>
     <div className="sd-browser-heading">{!searching&&area&&<button type="button" className="ghost" onClick={()=>setArea(null)}>← Áreas</button>}<strong>{searching?'Resultados em todas as áreas e contextos':area?(area==='all'?'Todos':drawer?.name||'Área'): 'Áreas de interesse'}</strong><div className="sd-browser-actions"><button type="button" className="ghost" aria-pressed={!searching&&area==='all'} onClick={()=>{setQuery('');setArea('all');}}>Mostrar todos</button><button type="button" className="ghost" onClick={onManageAreas}>Gerenciar áreas</button></div></div>
     {!showIdeas?<div className="sd-drawers">{drawers.map(d=><button type="button" key={d.id} className="sd-drawer" style={{'--sd-tone':d.color}} onClick={()=>setArea(d.id)}><span className="sd-drawer-art"><IdeaArt icon={d.icon} size={70}/></span><strong>{d.name}</strong><span>{d.count} {d.count===1?'ideia':'ideias'}{d.archived?' · Área oculta':''}</span></button>)}{!drawers.length&&<p className="empty">Crie uma área em Gerenciar áreas para começar.</p>}</div>:<>
     {!visible.length&&<p className="empty">{searching?'Nenhuma ideia encontrada.':'Nenhuma ideia nesta gaveta.'}</p>}
     <div className="sd-grid">{visible.map(idea=>{const a=areas.find(a=>a.data.uid===idea.data.area);return <article key={idea.id} className={'sd-card'+(selected===idea.id?' selected':'')} style={{'--sd-tone':idea.data.color}}>
      <button type="button" className="sd-card-main" disabled={busy} onClick={()=>{setDraft(null);setSelected(idea.id);}}><span className="sd-card-heading"><span className="sd-art"><IdeaArt icon={idea.data.icon}/></span><strong>{idea.name}</strong></span><span className="sd-area-chip" style={{'--sd-tone':a?.data.color||idea.data.color}}>{a?.name||'Escolher área'}</span><span className="sd-card-preview">{ideaText(idea.data.doc).slice(0,180)||'Uma possibilidade esperando novas referências.'}</span>{(idea.attachments.length>0||idea.data.promoted)&&<span className="sd-card-meta">{[idea.attachments.length?`${idea.attachments.length} anexo(s)`:'',idea.data.promoted?'Transformada':''].filter(Boolean).join(' · ')}</span>}</button>
      <button type="button" className="sd-card-star" aria-label={(idea.data.favorite?'Desfavoritar ':'Favoritar ')+idea.name} aria-pressed={idea.data.favorite} onClick={()=>{if(!idea.data.area){setDraft(null);setSelected(idea.id);}else patch(idea.id,{data:{favorite:!idea.data.favorite}});}}>{idea.data.favorite?'★':'☆'}</button>
     </article>;})}</div></>}
    </div>
   </div>}
   {current&&<div className="sd-editor-workspace"><button type="button" className="ghost" disabled={busy} onClick={close}>← {searching?'Resultados':area==='all'?'Todos':drawer?.name||'Áreas'}</button>{detail}</div>}
  </>}
 <ModalLayer open={choosingArea} onClose={()=>setChoosingArea(false)}>{choosingArea&&<div className="overlay" onClick={()=>setChoosingArea(false)}><section className="panel finance-modal sd-pick-area" role="dialog" aria-modal="true" aria-label="Escolha a área da ideia" onClick={e=>e.stopPropagation()}><h2>Em qual área guardar a ideia?</h2><p className="muted">Toda ideia precisa de uma área. Depois você pode alterá-la no editor.</p><div className="sd-area-choice-list">{areas.filter(a=>!a.data.archived).map(a=><button type="button" key={a.id} className="ghost" onClick={()=>startIdea(a)}><IdeaArt icon={a.data.icon} size={32}/>{a.name}</button>)}</div><div className="finance-period"><button type="button" className="ghost" onClick={()=>{setChoosingArea(false);onManageAreas();}}>Gerenciar áreas</button><button type="button" className="ghost" onClick={()=>setChoosingArea(false)}>Cancelar</button></div></section></div>}</ModalLayer>
 </section>;
}
