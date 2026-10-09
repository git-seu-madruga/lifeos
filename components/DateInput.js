"use client";
import { useEffect, useState } from 'react';
import { parseDateInput, formatDateInput, maskDateInput } from '../lib/dateInput';

export default function DateInput({ value, onChange, max, min, onValidityChange, ...props }) {
  const [text, setText] = useState(formatDateInput(value));
  const [error, setError] = useState('');
  useEffect(() => { setText(formatDateInput(value)); setError(''); }, [value]);
  function commit() {
    const result = parseDateInput(text);
    const message = result.error || (max && result.value > max ? `O limite é ${formatDateInput(max)}.` : '') || (min && result.value && result.value < min ? `A data deve ser igual ou posterior a ${formatDateInput(min)}.` : '');
    setError(message);onValidityChange?.(!message);
    if (message) return;
    setText(formatDateInput(result.value));
    if((result.value||'')!==(value||''))onChange({ target: { value: result.value || '' } });
  }
  return <span className="date-control">
    <span className="date-fields">
      <input {...props} type="text" inputMode="numeric" placeholder="DD/MM/AAAA" value={text} aria-invalid={!!error} onChange={(e) => { const input = e.target;
        const digitCount = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
        const masked = maskDateInput(input.value);
        setText(masked);
        let caret = 0, seen = 0;
        while (caret < masked.length && seen < digitCount) {
          if (/\d/.test(masked[caret])) seen++;
          caret++;
        }
        requestAnimationFrame(() => { if (document.activeElement === input) input.setSelectionRange(caret, caret); });
        setError('');onValidityChange?.(false); }} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }} />
      <span className="date-calendar-click"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18"/></svg><input onClick={e=>{try{e.currentTarget.showPicker?.();}catch{ /* Native input remains available on Safari. */ }}} className="date-picker" type="date" aria-label="Selecionar no calendário" value={value || ''} max={max} min={min} onChange={(e) => { if ((!max || !e.target.value || e.target.value <= max) && (!min || !e.target.value || e.target.value >= min)) {onChange(e);onValidityChange?.(true);} }} /></span>
    </span>
    {error && <span className="date-error" role="alert">{error}</span>}
  </span>;
}
