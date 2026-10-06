"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal,flushSync} from 'react-dom';
import {createBackNavigation} from './backNavigation';
let navigation=null;
function current(){if(typeof window==='undefined')return null;if(!navigation)navigation=createBackNavigation(window,{onPrompt:message=>window.dispatchEvent(new CustomEvent('lifeos-back-prompt',{detail:message}))});return navigation;}
export function useAppBackNavigation(enabled,ready=false){
 useEffect(()=>{if(!enabled)return;const nav=current();nav.start();return()=>nav.stop();},[enabled]);
 useEffect(()=>{if(enabled)current()?.reset();},[enabled,ready]);
}
// The exit notice updates only this portal, never the page or its editors.
export function BackNotice(){
 const [message,setMessage]=useState(''),[mounted,setMounted]=useState(false);
 useEffect(()=>{setMounted(true);const handle=e=>{if(e.detail)flushSync(()=>setMessage(e.detail));else setMessage('');};window.addEventListener('lifeos-back-prompt',handle);return()=>window.removeEventListener('lifeos-back-prompt',handle);},[]);
 if(!mounted)return null;
 return createPortal(<div className="back-toast" role="status" aria-live="polite" aria-atomic="true" data-visible={!!message}>{message}</div>,document.body);
}

export function useBackLayer(open,onClose,priority=20){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{if(!open)return;return current()?.register(()=>close.current?.(),priority);},[!!open,priority]);
}
