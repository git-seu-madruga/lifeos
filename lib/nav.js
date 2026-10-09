// Seções utilizadas no LifeOS.
export const NAV = [
  { id: "projetos", label: "Projetos", db: "Projetos", subs: [{ id: "ativos", label: "Ativos" }, { id: "pausados", label: "Pausados" }, { id: "concluidos", label: "Concluídos" }, { id: "cancelados", label: "Cancelados" }] },
  { id: "tarefas", label: "Tarefas", db: "Tarefas", subs: [{ id: "lista", label: "Por status" }, { id: "projeto", label: "Por projeto" }] },
  { id: "diario", label: "Diário", db: "Diário", subs: [{ id: "calendario", label: "Calendário" }] },
  { id: "financas", label: "Finanças", db: "Finanças", subs: [{ id: "fluxo", label: "Fluxo" }] },
  { id:"aniversarios",label:"Aniversários",db:"Aniversários",subs:[{id:"contatos",label:"Contatos"}] },
  {id:"compras",label:"Compras",db:"Compras",subs:[{id:"listas",label:"Listas"}]},
  {id:"bemestar",label:"Bem-estar",db:"Bem-estar",subs:[{id:"rotina",label:"Meu dia"}]},
  {id:"entretenimento",label:"Entretenimento",db:"Entretenimento",subs:[{id:"colecao",label:"Coleção"}]},
  {id:"recados",label:"Recados",db:"Recados",subs:[{id:"calendario",label:"Recados"}]},
];

export const INBOX_TARGETS = {
  recados:{kind:"recado",label:"recado"},
  entretenimento:{kind:null,label:"conteúdo"},
  projetos: { kind: "project", label: "projeto" },
  tarefas: { kind: "task", label: "tarefa" },
  diario: { kind: "diary", label: "nota do diário" },
  aniversarios: {kind:"contact",label:"contato"},
  bemestar: {kind:null,label:"registro de bem-estar"},
  compras: {kind:"shopping",label:"lista de compras"},
  financas: { kind: null, label: "lançamento" },
};
