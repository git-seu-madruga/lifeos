"use client";

import { useMemo, useState } from "react";
import { diffDays, dueLabel, longToday } from "../lib/dates";
import TaskDetail from "./TaskDetail";

const STATUS = [
  { key: "todo", label: "Não iniciadas", tone: "plain" },
  { key: "doing", label: "Em andamento", tone: "blue" },
  { key: "hold", label: "On hold", tone: "today" },
  { key: "done", label: "Concluídas", tone: "muted" },
];
const ORDER = { todo: 0, doing: 1, hold: 2, done: 3, cancelled: 4 };
const isClosed = (t) => t.status === "done" || t.status === "cancelled"; // vão para a seção de registro
const PRIO = { high: 0, medium: 1, low: 2 };
const PRIO_LABEL = { high: "Alta", medium: "Média", low: "Baixa" };
const CTX = { work: "Trabalho", personal: "Pessoal" };

// Em hold a data que importa é a da cobrança; nas demais, o prazo.
const keyDate = (t) => (t.status === "hold" ? t.followUp : t.due) || "9999-99-99";
const SORTERS = {
  due: (a, b) => keyDate(a).localeCompare(keyDate(b)),
  priority: (a, b) => PRIO[a.priority] - PRIO[b.priority] || keyDate(a).localeCompare(keyDate(b)),
  title: (a, b) => a.title.localeCompare(b.title, "pt-BR"),
};

function dateInfo(t) {
  if (t.status === "done") return { text: "Concluída", tone: "muted" };
  if (t.status === "cancelled") return { text: "Cancelada", tone: "muted" };
  if (t.status === "hold") {
    if (!t.followUp) return { text: "Sem cobrança", tone: "muted" };
    const l = dueLabel(t.followUp);
    return { text: `Cobrar · ${l.text}`, tone: l.tone };
  }
  return dueLabel(t.due);
}

export default function TasksView({ tasks, setTasks, projects, context, sub, onOpenProject }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("due");
  const [quick, setQuick] = useState(null);
  const [proj, setProj] = useState("all");
  const [collapsed, setCollapsed] = useState({ done: true });
  const [openId, setOpenId] = useState(null);

  const byProject = sub === "projeto";
  const pn = (id) => projects.find((p) => p.id === id)?.name || "";
  const scoped = useMemo(() => tasks.filter((t) => context === "all" || t.context === context), [tasks, context]);
  const update = (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const visibleProjects = projects.filter((p) => context === "all" || p.context === context);
  const projEff = visibleProjects.some((p) => p.id === proj) ? proj : "all";

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scoped
      .filter((t) => !quick || t.status === quick)
      .filter((t) => projEff === "all" || (t.project || "") === projEff)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || pn(t.project).toLowerCase().includes(q))
      .sort((a, b) => ORDER[a.status] - ORDER[b.status] || SORTERS[sort](a, b));

    const map = new Map();
    for (const t of list) {
      const g = isClosed(t)
        ? { key: "done", label: "Concluídas e canceladas · registro e busca", tone: "muted", order: 999 }
        : byProject
        ? { key: "p:" + (t.project || ""), label: pn(t.project) || "Sem projeto", tone: "plain", order: t.project ? 0 : 1 }
        : { ...STATUS[ORDER[t.status]], order: ORDER[t.status] };
      if (!map.has(g.key)) map.set(g.key, { ...g, items: [] });
      map.get(g.key).items.push(t);
    }
    return [...map.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "pt-BR"));
  }, [scoped, projects, quick, projEff, query, sort, byProject]);

  const count = (k) => scoped.filter((t) => t.status === k).length;
  const current = tasks.find((t) => t.id === openId);

  function pickCard(key) {
    setQuick((cur) => (cur === key ? null : key));
    if (key === "done") setCollapsed((c) => ({ ...c, done: false }));
  }

  return (
    <section>
      <h1 className="section-title">Tarefas</h1>
      <p className="section-date"><span className="dot-blue" />{longToday()}</p>

      <div className="cards">
        {STATUS.filter((s) => s.key !== "done").map((s) => (
          <button key={s.key} className={`card card-${s.tone}` + (quick === s.key ? " on" : "")} aria-pressed={quick === s.key} onClick={() => pickCard(s.key)}>
            <span className="card-value">{count(s.key)}</span>
            <span className="card-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="controls">
        <input className="search" type="search" placeholder="Buscar tarefas ou projetos…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar por">
          <option value="due">Ordenar: data</option>
          <option value="priority">Ordenar: prioridade</option>
          <option value="title">Ordenar: nome</option>
        </select>
        <select value={projEff} onChange={(e) => setProj(e.target.value)} aria-label="Filtrar por projeto">
          <option value="all">Todos os projetos</option>
          {visibleProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="toggles">
        <button className="ghost" onClick={() => setCollapsed({})}>Expandir tudo</button>
        <button className="ghost" onClick={() => setCollapsed(Object.fromEntries(groups.map((g) => [g.key, true])))}>Recolher tudo</button>
      </div>

      {groups.length === 0 && <p className="empty">Nenhuma tarefa com esses filtros.</p>}

      {groups.map((g) => {
        const closed = Boolean(collapsed[g.key]) && !(g.key === "done" && query.trim());
        return (
          <div key={g.key} className={`group group-${g.tone}`}>
            <button className="group-head" aria-expanded={!closed} onClick={() => setCollapsed({ ...collapsed, [g.key]: !closed })}>
              <span className={"chev" + (closed ? "" : " open")} aria-hidden="true">›</span>
              <span className="group-label">{g.label}</span>
              <span className="group-count">{g.items.length}</span>
            </button>
            {!closed && (
              <ul className="rows">
                {g.items.map((t) => {
                  const di = dateInfo(t);
                  return (
                    <li key={t.id} className={"row" + (isClosed(t) ? " done" : "")}>
                      <input type="checkbox" className="check" checked={t.status === "done"} aria-label={`Concluir: ${t.title}`}
                        onChange={() => update(t.id, t.status === "done" ? { status: "todo" } : { status: "done" })} />
                      <button className="row-title" onClick={() => setOpenId(t.id)}>
                        {t.title}
                        {t.status === "hold" && t.waitingOn && <span className="row-project">Aguardando: {t.waitingOn}</span>}
                      </button>
                      <span className="row-meta">
                        {t.links.length > 0 && <span className="muted small">🔗 {t.links.length}</span>}
                        {t.project && <button className="proj" onClick={() => onOpenProject(t.project)} title="Abrir projeto">{pn(t.project)}</button>}
                        <span className={`prio prio-${t.priority}`}>{PRIO_LABEL[t.priority]}</span>
                        <span className={`due due-${di.tone}`}>{di.text}</span>
                        <span className="chip">{CTX[t.context]}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {current && <TaskDetail task={current} projects={projects} update={update} onClose={() => setOpenId(null)} />}
    </section>
  );
}
