"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import {withoutUntouchedEntries,withoutUntouchedState,promoteDraftEdits} from './entryDrafts';
import { normalizeTransaction } from './finance';
import { api,setApiUser } from './api';
import {hasOpenEditor} from './editingGuard';
import { hasChanges } from './notionDiff';
import { readState, saveState,readPrivateDraft,savePrivateDraft } from './storage';

const stripFiles = state => ({
  mediaSections:state.mediaSections||[],media:(state.media||[]).map(item=>({...item,attachments:(item.attachments||[]).map(({file,...rest})=>rest)})),
  habits:state.habits||[],habitLogs:state.habitLogs||[],
  shopping:state.shopping || [],
  contacts:state.contacts || [],
  categories:state.categories || [],transactions:state.transactions || [],
  inbox: state.inbox || [],
  diary:state.diary || [],
  projects: withoutUntouchedEntries(state.projects).map(project => ({ ...project, attachments:(project.attachments || []).map(({ file, ...item }) => item) })),
  tasks: withoutUntouchedEntries(state.tasks).map(task => ({ ...task, attachments:(task.attachments || []).map(({ file, ...item }) => item) })),
});
function hydrate(state, result) {
  const bind = item => ({ ...item, ...(result.bindings[item.id] ? { _notionId:result.bindings[item.id] } : {}), ...(item.attachments ? { attachments:item.attachments.map(file => result.files[file.id] ? { ...result.files[file.id], file:undefined, uploadId:undefined } : file) } : {}) });
  return {_routingVersion:state._routingVersion,mediaSections:(state.mediaSections||[]).map(bind),media:(state.media||[]).map(bind),mediaConfigured:state.mediaConfigured, user:state.user,sharedActivity:result.sharedActivity||state.sharedActivity,habits:(state.habits||[]).map(bind),habitLogs:(state.habitLogs||[]).map(bind),habitsConfigured:state.habitsConfigured,shopping:(state.shopping || []).map(bind),shoppingConfigured:state.shoppingConfigured,contacts:(state.contacts || []).map(bind),contactsConfigured:state.contactsConfigured, categories:(state.categories || []).map(bind),transactions:(state.transactions || []).map(bind),financeConfigured:state.financeConfigured, diary:(state.diary || []).map(bind), diaryConfigured:state.diaryConfigured, inbox:(state.inbox || []).map(bind), projects:state.projects.map(project => ({ ...bind(project), milestones:project.milestones.map(bind) })), tasks:state.tasks.map(bind) };
}
export function useNotionState() {
  const [dataset,setDataset] = useState({mediaSections:[],media:[],mediaConfigured:false, projects:null,tasks:null,inbox:null,diary:null,diaryConfigured:false,categories:[],transactions:[],financeConfigured:false,habits:[],habitLogs:[],habitsConfigured:false,shopping:[],shoppingConfigured:false,contacts:[],contactsConfigured:false });
  const [maintenance,setMaintenance]=useState(false);
  const [ready,setReady] = useState(false);
  const [authenticated,setAuthenticated] = useState(null);
  const [configured,setConfigured] = useState(true);
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(false);
  const [refreshedAt,setRefreshedAt] = useState(null);
  const userRef=useRef(null),sessionCheck=useRef(null),loginPoll=useRef(null),loginWindow=useRef(null);
  const draftKey=()=>'notion-draft:'+userRef.current?.id;
  const current = useRef(null), baseline = useRef(null), running = useRef(null);
  const uploadCache = useRef(new Map());
  const timer = useRef(null);
  const mounted = useRef(true);
  const manualRead=useRef(false),foregroundRead=useRef(null),resumeRead=useRef(null),deferredRead=useRef(false),lastReadAttempt=useRef(0);
  const noteRead=useCallback(()=>setRefreshedAt(new Date()),[]);

  const previousMaintenance=useRef(false);
  const checkMaintenance=useCallback(async()=>{if(!userRef.current||window.document?.hidden)return;try{const status=await api('/api/backup');if(mounted.current){const released=previousMaintenance.current&&!status.maintenance;previousMaintenance.current=!!status.maintenance;setMaintenance(!!status.maintenance);if(released)resumeRead.current?.(true);}}catch(e){if(e.status===401)setAuthenticated(false);}},[]);
  useEffect(()=>{if(!ready)return;const check=()=>{if(!window.document?.hidden)checkMaintenance();};check();window.addEventListener('focus',check);window.document?.addEventListener('visibilitychange',check);const timer=maintenance?window.setInterval(check,4000):null;return()=>{window.removeEventListener('focus',check);window.document?.removeEventListener('visibilitychange',check);if(timer!==null)window.clearInterval(timer);};},[ready,maintenance,checkMaintenance]);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const state = await api('/api/notion');
      if(userRef.current&&state.user&&state.user.id!==userRef.current.id)throw Object.assign(new Error('A conta mudou. Entre novamente.'),{status:401});
      userRef.current=state.user||userRef.current;setApiUser(userRef.current);
      const personalDraft=await readPrivateDraft(draftKey(),userRef.current?.draftKey);
      const oldDraft=!personalDraft&&state.user?.isLegacyOwner?await readState('notion-draft'):null;
      const draft=personalDraft||oldDraft;
      if (!mounted.current) return;
      if (draft?.base && draft?.next && hasChanges(draft.base,draft.next)) {
        baseline.current={...draft.base,mediaSections:draft.base.mediaSections||state.mediaSections||[],media:draft.base.media||state.media||[],mediaConfigured:state.mediaConfigured,user:state.user,sharedActivity:state.sharedActivity,habits:draft.base.habits||state.habits||[],habitLogs:draft.base.habitLogs||state.habitLogs||[],habitsConfigured:state.habitsConfigured,shopping:draft.base.shopping || state.shopping || [],shoppingConfigured:state.shoppingConfigured,contacts:draft.base.contacts || state.contacts || [],contactsConfigured:state.contactsConfigured,categories:draft.base.categories || state.categories || [],transactions:(draft.base.transactions || state.transactions || []).map(normalizeTransaction),financeConfigured:state.financeConfigured,diary:draft.base.diary || state.diary || [],diaryConfigured:state.diaryConfigured,inbox:draft.base.inbox || state.inbox || []}; current.current={...draft.next,mediaSections:draft.next.mediaSections||state.mediaSections||[],media:draft.next.media||state.media||[],mediaConfigured:state.mediaConfigured,user:state.user,sharedActivity:state.sharedActivity,habits:draft.next.habits||state.habits||[],habitLogs:draft.next.habitLogs||state.habitLogs||[],habitsConfigured:state.habitsConfigured,shopping:draft.next.shopping || state.shopping || [],shoppingConfigured:state.shoppingConfigured,contacts:draft.next.contacts || state.contacts || [],contactsConfigured:state.contactsConfigured,categories:draft.next.categories || state.categories || [],transactions:(draft.next.transactions || state.transactions || []).map(normalizeTransaction),financeConfigured:state.financeConfigured,diary:draft.next.diary || state.diary || [],diaryConfigured:state.diaryConfigured,inbox:draft.next.inbox || state.inbox || []};
      } else { baseline.current=state; current.current=state; }
      if(oldDraft){await savePrivateDraft({base:withoutUntouchedState(baseline.current),next:withoutUntouchedState(current.current)},draftKey(),userRef.current?.draftKey);await saveState(null,'notion-draft');}
      setDataset(current.current); setReady(true); lastReadAttempt.current=Date.now();setRefreshedAt(new Date());
    } catch(e) { if (mounted.current) { setError(e.message); if(e.status===401) setAuthenticated(false); } }
    finally { if(mounted.current) setLoading(false); }
  },[]);
  useEffect(() => {
    mounted.current=true;
    let checking=false;
    async function checkSession(force=false){
      if(checking||(userRef.current&&!force))return;checking=true;
      try{
        const session=await api('/api/session');if(!mounted.current)return;
        userRef.current=session.user||null;setApiUser(userRef.current);setConfigured(session.configured);setAuthenticated(session.authenticated);
        if(session.authenticated){loginWindow.current=null;if(loginPoll.current!==null){window.clearInterval(loginPoll.current);loginPoll.current=null;}await load();}
      }catch(e){if(mounted.current){setAuthenticated(false);setError(e.message);}}
      finally{checking=false;}
    }
    sessionCheck.current=checkSession;checkSession();
    const resume=()=>{if(window.document?.hidden)return;if(userRef.current&&loginPoll.current===null)resumeRead.current?.();else checkSession(loginPoll.current!==null);};
    const storageLogin=e=>{if(e.key==='lifeos-login-complete'&&(loginPoll.current!==null||!userRef.current))checkSession(true);};
    const completed=e=>{if(e.origin!==window.location.origin||e.source!==loginWindow.current||e.data?.type!=='lifeos-login-complete')return;if(e.data.error){setError(e.data.error);window.clearInterval(loginPoll.current);loginPoll.current=null;}else checkSession(true);};
    window.addEventListener('focus',resume);window.addEventListener('pageshow',resume);window.addEventListener('message',completed);window.addEventListener('storage',storageLogin);window.document?.addEventListener('visibilitychange',resume);
    return ()=>{mounted.current=false;clearTimeout(timer.current);if(loginPoll.current!==null)window.clearInterval(loginPoll.current);loginPoll.current=null;sessionCheck.current=null;window.removeEventListener('focus',resume);window.removeEventListener('pageshow',resume);window.removeEventListener('message',completed);window.removeEventListener('storage',storageLogin);window.document?.removeEventListener('visibilitychange',resume);};
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
          await savePrivateDraft({base:withoutUntouchedState(base),next:withoutUntouchedState(snapshot)},draftKey(),userRef.current?.draftKey);
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
          const prepared={mediaSections:snapshot.mediaSections||[],media:[],habits:snapshot.habits||[],habitLogs:snapshot.habitLogs||[],shopping:snapshot.shopping || [],contacts:snapshot.contacts || [],categories:snapshot.categories || [],transactions:snapshot.transactions || [],projects:[],tasks:[],inbox:snapshot.inbox || [],diary:[]};
          for(const item of snapshot.media||[])prepared.media.push(await prepare(item));
          for(const item of withoutUntouchedEntries(snapshot.projects))prepared.projects.push(await prepare(item));
          for(const item of snapshot.diary || [])prepared.diary.push(await prepare(item));
          for(const item of withoutUntouchedEntries(snapshot.tasks))prepared.tasks.push(await prepare(item));
          const result=await api('/api/notion/sync',{method:'POST',body:JSON.stringify({base:stripFiles(base),next:stripFiles(prepared),revision:base._routingVersion||''})});
          baseline.current=hydrate(snapshot,result);
          current.current=hydrate(current.current,result);
          if(mounted.current)setDataset(current.current);
          await savePrivateDraft({base:withoutUntouchedState(baseline.current),next:withoutUntouchedState(current.current)},draftKey(),userRef.current?.draftKey);
        }
      } catch(e) {
        if(mounted.current){setError(e.message);if(e.status===423){previousMaintenance.current=true;setMaintenance(true);}if(e.status===401)setAuthenticated(false);}
        throw e;
      } finally { if(mounted.current)setSaving(false); }
    })();
    running.current=operation;
    try { await operation; } finally { running.current=null;if(deferredRead.current&&!hasChanges(baseline.current,current.current))resumeRead.current?.(true); }
  },[]);

  useEffect(() => {
    if(!ready || !baseline.current || !hasChanges(baseline.current,current.current))return;
    // Mantém um rascunho local enquanto o usuário continua editando.
    savePrivateDraft({base:withoutUntouchedState(baseline.current),next:withoutUntouchedState(current.current)},draftKey(),userRef.current?.draftKey).catch(() => setError('Não foi possível manter o rascunho local. Salve no Notion antes de fechar.'));
    setSaving(true);
    timer.current=setTimeout(() => { flush().catch(() => {}); },800);
    return () => clearTimeout(timer.current);
  },[dataset,ready,flush]);

  const setEntertainment=useCallback(update=>{const value=typeof update==='function'?update({mediaSections:current.current.mediaSections||[],media:current.current.media||[]}):update;current.current={...current.current,...value};setDataset(current.current);},[]);
  const setHabits=useCallback(update=>{const value=typeof update==='function'?update({habits:current.current.habits||[],habitLogs:current.current.habitLogs||[]}):update;current.current={...current.current,...value};setDataset(current.current);},[]);
  const setShopping=useCallback(update=>{const value=typeof update==='function'?update(current.current.shopping || []):update;current.current={...current.current,shopping:value};setDataset(current.current);},[]);
  const setContacts=useCallback(update=>{const value=typeof update==='function'?update(current.current.contacts):update;current.current={...current.current,contacts:value};setDataset(current.current);},[]);
  const setFinance=useCallback(update=>{const next=typeof update==='function'?update({categories:current.current.categories,transactions:current.current.transactions}):update;current.current={...current.current,...next,transactions:(next.transactions || current.current.transactions || []).map(normalizeTransaction)};setDataset(current.current);},[]);
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
    current.current={...current.current,tasks:promoteDraftEdits(current.current.tasks,value)};setDataset(current.current);
  },[]);
  const setProjects=useCallback(update => {
    const value=typeof update==='function'?update(current.current.projects):update;
    current.current={...current.current,projects:promoteDraftEdits(current.current.projects,value)};setDataset(current.current);
  },[]);
  const refreshOnResume=useCallback(async(force=false)=>{
    if(!mounted.current||window.document?.hidden||!userRef.current||!baseline.current||!current.current)return;
    if(previousMaintenance.current||hasOpenEditor()||manualRead.current||running.current||hasChanges(baseline.current,current.current)){deferredRead.current=true;return;}
    if(foregroundRead.current)return foregroundRead.current;
    if(!force&&Date.now()-lastReadAttempt.current<10000)return;
    lastReadAttempt.current=Date.now();deferredRead.current=false;
    const base=baseline.current,userId=userRef.current.id;
    const operation=(async()=>{
      setLoading(true);
      try{
        const state=await api('/api/notion');
        if(!mounted.current||userRef.current?.id!==userId)return;
        if(state.user&&state.user.id!==userId)throw Object.assign(new Error('A conta mudou. Entre novamente.'),{status:401});
        // An edit/save may have started while this request was in flight.
        if(hasOpenEditor()||running.current||baseline.current!==base||hasChanges(baseline.current,current.current)){deferredRead.current=true;return;}
        const keepDrafts=kind=>[...(state[kind]||[]),...(current.current[kind]||[]).filter(item=>item._untouchedDraft)];
        const next={...state,projects:keepDrafts('projects'),tasks:keepDrafts('tasks')};
        baseline.current=state;current.current=next;setDataset(next);setError('');noteRead();
      }catch(e){if(mounted.current&&userRef.current?.id===userId){setError(e.message);if(e.status===423){previousMaintenance.current=true;setMaintenance(true);}if(e.status===401)setAuthenticated(false);}}
      finally{if(mounted.current)setLoading(false);}
    })();
    foregroundRead.current=operation;
    try{await operation;}finally{foregroundRead.current=null;}
  },[noteRead]);
  resumeRead.current=refreshOnResume;
  useEffect(()=>{const closed=()=>{if(deferredRead.current)refreshOnResume(true);};window.addEventListener('lifeos-editors-closed',closed);return()=>window.removeEventListener('lifeos-editors-closed',closed);},[refreshOnResume]);
  useEffect(()=>{if(ready&&deferredRead.current&&!running.current&&!hasChanges(baseline.current,current.current))refreshOnResume(true);},[dataset,ready,refreshOnResume]);
  async function refresh(discard = false) {
    if(foregroundRead.current)await foregroundRead.current;
    manualRead.current=true;setLoading(true);
    try {
      if (!discard) await flush();
      const base=baseline.current,userId=userRef.current?.id;
      const state=await api('/api/notion');
      if(state.user&&state.user.id!==userRef.current?.id)throw Object.assign(new Error('A conta mudou. Entre novamente.'),{status:401});
      if(!mounted.current||userRef.current?.id!==userId)return;
      if(baseline.current!==base||hasChanges(baseline.current,current.current)&&!discard)throw new Error('Você editou durante a atualização. O texto foi preservado; tente atualizar depois de salvar.');
      const next={...state,projects:[...(state.projects||[]),...(discard?[]:(current.current.projects||[]).filter(item=>item._untouchedDraft))],tasks:[...(state.tasks||[]),...(discard?[]:(current.current.tasks||[]).filter(item=>item._untouchedDraft))]};
      baseline.current=state;current.current=next;setDataset(next);setError('');lastReadAttempt.current=Date.now();noteRead();
      await savePrivateDraft({base:state,next:state},draftKey(),userRef.current?.draftKey);
    } catch(e){setError(e.message);if(e.status===401)setAuthenticated(false);throw e;} finally{manualRead.current=false;setLoading(false);if(deferredRead.current&&!hasChanges(baseline.current,current.current))resumeRead.current?.(true);}
  }
  function login(){
    setError('');const popup=window.open('/api/auth/google?popup=1','lifeos-google-login');
    if(!popup)setError('Se a janela de login não abriu, permita pop-ups para o LifeOS e tente novamente.');
    loginWindow.current=popup;if(loginPoll.current!==null)window.clearInterval(loginPoll.current);
    const deadline=Date.now()+600000;
    loginPoll.current=window.setInterval(()=>{if(Date.now()>deadline){window.clearInterval(loginPoll.current);loginPoll.current=null;}sessionCheck.current?.(true);},1200);
  }
  async function logout() { setLoading(true);try{await flush();await api('/api/session',{method:'DELETE'});setReady(false);setAuthenticated(false);setDataset({projects:null,tasks:null});current.current=null;baseline.current=null;userRef.current=null;setApiUser(null);}finally{setLoading(false);} }
  const pending=ready && current.current && baseline.current && hasChanges(baseline.current,current.current);
  useEffect(() => {
    if(!pending)return;
    const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[pending,error]);
  return {...dataset,setEntertainment,setHabits,setShopping,setContacts,setFinance,setDiary,setTasks,setProjects,setInbox,ready,authenticated,configured,error,saving,loading,refreshedAt,noteRead,maintenance,setMaintenance,checkMaintenance,load,refresh,login,logout,flush,pending};
}
