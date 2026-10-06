"use client";
import {useEffect,useRef,useState} from 'react';
import {createBackNavigation} from './backNavigation';
let navigation=null;
function current(){if(typeof window==='undefined')return null;if(!navigation)navigation=createBackNavigation(window,{onPrompt:message=>window.dispatchEvent(new CustomEvent('lifeos-back-prompt',{detail:message}))});return navigation;}
export function useAppBackNavigation(enabled,ready=false){
 const [message,setMessage]=useState('');
 useEffect(()=>{if(!enabled)return;const handle=e=>setMessage(e.detail);window.addEventListener('lifeos-back-prompt',handle);const nav=current();nav.start();return()=>{nav.stop();window.removeEventListener('lifeos-back-prompt',handle);};},[enabled]);
 useEffect(()=>{if(enabled)current()?.reset();},[enabled,ready]);
 return message;
}
export function useBackLayer(open,onClose,priority=20){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{if(!open)return;return current()?.register(()=>close.current?.(),priority);},[!!open,priority]);
}
