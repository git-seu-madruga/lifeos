"use client";

import { useEffect, useState } from "react";
import { INBOX_TARGETS } from "../lib/nav";

export default function Inbox({ items, tabId, onAdd, onUpdate, onDelete, onConvert }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false); // só afeta telas estreitas
  const [openId, setOpenId] = useState(null);

  const target = INBOX_TARGETS[tabId];
  const item = items.find((i) => i.id === openId);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  function add() {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  function remove() {
    if (!window.confirm("Excluir esta entrada do inbox? Não dá para desfazer.")) return;
    onDelete(item.id);
    setOpenId(null);
  }

  function convert() {
    onConvert(item, target.kind);
    setOpenId(null);
  }

  return (
    <aside className={"inbox" + (open ? " open" : "")} aria-label="Inbox">
      <div className="inbox-head">
        <h2 className="inbox-title">Inbox</h2>
        <span className="inbox-count">{items.length}</span>
        <button className="ghost inbox-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Recolher" : "Abrir"}</button>
      </div>

      <div className="inbox-body">
        <textarea
          className="search quick"
          rows={3}
          value={text}
          placeholder="Anotar algo rápido…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              add();
            }
          }}
          aria-label="Nova entrada no inbox"
        />
        <p className="muted small quick-hint">Enter salva · Shift+Enter nova linha</p>
        {items.length === 0 && <p className="muted small inbox-empty">Inbox vazio.</p>}
        <ul className="inbox-list">
          {items.map((i) => (
            <li key={i.id}><button className="inbox-item" onClick={() => setOpenId(i.id)}>{i.text}</button></li>
          ))}
        </ul>
      </div>

      {item && (
        <div className="overlay" onClick={() => setOpenId(null)}>
          <div className="panel" role="dialog" aria-label="Entrada do inbox" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2 className="inbox-title grow">Entrada do inbox</h2>
              <button className="ghost" onClick={() => setOpenId(null)}>Fechar</button>
            </div>
            <div className="field">
              <span className="label">Conteúdo</span>
              <textarea className="search notes" rows={6} value={item.text} onChange={(e) => onUpdate(item.id, e.target.value)} />
            </div>
            <p className="muted small">Ao transformar, a primeira linha vira o título e o restante vira anotação.</p>
            <div className="inbox-actions">
              <button className="primary" disabled={!target.kind} onClick={convert}>
                Transformar em {target.label}{target.kind ? "" : " (em breve)"}
              </button>
              <button className="danger" onClick={remove}>Excluir</button>
            </div>
            {!target.kind && <p className="muted small">Esta seção ainda não foi construída. Troque de aba para transformar em tarefa ou projeto.</p>}
          </div>
        </div>
      )}
    </aside>
  );
}
