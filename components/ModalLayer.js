"use client";
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {holdEditor} from '../lib/editingGuard';
import {useBackLayer} from '../lib/useBackNavigation';
let locks=0,previousOverflow='';
// Keep the last panel mounted briefly so its exit animates without losing edits.
export default function ModalLayer({children,open=true,onClose}){
 const [retained,setRetained]=useState(open);const last=useRef(children);
 if(open&&children)last.current=children;
 useBackLayer(open,onClose,20);
 useEffect(()=>{if(open)return holdEditor();},[open]);
 useEffect(()=>{if(open){setRetained(true);return;}const timer=setTimeout(()=>setRetained(false),180);return()=>clearTimeout(timer);},[open]);
 useEffect(()=>{if(!open||typeof document==='undefined')return;const focused=document.activeElement;if(locks++===0){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}return()=>{if(--locks===0)document.body.style.overflow=previousOverflow;focused?.focus?.({preventScroll:true});};},[open]);
 if(typeof document==='undefined'||(!open&&!retained))return null;
 return createPortal(<div className={'modal-motion'+(open?'':' closing')} inert={!open} aria-hidden={!open||undefined}>{open?children:last.current}</div>,document.body);
}
