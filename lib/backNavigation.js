// One same-document base/guard pair; no history is added after Back.
export function createBackNavigation(win,{onPrompt=()=>{}}={}){
 const layers=new Map();let sequence=0,timer=null,armed=false,started=false,position=null,returning=false,oldRestoration=null;
 const mobile=()=>win.matchMedia('(max-width: 999px), (pointer: coarse)').matches;
 const mark='lifeosBackGuard',owner='lifeosBackDocument';
 const documentId=win.crypto?.randomUUID?.()||'lifeos-'+Date.now()+'-'+Math.random();
 // Bypass framework wrappers: the URL is unchanged and no route is restored.
 const native=win.History?.prototype;
 function manualScroll(){if(mobile())win.history.scrollRestoration='manual';}
 const write=(method,value)=>{manualScroll();(native?.[method]||win.history[method]).call(win.history,{...win.history.state,[mark]:value,[owner]:documentId},'');manualScroll();};
 const clearPrompt=()=>{armed=false;if(timer!==null){win.clearTimeout(timer);timer=null;}onPrompt('');};
 function install(){
  if(!started||!mobile())return;
  if(position){if(win.history.state?.[mark]!==position||win.history.state?.[owner]!==documentId)write('replaceState',position);return;}
  if(win.history.state?.[mark]==='guard'&&win.history.state?.[owner]===documentId){position='guard';return;}
  write('replaceState','base');write('pushState','guard');position='guard';
 }
 function restore(){
  if(!started||!mobile())return;
  install();
  if(position==='base'&&!returning){returning=true;win.history.forward();}
 }
 function reset(){clearPrompt();restore();}
 function top(){return [...layers.values()].sort((a,b)=>b.priority-a.priority||b.order-a.order)[0];}
 function closeTop(){const layer=top();if(!layer)return false;reset();layer.close();return true;}
 function pop(event){
  if(!mobile())return;
  const target=event?.state||win.history.state;
  if(target?.[owner]!==documentId)return;
  const marker=target?.[mark];
  if(marker!=='base'&&marker!=='guard')return;
  event?.stopImmediatePropagation?.();manualScroll();position=marker;
  if(marker==='guard'){returning=false;return;}
  if(closeTop())return;
  armed=true;onPrompt('Pressione voltar novamente para sair.');
  timer=win.setTimeout(()=>{timer=null;clearPrompt();restore();},3000);
 }
 function key(event){if(event.key==='Escape'&&closeTop())event.preventDefault();}
 // A swipe/scroll pointerdown is not an action: it must not consume the exit attempt.
 function interact(event){if(!event.target?.closest?.('button,a,input,textarea,select,[role=button]'))return;if(armed)reset();else install();}
 function navigate(event){
  if(!mobile()||event.navigationType!=='traverse'||!event.canIntercept)return;
  const state=event.destination?.getState?.();
  if(state?.[owner]!==documentId||!['base','guard'].includes(state?.[mark]))return;
  // Disable browser scroll/focus restoration before it paints a history traversal.
  event.intercept({scroll:'manual',focusReset:'manual'});
 }
 function resume(){if(!win.document||win.document.visibilityState==='visible')reset();}
 return {
  start(){
   if(started)return;started=true;
   win.addEventListener('popstate',pop,true);win.addEventListener('pageshow',resume);win.document?.addEventListener('visibilitychange',resume);win.addEventListener('keydown',key);win.addEventListener('click',interact);win.navigation?.addEventListener('navigate',navigate);
   if(mobile()){oldRestoration=win.history.scrollRestoration;win.history.scrollRestoration='manual';}install();
  },
  stop(){
   started=false;clearPrompt();returning=false;
   win.removeEventListener('popstate',pop,true);win.removeEventListener('pageshow',resume);win.document?.removeEventListener('visibilitychange',resume);win.removeEventListener('keydown',key);win.removeEventListener('click',interact);win.navigation?.removeEventListener('navigate',navigate);
   if(oldRestoration!==null){win.history.scrollRestoration=oldRestoration;oldRestoration=null;}
  },
  register(close,priority=20){const id=++sequence;layers.set(id,{close,priority,order:id});reset();return()=>layers.delete(id);},
  reset,
 };
}
