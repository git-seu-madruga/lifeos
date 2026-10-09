import {withoutUntouchedEntries} from './entryDrafts';
import { normalizeTransaction } from './finance';
export const PROJECT_FIELDS = ['shared','name','status','context','area','due','description','attachments'];
export const TASK_FIELDS = ['shared','responsible','title','status','priority','context','project','milestone','start','due','waitingOn','followUp','notes','completedAt','attachments'];
export const MILESTONE_FIELDS = ['shared','title','project','due','done','order'];
export const flattenMilestones = state => withoutUntouchedEntries(state.projects).flatMap(project => (project.milestones || []).map((milestone, index) => ({ ...milestone, project: project.id, shared:!!project.shared, order: index + 1 })));
export function sameField(key, a, b) {
  if (key === 'shared'||key === 'archived') return !!a===!!b;
  if (key === 'attachments') return JSON.stringify((a || []).map(item => [item.id,item.name])) === JSON.stringify((b || []).map(item => [item.id,item.name]));
  if(key==='responsible')return (a||'')===(b||'');
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
export const changedKeys = (fields, before, after) => fields.filter(key => !before || !sameField(key, before[key], after[key]));
export function diffState(base, next) {
  const fields = {mediaSections:['name','type','icon','color'],media:['completedOn','platforms','year','name','section','author','status','rating','comment','coverUrl','sourceUrl','provider','attachments'], projects: PROJECT_FIELDS, milestones: MILESTONE_FIELDS, tasks: TASK_FIELDS, inbox: ['text'], diary:['date','text','attachments'],categories:['archived','name','flow'],habits:['archived','name','context','color','icon','start'],habitLogs:['name','habit','date'],shopping:['name','context','items'],contacts:['name','day','month','year'],transactions:['name','category','date','amount','notes'] };
  const result = {};
  for (const kind of Object.keys(fields)) {
    const previousRaw = kind === 'milestones' ? flattenMilestones(base) : base[kind] || [];
    const currentRaw = kind === 'milestones' ? flattenMilestones(next) : next[kind] || [];
    const previousRows=['projects','tasks'].includes(kind)?withoutUntouchedEntries(previousRaw):previousRaw;
    const currentRows=['projects','tasks'].includes(kind)?withoutUntouchedEntries(currentRaw):currentRaw;
    const previous=kind==='transactions'?previousRows.map(normalizeTransaction):previousRows;
    const current=kind==='transactions'?currentRows.map(normalizeTransaction):currentRows;
    const byId = new Map(previous.map(item => [item.id,item]));
    const currentIds = new Set(current.map(item=>item.id));
    result[kind] = {
      upserts: current.map(item => ({ item, keys: changedKeys(fields[kind], byId.get(item.id), item) })).filter(change => change.keys.length),
      deletions: previous.filter(item => !currentIds.has(item.id)),
    };
  }
  return result;
}
export function hasChanges(base, next) {
  return Object.values(diffState(base,next)).some(group => group.upserts.length || group.deletions.length);
}

// Carry changed records and only the records needed to validate their relations.
export function compactSyncState(base,next) {
 const changes=diffState(base,next), ids=Object.fromEntries(Object.keys(changes).map(kind=>[kind,new Set()]));
 for(const [kind,group] of Object.entries(changes))for(const item of [...group.upserts.map(p=>p.item),...group.deletions])ids[kind].add(item.id);
 for(const state of [base,next]) {
  for(const project of state.projects||[])if((project.milestones||[]).some(m=>ids.milestones.has(m.id)))ids.projects.add(project.id);
 }
 let expanded=true;
 while(expanded){expanded=false;for(const state of [base,next])for(const [kind,set] of Object.entries(ids)){
  const list=kind==='milestones'?flattenMilestones(state):state[kind]||[];
  for(const item of list)if(set.has(item.id))for(const [field,target] of [['project','projects'],['category','categories'],['habit','habits'],['section','mediaSections']]){
   if(item[field]&&!ids[target].has(item[field])){ids[target].add(item[field]);expanded=true;}
  }
 }}
 const select=state=>Object.fromEntries(Object.entries(ids).filter(([kind])=>kind!=='milestones').map(([kind,set])=>[kind,(state[kind]||[]).filter(item=>set.has(item.id)&&!item._untouchedDraft)]));
 return {base:select(base),next:select(next)};
}
