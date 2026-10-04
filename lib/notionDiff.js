import { normalizeTransaction } from './finance';
export const PROJECT_FIELDS = ['name','status','context','area','due','description','attachments'];
export const TASK_FIELDS = ['title','status','priority','context','project','milestone','start','due','waitingOn','followUp','notes','completedAt','attachments'];
export const MILESTONE_FIELDS = ['title','project','due','done','order'];
export const flattenMilestones = state => (state.projects || []).flatMap(project => (project.milestones || []).map((milestone, index) => ({ ...milestone, project: project.id, order: index + 1 })));
export function sameField(key, a, b) {
  if (key === 'attachments') return JSON.stringify((a || []).map(item => [item.id,item.name])) === JSON.stringify((b || []).map(item => [item.id,item.name]));
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
export const changedKeys = (fields, before, after) => fields.filter(key => !before || !sameField(key, before[key], after[key]));
export function diffState(base, next) {
  const fields = { projects: PROJECT_FIELDS, milestones: MILESTONE_FIELDS, tasks: TASK_FIELDS, inbox: ['text'], diary:['date','text','attachments'],categories:['name','flow'],transactions:['name','category','date','amount','notes'] };
  const result = {};
  for (const kind of Object.keys(fields)) {
    const previousRaw = kind === 'milestones' ? flattenMilestones(base) : base[kind] || [];
    const currentRaw = kind === 'milestones' ? flattenMilestones(next) : next[kind] || [];
    const previous=kind==='transactions'?previousRaw.map(normalizeTransaction):previousRaw;
    const current=kind==='transactions'?currentRaw.map(normalizeTransaction):currentRaw;
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
