// Seções utilizadas no LifeOS.
export const NAV = [
  { id: "projetos", label: "Projetos", db: "Projetos", subs: [{ id: "ativos", label: "Ativos" }, { id: "pausados", label: "Pausados" }, { id: "concluidos", label: "Concluídos" }, { id: "cancelados", label: "Cancelados" }] },
  { id: "tarefas", label: "Tarefas", db: "Tarefas", subs: [{ id: "lista", label: "Por status" }, { id: "projeto", label: "Por projeto" }] },
  { id: "diario", label: "Diário", db: "Diário", subs: [{ id: "calendario", label: "Calendário" }] },
  { id: "financas", label: "Finanças", db: "Finanças", subs: [{ id: "fluxo", label: "Fluxo" }] },
  { id:"aniversarios",label:"Aniversários",db:"Aniversários",subs:[{id:"contatos",label:"Contatos"}] },
  {id:"compras",label:"Compras",db:"Compras",subs:[{id:"listas",label:"Listas"}]},
  {id:"habitos",label:"Hábitos",db:"Hábitos",subs:[{id:"rotina",label:"Rotina"}]},
];

export const INBOX_TARGETS = {
  projetos: { kind: "project", label: "projeto" },
  tarefas: { kind: "task", label: "tarefa" },
  diario: { kind: "diary", label: "nota do diário" },
  aniversarios: {kind:"contact",label:"contato"},
  habitos: {kind:null,label:"hábito"},
  compras: {kind:"shopping",label:"lista de compras"},
  financas: { kind: null, label: "lançamento" },
};
