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
