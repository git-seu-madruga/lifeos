"use client";
import { useEffect, useState } from 'react';
import { parseDateInput, formatDateInput } from '../lib/dateInput';

export default function DateInput({ value, onChange, max, min, ...props }) {
  const [text, setText] = useState(formatDateInput(value));
  const [error, setError] = useState('');
  useEffect(() => { setText(formatDateInput(value)); setError(''); }, [value]);
  function commit() {
    const result = parseDateInput(text);
    const message = result.error || (max && result.value > max ? `O limite é ${formatDateInput(max)}.` : '') || (min && result.value && result.value < min ? `A data deve ser igual ou posterior a ${formatDateInput(min)}.` : '');
    setError(message);
    if (message) return;
    setText(formatDateInput(result.value));
    onChange({ target: { value: result.value || '' } });
  }
  return <span className="date-control">
    <span className="date-fields">
      <input {...props} type="text" inputMode="numeric" placeholder="DD/MM/AAAA" value={text} aria-invalid={!!error} onChange={(e) => { setText(e.target.value); setError(''); }} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }} />
      <input className="date-picker" type="date" aria-label="Selecionar no calendário" value={value || ''} max={max} min={min} onChange={(e) => { if ((!max || !e.target.value || e.target.value <= max) && (!min || !e.target.value || e.target.value >= min)) onChange(e); }} />
    </span>
    {error && <span className="date-error" role="alert">{error}</span>}
  </span>;
}
