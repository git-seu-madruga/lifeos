"use client";

import { patchTask } from "../lib/tasks";

import { readState, saveState } from "../lib/storage";
import { useEffect, useState } from "react";
import { NAV, INBOX_TARGETS } from "../lib/nav";
import { useNotionState } from "../lib/useNotionState";
import Login from "../components/Login";
import Inbox from "../components/Inbox";
import TaskDetail from "../components/TaskDetail";
import TasksView from "../components/TasksView";
import ProjectsView from "../components/ProjectsView";
import Placeholder from "../components/Placeholder";

const CONTEXTS = [
  { id: "all", label: "Todos" },
  { id: "work", label: "Trabalho" },
  { id: "personal", label: "Pessoal" },
];

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Home() {
  const [context, setContext] = useState("all");
  const [tabId, setTabId] = useState("tarefas");
  const [subs, setSubs] = useState({});
  const [selected, setSelected] = useState(null);
  const remote = useNotionState();
  const { tasks, projects, inbox, setInbox, setTasks, setProjects, ready, saving, refreshedAt } = remote;
  const [legacyInbox, setLegacyInbox] = useState([]);
  const [newTaskId, setNewTaskId] = useState(null);


  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await readState('notion-inbox');
      const legacy = saved ? null : await readState();
      const imported = await readState('notion-inbox-imported');
      if (active) { setLegacyInbox((saved?.inbox || legacy?.inbox || []).filter(item => !imported?.ids?.includes(item.id))); }
    })().catch(() => {  });
    return () => { active=false; };
  }, []);
  const unimportedInbox = legacyInbox.filter(item => !inbox?.some(remoteItem => remoteItem.id === item.id || remoteItem.legacyId === item.id));
  async function importInbox() {
    if (!window.confirm(`Importar ${unimportedInbox.length} entrada(s) do navegador para o Notion?`)) return;
    setInbox(previous => [...unimportedInbox.map(item => ({...item, createdAt:item.createdAt || Date.now()})), ...previous]);
    try {
      await remote.flush();
      const imported = await readState('notion-inbox-imported');
      await saveState({ids:[...new Set([...(imported?.ids || []), ...unimportedInbox.map(item => item.id)])]}, 'notion-inbox-imported');
      setLegacyInbox([]);
    } catch {}
  }

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
  function convertInbox(item, kind) {
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

  async function refresh() {
    try { await remote.refresh(); setSelected(null); setNewTaskId(null); }
    catch {
      if (window.confirm("Não foi possível salvar antes de atualizar. Descartar as alterações locais pendentes e carregar a versão atual do Notion?")) {
        try { await remote.refresh(true); setSelected(null); setNewTaskId(null); } catch {}
      }
    }
  }

  if(remote.authenticated === null) return <p className="empty">Carregando LifeOS…</p>;
  if(!remote.authenticated) return <Login onLogin={remote.login} configured={remote.configured} initialError={remote.error} />;
  if(!ready) return <main className="login-shell"><div className="login-card"><h1>LifeOS</h1><p>{remote.loading ? "Conectando ao Notion…" : "Não foi possível carregar os bancos."}</p>{remote.error && <p className="date-error" role="alert">{remote.error}</p>}<button className="primary" onClick={remote.load} disabled={remote.loading}>Tentar novamente</button><button className="ghost" onClick={()=>remote.logout().catch(()=>{})}>Sair</button></div></main>;

  if(remote.loading) return <p className="empty">Atualizando dados do Notion…</p>;

  const time = refreshedAt
    ? refreshedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="shell">
      {ready && inbox && <Inbox items={inbox} tabId={tabId} onAdd={addInbox} onUpdate={updateInbox} onDelete={deleteInbox} onConvert={convertInbox} />}
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" fill="var(--blue)" />
          </svg>
          <span>LifeOS</span>
        </div>

        <div className="segmented" role="group" aria-label="Contexto">
          {CONTEXTS.map((c) => (
            <button
              key={c.id}
              className={context === c.id ? "on" : ""}
              aria-pressed={context === c.id}
              onClick={() => setContext(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="topbar-right">
          <button className={"icon-btn" + (remote.loading ? " spin" : "")} onClick={refresh} disabled={remote.loading || (saving && !remote.error)} aria-label="Atualizar dados">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
          <span className="refreshed">{time && `Atualizado às ${time}`}</span>
          <button className="signout" onClick={() => remote.logout().catch(() => {})}>Sair</button>
        </div>
      </header>

      <nav className="tabs" aria-label="Seções">
        {NAV.map((t) => (
          <span key={t.id} className="tab-wrap">
            {t.sep && <span className="tab-sep" aria-hidden="true" />}
            <button
              className={"tab" + (t.id === tabId ? " on" : "")}
              aria-current={t.id === tabId ? "page" : undefined}
              onClick={() => { setTabId(t.id); setSelected(null); }}
            >
              {t.label}
            </button>
          </span>
        ))}
      </nav>

      <main className="content">
        {remote.error && <p className="date-error" role="alert">{remote.error}</p>}
        {remote.error && <button className="ghost" onClick={() => remote.flush().catch(() => {})}>Tentar salvar novamente</button>}
        {ready && <p className="muted small" role="status">{saving ? "Salvando no Notion…" : remote.error || remote.pending ? "Alterações pendentes" : "Salvo no Notion"}</p>}
        {unimportedInbox.length > 0 && <button className="ghost" onClick={importInbox}>Importar Inbox deste navegador ({unimportedInbox.length})</button>}
        <div className="subtabs" role="tablist" aria-label={`Guias de ${tab.label}`}>
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
        </div>

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
        ) : (
          <Placeholder tab={tab} sub={sub} />
        )}
      </main>
    </div>
    {newTask && projects && <TaskDetail task={newTask} projects={projects} update={updateNewTask} onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))} onClose={() => setNewTaskId(null)} />}
    </div>
  );
}
