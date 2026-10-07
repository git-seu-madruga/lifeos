import {withoutUntouchedEntries} from './entryDrafts';
import { normalizeTransaction } from './finance';
export const PROJECT_FIELDS = ['name','status','context','area','due','description','attachments'];
export const TASK_FIELDS = ['title','status','priority','context','project','milestone','start','due','waitingOn','followUp','notes','completedAt','attachments'];
export const MILESTONE_FIELDS = ['title','project','due','done','order'];
export const flattenMilestones = state => withoutUntouchedEntries(state.projects).flatMap(project => (project.milestones || []).map((milestone, index) => ({ ...milestone, project: project.id, order: index + 1 })));
export function sameField(key, a, b) {
  if (key === 'archived') return !!a===!!b;
  if (key === 'attachments') return JSON.stringify((a || []).map(item => [item.id,item.name])) === JSON.stringify((b || []).map(item => [item.id,item.name]));
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
    result[kind] = {
      upserts: current.map(item => ({ item, keys: changedKeys(fields[kind], byId.get(item.id), item) })).filter(change => change.keys.length),
      deletions: previous.filter(item => !current.some(other => other.id === item.id)),
    };
  }
  return result;
}
export function hasChanges(base, next) {
  return Object.values(diffState(base,next)).some(group => group.upserts.length || group.deletions.length);
}
