"use client";
import LinkText, {TextLinks} from "./LinkText";
import ModalLayer from './ModalLayer';
import {useBackLayer} from '../lib/useBackNavigation';
import {shouldSubmitInbox} from '../lib/inboxInput';
import AutoTextarea from "./AutoTextarea";

import { useState } from "react";
import { INBOX_TARGETS } from "../lib/nav";

export default function Inbox({ items, tabId, onAdd, onUpdate, onDelete, onConvert }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false); // só afeta telas estreitas
  const [openId, setOpenId] = useState(null);

  const target = INBOX_TARGETS[tabId];
  const item = items.find((i) => i.id === openId);

  useBackLayer(open,()=>setOpen(false),15);

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
    if (onConvert(item, target.kind) === false) return;
    setOpenId(null);
  }

  return (
    <aside className={"inbox" + (open ? " open" : "")} aria-label="Inbox">
      <div className="inbox-head">
        <h2 className="inbox-title">Inbox</h2>
        <span className="inbox-count">{items.length}</span>
        <button className="ghost inbox-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Recolher" : "Abrir"}</button>
      </div>

      <div className="inbox-collapse"><div className="inbox-body">
        <AutoTextarea
          className="search quick"
          rows={3}
          enterKeyHint="enter"
          value={text}
          placeholder="Anotar algo rápido…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (shouldSubmitInbox(e,window.matchMedia("(max-width: 999px), (pointer: coarse)").matches)) {
              e.preventDefault();
              add();
            }
          }}
          aria-label="Nova entrada no inbox"
        />
        <div className="inbox-compose-actions"><p className="muted small quick-hint"><span className="desktop-inbox-hint">Enter salva · Shift+Enter nova linha</span><span className="mobile-inbox-hint">Enter cria uma nova linha</span></p><button className="primary" onClick={add} disabled={!text.trim()}>Adicionar</button></div>
        {items.length === 0 && <p className="muted small inbox-empty">Inbox vazio.</p>}
        <ul className="inbox-list">
          {items.map((i) => (
            <li key={i.id}><div className="inbox-item" role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpenId(i.id);}}} onClick={() => setOpenId(i.id)}><LinkText text={i.text}/></div></li>
          ))}
        </ul>
      </div></div>

      <ModalLayer open={!!item} onClose={()=>setOpenId(null)}>{item && (
        <div className="overlay" onClick={() => setOpenId(null)}>
          <div className="panel" role="dialog" aria-modal="true" aria-label="Entrada do inbox" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2 className="inbox-title grow">Entrada do inbox</h2>
              <button className="ghost" onClick={() => setOpenId(null)}>Fechar</button>
            </div>
            <div className="field">
              <span className="label">Conteúdo</span>
              <AutoTextarea className="search notes" rows={6} value={item.text} onChange={(e) => onUpdate(item.id, e.target.value)} /><TextLinks text={item.text}/>
            </div>
            <p className="muted small">{tabId === "habitos" ? "Para criar um hábito, use + Novo hábito na tela Hábitos." : target.kind === "shopping" ? "Primeira linha: nome da lista. Separe os itens nas linhas seguintes (Enter no celular ou Shift + Enter no computador)." : target.kind === "contact" ? "Primeira linha: nome. Segunda linha: DD/MM ou DD/MM/AAAA. O ano é opcional." : "Ao transformar, a primeira linha vira o título e o restante vira anotação."}</p>
            <div className="inbox-actions">
              {tabId !== "habitos" && <button className="primary" disabled={!target.kind} onClick={convert}>
                Transformar em {target.label}{target.kind ? "" : " (em breve)"}
              </button>}
              <button className="danger" onClick={remove}>Excluir</button>
            </div>
            {!target.kind && tabId !== "habitos" && <p className="muted small">Esta seção ainda não foi construída. Troque de aba para transformar em tarefa ou projeto.</p>}
          </div>
        </div>
      )}</ModalLayer>
    </aside>
  );
}
