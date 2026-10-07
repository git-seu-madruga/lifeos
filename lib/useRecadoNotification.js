"use client";
import {useEffect,useState} from 'react';
import {api} from './api';
import {recadoToday,hasUnreadRecadoToday} from './recados';

// Only foreground checks; failures preserve the last confirmed indication.
export function useRecadoNotification(user,enabled){
 const [notice,setNotice]=useState(null);
 useEffect(()=>{
  setNotice(null);
  if(!enabled||!user?.email)return;
  let live=true,inFlight=false,lastAttempt=0,revision=0;
  const apply=result=>{const day=recadoToday();setNotice(hasUnreadRecadoToday(result.items,user.email,day)?{day}:null);};
  const load=async(force=false)=>{
   if(!live||document.hidden||inFlight||(!force&&Date.now()-lastAttempt<10000))return;
   lastAttempt=Date.now();inFlight=true;const token=revision;
   try{const result=await api('/api/recados?month='+recadoToday().slice(0,7));if(live&&token===revision)apply(result);}catch{}finally{inFlight=false;}
  };
  const refresh=()=>load(),manual=()=>load(true);
  const changed=e=>{const {items,month,item}=e.detail||{};
   if(items&&month===recadoToday().slice(0,7)){revision++;apply({items});}
   else if(item?.recipient===user.email&&item.date===recadoToday()){revision++;apply({items:[item]});}
  };
  load(true);window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',refresh);window.addEventListener('lifeos-refresh',manual);window.addEventListener('lifeos-recados-updated',changed);
  return()=>{live=false;window.removeEventListener('focus',refresh);window.removeEventListener('pageshow',refresh);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('lifeos-refresh',manual);window.removeEventListener('lifeos-recados-updated',changed);};
 },[enabled,user?.email]);
 return notice?.day===recadoToday()?notice:null;
}
