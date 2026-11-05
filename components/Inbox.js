"use client";
import {pressureFromInbox} from '../lib/wellness';
import {selectedInboxAttachments,inboxAcceptsAttachments} from '../lib/inboxAttachments';
import LinkText, {TextLinks} from "./LinkText";
import ModalLayer from './ModalLayer';
import {useBackLayer} from '../lib/useBackNavigation';
import {shouldSubmitInbox} from '../lib/inboxInput';
import InboxImages,{InboxImageThumbnail} from './InboxImages';
import {pastedInboxImages} from '../lib/inboxImages';
import AutoTextarea from "./AutoTextarea";

import { useState } from "react";
import { INBOX_TARGETS } from "../lib/nav";

export default function Inbox({ items, tabId, onAdd, onUpdate, onDelete, onConvert }) {
  const [text, setText] = useState("");
  const [images,setImages]=useState([]);
  const [pasteError,setPasteError]=useState("");
  const [open, setOpen] = useState(false); // só afeta telas estreitas
  const [openId, setOpenId] = useState(null);

  const target = INBOX_TARGETS[tabId];
  const item = items.find((i) => i.id === openId);
  const blockedPressure=target?.kind==='pressure'&&!pressureFromInbox(item);
  const blockedAttachments=!!item?.attachments?.length&&!inboxAcceptsAttachments(target?.kind);

  useBackLayer(open,()=>setOpen(false),15);

  function add() {
    if (!text.trim()&&!images.length) return;
    onAdd(text.trim(),images);
    setImages([]);setPasteError("");
    setText("");
  }

  function paste(event,attachments,save){
    try{const added=pastedInboxImages(event,attachments);if(added){save([...attachments,...added]);setPasteError("");}}
    catch(error){setPasteError(error.message);}
  }

  function picker(attachments,save){return <label className="ghost inbox-attach" title="Adicionar imagens ou arquivos · até 4 MB por arquivo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m8 12 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9M6 14l8-8"/></svg><input type="file" multiple aria-label="Adicionar anexos ao Inbox" onChange={e=>{try{const added=selectedInboxAttachments(e.target.files,attachments);if(!added.length)return;save([...attachments,...added]);setPasteError('');}catch(error){setPasteError(error.message);}e.target.value='';}}/></label>;}

  function remove() {
    if (!window.confirm("Excluir esta entrada do inbox? Não dá para desfazer.")) return;
    onDelete(item.id);
    setOpenId(null);
  }

  function convert() {
    if (!item || blockedAttachments || blockedPressure || !target?.kind || onConvert(item, target.kind) === false) return;
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
          onPaste={e=>paste(e,images,setImages)}
          onKeyDown={(e) => {
            if (shouldSubmitInbox(e,window.matchMedia("(max-width: 999px), (pointer: coarse)").matches)) {
              e.preventDefault();
              add();
            }
          }}
          aria-label="Nova entrada no inbox"
        />
        <InboxImages items={images} onChange={setImages}/>
        {pasteError&&<p className="date-error" role="alert">{pasteError}</p>}
        <div className="inbox-compose-actions"><p className="muted small quick-hint"><span className="desktop-inbox-hint">Enter salva · Shift+Enter nova linha</span><span className="mobile-inbox-hint">Enter cria uma nova linha</span></p>{picker(images,setImages)}<button className="primary" onClick={add} disabled={!text.trim()&&!images.length}>Adicionar</button></div>
        {items.length === 0 && <p className="muted small inbox-empty">Inbox vazio.</p>}
        <ul className="inbox-list">
          {items.map((i) => (
            <li key={i.id}><div className="inbox-item" role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpenId(i.id);}}} onClick={() => setOpenId(i.id)}><LinkText text={i.text}/>{i.attachments?.length>0&&<InboxImageThumbnail item={i.attachments[0]}/>}</div></li>
          ))}
        </ul>
      </div></div>

      <ModalLayer open={!!item} onClose={()=>setOpenId(null)}>{item && (
        <div className="overlay" onClick={() => setOpenId(null)}>
          <div className="panel" role="dialog" aria-modal="true" aria-label="Entrada do inbox" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2 className="inbox-title grow">Entrada do inbox</h2>
              {picker(item.attachments||[],attachments=>onUpdate(item.id,item.text,attachments))}<button className="ghost" onClick={() => setOpenId(null)}>Fechar</button>
            </div>
            <div className="field">
              <span className="label">Conteúdo</span>
              <AutoTextarea className="search notes" rows={6} value={item.text} onPaste={e=>paste(e,item.attachments||[],attachments=>onUpdate(item.id,item.text,attachments))} onChange={(e) => onUpdate(item.id, e.target.value)} /><TextLinks text={item.text}/>
            </div>
            <InboxImages items={item.attachments||[]} onChange={attachments=>onUpdate(item.id,item.text,attachments)}/>
            {pasteError&&<p className="date-error" role="alert">{pasteError}</p>}
            {target&&!blockedAttachments&&<p className="muted small">{tabId === "habitos" ? "Para criar um hábito, use + Novo hábito na tela Hábitos." : target.kind === "pressure" ? "Use exatamente três números separados por um espaço: sistólica diastólica BPM (ex.: 130 68 55). Ao transformar, a medição será registrada hoje, sem abrir formulário." : target.kind === "diary" ? "O texto e as imagens serão acrescentados ao Diário de hoje. Os demais arquivos ficarão nos anexos da entrada." : target.kind === "someday" ? "Primeira linha: título da ideia. Demais linhas: conteúdo. Escolha a área para concluir a transformação; o contexto pode ser ajustado no editor." : target.kind === "recado" ? "Primeira linha: título do recado. Demais linhas: mensagem. A entrada permanece no Inbox até o envio ser concluído." : target.kind === "shopping" ? "Primeira linha: nome da lista. Separe os itens nas linhas seguintes (Enter no celular ou Shift + Enter no computador)." : target.kind === "contact" ? "Primeira linha: nome. Segunda linha: DD/MM ou DD/MM/AAAA. O ano é opcional." : "Ao transformar, a primeira linha vira o título e o restante vira anotação."}</p>}
            <div className="inbox-actions">
              {tabId !== "habitos" && target && <button className="primary" disabled={!target.kind||blockedAttachments||blockedPressure} title={blockedAttachments?"Esta integração não aceita anexos. Remova os arquivos ou escolha outra aba.":undefined} onClick={convert}>
                Transformar em {target.label}{target.kind ? "" : " (em breve)"}
              </button>}
              <button className="danger" onClick={remove}>Excluir</button>
            </div>
            {!target?.kind && tabId !== "habitos" && <p className="muted small">Esta seção ainda não foi construída. Troque de aba para transformar em tarefa ou projeto.</p>}
          </div>
        </div>
      )}</ModalLayer>
    </aside>
  );
}
