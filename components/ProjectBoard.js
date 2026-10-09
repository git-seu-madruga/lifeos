"use client";

import SharedBadge from "./SharedBadge";
import { useState } from "react";
import { formatDateInput } from "../lib/dateInput";

const STATUS_LABEL = { todo: "Não iniciada", doing: "Em andamento", hold: "On hold", done: "Concluída" };

// Colunas = marcos em ordem cronológica. Arraste o cartão para outra coluna (ou use o seletor, que também funciona no celular).
export default function ProjectBoard({ milestones, tasks, onMove, onOpen }) {
  const [over, setOver] = useState(null);
  const cols = [...milestones, { id: "", title: "Sem marco", due: null, done: false }];

  return (
    <div className="board">
      {cols.map((c) => {
        const items = tasks.filter((t) => (t.milestone || "") === c.id);
        const due = c.due ? formatDateInput(c.due) : null;
        return (
          <div
            key={c.id || "none"}
            className={"col" + (over === c.id ? " over" : "") + (c.done ? " col-done" : "")}
            onDragOver={(e) => { e.preventDefault(); setOver(c.id); }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) onMove(id, c.id || null);
            }}
          >
            <div className="col-head"><strong>{c.title}</strong><span className="muted small">{items.length}</span></div>
            {due && <span className="small muted">{due}</span>}
            {items.map((t) => (
              <div key={t.id} className="kcard" onClick={e=>{if(!e.target.closest('button,input,a,select'))onOpen(t.id);}} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}>
                <button className="kcard-title" onClick={() => onOpen(t.id)}>{t.title?.trim()||"Sem título"}</button>
                {t.shared&&<SharedBadge responsible={t.responsible}/>}<span className="chip">{STATUS_LABEL[t.status]}</span>
                <select value={t.milestone || ""} onChange={(e) => onMove(t.id, e.target.value || null)} aria-label={`Mover: ${t.title}`}>
                  <option value="">Sem marco</option>
                  {milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            ))}
            {items.length === 0 && <span className="muted small">Solte tarefas aqui</span>}
          </div>
        );
      })}
    </div>
  );
}
