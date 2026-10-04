// Registra a ordem de conclusão em todos os pontos de edição.
export function patchTask(task, patch, statuses) {
  const next = { ...task, ...patch };
  const behavior = id => statuses?.find(option => option.id === id)?.behavior || id;
  if (patch.status && behavior(patch.status) !== behavior(task.status)) {
    next.completedAt = behavior(patch.status) === "done" ? Date.now() : null;
  }
  return next;
}

export function newestCompleted(a, b) {
  return (b.completedAt || 0) - (a.completedAt || 0);
}
