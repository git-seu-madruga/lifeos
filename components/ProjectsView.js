"use client";
import ProjectAttachments from "./ProjectAttachments";
import DateInput from "./DateInput";

import { patchTask, newestCompleted } from "../lib/tasks";

import { useState } from "react";
import { formatDateInput } from "../lib/dateInput";
import { dueLabel } from "../lib/dates";
import TaskDetail from "./TaskDetail";
import MilestoneManager from "./MilestoneManager";
import ProjectBoard from "./ProjectBoard";
import ProjectGantt from "./ProjectGantt";

const SUB_STATUS = { ativos: "active", pausados: "paused", concluidos: "done", cancelados: "cancelled" };
const P_STATUS = [["active", "Ativo"], ["paused", "Pausado"], ["done", "Concluído"], ["cancelled", "Cancelado"]];
const STATUS_LABEL = { todo: "Não iniciada", doing: "Em andamento", hold: "On hold", done: "Concluída" };
const CTX = { work: "Trabalho", personal: "Pessoal" };
const ORDER = { doing: 0, hold: 1, todo: 2, done: 3 };

let seq = 0;
const uid = (p) => `${p}${Date.now().toString(36)}${seq++}`;

// Progresso das tarefas do projeto.
function progress(all) {
  const ts = all;
  const done = ts.filter((t) => t.status === "done").length;
  return { done, total: ts.length, pct: ts.length ? Math.round((done / ts.length) * 100) : 0 };
}

function Bar({ pct }) {
  return <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>;
}

export default function ProjectsView({ tasks, setTasks, projects, setProjects, context, sub, selected, onSelect }) {
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState("lista");
  const [nt, setNt] = useState({ title: "", ms: "", ctx: null });

  const [projectError, setProjectError] = useState("");

  const project = projects.find((p) => p.id === selected && (context === "all" || p.context === context));
  function updateProject(id, patch) {
    const current = projects.find(p => p.id === id);
    const next = { ...current, ...patch };
    if (next.due && next.milestones.some(m => m.due && m.due > next.due)) {
      setProjectError("Um marco ultrapassa o prazo final do projeto. Ajuste o marco antes de antecipar o prazo final.");
      return;
    }
    setProjectError("");
    setProjects(prev => prev.map(p => p.id === id ? next : p));
  }
  function deleteProject() {
    const count = tasks.filter(t => t.project === project.id).length;
    if (!window.confirm(`Excluir “${project.name}” e seus anexos? Não dá para desfazer. ${count} tarefa(s) serão mantidas sem projeto e sem marco.`)) return;
    setProjects(prev => prev.filter(p => p.id !== project.id));
    setTasks(prev => prev.map(t => t.project === project.id ? { ...t, project: null, milestone: null } : t));
    setProjectError("");
    onSelect(null);
  }
  const updateTask = (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? patchTask(t, patch) : t)));

  function addProject() {
    const id = uid("pr");
    setProjects((prev) => [...prev, { id, name: "Novo projeto", status: SUB_STATUS[sub] || "active", area: "", context: context === "all" ? "work" : context, due: null, description: "", milestones: [] }]);
    onSelect(id);
  }

  function setProjectContext(v) {
    updateProject(project.id, { context: v });
    setTasks((prev) => prev.map((t) => (t.project === project.id ? { ...t, context: v } : t)));
  }

  // ---------- Lista de projetos ----------
  if (!project) {
    const shown = projects.filter((p) => p.status === SUB_STATUS[sub] && (context === "all" || p.context === context));
    return (
      <section>
        <div className="head-row">
          <div>
            <h1 className="section-title">Projetos</h1>
            <p className="section-date">{shown.length} {shown.length === 1 ? "projeto" : "projetos"}</p>
          </div>
          <button className="ghost" onClick={addProject}>+ Novo projeto</button>
        </div>
        {shown.length === 0 && <p className="empty">Nenhum projeto nesta guia.</p>}
        <div className="pcards">
          {shown.map((p) => {
            const s = progress(tasks.filter((t) => t.project === p.id));
            const due = p.due ? dueLabel(p.due) : null;
            const msDone = p.milestones.filter((m) => m.done).length;
            return (
              <button key={p.id} className="pcard" onClick={() => onSelect(p.id)}>
                <span className="pcard-name">{p.name}</span>
                {context === "all" && <span className="chip">{CTX[p.context]}</span>}
                <span className="muted small">{p.area || "Sem área"}{due && ` · ${due.text}`}</span>
                <Bar pct={s.pct} />
                <span className="muted small">{s.done}/{s.total} tarefas · {msDone}/{p.milestones.length} marcos</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  // ---------- Detalhe editável ----------
  const pts = tasks.filter((t) => t.project === project.id);
  const all = progress(pts);
  const ms = project.milestones; // a ordem é a sequência definida em "Marcos do projeto"
  const current = ms.find((m) => !m.done);
  const msDone = ms.filter((m) => m.done).length;
  const msPct = ms.length ? Math.round((msDone / ms.length) * 100) : 0;
  const next = current?.due ? formatDateInput(current.due) : null;

  const setMs = (mid, patch) => updateProject(project.id, { milestones: project.milestones.map((m) => (m.id === mid ? { ...m, ...patch } : m)) });
  function delMs(mid) {
    updateProject(project.id, { milestones: project.milestones.filter((m) => m.id !== mid) });
    setTasks((prev) => prev.map((t) => (t.milestone === mid ? { ...t, milestone: null } : t)));
  }
  function addTask() {
    if (!nt.title.trim()) return;
    setTasks((prev) => [...prev, {
      id: uid("t"), title: nt.title.trim(), status: "todo", due: null, priority: "medium", context: project.context,
      project: project.id, milestone: nt.ms || null, attachments: [], notes: "", followUp: null, waitingOn: "",
    }]);
    setNt({ ...nt, title: "" });
  }

  const renderTask = (t) => (
    <li key={t.id} className={"row" + (t.status === "done" ? " done" : "")}>
      <input type="checkbox" className="check" checked={t.status === "done"} aria-label={`Concluir: ${t.title}`}
        onChange={() => updateTask(t.id, t.status === "done" ? { status: "todo" } : { status: "done" })} />
      <button className="row-title" onClick={() => setOpenId(t.id)}>{t.title}</button>
      <span className="row-meta">
        <span className="chip">{STATUS_LABEL[t.status]}</span>
      </span>
    </li>
  );
  const byMs = (mid) => pts.filter((t) => (t.milestone || null) === mid).sort((a, b) => ORDER[a.status] - ORDER[b.status] || (a.status === "done" ? newestCompleted(a, b) : 0));
  const loose = byMs(null);
  const openTask = tasks.find((t) => t.id === openId);

  return (
    <section>
      <button className="ghost" onClick={() => onSelect(null)}>← Projetos</button>

      <input className="panel-title pd-name" value={project.name} onChange={(e) => updateProject(project.id, { name: e.target.value })} aria-label="Nome do projeto" />
      <div className="field-row pd-fields">
        <div className="field"><span className="label">Contexto</span>
          <select value={project.context} onChange={(e) => setProjectContext(e.target.value)}>
            <option value="work">Trabalho</option><option value="personal">Pessoal</option>
          </select>
        </div>
        <div className="field"><span className="label">Status</span>
          <select value={project.status} onChange={(e) => updateProject(project.id, { status: e.target.value })}>
            {P_STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div className="field"><span className="label">Área</span>
          <input className="search" value={project.area} onChange={(e) => updateProject(project.id, { area: e.target.value })} />
        </div>
        <div className="field"><span className="label">Prazo final</span>
          <DateInput className="search" min={project.milestones.map(m => m.due).filter(Boolean).sort().at(-1)} value={project.due || ""} onChange={(e) => updateProject(project.id, { due: e.target.value || null })} />
        </div>
      </div>
      <div className="field"><span className="label">Descrição</span>
        <textarea className="search notes" rows={2} value={project.description} onChange={(e) => updateProject(project.id, { description: e.target.value })} />
      </div>

      {projectError && <p className="date-error" role="alert">{projectError}</p>}

      <div className="overview">
        <div><span className="label">Tarefas</span><Bar pct={all.pct} /><span className="muted small">{all.done}/{all.total} concluídas ({all.pct}%)</span></div>
        <div><span className="label">Marcos</span><Bar pct={msPct} /><span className="muted small">{msDone}/{ms.length} atingidos ({msPct}%)</span></div>
        <div><span className="label">Agora</span>
          <span className="now">{current ? current.title : ms.length ? "Todos os marcos atingidos" : "Sem marcos definidos"}</span>
          {next && <span className="small muted">{next}</span>}
        </div>
      </div>

      <MilestoneManager maxDue={project.due} milestones={project.milestones} tasks={pts} onChange={(list) => updateProject(project.id, { milestones: list })} onDelete={delMs} />

      <h2 className="group-head pd-h">Tarefas por marco</h2>
      <div className="seg-row view-toggle" role="tablist" aria-label="Visualização">
        {[["lista", "Lista"], ["quadro", "Quadro"], ["cronograma", "Cronograma"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={view === k} className={"subtab" + (view === k ? " on" : "")} onClick={() => setView(k)}>{l}</button>
        ))}
      </div>
      {view === "quadro" && <ProjectBoard milestones={ms} tasks={pts} onMove={(id, mid) => updateTask(id, { milestone: mid })} onOpen={setOpenId} />}
      {view === "cronograma" && <ProjectGantt milestones={ms} tasks={pts} project={project} onOpen={setOpenId} />}
      {view === "lista" && (
      <ol className="mslist">
        {ms.map((m) => {
          const mts = byMs(m.id);
          const s = progress(mts);
          return (
            <li key={m.id} className={"ms" + (m.done ? " ms-done" : "") + (current && m.id === current.id ? " ms-now" : "")}>
              <div className="ms-head">
                <input type="checkbox" className="check" checked={m.done} onChange={() => setMs(m.id, { done: !m.done })} aria-label="Marco atingido" />
                <span className="ms-title">{m.title}</span>
                {m.due && <span className="small muted">{formatDateInput(m.due)}</span>}
              </div>
              {current && m.id === current.id && <span className="ms-flag">Você está aqui</span>}
              <div className="ms-prog"><Bar pct={s.pct} /><span className="muted small">{s.total ? `${s.done}/${s.total} tarefas` : "sem tarefas"}</span></div>
              <ul className="rows">{mts.map(renderTask)}</ul>
            </li>
          );
        })}
        {loose.length > 0 && (
          <li className="ms">
            <div className="ms-head"><span className="ms-title muted">Sem marco</span></div>
            <ul className="rows">{loose.map(renderTask)}</ul>
          </li>
        )}
      </ol>
      )}


      <h2 className="group-head pd-h">Nova tarefa neste projeto</h2>
      <div className="addrow">
        <input className="search" value={nt.title} placeholder="Título da tarefa…" onChange={(e) => setNt({ ...nt, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addTask()} aria-label="Título da nova tarefa" />
        <select value={nt.ms} onChange={(e) => setNt({ ...nt, ms: e.target.value })} aria-label="Marco da nova tarefa">
          <option value="">Sem marco</option>
          {ms.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <button className="ghost" onClick={addTask}>+ Tarefa</button>
      </div>

      <ProjectAttachments key={project.id} items={project.attachments || []} onChange={(attachments) => updateProject(project.id, { attachments })} />
      <button className="danger" onClick={deleteProject}>Excluir projeto</button>

      {openTask && <TaskDetail task={openTask} projects={projects} update={updateTask} onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))} onClose={() => setOpenId(null)} />}
    </section>
  );
}
