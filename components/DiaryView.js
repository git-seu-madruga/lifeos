"use client";
import {habitToday} from '../lib/habits';
import {useDateRollover} from '../lib/useDateRollover';
import LinkText from "./LinkText";
import { useEffect, useRef, useState } from 'react';
import { calendarDays, dateKey, hasDiaryEntry, diaryDoc, validateDiary, removeDiaryAttachments, updateDiaryEntry, searchDiaryEntries } from '../lib/diary';
import { formatDateInput } from '../lib/dateInput';
import {useBackLayer} from '../lib/useBackNavigation';
import DateInput from './DateInput';
import ProjectAttachments from './ProjectAttachments';
import dynamic from 'next/dynamic';
import DiaryDocument from './DiaryDocument';
import {ideaText} from '../lib/someday';
import {holdEditor} from '../lib/editingGuard';
const IdeaEditor=dynamic(()=>import('./IdeaEditor'),{ssr:false,loading:()=> <p className="muted">Abrindo editor…</p>});

// A formatação é interpretada como texto, sem inserir HTML do usuário.
function InlineText({text}) {
  return text.split(/((?:https?:\/\/|www\.)[^\s<>"']+|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g).map((part,index)=>part.startsWith('**')&&part.endsWith('**')?<strong key={index}><LinkText text={part.slice(2,-2)}/></strong>:((part.startsWith('*')&&part.endsWith('*'))||(part.startsWith('_')&&part.endsWith('_')))?<em key={index}><LinkText text={part.slice(1,-1)}/></em>:part.startsWith('`')&&part.endsWith('`')?<code key={index}><LinkText text={part.slice(1,-1)}/></code>:<LinkText key={index} text={part}/>);
}
function ReadText({text}) {
  const lines=text.split('\n'),blocks=[];
  for(let i=0;i<lines.length;i++) {
    const line=lines[i];
    if(line.startsWith('- ')) {
      const items=[];
      while(i<lines.length&&lines[i].startsWith('- ')){items.push(<li key={i}><InlineText text={lines[i].slice(2)}/></li>);i++;}i--;
      blocks.push(<ul key={`list${i}`}>{items}</ul>);
    } else if(line.startsWith('## '))blocks.push(<h3 key={i}><InlineText text={line.slice(3)}/></h3>);
    else blocks.push(<p key={i}>{line?<InlineText text={line}/>:<br/>}</p>);
  }
  return <div className="diary-read">{blocks}</div>;
}
export function DiaryEntry({date,entry,onChange,onClose,initialEditing=false,onBusy}) {
  const [editing,setEditing]=useState(initialEditing || !hasDiaryEntry(entry));
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const editable=editing||!hasDiaryEntry(entry);
  const value=entry || {id:`d${date}`,date,text:'',attachments:[]};
  const latest=useRef(value);latest.current=value;
  const jobs=useRef(false);
  useEffect(()=>{if(editable)return holdEditor();},[editable]);
  const close=()=>{if(!jobs.current)onClose();};
  useBackLayer(true,close,11);
  function uploading(active){jobs.current=active;setBusy(active);onBusy?.(active);}
  useEffect(()=>()=>onBusy?.(false),[]);
  function update(patch){
    const current=latest.current,next={...current,...(typeof patch==='function'?patch(current):patch)};
    const message=validateDiary(next);if(message){setError(message);return;}
    latest.current=next;setError('');onChange(next);
  }
  return <section className="diary-entry" aria-label={`Diário de ${formatDateInput(date)}`}>
    <div className="diary-entry-head"><h2>{formatDateInput(date)}</h2><div>
      {editable?<button className="primary" disabled={busy} onClick={()=>setEditing(false)}>Concluir edição</button>:<button className="primary" onClick={()=>setEditing(true)}>Editar entrada</button>}
      <button className="ghost" disabled={busy} onClick={close}>Fechar</button>
    </div></div>
    {editable?<>
      <IdeaEditor autoFocus={initialEditing} label="Texto do diário" doc={diaryDoc(value)} attachments={value.attachments||[]} onBusy={uploading} onError={setError}
        onChange={doc=>update({doc,text:ideaText(doc)})}
        onImage={image=>update(previous=>({attachments:[...(previous.attachments||[]),image]}))}/>
      <p className="muted small">Salvamento automático · A edição será bloqueada ao fechar, trocar de data ou sair do Diário.</p>
    </>:value.doc?<DiaryDocument doc={value.doc} attachments={value.attachments}/>:value.text?<ReadText text={value.text}/>:<p className="muted">Ainda não há texto nesta data.</p>}
    {busy&&<p className="sd-uploading" role="status">Enviando imagem… mantenha esta entrada aberta.</p>}
    {error&&<p className="date-error" role="alert">{error}</p>}
    <ProjectAttachments entity="diário" readOnly={!editable||busy} items={value.attachments} onChange={attachments=>update(previous=>removeDiaryAttachments(previous,attachments))}/>
  </section>;
}
export default function DiaryView({entries=[],setEntries,configured,openRequest,onOpenHandled}) {
  const today=habitToday();
  const [view,updateView]=useState(today);
  const [selected,setSelected]=useState(null);
  const [busy,setBusy]=useState(false);
  useBackLayer(!!selected,()=>{if(!busy){setSelected(null);setEditingRequest(null);}},10);
  const [editingRequest,setEditingRequest]=useState(null);
  const [query,setQuery]=useState('');
  const searching=!!query.trim();
  const clearSearch=()=>{setQuery('');setSelected(null);setEditingRequest(null);};
  useBackLayer(searching&&!selected,clearSearch,9);
  const [setView]=useDateRollover(view,updateView,{blocked:()=>!!selected});
  useEffect(()=>{
    if(!openRequest)return;
    setView(openRequest.date);setSelected(openRequest.date);setEditingRequest(openRequest);
    onOpenHandled?.();
  },[openRequest]);
  const year=Number(view.slice(0,4)),month=Number(view.slice(5,7))-1;
  const days=calendarDays(year,month);
  const results=searching?searchDiaryEntries(entries,query):[];
  const entryByDate=new Map(entries.map(entry=>[entry.date,entry]));
  function navigate(value,openEntry=false){if(!value||busy)return;setView(value);setSelected(openEntry?value:null);setEditingRequest(null);}
  function shift(months){const date=new Date(year,month+months,1,12);if(date.getFullYear()<1000||date.getFullYear()>9999)return;navigate(dateKey(date));}
  function update(entry){setEntries(previous=>updateDiaryEntry(previous,entry));}
  if(!configured)return <section className="diary-setup"><h2>Configure o Diário no Notion</h2><p>Crie o banco Diário com Nome (Título), Data (Data), Conteúdo (Texto) e Anexos (Arquivos e mídia).</p><p>Na Vercel, adicione <code>NOTION_DIARY_DATABASE_ID</code> com o ID desse banco e faça um novo deploy.</p></section>;
  return <div className="diary-view">
    <div className="diary-search"><input type="search" disabled={busy} className="search" aria-label="Buscar no conteúdo do Diário" placeholder="Buscar no conteúdo de todas as datas…" value={query} maxLength={200} onChange={e=>{setQuery(e.target.value);setSelected(null);setEditingRequest(null);}}/>{searching&&<button type="button" className="ghost" disabled={busy} onClick={clearSearch}>Limpar busca</button>}</div>
    {searching?<>{selected?<button type="button" disabled={busy} className="ghost diary-search-back" onClick={()=>{setSelected(null);setEditingRequest(null);}}>← Resultados da busca</button>:<><p className="diary-search-count muted small" role="status">{results.length} {results.length===1?'entrada encontrada':'entradas encontradas'} em todas as datas</p><div className="diary-search-results">{results.map(({entry,parts})=><button type="button" className="diary-search-card" key={entry.id} aria-label={'Abrir Diário de '+formatDateInput(entry.date)} onClick={()=>navigate(entry.date,true)}><time dateTime={entry.date}>{formatDateInput(entry.date)}</time><p>{parts.map((part,index)=>part.match?<mark key={index}>{part.text}</mark>:<span key={index}>{part.text}</span>)}</p></button>)}</div>{!results.length&&<p className="diary-search-empty muted">Nenhuma entrada contém o texto pesquisado.</p>}</>}</>:<>
    <div className="diary-controls">
      <div className="diary-nav-buttons"><button className="ghost" onClick={()=>shift(-12)} aria-label="Ano anterior">« Ano</button><button className="ghost" onClick={()=>shift(-1)} aria-label="Mês anterior">‹ Mês</button></div>
      <h2 aria-live="polite">{new Date(year,month,1,12).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</h2>
      <div className="diary-nav-buttons"><button className="ghost" onClick={()=>shift(1)} aria-label="Próximo mês">Mês ›</button><button className="ghost" onClick={()=>shift(12)} aria-label="Próximo ano">Ano »</button></div>
    </div>
    <div className="diary-jump"><label>Ir para a data <DateInput className="search" value={view} onChange={e=>navigate(e.target.value,true)} aria-label="Ir para a data"/></label><button className="ghost" onClick={()=>navigate(today,true)}>Hoje</button><span className="muted small">● Dia com entrada</span></div>
    <div className="diary-calendar" role="group" aria-label="Calendário do diário">
      {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(day=><div key={day} className="diary-weekday">{day}</div>)}
      {days.map(day=><button key={day.date} className={`diary-day${day.outside?' outside':''}${day.date===today?' today':''}${day.date===selected?' selected':''}`} aria-current={day.date===today?'date':undefined} aria-pressed={day.date===selected} aria-label={`${formatDateInput(day.date)}${day.date===today?', hoje':''}${hasDiaryEntry(entryByDate.get(day.date))?', com entrada':''}`} onClick={()=>{if(busy)return;setEditingRequest(null);setSelected(day.date);if(day.outside)setView(day.date);}}><span>{day.day}</span>{hasDiaryEntry(entryByDate.get(day.date))&&<span className="diary-dot" aria-hidden="true">●</span>}</button>)}
    </div>
    </>}
    {selected&&<DiaryEntry key={`${selected}:${editingRequest?.token || "read"}`} initialEditing={editingRequest?.date===selected} date={selected} entry={entryByDate.get(selected)} onChange={update} onBusy={setBusy} onClose={()=>{if(busy)return;setSelected(null);setEditingRequest(null);}}/>}
  </div>;
}
