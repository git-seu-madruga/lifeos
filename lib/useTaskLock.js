"use client";
import {useEffect,useRef,useState} from 'react';
import {api} from './api';
export function useTaskLock(task,onRemoteLock){
 const latest=useRef({task,onRemoteLock});latest.current={task,onRemoteLock};const [error,setError]=useState('');
 useEffect(()=>{
  if(!task._notionId||!onRemoteLock)return;
  let alive=true,busy=false;
  const read=async()=>{if(!alive||busy||document.hidden)return;busy=true;const observed=!!latest.current.task.locked;
   try{const result=await api('/api/notion/task-lock?id='+encodeURIComponent(task._notionId));if(alive&&!!latest.current.task.locked===observed){latest.current.onRemoteLock?.(task.id,!!result.locked,result._routingVersion);setError('');}}
   catch(e){if(alive)setError(e.message);}finally{busy=false;}
  };
  read();window.addEventListener('focus',read);document.addEventListener('visibilitychange',read);const timer=setInterval(read,10000);
  return()=>{alive=false;clearInterval(timer);window.removeEventListener('focus',read);document.removeEventListener('visibilitychange',read);};
 },[task.id,task._notionId,onRemoteLock]);
 return error;
}
