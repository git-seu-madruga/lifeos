import {MEDIA_STATUS} from '../entertainment';
import {PRIVATE_KINDS,SHARED_KINDS,canRead,ensureAccess} from './access';
import {decodeShoppingItems} from '../shopping';
import { AppError } from './auth';
const API = 'https://api.notion.com/v1';
const VERSION = '2025-09-03';
const DB = {
  mediaSections:['NOTION_MEDIA_SECTIONS_DATABASE_ID',''],media:['NOTION_MEDIA_DATABASE_ID',''],
  habits:['NOTION_HABITS_DATABASE_ID',''],
  habitLogs:['NOTION_HABIT_LOGS_DATABASE_ID',''],
  shopping:['NOTION_SHOPPING_DATABASE_ID',''],
  contacts:['NOTION_CONTACTS_DATABASE_ID',''],
  projects: ['NOTION_PROJECTS_DATABASE_ID', '3ec530f0-f112-80d5-9097-ea21f9ce45d7'],
  milestones: ['NOTION_MILESTONES_DATABASE_ID', '3ed530f0-f112-80e0-b1e5-f2a861954669'],
  categories: ['NOTION_FINANCE_CATEGORIES_DATABASE_ID',''],
  transactions: ['NOTION_FINANCE_TRANSACTIONS_DATABASE_ID',''],
  diary: ['NOTION_DIARY_DATABASE_ID', ''],
  inbox: ['NOTION_INBOX_DATABASE_ID', ''],
  tasks: ['NOTION_TASKS_DATABASE_ID', '3ec530f0-f112-803b-a108-f7778cdee362'],
};
const LABELS = { mediaSections:'Seções de entretenimento',media:'Entretenimento', habits:'Hábitos',habitLogs:'Registros de hábitos', shopping:'Listas de compras', projects: 'Projetos', milestones: 'Marcos', tasks: 'Tarefas', inbox: 'Inbox', diary: 'Diário', contacts:'Aniversários', categories:'Categorias financeiras', transactions:'Lançamentos financeiros' };
const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const schemaCache = new Map();
export const TASK_STATUS = { todo: 'Não iniciada', doing: 'Em andamento', hold: 'On hold', done: 'Concluída' };
export const PROJECT_STATUS = { active: 'Ativo', paused: 'Pausado', done: 'Concluído', cancelled: 'Cancelado' };
export const PRIORITY = { high: 'Alta', medium: 'Média', low: 'Baixa' };
export const CONTEXT = { work: 'Trabalho', personal: 'Pessoal' };
const FIELDS = {
  mediaSections:{name:['Nome','title'],type:['Tipo','rich_text'],icon:['Ícone','rich_text'],color:['Cor','rich_text']},
  media:{completedOn:['Concluído em','date'],platforms:['Plataformas','rich_text'],year:['Ano','number'],name:['Nome','title'],section:['Seção','relation'],author:['Autor','rich_text'],status:['Status','select'],rating:['Avaliação','number'],comment:['Comentário','rich_text'],coverUrl:['URL da capa','rich_text'],sourceUrl:['Link de origem','rich_text'],provider:['Fonte','rich_text'],attachments:['Capa','files']},
  habits:{archived:['Encerrado','checkbox'],name:['Nome','title'],context:['Contexto','select'],color:['Cor','rich_text'],icon:['Ícone','rich_text'],start:['Início','date']},
  habitLogs:{name:['Nome','title'],habit:['Hábito','relation'],date:['Data','date']},
  shopping:{name:['Nome','title'],context:['Contexto','select'],items:['Itens','rich_text']},
  contacts:{name:['Nome','title'],day:['Dia','number'],month:['Mês','number'],year:['Ano de nascimento','number']},
  categories:{ name:['Nome','title'],flow:['Tipo','select'] },
  transactions:{ name:['Nome','title'],category:['Categoria','relation'],date:['Data','date'],amount:['Valor','number'],notes:['Observação','rich_text'] },
  diary: { name: ['Nome','title'], date: ['Data','date'], text: ['Conteúdo','rich_text'], attachments: ['Anexos','files'] },
  inbox: { name: ['Nome','title'], text: ['Conteúdo','rich_text'] },
  projects: { name: ['Nome','title'], status: ['Status','select','status'], context: ['Contexto','select'], area: ['Área','select'], due: ['Prazo final','date'], description: ['Descrição','rich_text'], attachments: ['Anexos','files'] },
  milestones: { title: ['Nome','title'], project: ['Projeto','relation'], due: ['Prazo','date'], done: ['Concluído','checkbox'], order: ['Ordem','number'] },
  tasks: { title: ['Nome','title'], status: ['Status','select','status'], priority: ['Prioridade','select'], context: ['Contexto','select'], project: ['Projeto','relation'], milestone: ['Marco','relation'], start: ['Início','date'], due: ['Prazo','date'], waitingOn: ['Aguardando','rich_text'], followUp: ['Cobrar em','date'], notes: ['Anotações','rich_text'], completedAt: ['Concluída em','date'], attachments: ['Anexos','files'] },
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function notion(path, { method = 'GET', body, multipart = false } = {}) {
  if (!process.env.NOTION_TOKEN) throw new AppError('NOTION_TOKEN não está configurado no servidor.', 503);
  for (let attempt = 0; attempt < 4; attempt++) {
    let response;
    try {
      response = await fetch(`${API}${path}`, { method, cache: 'no-store', signal: AbortSignal.timeout(25000), headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': VERSION, ...(!multipart ? { 'Content-Type': 'application/json' } : {}) }, ...(body !== undefined ? { body: multipart ? body : JSON.stringify(body) } : {}) });
    } catch { throw new AppError('A conexão com o Notion falhou. Suas alterações continuam no navegador; tente salvar novamente.', 502); }
    if (response.status === 429 && attempt < 3) { await pause(Math.min(Number(response.headers.get('retry-after') || 1) * 1000, 5000)); continue; }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) throw new AppError('O token do Notion é inválido. Verifique NOTION_TOKEN na Vercel.', 502);
      if (response.status === 403 || response.status === 404) throw new AppError('O Notion não permitiu acessar o banco ou registro. Confira o acesso da conexão LifeOS e os bancos configurados.', 502);
      throw new AppError(`Notion: ${data.message || 'não foi possível concluir a operação'}`, response.status === 429 ? 429 : 502);
    }
    return data;
  }
}
export async function schema(kind, tracking = false) {
  const cached = schemaCache.get(kind);
  if (cached && cached.until > Date.now() && (!tracking || cached.tracking)) return cached;
  const databaseId = process.env[DB[kind][0]] || DB[kind][1];
  if (!databaseId) throw new AppError(`Configure ${DB[kind][0]} na Vercel com o ID do banco ${LABELS[kind]}.`, 503);
  const database = await notion(`/databases/${databaseId}`);
  const explicit = process.env[kind==='media'?'NOTION_MEDIA_DATA_SOURCE_ID':kind==='mediaSections'?'NOTION_MEDIA_SECTIONS_DATA_SOURCE_ID':`NOTION_${kind === 'projects' ? 'PROJECTS' : kind === 'tasks' ? 'TASKS' : kind === 'inbox' ? 'INBOX' : kind === 'diary' ? 'DIARY' : kind === 'categories' ? 'FINANCE_CATEGORIES' : kind === 'transactions' ? 'FINANCE_TRANSACTIONS' : kind === 'habits' ? 'HABITS' : kind === 'habitLogs' ? 'HABIT_LOGS' : kind === 'shopping' ? 'SHOPPING' : kind === 'contacts' ? 'CONTACTS' : 'MILESTONES'}_DATA_SOURCE_ID`];
  const sourceId = explicit || (database.data_sources?.length === 1 ? database.data_sources[0].id : null);
  if (!sourceId) throw new AppError(`O banco ${LABELS[kind]} tem mais de uma fonte de dados. Configure seu DATA_SOURCE_ID na Vercel.`, 422);
  let source = await notion(`/data_sources/${sourceId}`);
  if (tracking && !Object.values(source.properties).some(property => property.name === 'LifeOS ID')) {
    source = await notion(`/data_sources/${sourceId}`, { method: 'PATCH', body: { properties: { 'LifeOS ID': { rich_text: {} } } } });
  }
  if(kind==='transactions' && tracking && !Object.values(source.properties).some(property=>normalize(property.name)==='observacao')) source=await notion(`/data_sources/${sourceId}`,{method:'PATCH',body:{properties:{'Observação':{rich_text:{}}}}});
  const additions={};
  if(kind==='media'&&!Object.values(source.properties).some(p=>normalize(p.name)==='concluido em'))additions['Concluído em']={date:{}};
  if(kind==='habits'&&!Object.values(source.properties).some(p=>normalize(p.name)==='encerrado'))additions.Encerrado={checkbox:{}};
  if(kind==='media'&&!Object.values(source.properties).some(p=>normalize(p.name)==='plataformas'))additions.Plataformas={rich_text:{}};
  if(kind==='media'&&!Object.values(source.properties).some(p=>normalize(p.name)==='ano')) additions.Ano={number:{}};
  for(const [name,type] of (PRIVATE_KINDS.includes(kind)?[['LifeOS Usuário','rich_text']]:[['LifeOS Último editor','rich_text'],['LifeOS Editado em','date']])){
    const existing=Object.values(source.properties).find(p=>p.name===name);if(!existing)additions[name]={[type]:{}};else if(existing.type!==type)throw new AppError(`O campo ${name} deve ser ${type==='date'?'Data':'Texto'}.`,422);
  }
  if(Object.keys(additions).length)source=await notion(`/data_sources/${sourceId}`,{method:'PATCH',body:{properties:additions}});
  const fields = {};
  for (const [key, [label, ...types]] of Object.entries(FIELDS[kind])) {
    const property = Object.values(source.properties).find(property => normalize(property.name) === normalize(label) || (kind==='transactions' && key==='date' && normalize(property.name)==='mes'));
    if (!property && kind==='transactions' && key==='notes' && !tracking) continue;
    if (!property || !types.includes(property.type)) throw new AppError(`No banco ${LABELS[kind]}, crie ou ajuste “${label}” para o tipo ${types.map(type => ({title:'Título',rich_text:'Texto',select:'Selecionar',status:'Status',relation:'Relação',date:'Data',number:'Número',checkbox:'Caixa de seleção',files:'Arquivos e mídia'}[type])).join(' ou ')}.`, 422);
    fields[key] = property;
  }
  const trackingProperty = Object.values(source.properties).find(property => property.name === 'LifeOS ID');
  if (trackingProperty && trackingProperty.type !== 'rich_text') throw new AppError(`“LifeOS ID” em ${LABELS[kind]} deve ser do tipo Texto.`, 422);
  const result = { owner:Object.values(source.properties).find(p=>p.name==='LifeOS Usuário'),editor:Object.values(source.properties).find(p=>p.name==='LifeOS Último editor'),edited:Object.values(source.properties).find(p=>p.name==='LifeOS Editado em'),id: sourceId, databaseId, fields, tracking: trackingProperty, until: Date.now() + 60000 };
  schemaCache.set(kind, result);
  return result;
}
export async function queryAll(sourceId) {
  const result = []; let cursor;
  do {
    const page = await notion(`/data_sources/${sourceId}/query`, { method: 'POST', body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) } });
    result.push(...page.results.filter(row => !row.in_trash && !row.archived));
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return result;
}
export const plain = list => (list || []).map(item => item.plain_text ?? item.text?.content ?? '').join('');
function read(page, property) {
  const value = page.properties[property.name];
  switch (property.type) {
    case 'title': return plain(value?.title);
    case 'rich_text': return plain(value?.rich_text);
    case 'select': return value?.select?.name || '';
    case 'status': return value?.status?.name || '';
    case 'date': return value?.date?.start || null;
    case 'relation': return value?.relation?.[0]?.id || null;
    case 'checkbox': return !!value?.checkbox;
    case 'number': return value?.number ?? 0;
    case 'files': return value?.files || [];
    default: return null;
  }
}
function reverse(map, label, field) {
  if (!label) return Object.keys(map)[0];
  const match = Object.entries(map).find(([, value]) => normalize(value) === normalize(label));
  if (!match) throw new AppError(`A opção “${label}” no campo ${field} não existe na v3. Use: ${Object.values(map).join(', ')}.`, 422);
  return match[0];
}
export function decode(kind, page, source) {
  const object = { id: page.id, _notionId: page.id, _editedAt: page.last_edited_time };
  for (const [key, property] of Object.entries(source.fields)) object[key] = read(page, property);
  if (kind === 'inbox') { object.createdAt = page.created_time ? Date.parse(page.created_time) : 0; object.legacyId = source.tracking ? plain(page.properties[source.tracking.name]?.rich_text) : ''; }
  if(kind==='shopping')object.items=decodeShoppingItems(object.items);
  if (kind==='contacts'||kind==='media') object.year=object.year || null;
  if (kind === 'categories') object.flow=reverse({in:'Entrada',out:'Saída'},object.flow,'Tipo');
  if (kind === 'transactions') { object.date=object.date?.slice(0,10) || '';object.amount=Math.round(object.amount*100);object.notes=object.notes || ''; }
  if (object.status !== undefined) object.status = reverse(kind === 'media' ? MEDIA_STATUS : kind === 'tasks' ? TASK_STATUS : PROJECT_STATUS, object.status, 'Status');
  if (object.context !== undefined) object.context = reverse(CONTEXT, object.context, 'Contexto');
  if (object.priority !== undefined) object.priority = object.priority ? reverse(PRIORITY, object.priority, 'Prioridade') : 'medium';
  if (object.completedAt !== undefined) object.completedAt = object.completedAt ? Date.parse(object.completedAt) : null;
  for (const key of ['due','start','followUp','date']) if (object[key]) object[key] = object[key].slice(0,10);
  if (object.attachments) object.attachments = object.attachments.map((file, index) => ({ id: `notion_${index}_${file.name}`, name: file.name, url: file[file.type]?.url || '', notion: file, index, pageId: page.id, kind }));
  return object;
}
export async function readSnapshot(tracking = false,user = null, selectedKinds = null) {
  const schemas = {}, rows = {}, objects = {};
  for (const kind of ['projects','milestones','tasks','inbox','diary','categories','transactions','contacts','shopping','habits','habitLogs','mediaSections','media']) {
    if (['media','mediaSections'].includes(kind) && !(process.env.NOTION_MEDIA_DATABASE_ID && process.env.NOTION_MEDIA_SECTIONS_DATABASE_ID)) {rows[kind]=[];objects[kind]=[];continue;}
    if (selectedKinds && !selectedKinds.has(kind)) { rows[kind]=[];objects[kind]=[];continue; }
    if(['habits','habitLogs'].includes(kind)&&!(process.env.NOTION_HABITS_DATABASE_ID&&process.env.NOTION_HABIT_LOGS_DATABASE_ID)){rows[kind]=[];objects[kind]=[];continue;}
    if(kind==='shopping'&&!process.env.NOTION_SHOPPING_DATABASE_ID){rows.shopping=[];objects.shopping=[];continue;}
    if(kind==='contacts' && !process.env.NOTION_CONTACTS_DATABASE_ID){rows.contacts=[];objects.contacts=[];continue;}
    if (['categories','transactions'].includes(kind) && !(process.env.NOTION_FINANCE_CATEGORIES_DATABASE_ID && process.env.NOTION_FINANCE_TRANSACTIONS_DATABASE_ID)) { rows[kind]=[];objects[kind]=[];continue; }
    if (kind === 'diary' && !process.env.NOTION_DIARY_DATABASE_ID) { rows.diary=[];objects.diary=[];continue; }
    schemas[kind] = await schema(kind, tracking);
    rows[kind] = await queryAll(schemas[kind].id);
    rows[kind]=rows[kind].filter(row=>canRead(kind,row,schemas[kind],user));
    objects[kind] = rows[kind].map(row => decode(kind, row, schemas[kind]));
  }
  if(user){
    const sectionIds=new Set(objects.mediaSections.map(p=>p.id));objects.media=objects.media.filter(p=>sectionIds.has(p.section));const mediaIds=new Set(objects.media.map(p=>p.id));rows.media=rows.media.filter(p=>mediaIds.has(p.id));
    const projectIds=new Set(objects.projects.map(p=>p.id)),milestoneIds=new Set(objects.milestones.filter(p=>projectIds.has(p.project)).map(p=>p.id)),habitIds=new Set(objects.habits.map(p=>p.id));
    objects.milestones=objects.milestones.filter(p=>projectIds.has(p.project));objects.tasks=objects.tasks.filter(p=>(!p.project||projectIds.has(p.project))&&(!p.milestone||milestoneIds.has(p.milestone)));objects.habitLogs=objects.habitLogs.filter(p=>habitIds.has(p.habit));
    for(const kind of ['milestones','tasks','habitLogs']){const ids=new Set(objects[kind].map(p=>p.id));rows[kind]=rows[kind].filter(p=>ids.has(p.id));}
  }
  const projects = objects.projects.map(project => ({ ...project, milestones: objects.milestones.filter(milestone => milestone.project === project.id).sort((a,b) => a.order - b.order).map(({project:_,order:__,...milestone}) => milestone) }));
  const tasks = objects.tasks.map(task => ({ ...task, context: projects.find(project => project.id === task.project)?.context || task.context }));
  for (const [kind,key,target] of [['media','section','mediaSections'],['milestones','project','projects'],['tasks','project','projects'],['tasks','milestone','milestones']]) {
    if (!schemas[kind] || !schemas[target]) continue;
    const relation = schemas[kind].fields[key].relation;
    if (relation.data_source_id ? relation.data_source_id !== schemas[target].id : relation.database_id !== schemas[target].databaseId) throw new AppError(`A relação “${schemas[kind].fields[key].name}” em ${LABELS[kind]} precisa apontar para ${LABELS[target]}.`,422);
  }
  if (schemas.transactions) { const relation=schemas.transactions.fields.category.relation;if (relation.data_source_id ? relation.data_source_id!==schemas.categories.id : relation.database_id!==schemas.categories.databaseId) throw new AppError('A relação Categoria dos lançamentos precisa apontar para Categorias financeiras.',422); }
  return { state: { mediaSections:objects.mediaSections,media:objects.media,mediaConfigured:!!schemas.media&&!!schemas.mediaSections,projects, tasks, habits:objects.habits,habitLogs:objects.habitLogs,habitsConfigured:!!schemas.habitLogs, shopping:objects.shopping,shoppingConfigured:!!schemas.shopping, contacts:objects.contacts,contactsConfigured:!!schemas.contacts, categories:objects.categories,transactions:objects.transactions,financeConfigured:!!schemas.transactions, diary:objects.diary, diaryConfigured:!!process.env.NOTION_DIARY_DATABASE_ID, inbox: objects.inbox.sort((a,b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id)) }, schemas, rows };
}
export const entityFields = kind => Object.keys(FIELDS[kind]);
export function encode(kind, object, source, keys = entityFields(kind)) {
  if (kind === 'transactions') {object={...object,name:object.name || 'Lançamento'};}
  if (kind === 'diary') {
    object = {...object,name:object.date ? object.date.split('-').reverse().join('/') : 'Diário'};
    if (keys.includes('date') && !keys.includes('name')) keys=[...keys,'name'];
  }
  if (kind === 'inbox') {
    object = { ...object, name: String(object.text || '').split('\n')[0].trim().slice(0,200) || 'Entrada do Inbox' };
    if (keys.includes('text') && !keys.includes('name')) keys = [...keys,'name'];
  }
  const properties = {};
  for (const key of keys) {
    const property = source.fields[key];
    let value = object[key];
    if(kind==='shopping'&&key==='items')value=JSON.stringify(value||[]);
    if (key === 'flow') value={in:'Entrada',out:'Saída'}[value];
    if (key === 'amount') value=value/100;
    if (key === 'status') value = (kind === 'media' ? MEDIA_STATUS : kind === 'tasks' ? TASK_STATUS : PROJECT_STATUS)[value];
    if (key === 'priority') value = PRIORITY[value];
    if (key === 'context') value = CONTEXT[value];
    if (key === 'completedAt') value = value ? new Date(value).toISOString() : null;
    switch(property.type) {
      case 'title': case 'rich_text': {
        const text = String(value || '');
        const chunks = text.match(/[\s\S]{1,2000}/g) || [];
        properties[property.name] = { [property.type]: chunks.map(content => ({ text: { content } })) };
        break;
      }
      case 'select': case 'status': properties[property.name] = { [property.type]: value ? { name: value } : null }; break;
      case 'date': properties[property.name] = { date: value ? { start: value } : null }; break;
      case 'relation': properties[property.name] = { relation: value ? [{ id: value }] : [] }; break;
      case 'checkbox': properties[property.name] = { checkbox: !!value }; break;
      case 'number': properties[property.name] = { number: (kind==='contacts'||kind==='media')&&key==='year'&&!value?null:Number(value || 0) }; break;
      case 'files': properties[property.name] = { files: (value || []).map(item => item.uploadId ? { name: item.name, type: 'file_upload', file_upload: { id: item.uploadId } } : item.notion?.type === 'file' ? { name:item.name, type:'file', file:{url:item.notion.file.url} } : { name:item.name, type:'external', external:{url:item.notion.external.url} }) }; break;
    }
  }
  return properties;
}
export async function ownedPage(kind, id,user=null) {
  const source = await schema(kind);
  const page = await notion(`/pages/${id}`);
  if (page.parent?.data_source_id ? page.parent.data_source_id !== source.id : page.parent?.database_id !== source.databaseId) throw new AppError('Esse registro não pertence ao banco configurado.', 403);
  ensureAccess(kind,page,source,user);
  return { page, source };
}
export async function uploadFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new AppError('Selecione um arquivo.');
  if (file.size > 4 * 1024 * 1024) throw new AppError('O limite de envio pelo app é 4 MB por arquivo. Envie arquivos maiores diretamente no Notion.', 413);
  const created = await notion('/file_uploads', { method: 'POST', body: { mode: 'single_part', filename: file.name, content_type: file.type || 'application/octet-stream' } });
  const form = new FormData(); form.append('file', file, file.name);
  const result = await notion(`/file_uploads/${created.id}/send`, { method: 'POST', body: form, multipart: true });
  if (result.status !== 'uploaded') throw new AppError('O Notion não concluiu o envio do arquivo.', 502);
  return { uploadId: created.id, name: file.name };
}
