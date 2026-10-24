"use client";
import {STARTUP_GROUPS,startupOrder,startupGroupForTab,emptyStartupState,mergeStartupGroup,advanceSyncBaseline} from './startup';
import {promoteIdea,registerProjectAreas,saveProjectArea,moveInboxToSomeday} from './someday';
import { useCallback, useEffect, useRef, useState } from 'react';
import {withoutUntouchedEntries,withoutUntouchedState,promoteDraftEdits} from './entryDrafts';
import {runFuelImport} from './vehicleImportRunner';
import { normalizeTransaction } from './finance';
import { api,setApiUser,setApiLocked } from './api';
import {hasOpenEditor} from './editingGuard';
import { diffState,hasChanges,compactSyncState } from './notionDiff';
import { readState, saveState,readPrivateDraft,savePrivateDraft } from './storage';

const stripFiles = state => ({reference:(state.reference||[]).map(item=>({...item,attachments:(item.attachments||[]).map(({file,...rest})=>rest)})),someday:(state.someday||[]).map(item=>({...item,attachments:(item.attachments||[]).map(({file,...rest})=>rest)})),nutrition:state.nutrition||[],vehicles:state.vehicles||[],wellness:state.wellness||[],cycle:state.cycle||[],
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
function hydrate(state, result, sent = state) {
  const bind = item => ({ ...item, ...(result.owners?.[item.id]?{_ownerEmail:result.owners[item.id]}:{}), ...(result.bindings[item.id] ? { _notionId:result.bindings[item.id] } : {}), ...(item.attachments ? { attachments:item.attachments.map(file => result.files[file.id] ? { ...result.files[file.id], file:undefined, uploadId:undefined } : file) } : {}) });
  const sentTasks=new Map((sent.tasks||[]).map(task=>[task.id,task]));
  const bindTask=task=>{
    const original=sentTasks.get(task.id),confirmed=result.taskCompletions?.[task.id];
    const unchanged=original&&task.status===original.status&&(task.completedAt??null)===(original.completedAt??null);
    // Adopt the returned date without overwriting a reopen/re-completion made
    // while the request was in flight. Other edits (e.g. notes) stay local.
    return bind(confirmed&&unchanged?{...task,status:confirmed.status,completedAt:confirmed.completedAt}:task);
  };
  return {reference:(state.reference||[]).map(bind),referenceConfigured:state.referenceConfigured,someday:(state.someday||[]).map(bind),somedayConfigured:state.somedayConfigured,nutrition:(state.nutrition||[]).map(bind),nutritionConfigured:state.nutritionConfigured,vehicles:(state.vehicles||[]).map(bind),vehiclesConfigured:state.vehiclesConfigured,wellness:(state.wellness||[]).map(bind),cycle:(state.cycle||[]).map(bind),wellnessConfigured:state.wellnessConfigured,cycleConfigured:state.cycleConfigured,_routingVersion:state._routingVersion,mediaSections:(state.mediaSections||[]).map(bind),media:(state.media||[]).map(bind),mediaConfigured:state.mediaConfigured, user:state.user,sharedActivity:result.sharedActivity||state.sharedActivity,habits:(state.habits||[]).map(bind),habitLogs:(state.habitLogs||[]).map(bind),habitsConfigured:state.habitsConfigured,shopping:(state.shopping || []).map(bind),shoppingConfigured:state.shoppingConfigured,contacts:(state.contacts || []).map(bind),contactsConfigured:state.contactsConfigured, categories:(state.categories || []).map(bind),transactions:(state.transactions || []).map(bind),financeConfigured:state.financeConfigured, diary:(state.diary || []).map(bind), diaryConfigured:state.diaryConfigured, inbox:(state.inbox || []).map(bind), projects:state.projects.map(project => ({ ...bind(project), milestones:project.milestones.map(bind) })), tasks:state.tasks.map(bindTask) };
}
export function useNotionState(options={}) {
  const startupOptions=useRef(options);startupOptions.current=options;
  const startup=useRef({started:false,complete:false,generation:0,operation:null,loaded:null,status:{},errors:{},priority:null,revision:null,fatal:false});
  const [startupStatus,setStartupStatus]=useState({}),[startupErrors,setStartupErrors]=useState({}),[initializing,setInitializing]=useState(false);
  const publishStartup=()=>{setStartupStatus({...startup.current.status});setStartupErrors({...startup.current.errors});};
  const ensureLoaded=(...kinds)=>{if(startup.current.loaded&&kinds.some(kind=>!startup.current.loaded.has(kind)))throw new Error('Esta área ainda está carregando. Aguarde antes de editar.');};
  const isTabReady=useCallback(tab=>{const group=startupGroupForTab(tab);return !startup.current.loaded||!!group&&startup.current.status[group]==='ready';},[]);
  const finishStartup=()=>{startup.current.complete=true;startup.current.loaded=new Set(Object.values(STARTUP_GROUPS).flatMap(g=>g.kinds));startup.current.status=Object.fromEntries(Object.keys(STARTUP_GROUPS).map(key=>[key,'ready']));startup.current.errors={};publishStartup();setInitializing(false);};
  const [dataset,setDataset] = useState({reference:[],referenceConfigured:false,someday:[],somedayConfigured:false,nutrition:[],nutritionConfigured:false,vehicles:[],vehiclesConfigured:false,wellness:[],cycle:[],wellnessConfigured:false,cycleConfigured:false,mediaSections:[],media:[],mediaConfigured:false, projects:null,tasks:null,inbox:null,diary:null,diaryConfigured:false,categories:[],transactions:[],financeConfigured:false,habits:[],habitLogs:[],habitsConfigured:false,shopping:[],shoppingConfigured:false,contacts:[],contactsConfigured:false });
  const [qrLocked,setQrLocked]=useState(false);
  const qrLockRef=useRef(false),qrActivity=useRef(Date.now());
  const applyQrLock=useCallback(value=>{qrLockRef.current=value;setApiLocked(value);setQrLocked(value);},[]);
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
  const writeDraft=(...args)=>userRef.current?.temporary?Promise.resolve():savePrivateDraft(...args);
  const current = useRef(null), baseline = useRef(null), running = useRef(null);
  const importingVehicles=useRef(false);
  const uploadCache = useRef(new Map());
  const timer = useRef(null);
  const mounted = useRef(true);
  const manualRead=useRef(false),foregroundRead=useRef(null),resumeRead=useRef(null),deferredRead=useRef(false),lastReadAttempt=useRef(0);
  const noteRead=useCallback(()=>setRefreshedAt(new Date()),[]);

  const previousMaintenance=useRef(false);
  const checkMaintenance=useCallback(async()=>{if(qrLockRef.current||!userRef.current||window.document?.hidden)return;try{const status=await api('/api/backup');if(mounted.current){const released=previousMaintenance.current&&!status.maintenance;previousMaintenance.current=!!status.maintenance;setMaintenance(!!status.maintenance);if(released)resumeRead.current?.(true);}}catch(e){if(e.status===401)setAuthenticated(false);}},[]);
  useEffect(()=>{if(!ready)return;const check=()=>{if(!window.document?.hidden)checkMaintenance();};check();window.addEventListener('focus',check);window.document?.addEventListener('visibilitychange',check);const timer=maintenance?window.setInterval(check,4000):null;return()=>{window.removeEventListener('focus',check);window.document?.removeEventListener('visibilitychange',check);if(timer!==null)window.clearInterval(timer);};},[ready,maintenance,checkMaintenance]);
  const runStartup=useRef(null);
  const startProgressive=useCallback(async()=>{
    const progress=startup.current;
    if(progress.operation)return progress.operation;
    if(manualRead.current)return;
    const user=userRef.current;if(!user||progress.fatal)return;
    const generation=progress.generation,alive=()=>mounted.current&&startup.current.generation===generation&&userRef.current?.id===user.id&&userRef.current?.sessionId===user.sessionId;
    const operation=(async()=>{
      setLoading(true);setInitializing(true);if(!progress.started)setError('');progress.paused=false;lastReadAttempt.current=Date.now();
      try{
        if(!progress.started){
          const personal=user.temporary?null:await readPrivateDraft(draftKey(),user.draftKey);
          const legacy=!personal&&!user.temporary&&user.isLegacyOwner?await readState('notion-draft'):null;
          if(!alive())return;
          if((personal||legacy)?.base&&(personal||legacy)?.next&&hasChanges((personal||legacy).base,(personal||legacy).next))return 'full-draft';
          progress.started=true;progress.loaded=new Set();progress.status=Object.fromEntries(Object.keys(STARTUP_GROUPS).map(key=>[key,'pending']));
          const empty=emptyStartupState(user);baseline.current=empty;current.current=empty;setDataset(empty);setReady(true);publishStartup();
        }
        const attempted=new Set();progress.attempted=attempted;
        while(alive()&&!qrLockRef.current&&!window.document?.hidden&&!previousMaintenance.current){
          const key=startupOrder(startupOptions.current.tabOrder||[],progress.priority).find(key=>progress.status[key]!=='ready'&&!attempted.has(key));
          if(!key)break;attempted.add(key);progress.status[key]='loading';delete progress.errors[key];publishStartup();
          try{
            if(!STARTUP_GROUPS[key].kinds.length){progress.status[key]='ready';publishStartup();continue;}
            const incoming=await api('/api/notion?group='+encodeURIComponent(key));
            if(!alive())return;
            if(qrLockRef.current){progress.status[key]='pending';publishStartup();return;}
            if(incoming._startupGroup!==key)throw new Error('Resposta de carregamento inválida. Tente novamente.');
            if(incoming.user?.id!==user.id||incoming.user?.sessionId!==user.sessionId)throw Object.assign(new Error('A conta ou sessão mudou. Entre novamente.'),{status:401});
            const revision=incoming._routingVersion||'';
            if(progress.revision!==null&&progress.revision!==revision){progress.fatal=true;progress.loaded.clear();for(const group of Object.keys(progress.status)){progress.status[group]='error';progress.errors[group]='Os bancos foram restaurados durante a abertura. Use Atualizar para carregar a versão atual.';}publishStartup();throw Object.assign(new Error(progress.errors[key]),{status:409});}
            progress.revision=revision;
            const base=mergeStartupGroup(baseline.current,incoming,key),next=mergeStartupGroup(current.current,incoming,key);
            baseline.current=base;current.current=next;for(const kind of STARTUP_GROUPS[key].kinds)progress.loaded.add(kind);progress.status[key]='ready';delete progress.errors[key];setDataset(next);publishStartup();
          }catch(e){
            if(!alive())return;progress.status[key]='error';progress.errors[key]=e.message;publishStartup();
            if(e.status===401){setError(e.message);setAuthenticated(false);break;}
            if(e.status===428||e.status===423||progress.fatal)break;
          }
        }
        if(alive()&&Object.values(progress.status).every(value=>value==='ready')){progress.complete=true;lastReadAttempt.current=Date.now();setRefreshedAt(new Date());}
      }catch(e){if(alive())setError(e.message);}
      finally{if(alive()){progress.paused=!!window.document?.hidden||qrLockRef.current||previousMaintenance.current;setLoading(false);setInitializing(false);}}
    })();
    progress.operation=operation;
    try{return await operation;}finally{if(progress.operation===operation)progress.operation=null;}
  },[]);
  runStartup.current=startProgressive;
  const prioritizeTab=useCallback(tab=>{startup.current.priority=tab;const group=startupGroupForTab(tab);if(startup.current.status[group]==='error')startup.current.attempted?.delete(group);if(startupOptions.current.progressive&&startup.current.started&&!startup.current.complete&&!startup.current.fatal)runStartup.current?.();},[]);
  const retryStartup=useCallback(group=>{if(!Object.hasOwn(STARTUP_GROUPS,group))return;startup.current.attempted?.delete(group);startup.current.priority=STARTUP_GROUPS[group].tabs[0]||null;runStartup.current?.();},[]);
  const load = useCallback(async () => {
    if(startupOptions.current.progressive&&!startup.current.complete){const result=await startProgressive();if(result!=='full-draft')return;}
    const generation=++startup.current.generation,user=userRef.current;
    const validLoad=()=>mounted.current&&generation===startup.current.generation&&userRef.current?.id===user?.id&&userRef.current?.sessionId===user?.sessionId;
    setLoading(true); setError('');
    try {
      const state = await api('/api/notion');
      if(!validLoad())return;
      if(userRef.current&&state.user&&state.user.id!==userRef.current.id)throw Object.assign(new Error('A conta mudou. Entre novamente.'),{status:401});
      userRef.current=state.user||userRef.current;setApiUser(userRef.current);
      const personalDraft=userRef.current?.temporary?null:await readPrivateDraft(draftKey(),userRef.current?.draftKey);
      const oldDraft=!personalDraft&&!userRef.current?.temporary&&state.user?.isLegacyOwner?await readState('notion-draft'):null;
      const draft=personalDraft||oldDraft;
      if (!validLoad()) return;
      if (draft?.base && draft?.next && hasChanges(draft.base,draft.next)) {
        baseline.current={...draft.base,reference:draft.base.reference||state.reference||[],referenceConfigured:state.referenceConfigured,someday:draft.base.someday||state.someday||[],somedayConfigured:state.somedayConfigured,nutrition:draft.base.nutrition||state.nutrition||[],nutritionConfigured:state.nutritionConfigured,vehicles:draft.base.vehicles||state.vehicles||[],vehiclesConfigured:state.vehiclesConfigured,wellness:draft.base.wellness||state.wellness||[],cycle:draft.base.cycle||state.cycle||[],wellnessConfigured:state.wellnessConfigured,cycleConfigured:state.cycleConfigured,mediaSections:draft.base.mediaSections||state.mediaSections||[],media:draft.base.media||state.media||[],mediaConfigured:state.mediaConfigured,user:state.user,sharedActivity:state.sharedActivity,habits:draft.base.habits||state.habits||[],habitLogs:draft.base.habitLogs||state.habitLogs||[],habitsConfigured:state.habitsConfigured,shopping:draft.base.shopping || state.shopping || [],shoppingConfigured:state.shoppingConfigured,contacts:draft.base.contacts || state.contacts || [],contactsConfigured:state.contactsConfigured,categories:draft.base.categories || state.categories || [],transactions:(draft.base.transactions || state.transactions || []).map(normalizeTransaction),financeConfigured:state.financeConfigured,diary:draft.base.diary || state.diary || [],diaryConfigured:state.diaryConfigured,inbox:draft.base.inbox || state.inbox || []}; current.current={...draft.next,reference:draft.next.reference||state.reference||[],referenceConfigured:state.referenceConfigured,someday:draft.next.someday||state.someday||[],somedayConfigured:state.somedayConfigured,nutrition:draft.next.nutrition||state.nutrition||[],nutritionConfigured:state.nutritionConfigured,vehicles:draft.next.vehicles||state.vehicles||[],vehiclesConfigured:state.vehiclesConfigured,wellness:draft.next.wellness||state.wellness||[],cycle:draft.next.cycle||state.cycle||[],wellnessConfigured:state.wellnessConfigured,cycleConfigured:state.cycleConfigured,mediaSections:draft.next.mediaSections||state.mediaSections||[],media:draft.next.media||state.media||[],mediaConfigured:state.mediaConfigured,user:state.user,sharedActivity:state.sharedActivity,habits:draft.next.habits||state.habits||[],habitLogs:draft.next.habitLogs||state.habitLogs||[],habitsConfigured:state.habitsConfigured,shopping:draft.next.shopping || state.shopping || [],shoppingConfigured:state.shoppingConfigured,contacts:draft.next.contacts || state.contacts || [],contactsConfigured:state.contactsConfigured,categories:draft.next.categories || state.categories || [],transactions:(draft.next.transactions || state.transactions || []).map(normalizeTransaction),financeConfigured:state.financeConfigured,diary:draft.next.diary || state.diary || [],diaryConfigured:state.diaryConfigured,inbox:draft.next.inbox || state.inbox || []};
      } else { baseline.current=state; current.current=state; }
      if(oldDraft){await writeDraft({base:withoutUntouchedState(baseline.current),next:withoutUntouchedState(current.current)},draftKey(),userRef.current?.draftKey);await saveState(null,'notion-draft');}
      finishStartup();setDataset(current.current); setReady(true); lastReadAttempt.current=Date.now();setRefreshedAt(new Date());
    } catch(e) { if (validLoad()) { setError(e.message); if(e.status===401) setAuthenticated(false); } }
    finally { if(validLoad()) setLoading(false); }
  },[]);
  useEffect(() => {
    mounted.current=true;
    let checking=false;
    async function checkSession(force=false){
      if(checking||(userRef.current&&!force))return;checking=true;
      try{
        const session=await api('/api/session');if(!mounted.current)return;
        userRef.current=session.user||null;setApiUser(userRef.current);setConfigured(session.configured);setAuthenticated(session.authenticated);
        if(session.user?.temporary){qrActivity.current=session.user.lastInteractionAt||Date.now();applyQrLock(!!session.user.locked);}else applyQrLock(false);
        if(session.authenticated&&session.user?.locked)return;
        if(session.authenticated){loginWindow.current=null;if(loginPoll.current!==null){window.clearInterval(loginPoll.current);loginPoll.current=null;}await load();}
      }catch(e){if(mounted.current){setAuthenticated(false);setError(e.message);}}
      finally{checking=false;}
    }
    sessionCheck.current=checkSession;checkSession();
    const resume=()=>{if(window.document?.hidden)return;if(userRef.current&&loginPoll.current===null)resumeRead.current?.();else checkSession(loginPoll.current!==null);};
    const storageLogin=e=>{if(e.key==='lifeos-login-complete'&&(loginPoll.current!==null||!userRef.current))checkSession(true);};
    const completed=e=>{if(e.origin!==window.location.origin||e.source!==loginWindow.current||e.data?.type!=='lifeos-login-complete')return;if(e.data.error){setError(e.data.error);window.clearInterval(loginPoll.current);loginPoll.current=null;}else checkSession(true);};
    window.addEventListener('focus',resume);window.addEventListener('pageshow',resume);window.addEventListener('message',completed);window.addEventListener('storage',storageLogin);window.document?.addEventListener('visibilitychange',resume);
    return ()=>{mounted.current=false;startup.current.generation++;startup.current.operation=null;clearTimeout(timer.current);if(loginPoll.current!==null)window.clearInterval(loginPoll.current);loginPoll.current=null;sessionCheck.current=null;window.removeEventListener('focus',resume);window.removeEventListener('pageshow',resume);window.removeEventListener('message',completed);window.removeEventListener('storage',storageLogin);window.document?.removeEventListener('visibilitychange',resume);};
  },[load]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if(qrLockRef.current)return;
    if(running.current)return running.current;
    if(!baseline.current || !current.current || !hasChanges(baseline.current,current.current))return;
    const operation = (async () => {
      setSaving(true);setError('');
      try {
        while(hasChanges(baseline.current,current.current)) {
          const snapshot=current.current, base=baseline.current;
          if(startup.current.loaded)for(const [kind,change] of Object.entries(diffState(base,snapshot)))if(change.upserts.length||change.deletions.length)ensureLoaded(kind);
          await writeDraft({base:withoutUntouchedState(base),next:withoutUntouchedState(snapshot)},draftKey(),userRef.current?.draftKey);
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
          const delta=compactSyncState(base,snapshot), changedSnapshot=delta.next;
          const prepared={reference:[],someday:[],nutrition:changedSnapshot.nutrition||[],vehicles:changedSnapshot.vehicles||[],wellness:changedSnapshot.wellness||[],cycle:changedSnapshot.cycle||[],mediaSections:changedSnapshot.mediaSections||[],media:[],habits:changedSnapshot.habits||[],habitLogs:changedSnapshot.habitLogs||[],shopping:changedSnapshot.shopping || [],contacts:changedSnapshot.contacts || [],categories:changedSnapshot.categories || [],transactions:changedSnapshot.transactions || [],projects:[],tasks:[],inbox:changedSnapshot.inbox || [],diary:[]};
          for(const item of changedSnapshot.reference||[])prepared.reference.push(await prepare(item));
          for(const item of changedSnapshot.someday||[])prepared.someday.push(await prepare(item));
          for(const item of changedSnapshot.media||[])prepared.media.push(await prepare(item));
          for(const item of withoutUntouchedEntries(changedSnapshot.projects))prepared.projects.push(await prepare(item));
          for(const item of changedSnapshot.diary || [])prepared.diary.push(await prepare(item));
          for(const item of withoutUntouchedEntries(changedSnapshot.tasks))prepared.tasks.push(await prepare(item));
          const result=await api('/api/notion/sync',{method:'POST',body:JSON.stringify({...compactSyncState(stripFiles(delta.base),stripFiles(prepared)),partial:true,revision:base._routingVersion||''})});
          if(!current.current||!userRef.current||userRef.current.id!==snapshot.user?.id||userRef.current.sessionId!==snapshot.user?.sessionId)throw Object.assign(new Error('A sessão terminou. Entre novamente.'),{status:401});
          baseline.current=hydrate(advanceSyncBaseline(baseline.current,snapshot,diffState(base,snapshot)),result,snapshot);
          current.current=hydrate(current.current,result,snapshot);
          if(mounted.current)setDataset(current.current);
          await writeDraft({base:withoutUntouchedState(baseline.current),next:withoutUntouchedState(current.current)},draftKey(),userRef.current?.draftKey);
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
    if(qrLocked||!ready || !baseline.current)return;
    if(!hasChanges(baseline.current,current.current)){
      if(!running.current){setSaving(false);setError('');}
      return;
    }
    // Mantém um rascunho local enquanto o usuário continua editando.
    writeDraft({base:withoutUntouchedState(baseline.current),next:withoutUntouchedState(current.current)},draftKey(),userRef.current?.draftKey).catch(() => setError('Não foi possível manter o rascunho local. Salve no Notion antes de fechar.'));
    setSaving(true);
    timer.current=setTimeout(() => { flush().catch(() => {}); },800);
    return () => clearTimeout(timer.current);
  },[dataset,ready,flush,qrLocked]);

  useEffect(()=>{
    if(!ready||qrLockRef.current||!current.current)return;
    if(startup.current.loaded&&['projects','tasks','someday'].some(kind=>!startup.current.loaded.has(kind)))return;
    const next=registerProjectAreas(current.current);
    if(next!==current.current){current.current=next;setDataset(next);}
  },[ready,dataset.projects,dataset.someday,dataset.somedayConfigured,qrLocked]);
  const saveArea=useCallback(record=>{
    if(qrLockRef.current||!current.current)throw new Error('Desbloqueie a sessão antes de continuar.');
    ensureLoaded('projects','tasks','someday');
    current.current=saveProjectArea(current.current,record);setDataset(current.current);
  },[]);
  const setReference=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('reference');const reference=typeof update==='function'?update(current.current.reference||[]):update;current.current={...current.current,reference};setDataset(current.current);},[]);
  const setSomeday=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('someday','projects','tasks');const someday=typeof update==='function'?update(current.current.someday||[]):update;current.current={...current.current,someday};setDataset(current.current);},[]);
  const convertInboxToSomeday=useCallback((id,areaUid)=>{
    if(qrLockRef.current||!current.current)throw new Error('Desbloqueie a sessão antes de continuar.');
    ensureLoaded('inbox','projects','tasks','someday');
    const moved=moveInboxToSomeday(current.current,id,areaUid);
    current.current=moved.state;setDataset(current.current);return moved.id;
  },[]);
  const promoteSomeday=useCallback(async(id,kind)=>{
    ensureLoaded('projects','tasks','someday');
    if(qrLockRef.current||!current.current)throw new Error('Desbloqueie a sessão antes de continuar.');
    await flush();
    let idea=current.current?.someday?.find(r=>r.id===id);if(!idea)throw new Error('A ideia não foi encontrada.');
    const user=userRef.current?.id;
    if(idea.attachments?.length){
      const fresh=await api('/api/notion/someday-assets?id='+encodeURIComponent(idea._notionId||idea.id));
      if(!current.current||userRef.current?.id!==user||qrLockRef.current)throw new Error('A sessão mudou.');
      idea=current.current.someday.find(r=>r.id===id);
      if(!idea||idea.attachments.some(a=>!fresh.attachments.some(f=>f.name===a.name)))throw new Error('Os anexos mudaram. Aguarde o salvamento e tente novamente.');
      current.current={...current.current,someday:current.current.someday.map(r=>r.id===id?{...r,attachments:r.attachments.map(a=>({...fresh.attachments.find(f=>f.name===a.name),id:a.id}))}:r)};
    }
    current.current=promoteIdea(current.current,id,kind);setDataset(current.current);await flush();
  },[flush]);
  const setNutrition=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('nutrition');const nutrition=typeof update==='function'?update(current.current.nutrition||[]):update;current.current={...current.current,nutrition};setDataset(current.current);},[]);
  const setVehicles=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('vehicles');const vehicles=typeof update==='function'?update(current.current.vehicles||[]):update;current.current={...current.current,vehicles};setDataset(current.current);},[]);
  const importVehicles=useCallback(async(items,onProgress)=>{
    if(importingVehicles.current)throw new Error('Já há uma importação em andamento.');
    if(qrLockRef.current||!current.current||!userRef.current)throw new Error('Desbloqueie a sessão antes de importar.');
    importingVehicles.current=true;
    const session=userRef.current.sessionId,user=userRef.current.id;
    try{await runFuelImport(items,{
      read:()=>current.current?.vehicles,
      append:batch=>setVehicles(previous=>[...previous,...batch]),flush,onProgress,
      shouldPause:()=>qrLockRef.current||window.document?.hidden||!userRef.current||userRef.current.id!==user||userRef.current.sessionId!==session
    });}finally{importingVehicles.current=false;}
  },[flush,setVehicles]);
  const setEntertainment=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('media','mediaSections');const value=typeof update==='function'?update({mediaSections:current.current.mediaSections||[],media:current.current.media||[]}):update;current.current={...current.current,...value};setDataset(current.current);},[]);
  const setWellness=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('wellness','cycle');const value=typeof update==='function'?update({wellness:current.current.wellness||[],cycle:current.current.cycle||[]}):update;current.current={...current.current,...value};setDataset(current.current);},[]);
  const setHabits=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('habits','habitLogs');const value=typeof update==='function'?update({habits:current.current.habits||[],habitLogs:current.current.habitLogs||[]}):update;current.current={...current.current,...value};setDataset(current.current);},[]);
  const setShopping=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('shopping');const value=typeof update==='function'?update(current.current.shopping || []):update;current.current={...current.current,shopping:value};setDataset(current.current);},[]);
  const setContacts=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('contacts');const value=typeof update==='function'?update(current.current.contacts):update;current.current={...current.current,contacts:value};setDataset(current.current);},[]);
  const setFinance=useCallback(update=>{if(qrLockRef.current||!current.current)return;ensureLoaded('categories','transactions');const next=typeof update==='function'?update({categories:current.current.categories,transactions:current.current.transactions}):update;current.current={...current.current,...next,transactions:(next.transactions || current.current.transactions || []).map(normalizeTransaction)};setDataset(current.current);},[]);
  const setDiary=useCallback(update => {
    if(qrLockRef.current||!current.current)return;ensureLoaded('diary');
    const value=typeof update==='function'?update(current.current.diary):update;
    current.current={...current.current,diary:value};setDataset(current.current);
  },[]);
  const setInbox=useCallback(update => {
    if(qrLockRef.current||!current.current)return;ensureLoaded('inbox');
    const value=typeof update==='function'?update(current.current.inbox):update;
    current.current={...current.current,inbox:value};setDataset(current.current);
  },[]);
  const setTasks=useCallback(update => {
    if(qrLockRef.current||!current.current)return;ensureLoaded('projects','tasks','milestones','someday');
    const value=typeof update==='function'?update(current.current.tasks):update;
    current.current={...current.current,tasks:promoteDraftEdits(current.current.tasks,value)};setDataset(current.current);
  },[]);
  const setProjects=useCallback(update => {
    if(qrLockRef.current||!current.current)return;ensureLoaded('projects','tasks','milestones','someday');
    const value=typeof update==='function'?update(current.current.projects):update;
    current.current={...current.current,projects:promoteDraftEdits(current.current.projects,value)};setDataset(current.current);
  },[]);
  const refreshOnResume=useCallback(async(force=false)=>{
    if(startupOptions.current.progressive&&startup.current.started&&!startup.current.complete){if(!manualRead.current&&!window.document?.hidden&&!qrLockRef.current&&(force||startup.current.paused||Date.now()-lastReadAttempt.current>=10000))await runStartup.current?.();return;}
    if(qrLockRef.current||!mounted.current||window.document?.hidden||!userRef.current||!baseline.current||!current.current)return;
    if(previousMaintenance.current||hasOpenEditor()||manualRead.current||running.current||hasChanges(baseline.current,current.current)){deferredRead.current=true;return;}
    if(foregroundRead.current)return foregroundRead.current;
    if(!force&&Date.now()-lastReadAttempt.current<10000)return;
    lastReadAttempt.current=Date.now();deferredRead.current=false;
    const base=baseline.current,userId=userRef.current.id,generation=startup.current.generation;
    const operation=(async()=>{
      setLoading(true);
      try{
        const state=await api('/api/notion');
        if(!mounted.current||generation!==startup.current.generation||userRef.current?.id!==userId)return;
        if(state.user&&state.user.id!==userId)throw Object.assign(new Error('A conta mudou. Entre novamente.'),{status:401});
        // An edit/save may have started while this request was in flight.
        if(hasOpenEditor()||running.current||baseline.current!==base||hasChanges(baseline.current,current.current)){deferredRead.current=true;return;}
        const keepDrafts=kind=>[...(state[kind]||[]),...(current.current[kind]||[]).filter(item=>item._untouchedDraft)];
        const next={...state,projects:keepDrafts('projects'),tasks:keepDrafts('tasks')};
        baseline.current=state;current.current=next;setDataset(next);setError('');noteRead();
      }catch(e){if(mounted.current&&generation===startup.current.generation&&userRef.current?.id===userId){setError(e.message);if(e.status===423){previousMaintenance.current=true;setMaintenance(true);}if(e.status===401)setAuthenticated(false);}}
      finally{if(mounted.current&&generation===startup.current.generation)setLoading(false);}
    })();
    foregroundRead.current=operation;
    try{await operation;}finally{if(foregroundRead.current===operation)foregroundRead.current=null;}
  },[noteRead]);
  resumeRead.current=refreshOnResume;
  useEffect(()=>{const closed=()=>{if(deferredRead.current)refreshOnResume(true);};window.addEventListener('lifeos-editors-closed',closed);return()=>window.removeEventListener('lifeos-editors-closed',closed);},[refreshOnResume]);
  useEffect(()=>{if(ready&&deferredRead.current&&!running.current&&!hasChanges(baseline.current,current.current))refreshOnResume(true);},[dataset,ready,refreshOnResume]);
  async function refresh(discard = false) {
    if(startup.current.operation)await startup.current.operation;
    const generation=++startup.current.generation;
    if(foregroundRead.current)await foregroundRead.current;
    manualRead.current=true;setLoading(true);
    try {
      if (!discard) await flush();
      const base=baseline.current,userId=userRef.current?.id;
      const state=await api('/api/notion');
      if(!mounted.current||generation!==startup.current.generation||userRef.current?.id!==userId)return;
      if(state.user&&state.user.id!==userRef.current?.id)throw Object.assign(new Error('A conta mudou. Entre novamente.'),{status:401});
      if(baseline.current!==base||hasChanges(baseline.current,current.current)&&!discard)throw new Error('Você editou durante a atualização. O texto foi preservado; tente atualizar depois de salvar.');
      const next={...state,projects:[...(state.projects||[]),...(discard?[]:(current.current.projects||[]).filter(item=>item._untouchedDraft))],tasks:[...(state.tasks||[]),...(discard?[]:(current.current.tasks||[]).filter(item=>item._untouchedDraft))]};
      baseline.current=state;current.current=next;startup.current.revision=state._routingVersion||'';startup.current.fatal=false;finishStartup();setDataset(next);setError('');lastReadAttempt.current=Date.now();noteRead();
      await writeDraft({base:state,next:state},draftKey(),userRef.current?.draftKey);
    } catch(e){if(generation===startup.current.generation){setError(e.message);if(e.status===401)setAuthenticated(false);}throw e;} finally{if(generation===startup.current.generation){manualRead.current=false;setLoading(false);if(deferredRead.current&&!hasChanges(baseline.current,current.current))resumeRead.current?.(true);}}
  }
  function login(){
    setError('');const popup=window.open('/api/auth/google?popup=1','lifeos-google-login');
    if(!popup)setError('Se a janela de login não abriu, permita pop-ups para o LifeOS e tente novamente.');
    loginWindow.current=popup;if(loginPoll.current!==null)window.clearInterval(loginPoll.current);
    const deadline=Date.now()+600000;
    loginPoll.current=window.setInterval(()=>{if(Date.now()>deadline){window.clearInterval(loginPoll.current);loginPoll.current=null;}sessionCheck.current?.(true);},1200);
  }
  const qrLoginComplete=useCallback(()=>sessionCheck.current?.(true),[]);
  useEffect(()=>{if(authenticated!==false)return;startup.current.generation++;startup.current.started=false;startup.current.complete=false;startup.current.loaded=null;startup.current.operation=null;startup.current.revision=null;startup.current.fatal=false;startup.current.status={};startup.current.errors={};publishStartup();setInitializing(false);manualRead.current=false;foregroundRead.current=null;deferredRead.current=false;applyQrLock(false);clearTimeout(timer.current);current.current=null;baseline.current=null;uploadCache.current.clear();userRef.current=null;setApiUser(null);setReady(false);setDataset({projects:null,tasks:null});},[authenticated]);
  useEffect(()=>{const user=userRef.current;if(!authenticated||!user?.temporary)return;let lastCheck=0,checking=false,alive=true,deadlineTimer;const expiresAt=user.expiresAt;
    const scheduleDeadline=()=>{clearTimeout(deadlineTimer);deadlineTimer=setTimeout(()=>{if(Date.now()>=expiresAt)expire();else lock();},Math.max(0,(qrLockRef.current?expiresAt:Math.min(expiresAt,qrActivity.current+600000))-Date.now()));};
    const expire=()=>{if(!alive)return;api('/api/session',{method:'DELETE'}).catch(()=>{});applyQrLock(false);setError('A sessão temporária terminou. Entre novamente para continuar.');setAuthenticated(false);};
    const lock=()=>{if(qrLockRef.current)return;applyQrLock(true);clearTimeout(timer.current);scheduleDeadline();api('/api/auth/qr',{method:'POST',body:JSON.stringify({action:'lock'})}).catch(e=>{if(e.status===401)expire();});};
    const check=async()=>{if(Date.now()>=expiresAt){expire();return;}if(Date.now()-qrActivity.current>=600000)lock();if(document.hidden||checking||Date.now()-lastCheck<60000)return;lastCheck=Date.now();checking=true;try{const session=await api('/api/session');if(!alive)return;if(!session.authenticated||session.user?.sessionId!==user.sessionId){expire();return;}if(session.user.locked)applyQrLock(true);else if(!qrLockRef.current&&Date.now()-qrActivity.current<60000)await api('/api/auth/qr',{method:'POST',body:JSON.stringify({action:'heartbeat'})});}catch(e){if(e.status===401)expire();if(e.status===428)applyQrLock(true);}finally{checking=false;}};
    const interact=()=>{if(Date.now()>=expiresAt){expire();return;}if(Date.now()-qrActivity.current>=600000){lock();return;}if(!qrLockRef.current){qrActivity.current=Date.now();scheduleDeadline();}};
    const blocked=()=>applyQrLock(true),events=['pointerdown','keydown','touchstart','wheel'];for(const event of events)window.addEventListener(event,interact,{passive:true,capture:true});window.addEventListener('lifeos-qr-locked',blocked);document.addEventListener('visibilitychange',check);window.addEventListener('focus',check);const interval=window.setInterval(check,15000);scheduleDeadline();check();return()=>{alive=false;clearTimeout(deadlineTimer);window.clearInterval(interval);for(const event of events)window.removeEventListener(event,interact,{capture:true});window.removeEventListener('lifeos-qr-locked',blocked);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
  },[authenticated,ready,dataset.user?.sessionId,qrLocked,applyQrLock]);
  async function unlockQr(code){const result=await api('/api/auth/qr',{method:'POST',body:JSON.stringify({action:'unlock',code})});qrActivity.current=Date.now();applyQrLock(false);setError('');if(!ready||startupOptions.current.progressive&&!startup.current.complete)await load();else{flush().catch(()=>{});deferredRead.current=true;resumeRead.current?.(true);}return result;}
  async function endQr(){await api('/api/session',{method:'DELETE'});applyQrLock(false);setAuthenticated(false);}
  async function logout() { startup.current.generation++;setLoading(true);try{await flush();await api('/api/session',{method:'DELETE'});setReady(false);setAuthenticated(false);setDataset({projects:null,tasks:null});current.current=null;baseline.current=null;userRef.current=null;setApiUser(null);}finally{setLoading(false);} }
  const pending=ready && current.current && baseline.current && hasChanges(baseline.current,current.current);
  useEffect(() => {
    if(!pending)return;
    const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[pending,error]);
  return {...dataset,startupBlocked:startup.current.fatal,isTabReady,prioritizeTab,retryStartup,startupStatus,startupErrors,initializing,inboxReady:!startup.current.loaded||startup.current.status.inbox==='ready',setReference,saveArea,setSomeday,promoteSomeday,convertInboxToSomeday,setNutrition,setVehicles,importVehicles,setWellness,setEntertainment,setHabits,setShopping,setContacts,setFinance,setDiary,setTasks,setProjects,setInbox,ready,authenticated,configured,qrLocked,unlockQr,endQr,error,saving,loading,refreshedAt,noteRead,maintenance,setMaintenance,checkMaintenance,load,refresh,login,qrLoginComplete,logout,flush,pending};
}
