"use client";

import { PROJECTS } from "../lib/mockData";
import { addDaysISO, dueLabel } from "../lib/dates";

const SUB_STATUS = { ativos: "active", pausados: "paused", concluidos: "done" };
const STATUS_LABEL = { todo: "Não iniciada", doing: "Em andamento", hold: "On hold", done: "Concluída" };
const ORDER = { doing: 0, hold: 1, todo: 2, done: 3 };

function statsOf(tasks, name) {
  const ts = tasks.filter((t) => t.project === name);
  const done = ts.filter((t) => t.status === "done").length;
  return { ts, done, total: ts.length, pct: ts.length ? Math.round((done / ts.length) * 100) : 0 };
}

function Progress({ pct }) {
  return <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>;
}

export default function ProjectsView({ tasks, sub, selected, onSelect }) {
  const project = PROJECTS.find((p) => p.name === selected);

  if (project) {
    const s = statsOf(tasks, project.name);
    const due = project.dueIn === null ? null : dueLabel(addDaysISO(project.dueIn));
    const list = [...s.ts].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
    return (
      <section>
        <button className="ghost" onClick={() => onSelect(null)}>← Projetos</button>
        <h1 className="section-title pd-title">{project.name}</h1>
        <p className="section-date">
          {project.area}{due && <> · Prazo: <span className={`due-${due.tone}`}>{due.text}</span></>}
        </p>
        <p>{project.description}</p>
        <div className="pd-progress"><Progress pct={s.pct} /><span className="muted small">{s.done} de {s.total} tarefas concluídas ({s.pct}%)</span></div>

        <h2 className="group-head pd-h">Tarefas deste projeto</h2>
        {list.length === 0 && <p className="empty">Nenhuma tarefa vinculada a este projeto.</p>}
        <ul className="rows">
          {list.map((t) => (
            <li key={t.id} className={"row" + (t.status === "done" ? " done" : "")}>
              <span className="row-title">{t.title}</span>
              <span className="row-meta"><span className="chip">{STATUS_LABEL[t.status]}</span></span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const shown = PROJECTS.filter((p) => p.status === SUB_STATUS[sub]);
  return (
    <section>
      <h1 className="section-title">Projetos</h1>
      <p className="section-date">{shown.length} {shown.length === 1 ? "projeto" : "projetos"}</p>
      {shown.length === 0 && <p className="empty">Nenhum projeto nesta guia.</p>}
      <div className="pcards">
        {shown.map((p) => {
          const s = statsOf(tasks, p.name);
          const due = p.dueIn === null ? null : dueLabel(addDaysISO(p.dueIn));
          return (
            <button key={p.name} className="pcard" onClick={() => onSelect(p.name)}>
              <span className="pcard-name">{p.name}</span>
              <span className="muted small">{p.area}{due && ` · ${due.text}`}</span>
              <Progress pct={s.pct} />
              <span className="muted small">{s.done}/{s.total} tarefas</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
