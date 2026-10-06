// History contains only a guard marker, never private entry data.
export function createBackNavigation(win,{onPrompt=()=>{}}={}){
 const layers=new Map();let sequence=0,timer=null,armed=false,started=false,guardPresent=false;
 const mobile=()=>win.matchMedia('(max-width: 999px), (pointer: coarse)').matches;
 const mark='lifeosBackGuard';
 const state=value=>({...win.history.state,[mark]:value});
 function ensureGuard(){
  if(!started||!mobile())return;
  const marker=win.history.state?.[mark];
  if(marker==='guard'){guardPresent=true;return;}
  // Hydration may replace the current state. Repair that entry, not the stack.
  if(guardPresent){win.history.replaceState(state('guard'),'');return;}
  win.history.replaceState(state('base'),'');win.history.pushState(state('guard'),'');guardPresent=true;
 }

 function reset(){armed=false;if(timer!==null){win.clearTimeout(timer);timer=null;}onPrompt('');ensureGuard();}
 function top(){return [...layers.values()].sort((a,b)=>b.priority-a.priority||b.order-a.order)[0];}
 function closeTop(){const layer=top();if(!layer)return false;reset();layer.close();return true;}
 function pop(event){
  if(!mobile())return;
  const marker=event?.state?.[mark]||win.history.state?.[mark];
  if(marker!=='base'&&marker!=='guard')return;
  // These same-page entries belong to LifeOS, not Next.js route traversal.
  event?.stopImmediatePropagation?.();
  if(marker==='guard'){guardPresent=true;return;}
  guardPresent=false;
  if(closeTop())return;
  armed=true;onPrompt('Pressione voltar novamente para sair.');
  timer=win.setTimeout(()=>{timer=null;armed=false;onPrompt('');ensureGuard();},2200);
 }

 function key(event){if(event.key==='Escape'&&closeTop()){event.preventDefault();}}
 function interact(){if(armed)reset();else ensureGuard();}
 function resume(){if(!win.document||win.document.visibilityState==='visible')reset();}
 return {
  start(){if(started)return;started=true;ensureGuard();win.addEventListener('popstate',pop,true);win.addEventListener('pageshow',resume);win.document?.addEventListener('visibilitychange',resume);win.addEventListener('keydown',key);win.addEventListener('pointerdown',interact);},
  stop(){started=false;if(timer!==null)win.clearTimeout(timer);timer=null;armed=false;win.removeEventListener('popstate',pop,true);win.removeEventListener('pageshow',resume);win.document?.removeEventListener('visibilitychange',resume);win.removeEventListener('keydown',key);win.removeEventListener('pointerdown',interact);},
  register(close,priority=20){const id=++sequence;layers.set(id,{close,priority,order:id});reset();return()=>layers.delete(id);},
  reset,
 };
}
