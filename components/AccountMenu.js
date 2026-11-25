"use client";
import {useBackLayer} from '../lib/useBackNavigation';
import {useEffect,useRef,useState} from 'react';
export default function AccountMenu({user,onLogout,onBackup,onSessions,onLock,tabs=[],hiddenTabs=[],onToggleTab}){const [open,setOpen]=useState(false),[tabVisibilityOpen,setTabVisibilityOpen]=useState(false),ref=useRef(null);useBackLayer(open,()=>setOpen(false),25);useEffect(()=>{if(!open)return;const close=e=>{if(!ref.current?.contains(e.target))setOpen(false);},key=e=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key);};},[open]);return <div className="account-menu" ref={ref}><button className="account-trigger" onClick={()=>{setTabVisibilityOpen(false);setOpen(!open);}} aria-expanded={open} aria-haspopup="menu"><span className="account-avatar">{(user?.name||user?.email||'?')[0]}</span><span>{user?.name||user?.email}</span><span aria-hidden="true">⌄</span></button>{open&&<div className={'account-dropdown'+(tabVisibilityOpen?' tab-visibility-open':'')} role="menu"><small>{user?.email}</small>
 {tabs.length>0&&<button type="button" role="menuitem" aria-expanded={tabVisibilityOpen} onClick={()=>setTabVisibilityOpen(value=>!value)}>Abas visíveis</button>}
 {tabVisibilityOpen&&<div className="tab-visibility-list" role="group" aria-label="Abas visíveis">
  {tabs.map(tab=>{
   const visible=!hiddenTabs.includes(tab.id);
   return <button key={tab.id} type="button" role="menuitemcheckbox" className="tab-visibility-option" aria-checked={visible}
    disabled={visible&&tabs.length-hiddenTabs.length===1} onClick={()=>onToggleTab(tab.id)}>
    <span className="tab-visibility-check" aria-hidden="true">{visible?'✓':''}</span>{tab.label}
   </button>;
  })}
 </div>}
 {user?.isLegacyOwner&&<button role="menuitem" onClick={()=>{setOpen(false);onBackup();}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 2 8 3v6c0 6-8 11-8 11S4 17 4 11V5z"/></svg> Backup e restauração</button>}{!user?.temporary&&<button role="menuitem" onClick={()=>{setOpen(false);onSessions();}}>Computadores autorizados</button>}{!user?.temporary&&<a role="menuitem" className="ghost" href="/capture/pair">Dispositivos de captura</a>}{user?.temporary&&<small>Sessão temporária · até {new Date(user.expiresAt).toLocaleTimeString('pt-BR')}</small>}{user?.temporary&&onLock&&<button role="menuitem" onClick={()=>{setOpen(false);onLock();}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg> Bloquear sessão</button>}<button role="menuitem" className="danger" onClick={()=>{setOpen(false);onLogout();}}>Sair</button></div>}</div>;}
