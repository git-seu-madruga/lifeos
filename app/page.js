"use client";

import { useEffect, useState } from "react";
import { NAV, INBOX_TARGETS } from "../lib/nav";
import { todayISO } from "../lib/dates";
import { makeTasks, makeProjects, INBOX_SEED } from "../lib/mockData";
import Inbox from "../components/Inbox";
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
  const [tasks, setTasks] = useState(null);
  const [projects, setProjects] = useState(null);
  const [inbox, setInbox] = useState(INBOX_SEED);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // Os dados só nascem no navegador para evitar diferença de fuso horário entre servidor e cliente.
  useEffect(() => {
    setTasks(makeTasks());
    setProjects(makeProjects());
    setRefreshedAt(new Date());
  }, []);

  const tab = NAV.find((t) => t.id === tabId);
  const subId = subs[tabId] || tab.subs[0].id;
  const sub = tab.subs.find((s) => s.id === subId);

  const SUB_OF = { active: "ativos", paused: "pausados", done: "concluidos" };
  function openProject(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setSubs((s) => ({ ...s, projetos: SUB_OF[p.status] }));
    setSelected(id);
    setTabId("projetos");
  }

  const addInbox = (text) => setInbox((prev) => [{ id: uid("i"), text }, ...prev]);
  const updateInbox = (id, text) => setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  const deleteInbox = (id) => setInbox((prev) => prev.filter((i) => i.id !== id));

  // Cria o item na seção atual e tira a entrada do inbox.
  function convertInbox(item, kind) {
    const [first, ...rest] = item.text.trim().split("\n");
    const notes = rest.join("\n").trim();
    const ctx = context === "all" ? "work" : context;
    if (kind === "task") {
      setTasks((prev) => [...prev, {
        id: uid("t"), title: first, status: "todo", due: tabId === "hoje" ? todayISO() : null, start: null,
        priority: "medium", context: ctx, project: null, milestone: null, links: [], notes,
        followUp: null, waitingOn: "", outcome: null,
      }]);
    } else if (kind === "project") {
      const status = { ativos: "active", pausados: "paused", concluidos: "done" }[subId] || "active";
      setProjects((prev) => [...prev, { id: uid("pr"), name: first, status, area: "", context: ctx, due: null, description: notes, milestones: [] }]);
    } else {
      return;
    }
    deleteInbox(item.id);
  }

  function refresh() {
    setSpinning(true);
    setTimeout(() => {
      setTasks(makeTasks());
    setProjects(makeProjects());
      setRefreshedAt(new Date());
      setSpinning(false);
    }, 600);
  }

  const time = refreshedAt
    ? refreshedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="shell">
      <Inbox items={inbox} tabId={tabId} onAdd={addInbox} onUpdate={updateInbox} onDelete={deleteInbox} onConvert={convertInbox} />
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
          <button className={"icon-btn" + (spinning ? " spin" : "")} onClick={refresh} aria-label="Atualizar dados">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
          <span className="refreshed">{time && `Atualizado às ${time}`}</span>
          <a className="signout" href="#">Sair</a>
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
    </div>
  );
}
