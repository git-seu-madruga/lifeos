"use client";
import EntryTitle from "./EntryTitle";
import LinkText, {TextLinks} from "./LinkText";
import ProjectAttachments from "./ProjectAttachments";
import DateInput from "./DateInput";

import { addDaysISO } from "../lib/dates";

const STATUS = [["todo", "Não iniciada"], ["doing", "Em andamento"], ["hold", "On hold"], ["done", "Concluída"]];

export default function TaskDetail({ task, projects, update, onDelete, onClose, newEntry=false }) {


  const set = (patch) => update(task.id, patch);
  const proj = projects.find((p) => p.id === task.project);

  function setStatus(s) {
    const p = { status: s };
    if (s === "hold" && !task.followUp) p.followUp = addDaysISO(3);
    set(p);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="panel" role="dialog" aria-modal="true" aria-label="Detalhes da tarefa" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <EntryTitle key={task.id} newEntry={newEntry} placeholder="Nova tarefa" className="panel-title" value={task.title} onChange={(e) => set({ title: e.target.value })} aria-label="Título" />
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

        {task.status === "hold" && (
          <div className="field-row">
            <div className="field">
              <span className="label">Aguardando</span>
              <input className="search" value={task.waitingOn} placeholder="Quem / o quê" onChange={(e) => set({ waitingOn: e.target.value })} /><TextLinks text={task.waitingOn}/>
            </div>
            <div className="field">
              <span className="label">Cobrar em</span>
              <DateInput className="search" value={task.followUp || ""} onChange={(e) => set({ followUp: e.target.value || null })} />
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <span className="label">Início</span>
            <DateInput className="search" value={task.start || ""} onChange={(e) => set({ start: e.target.value || null })} />
          </div>
          <div className="field">
            <span className="label">Prazo</span>
            <DateInput className="search" value={task.due || ""} onChange={(e) => set({ due: e.target.value || null })} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <span className="label">Prioridade</span>
            <select value={task.priority} onChange={(e) => set({ priority: e.target.value })}>
              <option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
            </select>
          </div>
          <div className="field">
            <span className="label">Contexto</span>
            <select value={task.context} disabled={Boolean(proj)} onChange={(e) => set({ context: e.target.value })}>
              <option value="work">Trabalho</option><option value="personal">Pessoal</option>
            </select>
            {proj && <span className="muted small ctx-note">Definido pelo projeto “{proj.name}”</span>}
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <span className="label">Projeto</span>
            <select value={task.project || ""} onChange={(e) => {
              const p = projects.find((x) => x.id === e.target.value);
              set({ project: p ? p.id : null, milestone: null, ...(p ? { context: p.context } : {}) });
            }}>
              <option value="">Sem projeto</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {task.project && (
            <div className="field">
              <span className="label">Marco</span>
              <select value={task.milestone || ""} onChange={(e) => set({ milestone: e.target.value || null })}>
                <option value="">Sem marco</option>
                {(projects.find((p) => p.id === task.project)?.milestones || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          )}
        </div>

        <ProjectAttachments key={task.id} entity="tarefa" items={task.attachments || []} onChange={(attachments) => set({ attachments })} />

        <div className="field">
          <span className="label">Anotações</span>
          <textarea className="search notes" rows={4} value={task.notes} placeholder="Texto livre (na versão real, o conteúdo da página)" onChange={(e) => set({ notes: e.target.value })} /><TextLinks text={task.notes}/>
        </div>
        <button className="danger" onClick={() => {
          if (!window.confirm("Excluir esta tarefa? Não dá para desfazer.")) return;
          onDelete(task.id);
          onClose();
        }}>Excluir tarefa</button>
      </aside>
    </div>
  );
}
