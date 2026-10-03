"use client";
import { useEffect, useState } from 'react';
function Reference({ item, onChange }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const value = URL.createObjectURL(item.file);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [item.file]);
  return <li className="attachment-row">
    <a href={url} target="_blank" rel="noopener noreferrer">{item.name}</a>
    <span className="muted small">{Math.ceil(item.file.size / 1024)} KB</span>
    <a className="ghost" href={url} download={item.name}>Baixar</a>
    <button className="ghost" onClick={() => onChange(!item.archived)}>{item.archived ? 'Restaurar' : 'Arquivar'}</button>
  </li>;
}
export default function ProjectAttachments({ items = [], onChange }) {
  const [archived, setArchived] = useState(false);
  function add(e) {
    const files = Array.from(e.target.files || []);
    onChange([...items, ...files.map(file => ({ id: `a${Date.now()}${Math.random().toString(36).slice(2)}`, name: file.name, file, archived: false }))]);
    e.target.value = '';
  }
  const shown = items.filter(item => !!item.archived === archived);
  return <section className="attachments">
    <h2 className="group-head pd-h">Anexos e referências</h2>
    <div className="seg-row view-toggle">
      <button className={'subtab' + (!archived ? ' on' : '')} onClick={() => setArchived(false)}>Ativos</button>
      <button className={'subtab' + (archived ? ' on' : '')} onClick={() => setArchived(true)}>Arquivados</button>
      <label className="ghost">+ Incluir anexos<input type="file" multiple onChange={add} aria-label="Incluir anexos" /></label>
    </div>
    <p className="muted small">Salvos neste navegador. Arquivar mantém o arquivo disponível na guia Arquivados.</p>
    <ul className="linked">{shown.map(item => <Reference key={item.id} item={item} onChange={value => onChange(items.map(a => a.id === item.id ? { ...a, archived: value } : a))} />)}</ul>
    {!shown.length && <p className="muted">Nenhum anexo {archived ? 'arquivado' : 'ativo'}.</p>}
  </section>;
}
