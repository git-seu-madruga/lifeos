"use client";

import { useEffect, useState } from "react";
import { PROJECTS, PAGES } from "../lib/mockData";
import { addDaysISO } from "../lib/dates";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const STATUS = [["todo", "Não iniciada"], ["doing", "Em andamento"], ["hold", "On hold"], ["done", "Concluída"]];

export default function TaskDetail({ task, update, onClose }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch) => update(task.id, patch);

  function setStatus(s) {
    const p = { status: s, outcome: s === "done" ? task.outcome || "finished" : null };
    if (s === "hold" && !task.followUp) p.followUp = addDaysISO(3);
    set(p);
  }

  // Busca por palavras-chave: todas as palavras precisam aparecer no título ou tipo.
  const words = norm(q).split(/\s+/).filter(Boolean);
  const results = words.length
    ? PAGES.filter((p) => !task.links.includes(p.id) && words.every((w) => norm(p.title + " " + p.type).includes(w))).slice(0, 5)
    : [];
  const linked = task.links.map((id) => PAGES.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="panel" role="dialog" aria-label="Detalhes da tarefa" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <input className="panel-title" value={task.title} onChange={(e) => set({ title: e.target.value })} aria-label="Título" />
          <button className="ghost" onClick={onClose}>Fechar</button>
        </div>

        <div className="field">
          <span className="label">Status</span>
          <div className="seg-row">
            {STATUS.map(([k, l]) => (
              <button key={k} className={"subtab" + (task.status === k ? " on" : "")} onClick={() => setStatus(k)}>{l}</button>
            ))}
          </div>
        </div>

        {task.status === "done" && (
          <div className="field">
            <span className="label">Motivo</span>
            <select value={task.outcome || "finished"} onChange={(e) => set({ outcome: e.target.value })}>
              <option value="finished">Finalizada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        )}

        {task.status === "hold" && (
          <div className="field-row">
            <div className="field">
              <span className="label">Aguardando</span>
              <input className="search" value={task.waitingOn} placeholder="Quem / o quê" onChange={(e) => set({ waitingOn: e.target.value })} />
            </div>
            <div className="field">
              <span className="label">Cobrar em</span>
              <input className="search" type="date" value={task.followUp || ""} onChange={(e) => set({ followUp: e.target.value || null })} />
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <span className="label">Prazo</span>
            <input className="search" type="date" value={task.due || ""} onChange={(e) => set({ due: e.target.value || null })} />
          </div>
          <div className="field">
            <span className="label">Prioridade</span>
            <select value={task.priority} onChange={(e) => set({ priority: e.target.value })}>
              <option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
            </select>
          </div>
          <div className="field">
            <span className="label">Contexto</span>
            <select value={task.context} onChange={(e) => set({ context: e.target.value })}>
              <option value="work">Trabalho</option><option value="personal">Pessoal</option>
            </select>
          </div>
        </div>

        <div className="field">
          <span className="label">Projeto</span>
          <select value={task.project || ""} onChange={(e) => set({ project: e.target.value || null })}>
            <option value="">Sem projeto</option>
            {PROJECTS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="field">
          <span className="label">Páginas relacionadas</span>
          <input className="search" value={q} placeholder="Buscar página por palavras-chave…" onChange={(e) => setQ(e.target.value)} />
          {results.length > 0 && (
            <ul className="results">
              {results.map((p) => (
                <li key={p.id}>
                  <button onClick={() => { set({ links: [...task.links, p.id] }); setQ(""); }}>
                    <span>{p.title}</span><span className="chip">{p.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {words.length > 0 && results.length === 0 && <p className="muted small">Nada encontrado.</p>}
          <ul className="linked">
            {linked.map((p) => (
              <li key={p.id}>
                <span>🔗 {p.title}</span><span className="chip">{p.type}</span>
                <button className="star" aria-label={`Remover ${p.title}`} onClick={() => set({ links: task.links.filter((x) => x !== p.id) })}>×</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="field">
          <span className="label">Anotações</span>
          <textarea className="search notes" rows={4} value={task.notes} placeholder="Texto livre (na versão real, o conteúdo da página)" onChange={(e) => set({ notes: e.target.value })} />
        </div>
      </aside>
    </div>
  );
}
