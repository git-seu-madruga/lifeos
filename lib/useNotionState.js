"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { hasChanges } from './notionDiff';
import { readState, saveState } from './storage';

const stripFiles = state => ({
  inbox: state.inbox || [],
  diary:state.diary || [],
  projects: state.projects.map(project => ({ ...project, attachments:(project.attachments || []).map(({ file, ...item }) => item) })),
  tasks: state.tasks.map(task => ({ ...task, attachments:(task.attachments || []).map(({ file, ...item }) => item) })),
});
function hydrate(state, result) {
  const bind = item => ({ ...item, ...(result.bindings[item.id] ? { _notionId:result.bindings[item.id] } : {}), ...(item.attachments ? { attachments:item.attachments.map(file => result.files[file.id] ? { ...result.files[file.id], file:undefined, uploadId:undefined } : file) } : {}) });
  return { diary:(state.diary || []).map(bind), diaryConfigured:state.diaryConfigured, inbox:(state.inbox || []).map(bind), projects:state.projects.map(project => ({ ...bind(project), milestones:project.milestones.map(bind) })), tasks:state.tasks.map(bind) };
}
export function useNotionState() {
  const [dataset,setDataset] = useState({ projects:null,tasks:null,inbox:null,diary:null,diaryConfigured:false });
  const [ready,setReady] = useState(false);
  const [authenticated,setAuthenticated] = useState(null);
  const [configured,setConfigured] = useState(true);
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(false);
  const [refreshedAt,setRefreshedAt] = useState(null);
  const current = useRef(null), baseline = useRef(null), running = useRef(null);
  const uploadCache = useRef(new Map());
  const timer = useRef(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const state = await api('/api/notion');
      const draft = await readState('notion-draft');
      if (!mounted.current) return;
      if (draft?.base && draft?.next && hasChanges(draft.base,draft.next)) {
        baseline.current={...draft.base,diary:draft.base.diary || state.diary || [],diaryConfigured:state.diaryConfigured,inbox:draft.base.inbox || state.inbox || []}; current.current={...draft.next,diary:draft.next.diary || state.diary || [],diaryConfigured:state.diaryConfigured,inbox:draft.next.inbox || state.inbox || []};
      } else { baseline.current=state; current.current=state; }
      setDataset(current.current); setReady(true); setRefreshedAt(new Date());
    } catch(e) { if (mounted.current) { setError(e.message); if(e.status===401) setAuthenticated(false); } }
    finally { if(mounted.current) setLoading(false); }
  },[]);
  useEffect(() => {
    mounted.current=true;
    api('/api/session').then(session => {
      if(!mounted.current)return;
      setConfigured(session.configured); setAuthenticated(session.authenticated);
      if(session.authenticated) load();
    }).catch(e => { if(mounted.current){setAuthenticated(false);setError(e.message);} });
    return () => { mounted.current=false; clearTimeout(timer.current); };
  },[load]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if(running.current)return running.current;
    if(!baseline.current || !current.current || !hasChanges(baseline.current,current.current))return;
    const operation = (async () => {
      setSaving(true);setError('');
      try {
        while(hasChanges(baseline.current,current.current)) {
          const snapshot=current.current, base=baseline.current;
          await saveState({base,next:snapshot},'notion-draft');
          const prepare = async item => {
            const attachments=[];
            for(const file of item.attachments || []) {
              if(file.notion || file.uploadId){attachments.push(file);continue;}
              let uploaded=uploadCache.current.get(file.id);
              if(!uploaded) {
                const form=new FormData();form.append('file',file.file,file.name);
                uploaded=await api('/api/notion/upload',{method:'POST',body:form});
                uploadCache.current.set(file.id,uploaded);
              }
              attachments.push({...file,...uploaded});
            }
            return {...item,attachments};
          };
          const prepared={projects:[],tasks:[],inbox:snapshot.inbox || [],diary:[]};
          for(const item of snapshot.projects)prepared.projects.push(await prepare(item));
          for(const item of snapshot.diary || [])prepared.diary.push(await prepare(item));
          for(const item of snapshot.tasks)prepared.tasks.push(await prepare(item));
          const result=await api('/api/notion/sync',{method:'POST',body:JSON.stringify({base:stripFiles(base),next:stripFiles(prepared)})});
          baseline.current=hydrate(snapshot,result);
          current.current=hydrate(current.current,result);
          if(mounted.current)setDataset(current.current);
          await saveState({base:baseline.current,next:current.current},'notion-draft');
        }
      } catch(e) {
        if(mounted.current){setError(e.message);if(e.status===401)setAuthenticated(false);}
        throw e;
      } finally { if(mounted.current)setSaving(false); }
    })();
    running.current=operation;
    try { await operation; } finally { running.current=null; }
  },[]);

  useEffect(() => {
    if(!ready || !baseline.current || !hasChanges(baseline.current,current.current))return;
    // Mantém um rascunho local enquanto o usuário continua editando.
    saveState({base:baseline.current,next:current.current},'notion-draft').catch(() => setError('Não foi possível manter o rascunho local. Salve no Notion antes de fechar.'));
    setSaving(true);
    timer.current=setTimeout(() => { flush().catch(() => {}); },800);
    return () => clearTimeout(timer.current);
  },[dataset,ready,flush]);

  const setDiary=useCallback(update => {
    const value=typeof update==='function'?update(current.current.diary):update;
    current.current={...current.current,diary:value};setDataset(current.current);
  },[]);
  const setInbox=useCallback(update => {
    const value=typeof update==='function'?update(current.current.inbox):update;
    current.current={...current.current,inbox:value};setDataset(current.current);
  },[]);
  const setTasks=useCallback(update => {
    const value=typeof update==='function'?update(current.current.tasks):update;
    current.current={...current.current,tasks:value};setDataset(current.current);
  },[]);
  const setProjects=useCallback(update => {
    const value=typeof update==='function'?update(current.current.projects):update;
    current.current={...current.current,projects:value};setDataset(current.current);
  },[]);
  async function refresh(discard = false) {
    setLoading(true);
    try {
      if (!discard) await flush();
      const state=await api('/api/notion');
      baseline.current=state;current.current=state;setDataset(state);setError('');setRefreshedAt(new Date());
      await saveState({base:state,next:state},'notion-draft');
    } catch(e){setError(e.message);if(e.status===401)setAuthenticated(false);throw e;} finally{setLoading(false);}
  }
  async function login(password) { await api('/api/session',{method:'POST',body:JSON.stringify({password})});setAuthenticated(true);setConfigured(true);await load(); }
  async function logout() { setLoading(true);try{await flush();await api('/api/session',{method:'DELETE'});setReady(false);setAuthenticated(false);setDataset({projects:null,tasks:null});current.current=null;baseline.current=null;}finally{setLoading(false);} }
  const pending=ready && current.current && baseline.current && hasChanges(baseline.current,current.current);
  useEffect(() => {
    if(!pending)return;
    const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[pending,error]);
  return {...dataset,setDiary,setTasks,setProjects,setInbox,ready,authenticated,configured,error,saving,loading,refreshedAt,load,refresh,login,logout,flush,pending};
}
