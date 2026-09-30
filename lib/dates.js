const pad = (n) => String(n).padStart(2, "0");

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDaysISO(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Diferença em dias entre duas datas ISO (negativo = no passado).
export function diffDays(iso, baseISO = todayISO()) {
  const [y, m, d] = iso.split("-").map(Number);
  const [y2, m2, d2] = baseISO.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y2, m2 - 1, d2)) / 86400000);
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function dueLabel(iso) {
  if (!iso) return { text: "Sem data", tone: "muted" };
  const n = diffDays(iso);
  if (n < 0) return { text: `${-n}d atrasada`, tone: "late" };
  if (n === 0) return { text: "Hoje", tone: "today" };
  if (n === 1) return { text: "Amanhã", tone: "soon" };
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (n <= 7) return { text: cap(date.toLocaleDateString("pt-BR", { weekday: "long" })), tone: "soon" };
  return { text: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), tone: "muted" };
}

export function longToday() {
  return cap(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));
}
