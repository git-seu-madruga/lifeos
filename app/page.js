"use client";

import { patchTask } from "../lib/tasks";


import { useEffect, useRef, useState } from "react";
import { NAV, INBOX_TARGETS } from "../lib/nav";
import { useNotionState } from "../lib/useNotionState";
import { InstallApp } from "../components/PwaProvider";
import Brand from '../components/Brand';
import {useRecadoNotification} from '../lib/useRecadoNotification';
import AccountMenu from '../components/AccountMenu';
import BackupView from '../components/BackupView';
import RecadosView from "../components/RecadosView";
import EntertainmentView from "../components/EntertainmentView";
import Login from "../components/Login";
import ModalLayer from '../components/ModalLayer';
import {useAppBackNavigation,useBackLayer,BackNotice} from '../lib/useBackNavigation';
import HabitsView from '../components/HabitsView';
import ShoppingView from '../components/ShoppingView';
import TabIcon from '../components/TabIcon';
import {shoppingFromInbox} from '../lib/shopping';
import Inbox from "../components/Inbox";
import TaskDetail from "../components/TaskDetail";
import TasksView from "../components/TasksView";
import ProjectsView from "../components/ProjectsView";
import BirthdaysView from '../components/BirthdaysView';
import {contactFromInbox} from '../lib/birthdays';
import FinanceView from "../components/FinanceView";
import DiaryView from "../components/DiaryView";
import { normalizeTabOrder, moveTab, dateKey, appendInboxToDiary } from "../lib/diary";
import Placeholder from "../components/Placeholder";

const CONTEXTS = [
  { id: "all", label: "Todos" },
  { id: "work", label: "Trabalho" },
  { id: "personal", label: "Pessoal" },
];

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Home() {
  const [context, setContext] = useState("all");
  const [tabId, setTabId] = useState(NAV[0].id);
  const [tabOrder,setTabOrder] = useState(NAV.map(tab=>tab.id));
  const [orderReady,setOrderReady] = useState(false);
  const [dragged,setDragged] = useState(null);
  const draggedTab = useRef(null);
  const touchDrag = useRef(null);
  const [touchMode,setTouchMode]=useState(false),[touchReorder,setTouchReorder]=useState(false);
  useEffect(()=>{const query=window.matchMedia("(pointer: coarse)");const update=()=>setTouchMode(query.matches);update();query.addEventListener("change",update);return()=>query.removeEventListener("change",update);},[]);
  const suppressClick = useRef(false);
  useEffect(()=>{
    let order=NAV.map(tab=>tab.id);
    try { order=normalizeTabOrder(JSON.parse(localStorage.getItem('lifeos-tab-order')),order); } catch {}
    setTabOrder(order);setTabId(order[0]);setOrderReady(true);
  },[]);
  useEffect(()=>{if(orderReady)try{localStorage.setItem('lifeos-tab-order',JSON.stringify(tabOrder));}catch{}},[tabOrder,orderReady]);
  function reorderTab(from,to){setTabOrder(order=>moveTab(order,from,to));}
  const orderedTabs=tabOrder.map(id=>NAV.find(tab=>tab.id===id));
  const [subs, setSubs] = useState({});
  const [backupOpen,setBackupOpen]=useState(false);
  useBackLayer(backupOpen,()=>setBackupOpen(false),10);
  const [selected, setSelected] = useState(null);
  const remote = useNotionState();
  useAppBackNavigation(remote.authenticated === true,remote.ready);
  const recadoNotice=useRecadoNotification(remote.user,remote.authenticated===true&&remote.ready);
  const [recadoTodayRequest,setRecadoTodayRequest]=useState(0);
  const { tasks, projects, inbox, setInbox, setTasks, setProjects, ready, saving, refreshedAt } = remote;

  const [shoppingSelected,setShoppingSelected]=useState(null);
  const [shoppingCreating,setShoppingCreating]=useState(false);
  const [shoppingInbox,setShoppingInbox]=useState(null);
  const [shoppingContext,setShoppingContext]=useState("personal");
  const [contactOpen,setContactOpen]=useState(null);
  const [diaryOpen,setDiaryOpen] = useState(null);
  const [newTaskId, setNewTaskId] = useState(null);


  const personalOnly = ["financas", "diario", "aniversarios", "habitos", "entretenimento", "recados"].includes(tabId);
  const effectiveContext = personalOnly ? "personal" : context;
  const tab = NAV.find((t) => t.id === tabId);
  const subId = subs[tabId] || tab.subs[0].id;
  const sub = tab.subs.find((s) => s.id === subId);

  const SUB_OF = { active: "ativos", paused: "pausados", done: "concluidos", cancelled: "cancelados" };
  function openProject(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setSubs((s) => ({ ...s, projetos: SUB_OF[p.status] }));
    setSelected(id);
    setTabId("projetos");
  }

  const newTask = tasks && tasks.find((t) => t.id === newTaskId);
  const updateNewTask = (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? patchTask(t, patch) : t)));

  const addInbox = (text) => setInbox((prev) => [{ id: uid("i"), text, createdAt:Date.now() }, ...prev]);
  const updateInbox = (id, text) => setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  const deleteInbox = (id) => setInbox((prev) => prev.filter((i) => i.id !== id));

  // Cria o item na seção atual e tira a entrada do inbox.
  const [recadoInbox,setRecadoInbox]=useState(null);
  function convertInbox(item, kind) {
    if(kind==="recado"){
      const [title,...lines]=item.text.split("\n");
      if(!title.trim()||!lines.join("\n").trim()){window.alert("Use a primeira linha para o título e as seguintes para a mensagem. O texto continua no Inbox.");return false;}
      setRecadoInbox({...item,title:title.trim(),message:lines.join("\n").trim(),token:uid("recado-inbox")});return true;
    }
    if(kind==="shopping"){
      if(!remote.shoppingConfigured){window.alert("Configure o banco Listas de compras no Notion. O texto continua no Inbox.");return false;}
      if(context==='all'){setShoppingInbox(item);return false;}
      return moveShoppingInbox(item,context);
    }
    if(kind==="contact"){
      if(!remote.contactsConfigured){window.alert("Configure o banco Aniversários no Notion antes de mover esta entrada. O texto continua no Inbox.");return false;}
      const parsed=contactFromInbox(item);
      if(parsed.error){window.alert(parsed.error);return false;}
      const person={...parsed.person,id:uid("contact")};
      if((remote.contacts || []).some(contact=>contact.name.toLocaleLowerCase('pt-BR')===person.name.toLocaleLowerCase('pt-BR'))&&!window.confirm("Já existe um contato com este nome. Criar outro contato?"))return false;
      remote.setContacts(previous=>[...previous,person]);deleteInbox(item.id);setContactOpen(person.id);setTabId("aniversarios");return true;
    }
    if (kind === "diary") {
      if (!remote.diaryConfigured) { window.alert("Configure o banco Diário no Notion antes de mover esta entrada. O texto continua no Inbox."); return false; }
      const date=dateKey(new Date());
      let result;
      try { result=appendInboxToDiary(remote.diary || [],item,date); }
      catch(error) { window.alert(error.message);return false; }
      const existing=(remote.diary || []).find(entry=>entry.date===date);
      if (existing && !window.confirm("Já existe uma entrada no Diário de hoje. Reabrir para edição e acrescentar o texto do Inbox ao final, com uma quebra de linha antes?")) return false;
      remote.setDiary(result.entries);
      deleteInbox(item.id);
      setDiaryOpen({date,token:uid("open")});
      setTabId("diario");
      return true;
    }
    const [first, ...rest] = item.text.trim().split("\n");
    const notes = rest.join("\n").trim();
    const ctx = context === "all" ? "work" : context;
    const newId = uid(kind === "task" ? "t" : "pr");
    if (kind === "task") {
      setTasks((prev) => [...prev, {
        id: newId, title: first, status: "todo", due: null, start: null,
        priority: "medium", context: ctx, project: null, milestone: null, attachments: [], notes,
        followUp: null, waitingOn: "",
      }]);
      setNewTaskId(newId); // abre o detalhe para completar os campos
    } else if (kind === "project") {
      const status = { ativos: "active", pausados: "paused", concluidos: "done", cancelados: "cancelled" }[subId] || "active";
      setProjects((prev) => [...prev, { id: newId, name: first, status, area: "", context: ctx, due: null, description: notes, milestones: [] }]);
      setSelected(newId); // abre o projeto para completar os campos
    } else {
      return;
    }
    deleteInbox(item.id);
  }

  function moveShoppingInbox(item,ctx){
    try{const result=shoppingFromInbox(remote.shopping || [],item.text,ctx);remote.setShopping(result.lists);deleteInbox(item.id);setShoppingSelected(result.id);setShoppingInbox(null);setShoppingCreating(false);setTabId('compras');return true;}
    catch(error){window.alert(error.message);return false;}
  }

  async function refresh() {
    try { await remote.refresh();window.dispatchEvent(new Event("lifeos-refresh")); }
    catch {
      if (window.confirm("Não foi possível salvar antes de atualizar. Descartar as alterações locais pendentes e carregar a versão atual do Notion?")) {
        try { await remote.refresh(true);window.dispatchEvent(new Event("lifeos-refresh")); } catch {}
      }
    }
  }

  if(!orderReady || remote.authenticated === null) return <p className="empty">Carregando LifeOS…</p>;
  if(!remote.authenticated) return <Login onLogin={remote.login} configured={remote.configured} initialError={remote.error} />;
  if(!ready) return <main className="login-shell"><div className="login-card"><h1><Brand/></h1><p>{remote.loading ? "Conectando ao Notion…" : "Não foi possível carregar os bancos."}</p>{remote.error && <p className="date-error" role="alert">{remote.error}</p>}<button className="primary" onClick={remote.load} disabled={remote.loading}>Tentar novamente</button><button className="ghost" onClick={()=>remote.logout().catch(()=>{})}>Sair</button></div></main>;


  const time = refreshedAt
    ? refreshedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="shell app-viewport" data-app-viewport="">
      <div className="left-rail" inert={remote.maintenance}>
      {ready && inbox && <Inbox items={inbox} tabId={tabId} onAdd={addInbox} onUpdate={updateInbox} onDelete={deleteInbox} onConvert={convertInbox} />}
      </div>
    <div className="app">
      <header className="topbar">
        {recadoNotice?<button className="recado-logo-notice" aria-label="Há um recado de hoje não lido. Abrir Recados" title="Seu recado de hoje chegou ❤️" onClick={()=>{setBackupOpen(false);setTabId('recados');setRecadoTodayRequest(value=>value+1);}}><TabIcon id="recados"/><span>Recado de hoje<small>Um carinho esperando por você</small></span></button>:<Brand/>}

        <div className="segmented" role="group" aria-label="Contexto">
          {CONTEXTS.map((c) => (
            <button
              key={c.id}
              className={effectiveContext === c.id ? "on" : ""}
              aria-pressed={effectiveContext === c.id}
              disabled={personalOnly||backupOpen||remote.maintenance}
              title={personalOnly ? "Esta seção usa apenas o contexto Pessoal" : undefined}
              onClick={() => setContext(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="topbar-right">
          <InstallApp />
          <button className={"icon-btn" + (remote.loading ? " spin" : "")} onClick={refresh} disabled={remote.loading || remote.maintenance || (saving && !remote.error)} aria-label="Atualizar dados">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
          <span className="refreshed" title={refreshedAt?.toLocaleString("pt-BR")}>{time && `Dados atualizados às ${time}`}</span>
          <AccountMenu user={remote.user} onLogout={()=>remote.logout().catch(()=>{})} onBackup={()=>setBackupOpen(true)}/>
        </div>
      </header>

      <div className="tabs-row" inert={backupOpen||remote.maintenance}><nav className={"tabs"+(touchReorder?" reordering":"")} aria-label="Seções">
        {orderedTabs.map((t) => (
          <span key={t.id} className="tab-wrap">
            {t.sep && <span className="tab-sep" aria-hidden="true" />}
            <button
              className={"tab" + (t.id === tabId ? " on" : "") + (dragged === t.id ? " dragging" : "")}
              draggable={!touchMode}
              data-tab-id={t.id} data-romantic={t.id==='recados'||undefined}
              onPointerDown={e=>{if(e.pointerType==='touch'&&touchReorder){touchDrag.current={id:t.id,x:e.clientX,y:e.clientY,moved:false,target:t.id,bar:e.currentTarget.closest('.tabs')};e.currentTarget.setPointerCapture(e.pointerId);}}}
              onPointerMove={e=>{const drag=touchDrag.current;if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.moved=true;setDragged(drag.id);const bounds=drag.bar.getBoundingClientRect();if(e.clientX>bounds.right-30)drag.bar.scrollLeft+=12;else if(e.clientX<bounds.left+30)drag.bar.scrollLeft-=12;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-tab-id]')?.dataset.tabId;if(target)drag.target=target;}}}
              onPointerUp={()=>{const drag=touchDrag.current;if(drag?.moved){reorderTab(drag.id,drag.target);suppressClick.current=true;setTimeout(()=>{suppressClick.current=false;},400);}touchDrag.current=null;setDragged(null);}}
              onPointerCancel={()=>{touchDrag.current=null;setDragged(null);}}
              title={touchMode?"Deslize para ver as abas · Use Ordenar abas para reorganizar":"Arraste para reordenar · Alt + seta também move"}
              onDragStart={e=>{draggedTab.current=t.id;setDragged(t.id);e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',t.id);}}
              onDragOver={e=>{if(draggedTab.current){e.preventDefault();e.dataTransfer.dropEffect='move';}}}
              onDrop={e=>{e.preventDefault();if(draggedTab.current)reorderTab(draggedTab.current,t.id);draggedTab.current=null;setDragged(null);}}
              onDragEnd={()=>{draggedTab.current=null;setDragged(null);}}
              onKeyDown={e=>{if(e.altKey && ['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const target=tabOrder[tabOrder.indexOf(t.id)+(e.key==='ArrowLeft'?-1:1)];if(target)reorderTab(t.id,target);}}}
              aria-current={t.id === tabId ? "page" : undefined}
              onClick={() => { if(suppressClick.current||touchReorder)return;setTabId(t.id); setSelected(null); }}
            >
              <TabIcon id={t.id}/><span className="tab-label">{t.label}{['compras','financas','aniversarios'].includes(t.id)&&<small className="tab-shared">COMPARTILHADO</small>}</span>
            </button>
          </span>
        ))}
      </nav>{touchMode&&<button className={"icon-btn tab-order-toggle"+(touchReorder?" on":"")} aria-label={touchReorder?"Concluir ordem das abas":"Ordenar abas"} aria-pressed={touchReorder} title={touchReorder?"Concluir ordem das abas":"Ordenar abas"} onClick={()=>{setTouchReorder(!touchReorder);touchDrag.current=null;setDragged(null);}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{touchReorder?<path d="m4 12 5 5L20 6"/>:<><path d="M4 8h16M4 16h16m-3-11 3 3-3 3M7 13l-3 3 3 3"/></>}</svg></button>}</div>{touchReorder&&<p className="muted small" role="status">Arraste as abas para ordenar. Toque no ✓ para voltar à rolagem.</p>}

      {backupOpen&&remote.user?.isLegacyOwner&&<BackupView onClose={()=>setBackupOpen(false)} beforeStart={remote.flush} onStatus={remote.setMaintenance} onFinished={()=>{remote.checkMaintenance();refresh();}}/>}
      {remote.maintenance&&!backupOpen&&<div className="backup-warning" role="status"><h2>Backup ou restauração em andamento</h2><p>As edições estão temporariamente bloqueadas para os dois usuários. Seus textos pendentes foram preservados.</p><p>O aplicativo verificará a liberação enquanto esta tela estiver visível.</p></div>}
      <main className="content" hidden={backupOpen||remote.maintenance}>
        {remote.error && <p className="date-error" role="alert">{remote.error}</p>}
        {remote.error && <button className="ghost" onClick={() => remote.flush().catch(() => {})}>Tentar salvar novamente</button>}
        {ready && <p className="muted small" role="status">{saving ? "Salvando no Notion…" : remote.error || remote.pending ? "Alterações pendentes" : "Salvo no Notion"}</p>}

        {!saving&&['compras','aniversarios','financas'].includes(tabId)&&(()=>{const keys=tabId==='compras'?['shopping']:tabId==='aniversarios'?['contacts']:['categories','transactions'];const latest=keys.map(key=>remote.sharedActivity?.[key]).filter(Boolean).sort((a,b)=>b.at.localeCompare(a.at))[0];return latest?<p className="muted small shared-editor">Última alteração no LifeOS por {latest.name} · {new Date(latest.at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</p>:null;})()}
        {!["diario","financas","aniversarios","compras","habitos","entretenimento"].includes(tabId) && <div className="subtabs" role="tablist" aria-label={`Guias de ${tab.label}`}>
          {tab.subs.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === subId}
              className={"subtab" + (s.id === subId ? " on" : "")}
              onClick={() => { setSubs({ ...subs, [tabId]: s.id }); setSelected(null); }}
            >
              {s.label}
            </button>
          ))}
        </div>}

        {tabId === "tarefas" ? (
          tasks && projects ? (
            <TasksView tasks={tasks} setTasks={setTasks} projects={projects} context={context} sub={subId} onOpenProject={openProject} />
          ) : (
            <p className="empty">Carregando…</p>
          )
        ) : tabId === "projetos" ? (
          tasks && projects ? (
            <ProjectsView tasks={tasks} setTasks={setTasks} projects={projects} setProjects={setProjects} context={context} sub={subId} selected={selected} onSelect={setSelected} />
          ) : (
            <p className="empty">Carregando…</p>
          )
        ) : tabId === "diario" ? (
          <DiaryView entries={remote.diary || []} setEntries={remote.setDiary} configured={remote.diaryConfigured} openRequest={diaryOpen} onOpenHandled={()=>setDiaryOpen(null)}/>
        ) : tabId === "entretenimento" ? (
          <EntertainmentView sections={remote.mediaSections||[]} items={remote.media||[]} setEntertainment={remote.setEntertainment} configured={remote.mediaConfigured}/>
        ) : tabId === "recados" ? (
          <RecadosView todayRequest={recadoTodayRequest} user={remote.user} onReadComplete={remote.noteRead} inboxRequest={recadoInbox} onInboxHandled={()=>setRecadoInbox(null)} onInboxSent={deleteInbox}/>
        ) : tabId === "habitos" ? (
          <HabitsView habits={remote.habits||[]} logs={remote.habitLogs||[]} setHabits={remote.setHabits} context="personal" configured={remote.habitsConfigured}/>
        ) : tabId === "compras" ? (
          <ShoppingView lists={remote.shopping || []} setLists={remote.setShopping} selected={shoppingSelected} onSelect={setShoppingSelected} context={context} configured={remote.shoppingConfigured} creating={shoppingCreating} onCreate={()=>setShoppingCreating(true)} onCreated={()=>setShoppingCreating(false)}/>
        ) : tabId === "aniversarios" ? (
          <BirthdaysView contacts={remote.contacts || []} setContacts={remote.setContacts} configured={remote.contactsConfigured} openContact={contactOpen} onOpenHandled={()=>setContactOpen(null)}/>
        ) : tabId === "financas" ? (
          <FinanceView categories={remote.categories} transactions={remote.transactions} setFinance={remote.setFinance} configured={remote.financeConfigured}/>
        ) : (
          <Placeholder tab={tab} sub={sub} />
        )}
      </main>
    </div>
    <BackNotice/>
    <ModalLayer open={!!shoppingInbox} onClose={()=>setShoppingInbox(null)}>{shoppingInbox&&<div className="overlay overlay-context"><div className="panel finance-modal" role="dialog" aria-modal="true" aria-label="Contexto da lista de compras"><h2>Contexto da lista</h2><p className="muted">Escolha onde criar a lista ou acrescentar os itens à lista de mesmo nome.</p><label>Contexto<select className="search" value={shoppingContext} onChange={e=>setShoppingContext(e.target.value)}><option value="personal">Pessoal</option><option value="work">Trabalho</option></select></label><div className="finance-period"><button className="primary" onClick={()=>moveShoppingInbox(shoppingInbox,shoppingContext)}>Mover para lista</button><button className="ghost" onClick={()=>setShoppingInbox(null)}>Cancelar</button></div></div></div>}</ModalLayer>
    <ModalLayer open={!!newTask&&!!projects} onClose={()=>setNewTaskId(null)}>{newTask && projects && <TaskDetail key={newTask.id} task={newTask} projects={projects} update={updateNewTask} onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))} onClose={() => setNewTaskId(null)} />}</ModalLayer>
    </div>
  );
}
