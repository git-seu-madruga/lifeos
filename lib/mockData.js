import { addDaysISO } from "./dates";

export const PROJECTS = ["Relatório Q3", "Projeto Beta", "Cliente Alfa", "Finanças 2026", "Casa e carro", "Estudos", "Saúde"];

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

// status: todo | doing | hold | done. Em hold, followUp é a data de cobrança.
// Em done, outcome é finished | cancelled.
const t = (title, status, due, priority, context, project, extra = {}) =>
  ({ title, status, due, priority, context, project, links: [], notes: "", followUp: null, waitingOn: "", outcome: null, ...extra });
const d = (n) => (n === null ? null : addDaysISO(n));

export function makeTasks() {
  return [
    t("Renovar seguro do carro", "todo", d(-1), "medium", "personal", "Casa e carro", { links: ["p5"] }),
    t("Preparar pauta da reunião de alinhamento", "todo", d(1), "high", "work", "Relatório Q3", { links: ["p1"] }),
    t("Agendar exames de rotina", "todo", d(4), "medium", "personal", "Saúde", { links: ["p7"] }),
    t("Planejar viagem de fim de ano", "todo", d(21), "low", "personal", null),
    t("Ideias para o blog", "todo", null, "low", "personal", null, { links: ["p8"] }),

    t("Revisar proposta do cliente Alfa", "doing", d(0), "high", "work", "Cliente Alfa", { links: ["p2"] }),
    t("Fechar escopo do projeto Beta", "doing", d(3), "high", "work", "Projeto Beta", { links: ["p3"] }),
    t("Atualizar planilha de orçamento", "doing", d(2), "medium", "personal", "Finanças 2026", { links: ["p4"] }),
    t("Estudar 30 min de inglês", "doing", d(0), "low", "personal", "Estudos", { links: ["p6"] }),

    t("Aprovação do orçamento pelo financeiro", "hold", d(5), "high", "work", "Relatório Q3", { followUp: d(-1), waitingOn: "Marina (financeiro)" }),
    t("Retorno do dentista sobre remarcação", "hold", null, "medium", "personal", "Saúde", { followUp: d(2), waitingOn: "Clínica" }),
    t("Contrato assinado do cliente Alfa", "hold", d(10), "medium", "work", "Cliente Alfa", { followUp: d(6), waitingOn: "Jurídico do cliente" }),

    t("Enviar relatório trimestral ao time", "done", d(-2), "high", "work", "Relatório Q3", { outcome: "finished" }),
    t("Fazer backup das fotos", "done", d(-3), "low", "personal", null, { outcome: "finished" }),
    t("Trocar pneus", "done", d(-6), "low", "personal", "Casa e carro", { outcome: "cancelled" }),
  ].map((x, i) => ({ id: `t${i + 1}`, ...x }));
}
