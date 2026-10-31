import {validateFollowup} from '../followups';
import {validateDiary} from '../diary';
import {validateReference,referenceCatalogError} from '../reference';
import {validateSomeday,normalizeAreaName} from '../someday';
import {validateNutrition} from '../nutrition';
import {patchTask,closeProjectTask,sameCompletionTime} from '../tasks';
import {normalizeStationName,validateVehicleRecord,vehicleReferencesError,odometerError} from '../vehicles';
import {validateWellness} from '../wellness';
import {RESPONSIBLES} from '../sharing';
import {MEDIA_STATUS,validMedia,validMediaSection,sectionValidationError} from '../entertainment';
import {PRIVATE_KINDS,SHARED_KINDS,ensureAccess} from './access';
import {seal,unseal} from './auth';
import {saveSharedActivity} from './coordination';
import {validHabit,habitToday} from '../habits';
import {validateShopping} from '../shopping';
import { validateBirthday } from '../birthdays';
import { normalizeTransaction } from '../finance';
import { AppError,legacyEmail,allowedEmails } from './auth';
import { diffState, flattenMilestones, sameField } from '../notionDiff';
import { readSnapshot, notion, encode, plain, TASK_STATUS, PROJECT_STATUS, PRIORITY, CONTEXT, decode,entityFields } from './notion';

const attachmentSignature = files => (files || []).map(file => [file.name,file.notion?.type || (file.uploadId ? 'file_upload' : ''),(file.notion?.[file.notion.type]?.url || '').split('?')[0]]);
const sameRemoteField = (key,actual,candidate) => key==='completedAt' ? sameCompletionTime(actual,candidate) : sameField(key,actual,candidate);

function validateState(state) {
  if (!state || !Array.isArray(state.projects) || !Array.isArray(state.tasks) || !Array.isArray(state.diary) || !Array.isArray(state.inbox) || state.projects.length + state.tasks.length + state.inbox.length + state.diary.length > 5000) throw new AppError('Estrutura de dados inválida ou muito grande.');
  if (!Array.isArray(state.mediaSections||[]) || !Array.isArray(state.media||[]) || (state.mediaSections||[]).length>100 || (state.media||[]).length>5000) throw new AppError('Coleção de entretenimento inválida ou muito grande.');
  if(!Array.isArray(state.nutrition||[])||(state.nutrition||[]).length>10000)throw new AppError('Há registros demais de acompanhamento.');
  if(!Array.isArray(state.vehicles||[])||(state.vehicles||[]).length>10000)throw new AppError('Há registros demais de veículos nesta solicitação.');
  if(!Array.isArray(state.reference||[])||(state.reference||[]).length>5000)throw new AppError('Biblioteca inválida ou muito grande.',422);
  const categories=new Map((state.categories || []).map(item=>[item.id,item]));
  const projects = new Map(state.projects.map(item => [item.id,item]));
  const milestones = new Map(flattenMilestones(state).map(item => [item.id,item]));
  for (const [kind, list] of [['reference',state.reference||[]],['someday',state.someday||[]],['nutrition',state.nutrition||[]],['vehicles',state.vehicles||[]],['mediaSections',state.mediaSections||[]],['media',state.media||[]],['projects',state.projects],['milestones',[...milestones.values()]],['tasks',state.tasks],['inbox',state.inbox],['diary',state.diary],['categories',state.categories || []],['transactions',state.transactions || []],['contacts',state.contacts || []],['shopping',state.shopping || []],['habits',state.habits || []],['habitLogs',state.habitLogs || []],['wellness',state.wellness||[]],['cycle',state.cycle||[]]]) {
    const ids = new Set();
    for (const item of list) {
      if (typeof item.id !== 'string' || item.id.length > 200 || ids.has(item.id)) throw new AppError('Identificador de registro inválido.');
      ids.add(item.id);
      const name = (kind === 'inbox' || kind === 'diary') ? item.text : item.title ?? item.name;
      if (typeof name !== 'string' || name.length > (kind==='diary'&&item.doc?30000:10000)) throw new AppError('Nome ou título inválido.');
      if(kind==='tasks'){const error=validateFollowup(item);if(error)throw new AppError(error,422);}
      if(kind==='tasks'&&item.locked!=null&&typeof item.locked!=='boolean')throw new AppError('Estado de bloqueio da tarefa inválido.',422);
      if(['projects','tasks'].includes(kind)){if(item.shared!=null&&typeof item.shared!=='boolean')throw new AppError('Compartilhamento inválido.');if(kind==='tasks'&&item.shared&&!RESPONSIBLES.some(p=>p.email===item.responsible))throw new AppError('Selecione um dos dois responsáveis.',422);if(kind==='tasks'&&item.project&&!!item.shared!==!!projects.get(item.project)?.shared)throw new AppError('O compartilhamento da tarefa deve seguir o projeto.',422);}
      if(kind==='mediaSections'&&!validMediaSection(item))throw new AppError(`A seção “${item.name?.trim()||'sem nome'}” precisa ser ajustada. ${sectionValidationError(item)}`);
      if(kind==='media'&&(!validMedia(item)||!(state.mediaSections||[]).some(p=>p.id===item.section)))throw new AppError('Conteúdo, seção, avaliação ou capa inválidos.');
      if(kind==='reference'){const message=validateReference(item);if(message)throw new AppError(message,422);}
      if(kind==='someday'){const message=validateSomeday(item);if(message)throw new AppError(message,422);}
      if(kind==='nutrition'){const message=validateNutrition(item);if(message)throw new AppError(message);}
      if(kind==='vehicles'){const message=validateVehicleRecord(item);if(message)throw new AppError(message);}
      if(['wellness','cycle'].includes(kind)){const message=validateWellness(item,kind);if(message)throw new AppError(message);}
      if(kind==='habits'){const error=validHabit(item);if(error)throw new AppError(error);}
      if(kind==='habitLogs'){const habit=(state.habits||[]).find(p=>p.id===item.habit);if(!habit||!item.date||item.date<habit.start||item.date>habitToday())throw new AppError('Registro de hábito ou data inválidos.');}
      if(kind==='shopping'){const error=validateShopping(item);if(error)throw new AppError(error);}
      if(kind==='contacts'){const error=validateBirthday(item);if(error)throw new AppError(error);}
      if(kind==='categories'&&item.archived!=null&&typeof item.archived!=='boolean')throw new AppError('Estado da categoria inválido.');
      if (kind==='categories' && (!['in','out'].includes(item.flow) || !item.name.trim() || item.name.length>100)) throw new AppError('Informe o nome da categoria e Entrada ou Saída.');
      if (kind==='transactions' && (!categories.has(item.category) || !item.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number(item.date.slice(0,4))<1000 || !Number.isSafeInteger(item.amount) || item.amount<=0 || item.amount>1000000000000)) throw new AppError('Informe categoria, data válida e valor positivo com até duas casas decimais.');
      if (kind==='transactions' && (typeof item.notes!=='string' || item.notes.length>10000)) throw new AppError('A observação deve ter até 10.000 caracteres.');
      if (item.status && !(kind === 'media' ? MEDIA_STATUS : kind === 'tasks' ? TASK_STATUS : PROJECT_STATUS)[item.status]) throw new AppError('Status inválido.');
      if (item.context && !CONTEXT[item.context]) throw new AppError('Contexto inválido.');
      if (kind === 'tasks' && !PRIORITY[item.priority]) throw new AppError('Prioridade inválida.');
      for (const key of ['due','start','followUp','date']) {
        const value = item[key];
        if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw new AppError('Data inválida.');
      }
      if(kind==='diary'){const error=validateDiary(item);if(error)throw new AppError(error,422);}
      if (kind === 'diary' && !item.date) throw new AppError('Informe a data da entrada do Diário.');
      if (item.project && !projects.has(item.project)) throw new AppError('O projeto vinculado não existe.');
      if (item.milestone && (!milestones.has(item.milestone) || milestones.get(item.milestone).project !== item.project)) throw new AppError('O marco precisa pertencer ao mesmo projeto da tarefa.');
      if (kind === 'milestones') {
        const project = projects.get(item.project);
        if (!project) throw new AppError('O marco precisa de um projeto.');
        if (project.due && item.due && item.due > project.due) throw new AppError(`O marco “${item.title}” ultrapassa o prazo final do projeto.`);
      }
      if(kind==='inbox'&&item.attachments?.some?.(file=>!/^inbox-[\da-f-]+\.(png|jpg|webp|gif)$/i.test(file.name||'')))throw new AppError('Imagem do Inbox inválida.',422);
      if (item.attachments && (!Array.isArray(item.attachments) || item.attachments.length > 100 || item.attachments.some(file => !file.name || (!file.uploadId && !file.notion)))) throw new AppError('Anexo inválido ou ainda não enviado.');
    }
  }
}
// Include relation dependencies as a group; unrelated banks are never queried.
export function synchronizationKinds(changes) {
  const kinds = new Set(Object.keys(changes).filter(kind => changes[kind].upserts.length || changes[kind].deletions.length));
  for (const group of [['projects','milestones','tasks'],['categories','transactions'],['habits','habitLogs'],['mediaSections','media']]) {
    if (group.some(kind => kinds.has(kind))) for (const kind of group) kinds.add(kind);
  }
  return kinds;
}
export async function synchronize(base, next,user=null,guard=async()=>{},partial=false) {
  next={...next,transactions:(next?.transactions || []).map(normalizeTransaction)};
  base={...base,transactions:(base?.transactions || []).map(normalizeTransaction)};
  validateState(next);
  for(const kind of ['wellness','cycle']){const list=next[kind]||[];if(list.length>5000)throw new AppError('Há registros demais nesta solicitação.');const daily=list.filter(p=>kind==='cycle'||p.type==='day');if(new Set(daily.map(p=>p.date)).size!==daily.length)throw new AppError('Já existe um registro diário nesta data.');}
  if (!base || !Array.isArray(base.projects) || !Array.isArray(base.tasks)) throw new AppError('Base de sincronização inválida.');
  if (new Set(next.diary.map(item => item.date)).size !== next.diary.length) throw new AppError('O Diário aceita apenas uma entrada por dia.');
  let changes = diffState(base,next);
  // Resolve fontes e registros existentes antes de escrever. O campo técnico evita duplicatas após uma falha parcial.
  const selectedKinds = synchronizationKinds(changes);
  const remote = await readSnapshot(true,user,selectedKinds,partial?{base,next}:null);
  // Delete every current child, including rows added in another instance.
  if(changes.projects.deletions.length){
    base={...base,projects:base.projects.map(p=>({...p,milestones:[...(p.milestones||[])]})),tasks:[...base.tasks]};next={...next,tasks:[...next.tasks]};
    for(const project of changes.projects.deletions){
      const remoteId=project._notionId||project.id;
      if(remote.state.tasks.some(t=>t.project===remoteId&&t.locked))throw new AppError('Desbloqueie as tarefas deste projeto e aguarde o salvamento antes de excluí-lo.',409);
      const before=base.projects.find(p=>p.id===project.id),actual=remote.state.projects.find(p=>p.id===remoteId);
      for(const milestone of actual?.milestones||[])if(!before.milestones.some(m=>m.id===milestone.id||m._notionId===milestone.id))before.milestones.push(milestone);
      for(const task of remote.state.tasks.filter(t=>t.project===remoteId)){
        if(!base.tasks.some(t=>t.id===task.id||t._notionId===task.id))base.tasks.push({...task,project:project.id});
        next.tasks=next.tasks.filter(t=>t.id!==task.id&&t._notionId!==task.id);
      }
      next.tasks=next.tasks.filter(t=>t.project!==project.id&&t.project!==remoteId);
    }
    changes=diffState(base,next);
  }
  // Sharing transitions include children added by another instance since the last read.
  if(partial){
    base={...base,projects:base.projects.map(p=>({...p,milestones:[...(p.milestones||[])]})),tasks:[...base.tasks]};
    next={...next,projects:next.projects.map(p=>({...p,milestones:[...(p.milestones||[])]})),tasks:[...next.tasks]};
    for(const {item,keys} of changes.projects.upserts)if(keys.includes('shared')){
      const before=base.projects.find(p=>p.id===item.id),after=next.projects.find(p=>p.id===item.id),remoteId=item._notionId||item.id;
      if(!before)continue;
      const remoteProject=remote.state.projects.find(p=>p.id===remoteId);
      for(const milestone of remoteProject?.milestones||[])if(!before.milestones.some(m=>m.id===milestone.id||m._notionId===milestone.id)){
        before.milestones.push(milestone);after.milestones.push(milestone);
      }
      for(const task of remote.state.tasks.filter(t=>t.project===remoteId))if(!base.tasks.some(t=>t.id===task.id||t._notionId===task.id)){
        const original={...task,project:item.id};base.tasks.push(original);next.tasks.push({...original,shared:!!after.shared,responsible:after.shared?(task.responsible||user?.email||RESPONSIBLES[0].email):''});
      }
    }
    validateState(next);changes=diffState(base,next);
  }
  // Closing as done/cancelled includes current children, even from another device.
  const completingProjects = new Set();
  for (const {item,keys} of changes.projects.upserts) {
    const before = base.projects.find(p => p.id === item.id);
    if (keys.includes('status') && ['done','cancelled'].includes(item.status) && before?.status !== item.status) completingProjects.add(item.id);
  }
  if (completingProjects.size) {
    for(const id of completingProjects){const project=next.projects.find(p=>p.id===id),remoteId=project._notionId||id;for(const task of remote.state.tasks.filter(t=>t.project===remoteId&&t.status!=='done'&&t.locked)){const desired=next.tasks.find(t=>(t._notionId||t.id)===task.id),previous=base.tasks.find(t=>t.id===desired?.id);if(!desired||!previous?.locked||desired.locked!==false)throw new AppError('Desbloqueie as tarefas pendentes deste projeto antes de concluí-lo ou cancelá-lo.',409);}}
    base = {...base, projects:base.projects.map(p=>({...p,milestones:[...(p.milestones||[])]})), tasks:[...base.tasks]};
    next = {...next, projects:next.projects.map(p=>({...p,milestones:[...(p.milestones||[])]})), tasks:[...next.tasks]};
    for (const id of completingProjects) {
      const before = base.projects.find(p=>p.id===id), after = next.projects.find(p=>p.id===id);
      const remoteId = after._notionId || id, actual = remote.state.projects.find(p=>p.id===remoteId);
      if (before) for (const milestone of actual?.milestones || []) {
        if (!before.milestones.some(m=>m.id===milestone.id||m._notionId===milestone.id)) before.milestones.push(milestone);
        if (!after.milestones.some(m=>m.id===milestone.id||m._notionId===milestone.id)) after.milestones.push(milestone);
      }
      after.milestones = after.milestones.map(m=>m.done?m:{...m,done:true});
      for (const task of remote.state.tasks.filter(t=>t.project===remoteId)) {
        if (!base.tasks.some(t=>t.id===task.id||t._notionId===task.id)) {
          const milestone = after.milestones.find(m=>m.id===task.milestone||m._notionId===task.milestone);
          const original = {...task, project:id, milestone:milestone?.id || task.milestone};
          base.tasks.push(original); next.tasks.push(original);
        }
      }
      next.tasks = next.tasks.map(t=>{
        if (t.project!==id) return t;
        const saved = remote.state.tasks.find(r=>r.id===(t._notionId||t.id));
        const previous = base.tasks.find(r=>r.id===t.id);
        // A retry can carry 'done' from the UI while a previous attempt already
        // saved this child. Keep the confirmed completion instead of inventing
        // a new date or conflicting with our own partially committed operation.
        if(saved?.status==='done'&&previous?.status!=='done')return {...t,status:'done',completedAt:saved.completedAt,recurrence:saved.recurrence??null};
        if(t.status==='done')return t;
        const completed = closeProjectTask(t);
        return saved?.status==='done' ? {...completed,completedAt:saved.completedAt} : completed;
      });
    }
    validateState(next); changes = diffState(base,next);
  }
  if(changes.reference.upserts.length||changes.reference.deletions.length){
    if(!remote.schemas.reference)throw new AppError('Configure NOTION_REFERENCE_DATABASE_ID na Vercel.',503);
    const source=remote.schemas.reference,physical=item=>item._notionId||remote.rows.reference.find(row=>plain(row.properties[source.tracking.name]?.rich_text)===item.id)?.id||item.id;
    const all=new Map(remote.state.reference.map(item=>[item.id,item]));
    for(const item of changes.reference.deletions)all.delete(physical(item));
    for(const item of next.reference||[])all.set(physical(item),item);
    const combined=[...all.values()],message=referenceCatalogError(combined);if(message)throw new AppError(message,422);
    for(const {item} of changes.reference.upserts){
      const before=(base.reference||[]).find(r=>r.id===item.id)||remote.state.reference.find(r=>r.id===physical(item)),category=combined.find(c=>c.type==='category'&&c.data.uid===item.data.category);
      if(before&&(before.type!==item.type||before.data.uid!==item.data.uid))throw new AppError('O tipo e identificador da referência não podem mudar.',422);
      if(item.type==='material'&&category?.data.archived&&before?.data.category!==item.data.category)throw new AppError('Reative a categoria antes de selecioná-la.',422);
    }
  }
  if(changes.someday.upserts.length||changes.someday.deletions.length){
    if(!remote.schemas.someday)throw new AppError('Configure NOTION_SOMEDAY_DATABASE_ID na Vercel.',503);
    const source=remote.schemas.someday;
    const physical=item=>item._notionId||remote.rows.someday.find(row=>plain(row.properties[source.tracking.name]?.rich_text)===item.id)?.id||item.id;
    const all=new Map(remote.state.someday.map(item=>[item.id,item]));
    for(const item of changes.someday.deletions)all.delete(physical(item));
    for(const item of next.someday||[])all.set(physical(item),item);
    const combined=[...all.values()],areas=combined.filter(r=>r.type==='area');
    if(combined.length>5000||new Set(combined.map(r=>r.data.uid)).size!==combined.length)throw new AppError('Há uma ideia/área repetida. Atualize os dados antes de continuar.',409);
    if(areas.length>100)throw new AppError('Use até 100 áreas de interesse.',422);
    const active=areas.filter(r=>!r.data.archived).map(r=>normalizeAreaName(r.name));
    if(new Set(active).size!==active.length)throw new AppError('Já existe uma área com esse nome. Use ou edite a existente.',409);
    for(const item of combined)if(item.type==='idea'&&item.data.area&&!areas.some(a=>a.data.uid===item.data.area))throw new AppError('A área desta ideia não existe. Atualize e escolha outra área.',422);
    for(const {item} of changes.someday.upserts){
      if(item.type==='idea'&&!item.data.area)throw new AppError('Escolha uma área para salvar a ideia.',422);
      const before=(base.someday||[]).find(r=>r.id===item.id);
      if(before&&(before.type!==item.type||before.data.uid!==item.data.uid))throw new AppError('O tipo e identificador da ideia/área não podem mudar.',422);
      const area=areas.find(a=>a.data.uid===item.data.area);
      if(item.type==='idea'&&area?.data.archived&&before?.data.area!==item.data.area)throw new AppError('Reative a área antes de selecioná-la.',422);
    }
  }
  if(changes.nutrition.upserts.length||changes.nutrition.deletions.length){
    if(!remote.schemas.nutrition)throw new AppError('Configure NOTION_NUTRITION_DATABASE_ID na Vercel.',503);
    const all=[...(next.nutrition||[])],removed=new Set(changes.nutrition.deletions.map(p=>p._notionId||p.id));
    for(const r of remote.state.nutrition)if(!removed.has(r.id)&&!all.some(p=>(p._notionId||p.id)===r.id)){
      // A retry is allowed to resolve its original local ID through the tracking field.
      const row=remote.rows.nutrition.find(p=>p.id===r.id);
      const tracked=plain(row.properties[remote.schemas.nutrition.tracking.name]?.rich_text);
      if(!all.some(p=>p.id===tracked))all.push(r);
    }
    for(const key of [p=>p.data.uid,p=>p.type==='day'?'day:'+p.date:p.type==='settings'?'settings':p.data.uid]){
      const seen=new Set();for(const p of all){const k=key(p);if(seen.has(k))throw new AppError('Este dia, alimento ou configuração já foi criado em outra instância. Atualize os dados antes de editar.',409);seen.add(k);}
    }
    for(const {item} of changes.nutrition.upserts){const before=(base.nutrition||[]).find(p=>p.id===item.id);if(before&&(before.type!==item.type||before.data.uid!==item.data.uid||before.type==='day'&&before.date!==item.date))throw new AppError('O tipo, identificador e dia do acompanhamento não podem mudar.',422);}
  }
  if(changes.vehicles.upserts.length||changes.vehicles.deletions.length){
    if(!remote.schemas.vehicles)throw new AppError('Configure NOTION_VEHICLES_DATABASE_ID na Vercel.',503);
    const physicalId=item=>item._notionId||remote.rows.vehicles.find(row=>plain(row.properties[remote.schemas.vehicles.tracking?.name]?.rich_text)===item.id)?.id||item.id;
    const combinedMap=new Map(remote.state.vehicles.map(item=>[item.id,item]));
    for(const item of changes.vehicles.deletions)combinedMap.delete(physicalId(item));
    for(const item of next.vehicles||[])combinedMap.set(physicalId(item),item);
    const combined=[...combinedMap.values()];
    if(new Set(combined.map(r=>r.data.uid)).size!==combined.length)throw new AppError('Já existe um registro de veículo com este identificador. Atualize os dados.',409);
    const stationNames=combined.filter(r=>r.type==='station').map(r=>normalizeStationName(r.name));if(new Set(stationNames).size!==stationNames.length)throw new AppError('Este posto já está cadastrado. Atualize os dados e use o cadastro existente.',409);
    const refs=vehicleReferencesError(next.vehicles||[]);if(refs)throw new AppError(refs,422);
    for(const removed of changes.vehicles.deletions){if(removed.type==='vehicle'&&combined.some(r=>r.data.vehicle===removed.data.uid))throw new AppError('O veículo deste registro não existe. Exclua seus lançamentos antes de remover o veículo.',422);if(removed.type==='category'&&combined.some(r=>r.data.category===removed.data.uid))throw new AppError('Desative a categoria para preservar os lançamentos existentes.',422);}
    for(const {item} of changes.vehicles.upserts){const previous=(base.vehicles||[]).find(p=>p.id===item.id);if(previous&&(previous.type!==item.type||previous.data.uid!==item.data.uid))throw new AppError('O tipo e o identificador de veículo não podem ser modificados.',422);const normalized=combined.map(r=>({...r,id:physicalId(r)}));const message=odometerError(normalized,{...item,id:physicalId(item)});if(message)throw new AppError(message,422);}
  }
  for(const kind of ['wellness','cycle'])if(changes[kind].upserts.length&&!remote.schemas[kind])throw new AppError('Configure os bancos de Bem-estar na Vercel.',503);
  if ((changes.media.upserts.length||changes.mediaSections.upserts.length) && !remote.schemas.media) throw new AppError('Configure os dois bancos de Entretenimento na Vercel.',503);
  if (changes.diary.upserts.length && !remote.schemas.diary) throw new AppError('Crie o banco Diário e configure NOTION_DIARY_DATABASE_ID na Vercel.',503);
  for (const {item} of changes.diary.upserts) {
    const duplicate=remote.state.diary.find(other => other.date === item.date && other.id !== (item._notionId || item.id));
    if (duplicate && !remote.rows.diary.some(row => row.id === duplicate.id && plain(row.properties[remote.schemas.diary.tracking.name]?.rich_text) === item.id)) throw new AppError('Já existe uma entrada para este dia no Notion. Atualize os dados antes de editar.',409);
  }
  if ((changes.categories.upserts.length || changes.transactions.upserts.length) && !remote.schemas.transactions) throw new AppError('Configure os dois bancos de Finanças na Vercel.',503);
  if(changes.shopping.upserts.length&&!remote.schemas.shopping)throw new AppError('Configure NOTION_SHOPPING_DATABASE_ID na Vercel.',503);
  if(changes.contacts.upserts.length&&!remote.schemas.contacts)throw new AppError('Configure NOTION_CONTACTS_DATABASE_ID na Vercel.',503);
  if((changes.habits.upserts.length||changes.habitLogs.upserts.length)&&!remote.schemas.habitLogs)throw new AppError('Configure os dois bancos de Hábitos na Vercel.',503);
  if(new Set((next.habitLogs||[]).map(p=>p.habit+'|'+p.date)).size!==(next.habitLogs||[]).length)throw new AppError('Um hábito aceita uma marcação por dia.');
  if(user){
    for(const kind of Object.keys(changes))for(const item of [...changes[kind].upserts.map(p=>p.item),...changes[kind].deletions]){
      const id=item._notionId||item.id;
      if(/^[\da-f-]{32,36}$/i.test(id)&&!remote.rows[kind].some(row=>row.id===id)){
        const page=await notion(`/pages/${id}`);ensureAccess(kind,page,remote.schemas[kind],user);
        if(changes[kind].deletions.includes(item)&&(page.in_trash||page.archived)&&page.parent?.data_source_id===remote.schemas[kind].id)continue;
        throw new AppError('O registro não pertence aos dados acessíveis desta seção. Atualize os dados.',403);
      }
      for(const file of item.attachments||[])if(file.uploadId){const proof=unseal(file.uploadProof);if(!proof||proof.user!==user.id||proof.uploadId!==file.uploadId||proof.exp<Date.now())throw new AppError('O anexo ainda não foi autorizado para este usuário. Envie novamente.',403);}
    }
  }
  const bindings = {}, files = {}, owners = {}, taskCompletions = {};
  const byId = {}, byTracking = {};
  for (const kind of ['reference','someday','projects','milestones','tasks','inbox','diary','categories','transactions','contacts','shopping','habits','habitLogs','mediaSections','media','vehicles','wellness','cycle','nutrition']) {
    byId[kind] = new Map(remote.rows[kind].map(row => [row.id,row]));
    const tracking = remote.schemas[kind]?.tracking;
    if (!tracking) { byTracking[kind]=new Map();continue; }
    byTracking[kind] = new Map(remote.rows[kind].map(row => [plain(row.properties[tracking.name]?.rich_text),row]).filter(([id]) => id));
  }
  function existing(kind,item) {
    if (item._notionId) {
      const row = byId[kind].get(item._notionId);
      if (!row) throw new AppError('Um registro foi removido ou mudou de banco no Notion. Atualize os dados antes de continuar.',409);
      return row;
    }
    const tracked=byId[kind].get(item.id) || byTracking[kind].get(item.id);
    if(tracked)return tracked;
    if(kind==='cycle'||(kind==='wellness'&&['day','body'].includes(item.type))){const same=remote.state[kind].find(p=>p.date===item.date&&p.type===item.type);return same?byId[kind].get(same.id):undefined;}
    if(kind!=='habitLogs')return tracked;
    // One logical completion per owner/habit/day, even after a rapid uncheck/recheck.
    const habitId=bindings[item.habit]||item.habit;
    const sameDay=remote.state.habitLogs.find(log=>log.habit===habitId&&log.date===item.date);
    return sameDay?byId[kind].get(sameDay._notionId||sameDay.id):undefined;
  }
  for (const [kind,list] of [['reference',next.reference||[]],['someday',next.someday||[]],['nutrition',next.nutrition||[]],['vehicles',next.vehicles||[]],['mediaSections',next.mediaSections||[]],['media',next.media||[]],['projects',next.projects],['milestones',flattenMilestones(next)],['tasks',next.tasks],['inbox',next.inbox],['diary',next.diary],['categories',next.categories || []],['transactions',next.transactions || []],['contacts',next.contacts || []],['shopping',next.shopping || []],['habits',next.habits || []],['habitLogs',next.habitLogs || []],['wellness',next.wellness||[]],['cycle',next.cycle||[]]]) {
    if (!selectedKinds.has(kind)) continue;
    for (const item of list) { const row = existing(kind,item); if (row) bindings[item.id] = row.id; }
  }
  // Verifica todos os campos alterados antes de iniciar a gravação.
  for (const kind of ['reference','someday','projects','milestones','tasks','inbox','diary','categories','transactions','contacts','shopping','habits','habitLogs','mediaSections','media','vehicles','wellness','cycle','nutrition']) {
    const previous = kind === 'milestones' ? flattenMilestones(base) : base[kind] || [];
    const beforeById = new Map(previous.map(item => [item.id,item]));
    for (const {item,keys} of changes[kind].upserts) {
      const row = existing(kind,item), before = beforeById.get(item.id);
      if(kind==='tasks'&&row){const actual=decode(kind,row,remote.schemas.tasks),unlock=keys.includes('locked')&&item.locked===false;
        const effective={...actual,...Object.fromEntries(keys.map(key=>[key,item[key]]))};const followupError=validateFollowup(effective);if(followupError)throw new AppError(followupError,422);
        if(actual.locked&&!unlock&&keys.some(key=>{if(key==='locked')return false;let desired=item[key];if(['project','milestone'].includes(key))desired=desired?bindings[desired]||desired:null;if(key==='attachments')return JSON.stringify(attachmentSignature(actual[key]))!==JSON.stringify(attachmentSignature(desired));return !sameRemoteField(key,actual[key],desired);}))throw new AppError('Esta tarefa está bloqueada para edição. Atualize os dados e use o cadeado para desbloqueá-la.',409);
      }

      if(kind==='wellness'&&item.type==='body'&&(!before||before.date!==item.date)){const duplicate=(next.wellness||[]).some(p=>p.type==='body'&&p.date===item.date&&p.id!==item.id)||remote.state.wellness.some(p=>p.type==='body'&&p.date===item.date&&p.id!==(row?.id||item._notionId||item.id));if(duplicate)throw new AppError('Já existe um registro de peso e gordura nesta data. Atualize os dados e edite o registro existente.',409);}
      if(kind==='media'&&item.status==='done'&&(!before||before.status!=='done')&&!item.completedOn)throw new AppError('Informe a data de conclusão do conteúdo.',422);
      if(kind==='vehicles'&&row&&!before&&item.data?.importSourceId){const actual=decode(kind,row,remote.schemas[kind]);if(keys.some(key=>!sameField(key,actual[key],item[key])))throw new AppError('Este registro já foi importado e modificado. Atualize os dados; o registro existente foi preservado.',409);}
      if(row&&!before&&['wellness','cycle'].includes(kind)){const actual=decode(kind,row,remote.schemas[kind]);if(keys.some(key=>!sameField(key,actual[key],item[key])))throw new AppError('Este registro já foi criado em outra instância. Atualize antes de editar.',409);}
      if (!row || !before) continue;
      const actual = decode(kind,row,remote.schemas[kind]);
      for (const key of keys) {
        let expected = before[key], value = actual[key], desired = item[key];
        if(kind==='media'&&key==='platforms'){expected=expected||'';desired=desired||'';}
        if (key === 'project' || key === 'milestone' || key === 'category' || key === 'habit' || key === 'section') { expected = expected ? bindings[expected] || expected : null; desired = desired ? bindings[desired] || desired : null; }
        if (key === 'attachments') {
          const signature = attachmentSignature;
          expected=signature(expected);value=signature(value);desired=signature(desired);
          if (JSON.stringify(value)!==JSON.stringify(expected) && JSON.stringify(value)!==JSON.stringify(desired)) throw new AppError('Os anexos foram alterados no Notion por outra edição. Use Atualizar para revisar os dados.',409);
        } else if (!sameRemoteField(key,value,expected) && !sameRemoteField(key,value,desired)) {
          throw new AppError(`O campo “${remote.schemas[kind].fields[key].name}” foi alterado no Notion. Use Atualizar para revisar os dados antes de salvar.`,409);
        }
      }
    }
  }
  for(const kind of Object.keys(changes))for(const item of changes[kind].deletions){
    const row=byId[kind].get(item._notionId||item.id)||byTracking[kind].get(item.id);if(!row)continue;const actual=decode(kind,row,remote.schemas[kind]);if(kind==='tasks'&&actual.locked)throw new AppError('Desbloqueie a tarefa e aguarde o salvamento antes de excluí-la.',409);
    for(const key of entityFields(kind).filter(key=>!(key==='name'&&['inbox','diary'].includes(kind)))){
      let expected=item[key];if(kind==='media'&&key==='platforms')expected=expected||'';if(['project','milestone','category','habit','section'].includes(key))expected=expected?bindings[expected]||expected:null;
      if(key==='attachments'){if(JSON.stringify(attachmentSignature(actual[key]))!==JSON.stringify(attachmentSignature(expected)))throw new AppError('Os anexos foram alterados no Notion. Atualize antes de excluir.',409);continue;}
      if(!sameRemoteField(key,actual[key],expected))throw new AppError('O registro foi alterado desde que você o abriu. Atualize antes de excluir ou converter.',409);
    }
  }
  const deferredCompletions = new Set([...completingProjects].filter(id=>existing('projects',next.projects.find(p=>p.id===id))));
  const promotedIdeas=new Set(changes.someday.upserts.filter(({item})=>item.type==='idea'&&item.data.promoted&&!base.someday?.find(r=>r.id===item.id)?.data.promoted).map(({item})=>item.id));
  for(const item of next.someday||[])if(promotedIdeas.has(item.id)){
    const collection=item.data.promoted.kind==='task'?'tasks':'projects';
    if(!(next[collection]||[]).some(r=>r.id===item.data.promoted.id))throw new AppError('A tarefa/projeto da conversão não foi incluída. Tente novamente.',422);
  }
  // Existing projects are closed only after their children were saved.
  for (const completionPhase of [false,true]) for (const kind of ['reference','someday','projects','milestones','tasks','inbox','diary','categories','transactions','contacts','shopping','habits','habitLogs','mediaSections','media','vehicles','wellness','cycle','nutrition']) {
    const source = remote.schemas[kind];
    for (const { item, keys } of changes[kind].upserts) {
      if (completionPhase !== (kind === 'projects' && deferredCompletions.has(item.id) || kind==='someday' && promotedIdeas.has(item.id))) continue;
      const row = existing(kind,item);
      const object = { ...item, ...(kind !== 'projects' ? { project: item.project ? bindings[item.project] : null } : {}) };
      if(kind==='media')object.section=bindings[item.section]||item.section;
      if(kind==='habitLogs')object.habit=bindings[item.habit]||item.habit;
      if (kind === 'transactions') object.category=bindings[item.category] || item.category;
      if (kind === 'tasks') {
        object.milestone = item.milestone ? bindings[item.milestone] : null;
        object.context = next.projects.find(project => project.id === item.project)?.context || item.context;
      }
      if (keys.includes('attachments')) {
        const freshFiles = row?decode(kind,row,source).attachments:[];
        object.attachments = (object.attachments || []).map(file => {
          if (file.uploadId) return file;
          const originalUrl = (file.notion?.[file.notion.type]?.url || '').split('?')[0];
          const fresh = freshFiles.find(other => other.name === file.name && (other.notion?.[other.notion.type]?.url || '').split('?')[0] === originalUrl);
          if(!fresh&&kind==='diary'&&file.inboxSourceId){
            const removed=changes.inbox.deletions.find(item=>(item._notionId||item.id)===file.inboxSourceId);
            const sourceRow=removed&&(byId.inbox.get(removed._notionId||removed.id)||byTracking.inbox.get(removed.id));
            if(sourceRow){
              const original=decode('inbox',sourceRow,remote.schemas.inbox).attachments.find(a=>a.name===file.name);
              if(original)return {...original,id:file.id};
            }
          }
          if(!row&&!file.inboxSourceId)return file;
          if (!fresh) throw new AppError('Um anexo foi removido ou substituído no Notion. Atualize os dados para revisar.',409);
          return {...file,notion:fresh.notion};
        });
      }
      if(kind==='habitLogs'&&!row&&remote.state.habitLogs.some(p=>p.habit===object.habit&&p.date===object.date))throw new AppError('Este hábito já foi marcado neste dia. Atualize os dados.',409);
      await guard();
      const properties = encode(kind,object,source,row ? keys : undefined);
      if(user&&PRIVATE_KINDS.includes(kind)){
        let owner=row?plain(row.properties[source.owner.name]?.rich_text):user.id;
        if(['tasks','milestones'].includes(kind)&&item.project){const projectRow=byId.projects.get(bindings[item.project]||item.project);if(projectRow&&!projectRow.properties[remote.schemas.projects.fields.shared.name]?.checkbox)owner=plain(projectRow.properties[remote.schemas.projects.owner.name]?.rich_text);}
        properties[source.owner.name]={rich_text:owner?[{text:{content:owner}}]:[]};
        if(['projects','tasks'].includes(kind))owners[item.id]=!owner?legacyEmail():owner===user.id?user.email:allowedEmails().find(email=>email!==user.email)||legacyEmail();
      }
      if(user&&SHARED_KINDS.includes(kind)){properties[source.editor.name]={rich_text:[{text:{content:user.name+' <'+user.email+'>'}}]};properties[source.edited.name]={date:{start:new Date().toISOString()}};}

      if (!row) properties[source.tracking.name] = { rich_text: [{ text: { content: item.id } }] };
      const saved = await notion(row ? `/pages/${row.id}` : '/pages', { method: row ? 'PATCH' : 'POST', body: row ? { properties } : { parent: { type: 'data_source_id', data_source_id: source.id }, properties } });
      bindings[item.id] = saved.id;
      byId[kind].set(saved.id,saved); byTracking[kind].set(item.id,saved);
      if(kind==='tasks'){
        const confirmed=decode(kind,saved,source);
        taskCompletions[item.id]={status:confirmed.status,completedAt:confirmed.completedAt};
      }
      if (keys.includes('attachments') && object.attachments) {
        const decoded = decode(kind,saved,source).attachments;
        object.attachments.forEach((file,index) => { if (decoded[index]) files[file.id] = { ...decoded[index], id:file.id }; });
      }
    }
  }
  for (const kind of ['reference','someday','media','mediaSections','habitLogs','habits','shopping','contacts','transactions','categories','diary','inbox','tasks','milestones','projects','vehicles','wellness','cycle','nutrition']) {
    for (const item of changes[kind].deletions) {
      const row = item._notionId ? byId[kind].get(item._notionId) : byId[kind].get(item.id) || byTracking[kind].get(item.id);
      if(kind==='habitLogs'&&row&&(next.habitLogs||[]).some(log=>bindings[log.id]===row.id))continue;
      if (row){await guard();await notion(`/pages/${row.id}`, { method:'PATCH', body:{in_trash:true} });}
    }
  }
  if(user)await saveSharedActivity(SHARED_KINDS.filter(kind=>changes[kind].upserts.length||changes[kind].deletions.length),user);
  return { bindings, files,owners,taskCompletions };
}
