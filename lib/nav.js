// Abas principais e guias internas. `sep: true` desenha um divisor antes da aba.
// `db` é o banco do Notion que a aba vai ler quando conectarmos a API.
export const NAV = [
  { id: "hoje", label: "Hoje", db: "Tarefas + Hábitos", subs: [{ id: "resumo", label: "Resumo" }, { id: "agenda", label: "Agenda" }] },
  { id: "mensagens", label: "Mensagens", db: "Mensagens", subs: [{ id: "entrada", label: "Caixa de entrada" }, { id: "enviadas", label: "Enviadas" }] },
  { id: "projetos", label: "Projetos", db: "Projetos", subs: [{ id: "ativos", label: "Ativos" }, { id: "pausados", label: "Pausados" }, { id: "concluidos", label: "Concluídos" }] },
  { id: "tarefas", label: "Tarefas", db: "Tarefas", subs: [{ id: "lista", label: "Lista" }, { id: "rotinas", label: "Rotinas" }, { id: "concluidas", label: "Concluídas" }] },
  { id: "revisao", label: "Revisão", db: "Diário", subs: [{ id: "semanal", label: "Semanal" }, { id: "mensal", label: "Mensal" }] },
  { id: "saude", label: "Saúde", sep: true, db: "Saúde", subs: [{ id: "treinos", label: "Treinos" }, { id: "sono", label: "Sono" }, { id: "medidas", label: "Medidas" }] },
  { id: "financas", label: "Finanças", db: "Finanças", subs: [{ id: "gastos", label: "Gastos" }, { id: "contas", label: "Contas" }, { id: "metas", label: "Metas" }] },
  { id: "hobbies", label: "Hobbies", db: "Hobbies", subs: [{ id: "colecao", label: "Coleção" }, { id: "desejos", label: "Lista de desejos" }] },
];
