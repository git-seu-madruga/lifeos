"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import Brand from './Brand';
export default function QrLock({onUnlock,onExit}){
 const [code,setCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),input=useRef(null);
 useEffect(()=>{document.body.dataset.qrLocked='true';input.current?.focus();const focus=event=>{if(!event.target.closest?.('.qr-lock-screen'))input.current?.focus();};document.addEventListener('focusin',focus);return()=>{delete document.body.dataset.qrLocked;document.removeEventListener('focusin',focus);};},[]);
 async function submit(event){event.preventDefault();if(busy)return;setBusy(true);setError('');try{await onUnlock(code);}catch(e){setError(e.message);setCode('');if(e.status===401)await onExit().catch(()=>{});}finally{setBusy(false);input.current?.focus();}}
 if(typeof document==='undefined')return null;
 return createPortal(<main className="qr-lock-screen login-shell" role="dialog" aria-modal="true" aria-label="Sessão temporária bloqueada"><form className="login-card" onSubmit={submit}><h1><Brand/></h1><h2>Sessão bloqueada</h2><p className="muted">Digite o código de seis números que apareceu junto ao QR Code neste computador.</p><label className="habit-field">Código de desbloqueio<input ref={input} className="search qr-unlock-code" autoComplete="off" inputMode="numeric" type="password" pattern="[0-9]{6}" maxLength={6} value={code} required disabled={busy} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label>{error&&<p className="date-error" role="alert">{error}</p>}<p className="muted small">O desbloqueio não prolonga a validade total de 1 hora.</p><button className="primary google-login" disabled={busy||code.length!==6}>{busy?'Verificando…':'Desbloquear'}</button><button type="button" className="ghost google-login" disabled={busy} onClick={()=>{setBusy(true);onExit().catch(e=>{setError(e.message);setBusy(false);});}}>Encerrar sessão</button></form></main>,document.body);
}
