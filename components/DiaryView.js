"use client";
import { useRef, useState } from 'react';
import { calendarDays, dateKey } from '../lib/diary';
import { formatDateInput } from '../lib/dateInput';
import DateInput from './DateInput';
import ProjectAttachments from './ProjectAttachments';

// A formatação é interpretada como texto, sem inserir HTML do usuário.
function InlineText({text}) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g).map((part,index)=>part.startsWith('**')&&part.endsWith('**')?<strong key={index}>{part.slice(2,-2)}</strong>:((part.startsWith('*')&&part.endsWith('*'))||(part.startsWith('_')&&part.endsWith('_')))?<em key={index}>{part.slice(1,-1)}</em>:part.startsWith('`')&&part.endsWith('`')?<code key={index}>{part.slice(1,-1)}</code>:part);
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
export function DiaryEntry({date,entry,onChange,onClose}) {
  const [editing,setEditing]=useState(!entry);
  const editor=useRef(null);
  const value=entry || {id:`d${date}`,date,text:'',attachments:[]};
  function update(patch){onChange({...value,...patch});}
  function format(before,after='') {
    const field=editor.current;if(!field)return;
    const start=field.selectionStart,end=field.selectionEnd;
    const selected=value.text.slice(start,end)||'texto';
    const text=value.text.slice(0,start)+before+selected+after+value.text.slice(end);
    update({text});
    requestAnimationFrame(()=>{field.focus();field.setSelectionRange(start+before.length,start+before.length+selected.length);});
  }
  return <section className="diary-entry" aria-label={`Diário de ${formatDateInput(date)}`}>
    <div className="diary-entry-head"><h2>{formatDateInput(date)}</h2><div>
      {editing?<button className="primary" onClick={()=>setEditing(false)}>Concluir edição</button>:<button className="primary" onClick={()=>setEditing(true)}>Editar entrada</button>}
      <button className="ghost" onClick={onClose}>Fechar</button>
    </div></div>
    {editing?<>
      <div className="diary-format" role="toolbar" aria-label="Formatação do diário">
        <button className="ghost" onClick={()=>format('**','**')}><strong>Negrito</strong></button>
        <button className="ghost" onClick={()=>format('*','*')}><em>Itálico</em></button>
        <button className="ghost" onClick={()=>format('\n## ')}>Título</button>
        <button className="ghost" onClick={()=>format('\n- ')}>Lista</button>
      </div>
      <textarea ref={editor} className="diary-editor" aria-label="Texto do diário" placeholder="Como foi seu dia?" value={value.text} maxLength={10000} onChange={e=>update({text:e.target.value})}/>
      <p className="muted small">Salvamento automático · A edição será bloqueada ao fechar, trocar de data ou sair do Diário.</p>
    </>:value.text?<ReadText text={value.text}/>:<p className="muted">Ainda não há texto nesta data.</p>}
    <ProjectAttachments entity="diário" readOnly={!editing} items={value.attachments} onChange={attachments=>update({attachments})}/>
  </section>;
}
export default function DiaryView({entries=[],setEntries,configured}) {
  const today=dateKey(new Date());
  const [view,setView]=useState(today);
  const [selected,setSelected]=useState(null);
  const year=Number(view.slice(0,4)),month=Number(view.slice(5,7))-1;
  const days=calendarDays(year,month);
  const entryByDate=new Map(entries.map(entry=>[entry.date,entry]));
  function navigate(value,openEntry=false){if(!value)return;setView(value);setSelected(openEntry?value:null);}
  function shift(months){const date=new Date(year,month+months,1,12);if(date.getFullYear()<1000||date.getFullYear()>9999)return;navigate(dateKey(date));}
  function update(entry){setEntries(previous=>{const existing=previous.find(item=>item.date===entry.date);return existing?previous.map(item=>item.id===existing.id?entry:item):[...previous,entry];});}
  if(!configured)return <section className="diary-setup"><h2>Configure o Diário no Notion</h2><p>Crie o banco Diário com Nome (Título), Data (Data), Conteúdo (Texto) e Anexos (Arquivos e mídia).</p><p>Na Vercel, adicione <code>NOTION_DIARY_DATABASE_ID</code> com o ID desse banco e faça um novo deploy.</p></section>;
  return <div className="diary-view">
    <div className="diary-controls">
      <div className="diary-nav-buttons"><button className="ghost" onClick={()=>shift(-12)} aria-label="Ano anterior">« Ano</button><button className="ghost" onClick={()=>shift(-1)} aria-label="Mês anterior">‹ Mês</button></div>
      <h2 aria-live="polite">{new Date(year,month,1,12).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</h2>
      <div className="diary-nav-buttons"><button className="ghost" onClick={()=>shift(1)} aria-label="Próximo mês">Mês ›</button><button className="ghost" onClick={()=>shift(12)} aria-label="Próximo ano">Ano »</button></div>
    </div>
    <div className="diary-jump"><label>Ir para a data <DateInput className="search" value={view} onChange={e=>navigate(e.target.value,true)} aria-label="Ir para a data"/></label><button className="ghost" onClick={()=>navigate(today,true)}>Hoje</button><span className="muted small">● Dia com entrada</span></div>
    <div className="diary-calendar" role="group" aria-label="Calendário do diário">
      {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(day=><div key={day} className="diary-weekday">{day}</div>)}
      {days.map(day=><button key={day.date} className={`diary-day${day.outside?' outside':''}${day.date===today?' today':''}${day.date===selected?' selected':''}`} aria-current={day.date===today?'date':undefined} aria-pressed={day.date===selected} aria-label={`${formatDateInput(day.date)}${day.date===today?', hoje':''}${entryByDate.has(day.date)?', com entrada':''}`} onClick={()=>{setSelected(day.date);if(day.outside)setView(day.date);}}><span>{day.day}</span>{entryByDate.has(day.date)&&<span className="diary-dot" aria-hidden="true">●</span>}</button>)}
    </div>
    {selected&&<DiaryEntry key={selected} date={selected} entry={entryByDate.get(selected)} onChange={update} onClose={()=>setSelected(null)}/>}
  </div>;
}
