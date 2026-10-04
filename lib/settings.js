export const DEFAULT_SETTINGS = {
  contexts: [{ id: 'work', label: 'Trabalho' }, { id: 'personal', label: 'Pessoal' }],
  projectStatuses: [
    { id: 'active', label: 'Ativo', behavior: 'active' },
    { id: 'paused', label: 'Pausado', behavior: 'paused' },
    { id: 'done', label: 'Concluído', behavior: 'done' },
    { id: 'cancelled', label: 'Cancelado', behavior: 'cancelled' },
  ],
  taskStatuses: [
    { id: 'todo', label: 'Não iniciadas', behavior: 'todo' },
    { id: 'doing', label: 'Em andamento', behavior: 'doing' },
    { id: 'hold', label: 'On hold', behavior: 'hold' },
    { id: 'done', label: 'Concluídas', behavior: 'done' },
  ],
  priorities: [{ id: 'high', label: 'Alta' }, { id: 'medium', label: 'Média' }, { id: 'low', label: 'Baixa' }],
  areas: ['Carreira', 'Finanças', 'Aprendizado', 'Saúde', 'Casa', 'Lazer'].map((label, i) => ({ id: `area${i}`, label })),
};
export const optionLabel = (options, id) => options.find(option => option.id === id)?.label || id || '';
export const statusBehavior = (options, id) => options.find(option => option.id === id)?.behavior || id;
export const statusTone = behavior => ({ doing: 'blue', hold: 'today', done: 'muted' }[behavior] || 'plain');

export function loadSettings(saved, tasks, projects) {
  const settings = Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([key, defaults]) => [key, (saved?.[key] || defaults).map(option => ({ ...option }))]));
  // Preserva opções já utilizadas, inclusive áreas que eram texto livre.
  for (const [key, values] of [
    ['contexts', [...tasks, ...projects].map(item => item.context)],
    ['taskStatuses', tasks.map(item => item.status)],
    ['projectStatuses', projects.map(item => item.status)],
    ['priorities', tasks.map(item => item.priority)],
  ]) {
    for (const id of values.filter(Boolean)) {
      if (!settings[key].some(option => option.id === id)) settings[key].push({ id, label: id, ...(key.includes('Statuses') ? { behavior: key === 'taskStatuses' ? 'todo' : 'active' } : {}) });
    }
  }
  for (const area of projects.map(project => project.area).filter(Boolean)) {
    if (!settings.areas.some(option => option.label === area)) settings.areas.push({ id: `area_${settings.areas.length}`, label: area });
  }
  return settings;
}
