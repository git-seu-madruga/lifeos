"use client";
import { useEffect, useState } from 'react';

const FIELDS = {
  contexts: { title: 'Contextos', note: 'Global: as alterações valem para Projetos, Tarefas e o filtro superior.' },
  projectStatuses: { title: 'Status dos projetos', roles: [['active', 'Ativo'], ['paused', 'Pausado'], ['done', 'Concluído'], ['cancelled', 'Cancelado']] },
  taskStatuses: { title: 'Status das tarefas', roles: [['todo', 'Não iniciado'], ['doing', 'Em andamento'], ['hold', 'Aguardando / cobrança'], ['done', 'Concluído']] },
  areas: { title: 'Áreas dos projetos' },
  priorities: { title: 'Prioridades das tarefas', note: 'A ordem abaixo define a prioridade, da maior para a menor.' },
};
function OptionEditor({ option, field, onSave, onMove, first, last }) {
  const [label, setLabel] = useState(option.label);
  const [behavior, setBehavior] = useState(option.behavior);
  const [error, setError] = useState('');
  useEffect(() => { setLabel(option.label); setBehavior(option.behavior); }, [option.label, option.behavior]);
  return <form className="settings-row" onSubmit={e => {
    e.preventDefault();
    const message = onSave({ ...option, label: label.trim(), ...(field.roles ? { behavior } : {}) });
    setError(message || '');
  }}>
    <input className="search" aria-label={`Nome: ${option.label}`} value={label} onChange={e => setLabel(e.target.value)} />
    {field.roles && <select aria-label={`Comportamento: ${option.label}`} value={behavior} disabled={['todo','doing','hold','done','active','paused','cancelled'].includes(option.id)} onChange={e => setBehavior(e.target.value)}>{field.roles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>}
    <button className="ghost" type="submit">Salvar</button>
    <button className="mv" type="button" disabled={first} onClick={() => onMove(-1)} aria-label={`Subir: ${option.label}`}>▲</button>
    <button className="mv" type="button" disabled={last} onClick={() => onMove(1)} aria-label={`Descer: ${option.label}`}>▼</button>
    {error && <span className="date-error" role="alert">{error}</span>}
  </form>;
}
function FieldEditor({ fieldKey, options, onChange }) {
  const field = FIELDS[fieldKey];
  const [name, setName] = useState('');
  const [behavior, setBehavior] = useState(field.roles?.[0][0]);
  const [error, setError] = useState('');
  function valid(label, id) {
    if (!label) return 'Informe um nome.';
    if (options.some(option => option.id !== id && option.label.toLocaleLowerCase('pt-BR') === label.toLocaleLowerCase('pt-BR'))) return 'Já existe uma opção com esse nome.';
    return '';
  }
  return <section className="settings-field">
    <h3>{field.title}</h3>
    {field.note && <p className="muted small">{field.note}</p>}
    {field.roles && <p className="muted small">O comportamento define como o status participa dos filtros, da conclusão e das cobranças. Os nomes podem ser personalizados.</p>}
    {options.map((option, index) => <OptionEditor key={option.id} option={option} field={field} first={index === 0} last={index === options.length - 1} onSave={next => {
      const message = valid(next.label, next.id);
      if (!message) onChange(options.map(item => item.id === next.id ? next : item));
      return message;
    }} onMove={direction => {
      const next = [...options];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      onChange(next);
    }} />)}
    <form className="settings-row" onSubmit={e => {
      e.preventDefault();
      const label = name.trim(), message = valid(label);
      setError(message);
      if (message) return;
      onChange([...options, { id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, label, ...(field.roles ? { behavior } : {}) }]);
      setName('');
    }}>
      <input className="search" aria-label={`Nova opção: ${field.title}`} placeholder="Nome da nova opção…" value={name} onChange={e => setName(e.target.value)} />
      {field.roles && <select aria-label={`Comportamento da nova opção: ${field.title}`} value={behavior} onChange={e => setBehavior(e.target.value)}>{field.roles.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>}
      <button className="primary" type="submit">+ Adicionar</button>
      {error && <span className="date-error" role="alert">{error}</span>}
    </form>
  </section>;
}
export default function SettingsPanel({ tab, settings, onChange, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const keys = tab.id === 'projetos' ? ['projectStatuses','areas','contexts'] : tab.id === 'tarefas' ? ['taskStatuses','priorities','contexts'] : ['contexts'];
  return <div className="overlay" onClick={onClose}>
    <aside className="panel settings-panel" role="dialog" aria-modal="true" aria-label={`Configurações de ${tab.label}`} onClick={e => e.stopPropagation()}>
      <div className="panel-head"><h2 className="inbox-title grow">Configurações · {tab.label}</h2><button className="ghost" onClick={onClose}>Fechar</button></div>
      <p className="muted small">Adicione opções, altere nomes e organize a ordem. Renomear mantém os vínculos dos registros existentes. As alterações são salvas neste navegador.</p>
      {keys.map(key => <FieldEditor key={key} fieldKey={key} options={settings[key]} onChange={options => onChange(key, options)} />)}
      {!['projetos','tarefas'].includes(tab.id) && <p className="muted">As opções específicas desta tela estarão disponíveis quando ela for construída.</p>}
    </aside>
  </div>;
}
