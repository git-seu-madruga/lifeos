"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import PageActions from './PageActions';
import ModalLayer from './ModalLayer';
import IdeaArt from './IdeaArt';
import IdeaPalette from './IdeaPalette';
import ReferenceCategoryManager from './ReferenceCategoryManager';
import {holdEditor} from '../lib/editingGuard';
import {useBackLayer} from '../lib/useBackNavigation';
import {api} from '../lib/api';
import {ideaText} from '../lib/someday';
import {makeReferenceMaterial,validateReference,saveReferenceCategory,referenceDrawers,referenceMaterials,removeReferenceAttachment} from '../lib/reference';
const IdeaEditor=dynamic(()=>import('./IdeaEditor'),{ssr:false,loading:()=> <p className="muted">Abrindo editor…</p>});
const fileName=name=>name.replace(/^ref-[a-f\d-]{36}-/i,'');
const fileUrl=file=>file.pageId?'/api/notion/attachment?kind=reference&id='+encodeURIComponent(file.pageId)+'&index='+file.index+'&name='+encodeURIComponent(file.name):file.notion?.[file.notion.type]?.url||'';
export function MaterialDetail({record,categories,onPatch,onClose,onDelete,onBusy,onFlush,onManage}){
 const [title,setTitle]=useState(record.name),[palette,setPalette]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saving,setSaving]=useState(false);
 const fileInput=useRef(null),busyJobs=useRef({image:false,files:false}),latest=useRef(record);latest.current=record;
 const update=change=>onPatch(record.id,change);
 const uploading=useCallback((value,source='image')=>{busyJobs.current[source]=value;const active=Object.values(busyJobs.current).some(Boolean);setBusy(active);onBusy(active);},[onBusy]);
 async function addFiles(event){
  const files=Array.from(event.target.files||[]);event.target.value='';if(!files.length)return;
  if(files.some(f=>f.size>4*1024*1024)){setError('O limite de envio pelo app é 4 MB por arquivo.');return;}
  if(latest.current.attachments.length+files.length>100){setError('Use até 100 anexos por material.');return;}
  uploading(true,'files');setError('');
  try{for(const file of files){const name='ref-'+crypto.randomUUID()+'-'+file.name.slice(-150),form=new FormData();form.append('file',file,name);const uploaded=await api('/api/notion/upload',{method:'POST',body:form});const attachment={id:'ref-file:'+crypto.randomUUID(),name,...uploaded};update(previous=>({attachments:[...previous.attachments,attachment]}));}}
  catch(e){setError(e.message);}finally{uploading(false,'files');}
 }
 async function finish(){if(!title.trim()){setError('Dê um título ao material.');return;}setSaving(true);onBusy(true);setError('');try{await onFlush?.();onBusy(false);onClose();}catch(e){setError(e.message);}finally{setSaving(false);onBusy(false);}}
 return <section className="ref-editor sd-detail" aria-label="Material de referência">
  <div className="ref-editor-actions"><button type="button" className="ghost" disabled={busy||saving} onClick={onClose}>← Voltar à biblioteca</button><button type="button" className="primary" disabled={busy||saving} onClick={finish}>{saving?'Salvando…':'Salvar material'}</button></div>
  <div className="ref-editor-heading"><span className="sd-art"><IdeaArt icon={record.data.icon} size={50}/></span><button type="button" className="ghost ref-star" aria-label="Favoritar material" aria-pressed={record.data.favorite} onClick={()=>update({data:{favorite:!record.data.favorite}})}>{record.data.favorite?'★':'☆'}</button></div>
  <input className="sd-title-input" aria-label="Título do material" placeholder="Título do material" maxLength={200} autoFocus={!record.name} value={title} onChange={e=>{setTitle(e.target.value);if(e.target.value.trim())update({name:e.target.value});}} onBlur={()=>{if(!title.trim())setTitle(latest.current.name);}}/>
  <div className="ref-material-options"><label>Categoria<select className="search" aria-label="Categoria do material" value={record.data.category} onChange={e=>update({data:{category:e.target.value}})}>{categories.filter(c=>!c.data.archived||c.data.uid===record.data.category).map(c=><option key={c.id} value={c.data.uid}>{c.name}{c.data.archived?' (oculta)':''}</option>)}</select></label><button type="button" className="ghost" disabled={busy||saving} onClick={onManage}>Gerenciar categorias</button><button type="button" className="ghost" aria-expanded={palette} onClick={()=>setPalette(v=>!v)}>Ilustração e cor</button></div>
  {palette&&<IdeaPalette icon={record.data.icon} color={record.data.color} onChange={data=>update({data})}/>}
  <IdeaEditor label="Conteúdo do material" doc={record.data.doc} attachments={record.attachments} onBusy={uploading} onError={setError} onChange={doc=>update({data:{doc}})} onImage={image=>update(previous=>({attachments:[...previous.attachments,image]}))}/>
  {busy&&<p className="sd-uploading" role="status">Enviando arquivos… mantenha este material aberto.</p>}
  <section className="ref-attachments"><div className="ref-line"><h3>Anexos do material</h3><button type="button" className="ghost" disabled={busy||saving} onClick={()=>fileInput.current.click()}>＋ Adicionar anexo</button><input ref={fileInput} type="file" multiple hidden onChange={addFiles}/></div><p className="muted small">Imagens no texto e arquivos de consulta · até 4 MB por arquivo enviado pelo app.</p><div className="ref-files">{record.attachments.map(file=><div key={file.id} className="ref-file"><span>{fileUrl(file)?<a href={fileUrl(file)} target="_blank" rel="noopener noreferrer">{fileName(file.name)} ↗</a>:fileName(file.name)}</span><button type="button" className="ghost" disabled={busy||saving} aria-label={'Excluir anexo '+fileName(file.name)} onClick={()=>{if(window.confirm('Excluir este anexo do material e retirar suas imagens do texto?'))update(previous=>removeReferenceAttachment(previous,file));}}>Excluir</button></div>)}</div>{!record.attachments.length&&<p className="muted small">Nenhum arquivo anexado.</p>}</section>
  {error&&<p className="date-error" role="alert">{error}</p>}
  <div className="ref-editor-foot"><small className="muted">As alterações são salvas automaticamente. Use Salvar material para concluir e voltar.</small><button type="button" className="danger" disabled={busy||saving} onClick={()=>{if(window.confirm('Excluir este material e seus anexos? Não dá para desfazer.'))onDelete(record.id);}}>Excluir material</button></div>
 </section>;
}
export default function ReferenceView({records=[],setRecords,configured,onFlush}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState(null),[favorites,setFavorites]=useState(false),[selected,setSelected]=useState(null),[draft,setDraft]=useState(null),[busy,setBusy]=useState(false),[manager,setManager]=useState(false),[choosing,setChoosing]=useState(false);
 const categories=records.filter(r=>r.type==='category'),current=records.find(r=>r.id===selected)||draft;
 useEffect(()=>{if(current)return holdEditor();},[!!current]);
 const close=()=>{if(busy)return;setSelected(null);setDraft(null);};useBackLayer(!!current,close,12);
 function patch(id,change){setRecords(previous=>{const old=previous.find(r=>r.id===id)||draft;if(!old)return previous;const value=typeof change==='function'?change(old):change,next={...old,...value,data:{...old.data,...value.data}};if(JSON.stringify(next)===JSON.stringify(old))return previous;if(!next.name.trim())next.name='Sem título';next.data.updatedAt=Date.now();const error=validateReference(next);if(error)throw new Error(error);return previous.some(r=>r.id===id)?previous.map(r=>r.id===id?next:r):[...previous,next];});}
 function start(chosen){const material=makeReferenceMaterial(chosen);setDraft(material);setSelected(material.id);setChoosing(false);}
 const newMaterial=()=>{const active=categories.find(c=>c.data.uid===category&&!c.data.archived);if(active)start(active);else setChoosing(true);};
 const list=referenceMaterials(records,{query,category,favorites}),drawers=referenceDrawers(records),isHome=category===null&&!query.trim()&&!favorites;
 const open=id=>{setSelected(id);setDraft(null);};
 function favorite(item){patch(item.id,{data:{favorite:!item.data.favorite}});}
 const materialCard=item=><article className="ref-material" key={item.id}><button type="button" className="ref-card-star ref-star" aria-pressed={item.data.favorite} aria-label={'Favoritar '+item.name} onClick={()=>favorite(item)}>{item.data.favorite?'★':'☆'}</button><button type="button" className="ref-material-open" onClick={()=>open(item.id)}><span className="ref-material-category">{categories.find(c=>c.data.uid===item.data.category)?.name}</span><h3>{item.name}</h3><p>{ideaText(item.data.doc).slice(0,180)||'Material de consulta'}</p><span className="ref-material-meta">Texto rico{item.attachments.length?' · '+item.attachments.length+' anexo(s)':''}</span></button></article>;
 return <section className="reference-view">
  {!current&&<PageActions><button type="button" className="primary" disabled={!configured} onClick={newMaterial}>＋ Novo material</button></PageActions>}
  {!configured&&<p className="well-setup">Para usar a biblioteca, configure o banco Referência Geral no Notion e NOTION_REFERENCE_DATABASE_ID na Vercel, conforme o README.</p>}
  {current?<MaterialDetail key={current.id} record={current} categories={categories} onPatch={patch} onClose={close} onDelete={id=>{setRecords(previous=>previous.filter(r=>r.id!==id));setSelected(null);setDraft(null);}} onBusy={setBusy} onFlush={onFlush} onManage={()=>setManager(true)}/>:<>
   <div className="ref-browser-tools"><input className="search" type="search" aria-label="Buscar em toda a biblioteca" placeholder="Buscar em todos os materiais, textos e links…" value={query} onChange={e=>setQuery(e.target.value)}/><button type="button" className="ghost ref-favorites" aria-pressed={favorites} onClick={()=>setFavorites(v=>!v)}>☆ Favoritos</button><button type="button" className="ghost" onClick={()=>{setCategory('all');setQuery('');setFavorites(false);}}>Mostrar todos</button><button type="button" className="ghost" disabled={!configured} onClick={()=>setManager(true)}>Gerenciar categorias</button></div>
   {!isHome&&<div className="ref-breadcrumb"><button type="button" className="ghost" onClick={()=>{setCategory(null);setQuery('');setFavorites(false);}}>← Biblioteca</button><span>{query.trim()?'Resultados em toda a biblioteca':favorites?'Favoritos':category==='all'?'Todos os materiais':categories.find(c=>c.data.uid===category)?.name}</span><small>{list.length} material(is)</small></div>}
   {isHome?<><div className="ref-drawers">{drawers.map(c=><button type="button" className="ref-drawer" key={c.id} style={{'--ref-tone':c.data.color}} onClick={()=>setCategory(c.data.uid)}><IdeaArt icon={c.data.icon} size={58}/><strong>{c.name}</strong>{c.data.description&&<p>{c.data.description}</p>}<small>{c.count} {c.count===1?'material':'materiais'}{c.data.archived?' · categoria oculta':''}</small></button>)}{!drawers.length&&<div className="ref-empty"><IdeaArt icon="art-books" size={64}/><p>Crie suas categorias e reúna os materiais que quer encontrar de novo.</p><button type="button" className="ghost" disabled={!configured} onClick={()=>setManager(true)}>Criar categoria</button></div>}</div>{records.some(r=>r.type==='material'&&r.data.favorite)&&<><p className="ref-favorites-label">★ À mão · seus favoritos</p><div className="ref-materials">{referenceMaterials(records,{favorites:true}).slice(0,4).map(materialCard)}</div></>}</>:<div className="ref-materials">{list.map(materialCard)}{!list.length&&<p className="ref-empty">Nenhum material encontrado.{!query.trim()&&' Use Novo material para guardar uma referência nesta categoria.'}</p>}</div>}
  </>}
  <ModalLayer open={manager} onClose={()=>setManager(false)}>{manager&&<div className="overlay sd-area-layer" onClick={()=>setManager(false)}><div onClick={e=>e.stopPropagation()}><ReferenceCategoryManager areas={categories} onSave={value=>setRecords(previous=>saveReferenceCategory(previous,value))} onClose={()=>setManager(false)}/></div></div>}</ModalLayer>
  <ModalLayer open={choosing} onClose={()=>setChoosing(false)}>{choosing&&<div className="overlay" onClick={()=>setChoosing(false)}><section className="panel finance-modal sd-pick-area" role="dialog" aria-modal="true" aria-label="Categoria do novo material" onClick={e=>e.stopPropagation()}><h2>Em qual categoria guardar?</h2><div className="sd-area-choice-list">{categories.filter(c=>!c.data.archived).map(c=><button type="button" className="ghost" key={c.id} onClick={()=>start(c)}><IdeaArt icon={c.data.icon} size={32}/>{c.name}</button>)}</div>{!categories.some(c=>!c.data.archived)&&<p className="muted">Crie uma categoria antes de adicionar materiais.</p>}<div className="ref-line"><button type="button" className="ghost" onClick={()=>setManager(true)}>Gerenciar categorias</button><button type="button" className="ghost" onClick={()=>setChoosing(false)}>Cancelar</button></div></section></div>}</ModalLayer>
 </section>;
}
