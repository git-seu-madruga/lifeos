// Registra a ordem de conclusão em todos os pontos de edição.
export function patchTask(task, patch) {
  const next = { ...task, ...patch };
  if (patch.status && patch.status !== task.status) {
    next.completedAt = patch.status === "done" ? Date.now() : null;
  }
  return next;
}

export function newestCompleted(a, b) {
  return (b.completedAt || 0) - (a.completedAt || 0);
}

export const taskDate = task => (task.status === 'hold' ? task.followUp : task.due) || '9999-99-99';

export function taskInsertionTime(task) {
  if (Number.isFinite(task._createdAt) && task._createdAt > 0) return task._createdAt;
  // Existing LifeOS task IDs include an 8-character base36 millisecond timestamp,
  // followed by the project sequence or a random suffix. Recover it for old rows.
  const match = /^t([a-z0-9]{8})(?:\d+|[a-z0-9]{4})$/.exec(task.id || '');
  const time = match ? parseInt(match[1],36) : 0;
  return time >= 946684800000 && time < 4102444800000 ? time : 0;
}

export const oldestInserted = (a,b) => taskInsertionTime(a) - taskInsertionTime(b);

// A stored date can come back with seconds/milliseconds truncated. Accept only
// that exact representation change, not arbitrary different times in a minute.
export function sameCompletionTime(actual, candidate) {
  if ((actual ?? null) === (candidate ?? null)) return true;
  if (!Number.isFinite(actual) || !Number.isFinite(candidate)) return false;
  return [1000,60000].some(unit => actual % unit === 0 && Math.floor(candidate / unit) * unit === actual);
}
