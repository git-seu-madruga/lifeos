"use client";
import { useState } from 'react';
export default function Login({ onLogin, configured, initialError = '' }) {
  const [password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  return <main className="login-shell"><form className="login-card" onSubmit={async e=>{
    e.preventDefault();setBusy(true);setError('');
    try { await onLogin(password); } catch(e){setError(e.message);} finally{setBusy(false);}
  }}>
    <h1>LifeOS</h1><p className="muted">Entre para acessar seus projetos e tarefas.</p>
    {!configured && <p className="date-error" role="alert">Configure NOTION_TOKEN e LIFEOS_PASSWORD na Vercel e faça uma nova implantação.</p>}
    <label className="field"><span className="label">Senha</span><input className="search" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required autoFocus /></label>
    {(error || initialError) && <p className="date-error" role="alert">{error || initialError}</p>}
    <button className="primary" disabled={busy || !configured}>{busy?'Entrando…':'Entrar'}</button>
  </form></main>;
}
