"use client";

import { useState } from "react";

let seq = 0;
const uid = () => `m${Date.now().toString(36)}${seq++}`;

// Marcos deste projeto. A ordem da lista é a sequência oficial usada na lista, no quadro e no cronograma.
export default function MilestoneManager({ milestones, tasks, onChange, onDelete }) {
  const [title, setTitle] = useState("");
  const [dragFrom, setDragFrom] = useState(null);
  const [over, setOver] = useState(null);

  const set = (id, patch) => onChange(milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  function move(from, to) {
    if (to < 0 || to >= milestones.length || from === to) return;
    const list = [...milestones];
    const [x] = list.splice(from, 1);
    list.splice(to, 0, x);
    onChange(list);
  }

  function add() {
    if (!title.trim()) return;
    onChange([...milestones, { id: uid(), title: title.trim(), due: null, done: false }]);
    setTitle("");
  }

  function remove(m) {
    const n = tasks.filter((t) => t.milestone === m.id).length;
    if (n > 0 && !window.confirm(`“${m.title}” tem ${n} tarefa(s). Elas ficarão sem marco. Remover?`)) return;
    onDelete(m.id);
  }

  const sortByDate = () => onChange([...milestones].sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999")));

  // Avisa quando a data é anterior à do marco que vem antes na sequência.
  const outOfOrder = (i) => {
    const m = milestones[i];
    if (!m.due) return false;
    for (let j = i - 1; j >= 0; j--) if (milestones[j].due) return milestones[j].due > m.due;
    return false;
  };

  return (
    <div className="mgr">
      <div className="head-row">
        <div>
          <h2 className="group-head pd-h mgr-h">Marcos do projeto</h2>
          <p className="muted small mgr-hint">A ordem abaixo é a sequência do projeto e vale em todas as telas dele. Arraste pela alça ⠿ ou use as setas.</p>
        </div>
        {milestones.length > 1 && <button className="ghost" onClick={sortByDate}>Ordenar por data</button>}
      </div>

      {milestones.length === 0 && <p className="empty">Este projeto ainda não tem marcos. Comece definindo as grandes etapas, na ordem em que vão acontecer.</p>}

      <ol className="mgr-list">
        {milestones.map((m, i) => {
          const n = tasks.filter((t) => t.milestone === m.id).length;
          return (
            <li
              key={m.id}
              className={"mgr-row" + (over === i && dragFrom !== null ? " over" : "")}
              onDragOver={(e) => { if (dragFrom !== null) { e.preventDefault(); setOver(i); } }}
              onDrop={(e) => { e.preventDefault(); if (dragFrom !== null) move(dragFrom, i); setDragFrom(null); setOver(null); }}
            >
              <span
                className="handle"
                draggable
                onDragStart={(e) => { e.dataTransfer.setData("text/plain", m.id); setDragFrom(i); }}
                onDragEnd={() => { setDragFrom(null); setOver(null); }}
                aria-hidden="true"
              >⠿</span>
              <span className="num">{i + 1}</span>
              <input type="checkbox" className="check" checked={m.done} onChange={() => set(m.id, { done: !m.done })} aria-label={`Marco atingido: ${m.title}`} />
              <input className="ms-title" value={m.title} onChange={(e) => set(m.id, { title: e.target.value })} aria-label="Nome do marco" />
              <input className="search ms-date" type="date" value={m.due || ""} onChange={(e) => set(m.id, { due: e.target.value || null })} aria-label="Prazo do marco" />
              <span className="muted small mgr-count">{n} {n === 1 ? "tarefa" : "tarefas"}</span>
              <button className="mv" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Subir marco">▲</button>
              <button className="mv" onClick={() => move(i, i + 1)} disabled={i === milestones.length - 1} aria-label="Descer marco">▼</button>
              <button className="star" onClick={() => remove(m)} aria-label={`Remover ${m.title}`}>×</button>
              {outOfOrder(i) && <span className="warn small">A data é anterior à do marco anterior na sequência.</span>}
            </li>
          );
        })}
      </ol>

      <div className="addrow">
        <input className="search" value={title} placeholder="Novo marco…" onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} aria-label="Novo marco" />
        <button className="ghost" onClick={add}>+ Marco</button>
      </div>
    </div>
  );
}
