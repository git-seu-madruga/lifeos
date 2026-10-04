import { AppError } from './auth';
import { diffState, flattenMilestones, sameField } from '../notionDiff';
import { readSnapshot, notion, encode, plain, TASK_STATUS, PROJECT_STATUS, PRIORITY, CONTEXT, decode } from './notion';

function validateState(state) {
  if (!state || !Array.isArray(state.projects) || !Array.isArray(state.tasks) || !Array.isArray(state.inbox) || state.projects.length + state.tasks.length + state.inbox.length > 5000) throw new AppError('Estrutura de dados inválida ou muito grande.');
  const projects = new Map(state.projects.map(item => [item.id,item]));
  const milestones = new Map(flattenMilestones(state).map(item => [item.id,item]));
  for (const [kind, list] of [['projects',state.projects],['milestones',[...milestones.values()]],['tasks',state.tasks],['inbox',state.inbox]]) {
    const ids = new Set();
    for (const item of list) {
      if (typeof item.id !== 'string' || item.id.length > 200 || ids.has(item.id)) throw new AppError('Identificador de registro inválido.');
      ids.add(item.id);
      const name = kind === 'inbox' ? item.text : item.title ?? item.name;
      if (typeof name !== 'string' || name.length > 10000) throw new AppError('Nome ou título inválido.');
      if (item.status && !(kind === 'tasks' ? TASK_STATUS : PROJECT_STATUS)[item.status]) throw new AppError('Status inválido.');
      if (item.context && !CONTEXT[item.context]) throw new AppError('Contexto inválido.');
      if (kind === 'tasks' && !PRIORITY[item.priority]) throw new AppError('Prioridade inválida.');
      for (const key of ['due','start','followUp']) {
        const value = item[key];
        if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw new AppError('Data inválida.');
      }
      if (item.project && !projects.has(item.project)) throw new AppError('O projeto vinculado não existe.');
      if (item.milestone && (!milestones.has(item.milestone) || milestones.get(item.milestone).project !== item.project)) throw new AppError('O marco precisa pertencer ao mesmo projeto da tarefa.');
      if (kind === 'milestones') {
        const project = projects.get(item.project);
        if (!project) throw new AppError('O marco precisa de um projeto.');
        if (project.due && item.due && item.due > project.due) throw new AppError(`O marco “${item.title}” ultrapassa o prazo final do projeto.`);
      }
      if (item.attachments && (!Array.isArray(item.attachments) || item.attachments.length > 100 || item.attachments.some(file => !file.name || (!file.uploadId && !file.notion)))) throw new AppError('Anexo inválido ou ainda não enviado.');
    }
  }
}
export async function synchronize(base, next) {
  validateState(next);
  if (!base || !Array.isArray(base.projects) || !Array.isArray(base.tasks)) throw new AppError('Base de sincronização inválida.');
  const changes = diffState(base,next);
  // Resolve fontes e registros existentes antes de escrever. O campo técnico evita duplicatas após uma falha parcial.
  const remote = await readSnapshot(true);
  const bindings = {}, files = {};
  const byId = {}, byTracking = {};
  for (const kind of ['projects','milestones','tasks','inbox']) {
    byId[kind] = new Map(remote.rows[kind].map(row => [row.id,row]));
    const tracking = remote.schemas[kind].tracking;
    byTracking[kind] = new Map(remote.rows[kind].map(row => [plain(row.properties[tracking.name]?.rich_text),row]).filter(([id]) => id));
  }
  function existing(kind,item) {
    if (item._notionId) {
      const row = byId[kind].get(item._notionId);
      if (!row) throw new AppError('Um registro foi removido ou mudou de banco no Notion. Atualize os dados antes de continuar.',409);
      return row;
    }
    return byId[kind].get(item.id) || byTracking[kind].get(item.id);
  }
  for (const [kind,list] of [['projects',next.projects],['milestones',flattenMilestones(next)],['tasks',next.tasks],['inbox',next.inbox]]) {
    for (const item of list) { const row = existing(kind,item); if (row) bindings[item.id] = row.id; }
  }
  // Verifica todos os campos alterados antes de iniciar a gravação.
  for (const kind of ['projects','milestones','tasks','inbox']) {
    const previous = kind === 'milestones' ? flattenMilestones(base) : base[kind] || [];
    const beforeById = new Map(previous.map(item => [item.id,item]));
    for (const {item,keys} of changes[kind].upserts) {
      const row = existing(kind,item), before = beforeById.get(item.id);
      if (!row || !before) continue;
      const actual = decode(kind,row,remote.schemas[kind]);
      for (const key of keys) {
        let expected = before[key], value = actual[key], desired = item[key];
        if (key === 'project' || key === 'milestone') { expected = expected ? bindings[expected] || expected : null; desired = desired ? bindings[desired] || desired : null; }
        if (key === 'attachments') {
          const signature = files => (files || []).map(file => [file.name,file.notion?.type || (file.uploadId ? 'file_upload' : ''),(file.notion?.[file.notion.type]?.url || '').split('?')[0]]);
          expected=signature(expected);value=signature(value);desired=signature(desired);
          if (JSON.stringify(value)!==JSON.stringify(expected) && JSON.stringify(value)!==JSON.stringify(desired)) throw new AppError('Os anexos foram alterados no Notion por outra edição. Use Atualizar para revisar os dados.',409);
        } else if (!sameField(key,value,expected) && !sameField(key,value,desired)) {
          throw new AppError(`O campo “${remote.schemas[kind].fields[key].name}” foi alterado no Notion. Use Atualizar para revisar os dados antes de salvar.`,409);
        }
      }
    }
  }
  for (const kind of ['projects','milestones','tasks','inbox']) {
    const source = remote.schemas[kind];
    for (const { item, keys } of changes[kind].upserts) {
      const row = existing(kind,item);
      const object = { ...item, ...(kind !== 'projects' ? { project: item.project ? bindings[item.project] : null } : {}) };
      if (kind === 'tasks') {
        object.milestone = item.milestone ? bindings[item.milestone] : null;
        object.context = next.projects.find(project => project.id === item.project)?.context || item.context;
      }
      if (row && keys.includes('attachments')) {
        const freshFiles = decode(kind,row,source).attachments;
        object.attachments = (object.attachments || []).map(file => {
          if (file.uploadId) return file;
          const originalUrl = (file.notion?.[file.notion.type]?.url || '').split('?')[0];
          const fresh = freshFiles.find(other => other.name === file.name && (other.notion?.[other.notion.type]?.url || '').split('?')[0] === originalUrl);
          if (!fresh) throw new AppError('Um anexo foi removido ou substituído no Notion. Atualize os dados para revisar.',409);
          return {...file,notion:fresh.notion};
        });
      }
      const properties = encode(kind,object,source,row ? keys : undefined);
      if (!row) properties[source.tracking.name] = { rich_text: [{ text: { content: item.id } }] };
      const saved = await notion(row ? `/pages/${row.id}` : '/pages', { method: row ? 'PATCH' : 'POST', body: row ? { properties } : { parent: { type: 'data_source_id', data_source_id: source.id }, properties } });
      bindings[item.id] = saved.id;
      byId[kind].set(saved.id,saved); byTracking[kind].set(item.id,saved);
      if (keys.includes('attachments') && object.attachments) {
        const decoded = decode(kind,saved,source).attachments;
        object.attachments.forEach((file,index) => { if (decoded[index]) files[file.id] = { ...decoded[index], id:file.id }; });
      }
    }
  }
  for (const kind of ['inbox','tasks','milestones','projects']) {
    for (const item of changes[kind].deletions) {
      const row = item._notionId ? byId[kind].get(item._notionId) : byId[kind].get(item.id) || byTracking[kind].get(item.id);
      if (row) await notion(`/pages/${row.id}`, { method:'PATCH', body:{in_trash:true} });
    }
  }
  return { bindings, files };
}
