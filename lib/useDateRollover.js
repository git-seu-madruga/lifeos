"use client";
import {useEffect,useRef} from 'react';
import {habitToday} from './habits';

// A local clock follows today's default, without requests or changing manual dates.
export function useDateRollover(value,setValue,{blocked=()=>false}={}){
 const state=useRef({value,automatic:value===habitToday(),setValue,blocked});
 state.current={...state.current,value,setValue,blocked};
 const check=()=>{
  const current=state.current,today=habitToday();
  if(current.automatic&&!current.blocked()&&current.value!==today){current.value=today;current.setValue(today);}
 };
 useEffect(()=>{check();});
 useEffect(()=>{
  const visible=()=>{if(!document.hidden)check();};
  window.addEventListener('focus',visible);window.addEventListener('pageshow',visible);window.addEventListener('lifeos-refresh',check);window.addEventListener('lifeos-refresh-date',check);document.addEventListener('visibilitychange',visible);
  const timer=setInterval(visible,30000);
  return()=>{clearInterval(timer);window.removeEventListener('focus',visible);window.removeEventListener('pageshow',visible);window.removeEventListener('lifeos-refresh',check);window.removeEventListener('lifeos-refresh-date',check);document.removeEventListener('visibilitychange',visible);};
 },[]);
 const choose=next=>{const current=state.current,day=typeof next==='function'?next(current.value):next;current.automatic=day===habitToday();current.value=day;current.setValue(day);};
 const currentDefault=()=>state.current.automatic&&!state.current.blocked()?habitToday():state.current.value;
 return [choose,currentDefault];
}
