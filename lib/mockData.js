import { addDaysISO, shiftISO } from "./dates";

const d = (n) => (n === null ? null : addDaysISO(n));

// Contexto de cada projeto: as tarefas dele sempre herdam este valor.
const PCTX = { pr1: "work", pr2: "work", pr3: "work", pr4: "personal", pr5: "personal", pr6: "personal", pr7: "personal", pr8: "personal", pr9: "personal" };

export function makeProjects() {
  const p = (id, name, status, area, due, description, milestones = []) =>
    ({ id, name, status, area, context: PCTX[id], due: d(due), description, milestones: milestones.map(([mid, title, md, done]) => ({ id: mid, title, due: d(md), done: Boolean(done) })) });
  return [
    p("pr1", "Relatório Q3", "active", "Carreira", 14, "Fechamento e apresentação dos resultados do trimestre.", [["m1", "Coletar dados", -5, true], ["m2", "Rascunho do relatório", 4], ["m3", "Apresentação ao time", 14]]),
    p("pr2", "Projeto Beta", "active", "Carreira", 30, "Lançamento da versão beta do produto, do escopo à retro final.", [["m4", "Escopo fechado", 3], ["m5", "Desenvolvimento", 20], ["m6", "Lançamento beta", 30]]),
    p("pr3", "Cliente Alfa", "active", "Carreira", 20, "Proposta, contrato e entrega do primeiro ciclo.", [["m7", "Proposta enviada", 0], ["m8", "Contrato assinado", 10], ["m9", "Primeira entrega", 20]]),
    p("pr4", "Finanças 2026", "active", "Finanças", 90, "Orçamento anual, faturas e documentos do imposto.", [["m10", "Orçamento anual", 2], ["m11", "Declaração do imposto", 60]]),
    p("pr5", "Estudos", "active", "Aprendizado", null, "Inglês diário e trilha de dados."),
    p("pr6", "Saúde", "active", "Saúde", null, "Exames, consultas e rotina de treino."),
    p("pr7", "Casa e carro", "paused", "Casa", null, "Manutenções, seguro e pendências."),
    p("pr8", "Viagem de fim de ano", "paused", "Lazer", 75, "Destino, datas e reservas em definição."),
    p("pr9", "Reforma do escritório", "done", "Casa", -30, "Reforma concluída e mobiliário instalado."),
  ];
}

// Páginas do Notion que podem ser linkadas a uma tarefa (na versão real vêm da busca da API).
export const PAGES = [
  { id: "p1", title: "Ata da reunião de alinhamento Q3", type: "Nota" },
  { id: "p2", title: "Briefing do cliente Alfa", type: "Documento" },
  { id: "p3", title: "Escopo do projeto Beta", type: "Documento" },
  { id: "p4", title: "Orçamento anual 2026", type: "Finanças" },
  { id: "p5", title: "Apólice do seguro do carro", type: "Documento" },
  { id: "p6", title: "Plano de estudos de inglês", type: "Nota" },
  { id: "p7", title: "Exames de rotina: checklist", type: "Saúde" },
  { id: "p8", title: "Ideias para o blog", type: "Nota" },
];

// status: todo | doing | hold | done. project = id do projeto, milestone = id do marco.
// Em hold, followUp é a data de cobrança. Em done, outcome é finished | cancelled.
const t = (title, status, due, priority, context, project, extra = {}) =>
  ({ title, status, due, priority, context, project, milestone: null, links: [], notes: "", followUp: null, waitingOn: "", outcome: null, ...extra });

export function makeTasks() {
  return [
    t("Renovar seguro do carro", "todo", d(-1), "medium", "personal", "pr7", { links: ["p5"] }),
    t("Preparar pauta da reunião de alinhamento", "todo", d(1), "high", "work", "pr1", { links: ["p1"], milestone: "m2" }),
    t("Agendar exames de rotina", "todo", d(4), "medium", "personal", "pr6", { links: ["p7"] }),
    t("Planejar viagem de fim de ano", "todo", d(21), "low", "personal", "pr8"),
    t("Ideias para o blog", "todo", null, "low", "personal", null, { links: ["p8"] }),

    t("Revisar proposta do cliente Alfa", "doing", d(0), "high", "work", "pr3", { links: ["p2"], milestone: "m7" }),
    t("Fechar escopo do projeto Beta", "doing", d(3), "high", "work", "pr2", { links: ["p3"], milestone: "m4" }),
    t("Atualizar planilha de orçamento", "doing", d(2), "medium", "personal", "pr4", { links: ["p4"], milestone: "m10" }),
    t("Estudar 30 min de inglês", "doing", d(0), "low", "personal", "pr5", { links: ["p6"] }),

    t("Aprovação do orçamento pelo financeiro", "hold", d(5), "high", "work", "pr1", { followUp: d(-1), waitingOn: "Marina (financeiro)", milestone: "m3" }),
    t("Retorno do dentista sobre remarcação", "hold", null, "medium", "personal", "pr6", { followUp: d(2), waitingOn: "Clínica" }),
    t("Contrato assinado do cliente Alfa", "hold", d(10), "medium", "work", "pr3", { followUp: d(6), waitingOn: "Jurídico do cliente", milestone: "m8" }),

    t("Enviar relatório trimestral ao time", "done", d(-2), "high", "work", "pr1", { outcome: "finished", milestone: "m1" }),
    t("Fazer backup das fotos", "done", d(-3), "low", "personal", null, { outcome: "finished" }),
    t("Trocar pneus", "done", d(-6), "low", "personal", "pr7", { outcome: "cancelled" }),
  ].map((x, i) => ({ id: `t${i + 1}`, ...x, start: x.milestone && x.due ? shiftISO(x.due, -4) : null }));
}

// Entradas rápidas ainda sem categoria.
export const INBOX_SEED = [
  { id: "i1", text: "Ligar para o contador sobre o IR" },
  { id: "i2", text: "Automatizar o relatório mensal\nPuxar os números direto do Notion e gerar o rascunho" },
  { id: "i3", text: "Comprar filtro de água" },
];
