"use client";

import { useMemo, useState } from "react";
import { diffDays, dueLabel, longToday } from "../lib/dates";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABEL = { high: "Alta", medium: "Média", low: "Baixa" };
const CONTEXT_LABEL = { work: "Trabalho", personal: "Pessoal" };

const WHEN = [
  { key: "overdue", label: "Atrasadas", tone: "late" },
  { key: "today", label: "Hoje", tone: "today" },
  { key: "week", label: "Esta semana", tone: "plain" },
  { key: "later", label: "Depois", tone: "muted" },
  { key: "nodate", label: "Sem data", tone: "muted" },
];

function whenKey(t) {
  if (!t.due) return "nodate";
  const n = diffDays(t.due);
  if (n < 0) return "overdue";
  if (n === 0) return "today";
  if (n <= 7) return "week";
  return "later";
}

function groupOf(t, mode) {
  if (mode === "when") {
    const k = whenKey(t);
    const i = WHEN.findIndex((w) => w.key === k);
    return { key: k, label: WHEN[i].label, tone: WHEN[i].tone, order: i };
  }
  if (mode === "project") {
    return { key: "p:" + (t.project || ""), label: t.project || "Sem projeto", tone: "plain", order: t.project ? 0 : 1 };
  }
  if (mode === "priority") {
    return { key: t.priority, label: `Prioridade ${PRIORITY_LABEL[t.priority].toLowerCase()}`, tone: "plain", order: PRIORITY_ORDER[t.priority] };
  }
  return { key: "all", label: "Todas as tarefas", tone: "plain", order: 0 };
}

const dueKey = (t) => t.due || "9999-99-99";
const SORTERS = {
  due: (a, b) => dueKey(a).localeCompare(dueKey(b)) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  priority: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || dueKey(a).localeCompare(dueKey(b)),
  title: (a, b) => a.title.localeCompare(b.title, "pt-BR"),
};

export default function TasksView({ tasks, setTasks, context, sub }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("due");
  const [group, setGroup] = useState("when");
  const [quick, setQuick] = useState(null); // null | "today" | "overdue" | "starred"
  const [showRoutines, setShowRoutines] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  const scoped = useMemo(
    () => tasks.filter((t) => context === "all" || t.context === context),
    [tasks, context]
  );

  const stats = useMemo(() => {
    const open = scoped.filter((t) => !t.done);
    return {
      open: open.length,
      today: open.filter((t) => t.due && diffDays(t.due) === 0).length,
      overdue: open.filter((t) => t.due && diffDays(t.due) < 0).length,
      starred: open.filter((t) => t.starred).length,
    };
  }, [scoped]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = scoped.filter((t) => {
      if (sub === "concluidas") return t.done;
      if (sub === "rotinas") return t.routine && (!t.done || showDone);
      if (t.done && !showDone) return false;
      if (t.routine && !showRoutines && !(t.due && diffDays(t.due) <= 0)) return false;
      return true;
    });

    if (sub !== "concluidas") {
      if (quick === "today") list = list.filter((t) => t.due && diffDays(t.due) === 0);
      if (quick === "overdue") list = list.filter((t) => t.due && diffDays(t.due) < 0);
      if (quick === "starred") list = list.filter((t) => t.starred);
    }
    if (q) {
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.project || "").toLowerCase().includes(q));
    }

    list = [...list].sort(SORTERS[sort]);

    const map = new Map();
    for (const t of list) {
      const g = groupOf(t, group);
      if (!map.has(g.key)) map.set(g.key, { ...g, items: [] });
      map.get(g.key).items.push(t);
    }
    return [...map.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "pt-BR"));
  }, [scoped, sub, quick, query, sort, group, showRoutines, showDone]);

  function toggle(id, field) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: !t[field] } : t)));
  }

  function pickQuick(key) {
    setQuick((cur) => (cur === key ? null : key));
  }

  const cards = [
    { key: null, label: "Abertas", value: stats.open, tone: "plain" },
    { key: "today", label: "Hoje", value: stats.today, tone: "today" },
    { key: "overdue", label: "Atrasadas", value: stats.overdue, tone: "late" },
    { key: "starred", label: "Favoritas", value: stats.starred, tone: "blue" },
  ];

  return (
    <section>
      <h1 className="section-title">Tarefas</h1>
      <p className="section-date"><span className="dot-blue" />{longToday()}</p>

      <div className="cards">
        {cards.map((c) => (
          <button
            key={c.label}
            className={`card card-${c.tone}` + (quick === c.key ? " on" : "")}
            aria-pressed={quick === c.key}
            onClick={() => (c.key === null ? setQuick(null) : pickQuick(c.key))}
          >
            <span className="card-value">{c.value}</span>
            <span className="card-label">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="controls">
        <input
          className="search"
          type="search"
          placeholder="Buscar tarefas ou projetos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar tarefas ou projetos"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar por">
          <option value="due">Ordenar: vencimento</option>
          <option value="priority">Ordenar: prioridade</option>
          <option value="title">Ordenar: nome</option>
        </select>
        <select value={group} onChange={(e) => { setGroup(e.target.value); setCollapsed({}); }} aria-label="Agrupar por">
          <option value="when">Agrupar: quando vence</option>
          <option value="project">Agrupar: projeto</option>
          <option value="priority">Agrupar: prioridade</option>
          <option value="none">Sem agrupamento</option>
        </select>
      </div>

      <div className="toggles">
        <label className="toggle">
          <input type="checkbox" checked={quick === "today"} onChange={() => pickQuick("today")} />
          Só tarefas de hoje
        </label>
        <label className="toggle">
          <input type="checkbox" checked={showRoutines} onChange={(e) => setShowRoutines(e.target.checked)} />
          Mostrar rotinas ainda não vencidas
        </label>
        <label className="toggle">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Mostrar concluídas
        </label>
        <button className="ghost" onClick={() => setCollapsed({})}>Expandir tudo</button>
        <button
          className="ghost"
          onClick={() => setCollapsed(Object.fromEntries(groups.map((g) => [g.key, true])))}
        >
          Recolher tudo
        </button>
      </div>

      {groups.length === 0 && (
        <p className="empty">Nenhuma tarefa com esses filtros. Limpe a busca ou troque o filtro.</p>
      )}

      {groups.map((g) => {
        const isCollapsed = Boolean(collapsed[g.key]);
        return (
          <div key={g.key} className={`group group-${g.tone}`}>
            <button
              className="group-head"
              aria-expanded={!isCollapsed}
              onClick={() => setCollapsed({ ...collapsed, [g.key]: !isCollapsed })}
            >
              <span className={"chev" + (isCollapsed ? "" : " open")} aria-hidden="true">›</span>
              <span className="group-label">{g.label}</span>
              <span className="group-count">{g.items.length}</span>
            </button>

            {!isCollapsed && (
              <ul className="rows">
                {g.items.map((t) => {
                  const due = dueLabel(t.due);
                  const isToday = t.due && diffDays(t.due) === 0;
                  return (
                    <li key={t.id} className={"row" + (t.done ? " done" : "")}>
                      <input
                        type="checkbox"
                        className="check"
                        checked={t.done}
                        onChange={() => toggle(t.id, "done")}
                        aria-label={`Concluir: ${t.title}`}
                      />
                      <span className={"dot" + (isToday ? " dot-on" : "")} aria-hidden="true" />
                      <span className="row-title">
                        {t.title}
                        {t.project && <span className="row-project">{t.project}</span>}
                      </span>
                      <span className="row-meta">
                        {t.routine && <span className="routine">Rotina</span>}
                        <span className={`prio prio-${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
                        <span className={`due due-${due.tone}`}>{due.text}</span>
                        <span className="chip">{CONTEXT_LABEL[t.context]}</span>
                        <button
                          className={"star" + (t.starred ? " on" : "")}
                          onClick={() => toggle(t.id, "starred")}
                          aria-pressed={t.starred}
                          aria-label={t.starred ? "Remover dos favoritos" : "Favoritar"}
                        >
                          {t.starred ? "★" : "☆"}
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
