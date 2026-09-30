import { addDaysISO } from "./dates";

// Datas relativas a hoje, para os grupos (Atrasadas, Hoje, Esta semana...) sempre fazerem sentido.
// Colunas: título, dias a partir de hoje (null = sem data), prioridade, contexto,
// favorita, rotina, projeto, concluída.
const RAW = [
  ["Renovar seguro do carro", -1, "medium", "personal", true, false, "Casa e carro"],
  ["Enviar relatório trimestral ao time", -2, "high", "work", true, false, "Relatório Q3"],

  ["Preparar pauta da reunião de alinhamento", 0, "high", "work", true, false, "Relatório Q3"],
  ["Pagar fatura do cartão", 0, "medium", "personal", true, false, "Finanças 2026"],
  ["Ligar para o dentista e remarcar consulta", 0, "medium", "personal", true, false, null],
  ["Revisar proposta do cliente Alfa", 0, "medium", "work", false, false, "Cliente Alfa"],
  ["Estudar 30 min de inglês", 0, "low", "personal", false, true, "Estudos"],

  ["Comprar presente de aniversário", 1, "medium", "personal", false, false, null],
  ["Agendar exames de rotina", 2, "medium", "personal", false, false, "Saúde"],
  ["Atualizar planilha de orçamento", 2, "medium", "personal", true, false, "Finanças 2026"],
  ["Responder e-mails pendentes", 3, "low", "work", false, false, null],
  ["Fechar escopo do projeto Beta", 3, "high", "work", false, false, "Projeto Beta"],
  ["Treino de força", 4, "medium", "personal", false, true, "Saúde"],
  ["Organizar documentos do imposto", 5, "medium", "personal", false, false, "Finanças 2026"],
  ["Retro do sprint", 6, "low", "work", false, false, "Projeto Beta"],

  ["Trocar óleo do carro", 12, "low", "personal", false, false, "Casa e carro"],
  ["Planejar viagem de fim de ano", 21, "low", "personal", false, false, null],
  ["Revisão mensal de metas", 25, "medium", "personal", false, true, "Revisões"],

  ["Ideias para o blog", null, "low", "personal", false, false, null],
  ["Pesquisar cursos de dados", null, "low", "work", false, false, "Estudos"],

  ["Fazer backup das fotos", -3, "low", "personal", false, false, null, true],
  ["Enviar nota fiscal", -1, "medium", "work", false, false, null, true],
];

export function makeTasks() {
  return RAW.map(([title, offset, priority, context, starred, routine, project, done], i) => ({
    id: `t${i + 1}`,
    title,
    due: offset === null ? null : addDaysISO(offset),
    priority,
    context,
    starred,
    routine,
    project,
    done: Boolean(done),
  }));
}
