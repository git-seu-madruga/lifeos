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

// A stored date can come back with seconds/milliseconds truncated. Accept only
// that exact representation change, not arbitrary different times in a minute.
export function sameCompletionTime(actual, candidate) {
  if ((actual ?? null) === (candidate ?? null)) return true;
  if (!Number.isFinite(actual) || !Number.isFinite(candidate)) return false;
  return [1000,60000].some(unit => actual % unit === 0 && Math.floor(candidate / unit) * unit === actual);
}
