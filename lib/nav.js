// Abas principais e guias internas. `sep: true` desenha um divisor antes da aba.
// `db` é o banco do Notion que a aba vai ler quando conectarmos a API.
export const NAV = [
  { id: "hoje", label: "Hoje", db: "Tarefas + Hábitos", subs: [{ id: "resumo", label: "Resumo" }, { id: "agenda", label: "Agenda" }] },
  { id: "mensagens", label: "Mensagens", db: "Mensagens", subs: [{ id: "entrada", label: "Caixa de entrada" }, { id: "enviadas", label: "Enviadas" }] },
  { id: "projetos", label: "Projetos", db: "Projetos", subs: [{ id: "ativos", label: "Ativos" }, { id: "pausados", label: "Pausados" }, { id: "concluidos", label: "Concluídos" }] },
  { id: "tarefas", label: "Tarefas", db: "Tarefas", subs: [{ id: "lista", label: "Por status" }, { id: "projeto", label: "Por projeto" }] },
  { id: "revisao", label: "Revisão", db: "Diário", subs: [{ id: "semanal", label: "Semanal" }, { id: "mensal", label: "Mensal" }] },
  { id: "saude", label: "Saúde", sep: true, db: "Saúde", subs: [{ id: "treinos", label: "Treinos" }, { id: "sono", label: "Sono" }, { id: "medidas", label: "Medidas" }] },
  { id: "financas", label: "Finanças", db: "Finanças", subs: [{ id: "gastos", label: "Gastos" }, { id: "contas", label: "Contas" }, { id: "metas", label: "Metas" }] },
  { id: "hobbies", label: "Hobbies", db: "Hobbies", subs: [{ id: "colecao", label: "Coleção" }, { id: "desejos", label: "Lista de desejos" }] },
];

// O que o botão do Inbox faz em cada aba. kind: null = seção ainda não construída.
export const INBOX_TARGETS = {
  hoje: { kind: "task", label: "tarefa" },
  mensagens: { kind: null, label: "mensagem" },
  projetos: { kind: "project", label: "projeto" },
  tarefas: { kind: "task", label: "tarefa" },
  revisao: { kind: null, label: "nota de revisão" },
  saude: { kind: null, label: "registro de saúde" },
  financas: { kind: null, label: "lançamento" },
  hobbies: { kind: null, label: "item de hobby" },
};
