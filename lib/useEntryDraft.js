"use client";
import {useEffect,useRef,useState} from 'react';
import {registerEditorLeaveGuard} from './editingGuard';

// Ignore transport/hydration metadata; compare only editable content and file identity.
export function entryContent(record){
 if(!record)return '';
 const {updatedAt,...data}=record.data;
 return JSON.stringify({name:record.name,context:record.context||'personal',data,attachments:(record.attachments||[]).map(file=>({id:file.id,name:file.name,uploadId:file.uploadId}))});
}
export function useEntryDraft({setRecords,validate,onFlush,busy=false,timestamp=false}){
 const [session,setSession]=useState(null),[saving,setSaving]=useState(false);
 const latest=useRef(session),blocked=useRef(false),savingNow=useRef(false);latest.current=session;blocked.current=busy||saving;
 const assign=value=>{latest.current=value;setSession(value);};
 const isDirty=()=>!!latest.current&&entryContent(latest.current.record)!==entryContent(latest.current.base);
 const allowLeave=()=>!blocked.current&&(!isDirty()||window.confirm('Há alterações não salvas. O conteúdo só será salvo ao clicar em Salvar. Deseja sair e descartar essas alterações?'));
 useEffect(()=>{
  if(!session)return;
  const release=registerEditorLeaveGuard(()=>allowLeave());
  const beforeUnload=event=>{if(isDirty()||blocked.current){event.preventDefault();event.returnValue='';}};
  window.addEventListener('beforeunload',beforeUnload);
  return ()=>{release();window.removeEventListener('beforeunload',beforeUnload);};
 },[!!session]);
 const begin=(record,isNew=false)=>assign({record,base:record,isNew});
 const close=()=>{if(!allowLeave())return false;assign(null);return true;};
 const clear=()=>assign(null);
 const patch=(id,change)=>{
  const value=latest.current;if(!value||value.record.id!==id||savingNow.current)return;
  const delta=typeof change==='function'?change(value.record):change;
  assign({...value,record:{...value.record,...delta,data:{...value.record.data,...delta.data}}});
 };
 async function save(){
  if(blocked.current||!latest.current)return false;
  const current=latest.current,record={...current.record,name:current.record.name.trim()};
  if(timestamp)record.data={...record.data,updatedAt:Date.now()};
  const error=validate(record);if(error)throw new Error(error);
  blocked.current=true;savingNow.current=true;setSaving(true);
  try{
   if(current.isNew||entryContent(record)!==entryContent(current.base)){
    setRecords(previous=>{
     const old=previous.find(item=>item.id===record.id);
     if(!current.isNew&&(!old||entryContent(old)!==entryContent(current.base)))throw new Error('Esta entrada mudou desde que foi aberta. Suas edições continuam aqui. Reabra a entrada atualizada antes de salvar.');
     const next={...old,...record};
     return old?previous.map(item=>item.id===record.id?next:item):[...previous,next];
    });
    // Save was explicitly requested. If transport fails, the existing sync queue
    // retains it; never imply that discarding the editor can undo a submitted save.
    assign({record,base:record,isNew:false});
   }
   await onFlush?.();
   assign(null);return true;
  }finally{blocked.current=false;savingNow.current=false;setSaving(false);}
 }
 const refresh=record=>{if(record&&latest.current&&!isDirty()&&!savingNow.current)assign({...latest.current,record,base:record});};
 return {record:session?.record||null,dirty:!!session&&entryContent(session.record)!==entryContent(session.base),saving,begin,patch,close,clear,save,refresh};
}
