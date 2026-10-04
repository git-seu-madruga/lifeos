// Seções utilizadas no LifeOS.
export const NAV = [
  { id: "projetos", label: "Projetos", db: "Projetos", subs: [{ id: "ativos", label: "Ativos" }, { id: "pausados", label: "Pausados" }, { id: "concluidos", label: "Concluídos" }, { id: "cancelados", label: "Cancelados" }] },
  { id: "tarefas", label: "Tarefas", db: "Tarefas", subs: [{ id: "lista", label: "Por status" }, { id: "projeto", label: "Por projeto" }] },
  { id: "diario", label: "Diário", db: "Diário", subs: [{ id: "calendario", label: "Calendário" }] },
  { id: "financas", label: "Finanças", db: "Finanças", subs: [{ id: "fluxo", label: "Fluxo" }] },
];

export const INBOX_TARGETS = {
  projetos: { kind: "project", label: "projeto" },
  tarefas: { kind: "task", label: "tarefa" },
  diario: { kind: "diary", label: "nota do diário" },
  financas: { kind: null, label: "lançamento" },
};
