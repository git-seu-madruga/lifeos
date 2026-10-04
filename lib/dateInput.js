// Máscara progressiva: 0310 -> 03/10; 03102026 -> 03/10/2026.
export function maskDateInput(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

export function parseDateInput(text, year = new Date().getFullYear()) {
  if (!text.trim()) return { value: null };
  const match = text.trim().match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{4}))?$/);
  if (!match) return { error: 'Use DD/MM ou DD/MM/AAAA.' };
  const day = Number(match[1]), month = Number(match[2]), y = Number(match[3] || year);
  const date = new Date(y, month - 1, day);
  if (y < 1000 || date.getFullYear() !== y || date.getMonth() !== month - 1 || date.getDate() !== day) return { error: 'Data inválida.' };
  return { value: `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
}
export const formatDateInput = (value) => value ? value.split('-').reverse().join('/') : '';
