"use client";
import { useEffect, useState } from 'react';
function Reference({ item, onDelete }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (item.file) {
      const value = URL.createObjectURL(item.file);
      setUrl(value);
      return () => URL.revokeObjectURL(value);
    }
    setUrl(item.pageId ? `/api/notion/attachment?kind=${item.kind}&id=${item.pageId}&index=${item.index}&name=${encodeURIComponent(item.name)}` : item.url || '');
  }, [item.file, item.pageId, item.kind, item.index, item.name, item.url]);
  return <li className="attachment-row">
    <a href={url} target="_blank" rel="noopener noreferrer">{item.name}</a>
    <span className="muted small">{item.file ? `${Math.ceil(item.file.size / 1024)} KB · pendente` : "No Notion"}</span>
    <a className="ghost" href={url} download={item.name}>Baixar</a>
    <button className="danger" onClick={onDelete}>Excluir anexo</button>
  </li>;
}
export default function ProjectAttachments({ items = [], onChange, entity = "projeto" }) {
  const [error, setError] = useState('');
  function add(e) {
    const files = Array.from(e.target.files || []);
    if (files.some(file => file.size > 4 * 1024 * 1024)) { setError('O limite é 4 MB por arquivo. Envie arquivos maiores diretamente no Notion.'); e.target.value=''; return; }
    setError('');
    onChange([...items, ...files.map(file => ({ id: `a${Date.now()}${Math.random().toString(36).slice(2)}`, name: file.name, file }))]);
    e.target.value = '';
  }
  function remove(item) {
    if (!window.confirm(`Excluir o anexo “${item.name}” ${entity === "tarefa" ? "desta tarefa" : "deste projeto"}? Não dá para desfazer.`)) return;
    onChange(items.filter(a => a.id !== item.id));
  }
  return <section className="attachments">
    <h2 className="group-head pd-h">Anexos e referências</h2>
    <div className="seg-row view-toggle">
      <label className="ghost">+ Incluir anexos<input type="file" multiple onChange={add} aria-label="Incluir anexos" /></label>
    </div>
    <p className="muted small">Anexos salvos no Notion. Limite de envio pelo app: 4 MB por arquivo.</p>
    {error && <p className="date-error" role="alert">{error}</p>}
    <ul className="linked">{items.map(item => <Reference key={item.id} item={item} onDelete={() => remove(item)} />)}</ul>
    {!items.length && <p className="muted">Nenhum anexo {entity === "tarefa" ? "nesta tarefa" : "neste projeto"}.</p>}
  </section>;
}
