"use client";

import SettingsPanel from "../components/SettingsPanel";
import { SettingsContext } from "../components/SettingsContext";
import { DEFAULT_SETTINGS, loadSettings, statusBehavior } from "../lib/settings";
import { patchTask } from "../lib/tasks";

import { readState, saveState } from "../lib/storage";
import { useEffect, useRef, useState } from "react";
import { NAV, INBOX_TARGETS } from "../lib/nav";
import { makeTasks, makeProjects, INBOX_SEED } from "../lib/mockData";
import Inbox from "../components/Inbox";
import TaskDetail from "../components/TaskDetail";
import TasksView from "../components/TasksView";
import ProjectsView from "../components/ProjectsView";
import Placeholder from "../components/Placeholder";

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Home() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [context, setContext] = useState("all");
  const [tabId, setTabId] = useState("tarefas");
  const [subs, setSubs] = useState({});
  const [selected, setSelected] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [projects, setProjects] = useState(null);
  const [inbox, setInbox] = useState(INBOX_SEED);
  const [newTaskId, setNewTaskId] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const saveQueue = useRef(Promise.resolve());

  // Os dados só nascem no navegador para evitar diferença de fuso horário entre servidor e cliente.
  useEffect(() => {
    let alive = true;
    readState().then(saved => {
      if (!alive) return;
      setTasks(saved?.tasks || makeTasks());
      setProjects(saved?.projects || makeProjects());
      setInbox(saved?.inbox || INBOX_SEED);
      setSettings(loadSettings(saved?.settings, saved?.tasks || makeTasks(), saved?.projects || makeProjects()));
      setRefreshedAt(new Date());
      setReady(true);
    }).catch(() => {
      if (alive) setSaveError("Não foi possível abrir os dados salvos. Recarregue a página para tentar novamente.");
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSaving(true);
    saveQueue.current = saveQueue.current.catch(() => {}).then(() => saveState({ tasks, projects, inbox, settings }));
    const pending = saveQueue.current;
    pending.then(() => {
      if (saveQueue.current === pending) { setSaving(false); setSaveError(""); }
    }).catch(() => {
      if (saveQueue.current === pending) { setSaving(false); setSaveError("Não foi possível salvar. Verifique o espaço disponível e as permissões do navegador antes de fechar a página."); }
    });
  }, [ready, tasks, projects, inbox, settings]);

  useEffect(() => {
    if (!saving && !saveError) return;
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saving, saveError]);

  const navigation = NAV.map(tab => tab.id === "projetos" ? { ...tab, subs: settings.projectStatuses.map(option => ({ id: option.id, label: option.label })) } : tab);
  const tab = navigation.find((t) => t.id === tabId);
  const subId = subs[tabId] || tab.subs[0].id;
  const sub = tab.subs.find((s) => s.id === subId);

  function openProject(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setSubs((s) => ({ ...s, projetos: p.status }));
    setSelected(id);
    setTabId("projetos");
  }

  const newTask = tasks && tasks.find((t) => t.id === newTaskId);
  const updateNewTask = (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? patchTask(t, patch, settings.taskStatuses) : t)));

  const addInbox = (text) => setInbox((prev) => [{ id: uid("i"), text }, ...prev]);
  const updateInbox = (id, text) => setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  const deleteInbox = (id) => setInbox((prev) => prev.filter((i) => i.id !== id));

  // Cria o item na seção atual e tira a entrada do inbox.
  function convertInbox(item, kind) {
    const [first, ...rest] = item.text.trim().split("\n");
    const notes = rest.join("\n").trim();
    const ctx = context === "all" ? settings.contexts[0].id : context;
    const newId = uid(kind === "task" ? "t" : "pr");
    if (kind === "task") {
      setTasks((prev) => [...prev, {
        id: newId, title: first, status: "todo", due: null, start: null,
        priority: "medium", context: ctx, project: null, milestone: null, links: [], notes,
        followUp: null, waitingOn: "",
      }]);
      setNewTaskId(newId); // abre o detalhe para completar os campos
    } else if (kind === "project") {
      const status = settings.projectStatuses.some(option => option.id === subId) ? subId : settings.projectStatuses[0].id;
      setProjects((prev) => [...prev, { id: newId, name: first, status, area: "", context: ctx, due: null, description: notes, milestones: [] }]);
      setSelected(newId); // abre o projeto para completar os campos
    } else {
      return;
    }
    deleteInbox(item.id);
  }

  function refresh() {
    setSpinning(true);
    setTimeout(() => {
      // Atualizar a interface não apaga os dados locais.
      setRefreshedAt(new Date());
      setSpinning(false);
    }, 600);
  }

  function updateSettings(key, options) {
    if (key === "areas") {
      const renamed = new Map(settings.areas.map(old => [old.label, options.find(option => option.id === old.id)?.label || old.label]));
      setProjects(prev => prev.map(project => ({ ...project, area: renamed.get(project.area) || project.area })));
    }
    if (key === "taskStatuses") {
      setTasks(prev => prev.map(task => {
        const wasDone = statusBehavior(settings.taskStatuses, task.status) === "done";
        const isDone = statusBehavior(options, task.status) === "done";
        return wasDone === isDone ? task : { ...task, completedAt: isDone ? Date.now() : null };
      }));
    }
    setSettings(prev => ({ ...prev, [key]: options }));
  }

  const time = refreshedAt
    ? refreshedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <SettingsContext.Provider value={settings}>
    <div className="shell">
      {ready && <Inbox items={inbox} tabId={tabId} onAdd={addInbox} onUpdate={updateInbox} onDelete={deleteInbox} onConvert={convertInbox} />}
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" fill="var(--blue)" />
          </svg>
          <span>LifeOS</span>
        </div>

        <div className="segmented" role="group" aria-label="Contexto">
          {[{ id: "all", label: "Todos" }, ...settings.contexts].map((c) => (
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
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} disabled={!ready} aria-label="Configurações" title={`Configurações de ${tab.label}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 3h6l.7 3 2.6 1.5 3-.8 3 5.2-2.3 2.1v3l2.3 2.1-3 5.2-3-.8-2.6 1.5-.7 3H9l-.7-3-2.6-1.5-3 .8-3-5.2L2 17.1v-3L-.3 12l3-5.2 3 .8L8.3 6Z" transform="translate(2 0) scale(.8)"/><circle cx="12" cy="12" r="3" /></svg>
          </button>
          <span className="refreshed">{time && `Atualizado às ${time}`}</span>
          <a className="signout" href="#">Sair</a>
        </div>
      </header>

      <nav className="tabs" aria-label="Seções">
        {navigation.map((t) => (
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
        {saveError && <p className="date-error" role="alert">{saveError}</p>}
        {ready && <p className="muted small" role="status">{saving ? "Salvando…" : saveError ? "Alterações não salvas" : "Salvo neste navegador"}</p>}
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
    {settingsOpen && <SettingsPanel tab={tab} settings={settings} onChange={updateSettings} onClose={() => setSettingsOpen(false)} />}
    </div>
    </SettingsContext.Provider>
  );
}
