// History contains only a guard marker, never private entry data.
export function createBackNavigation(win,{onPrompt=()=>{}}={}){
 const layers=new Map();let sequence=0,timer=null,armed=false,started=false;
 const mobile=()=>win.matchMedia('(max-width: 999px), (pointer: coarse)').matches;
 const mark='lifeosBackGuard';
 const state=value=>({...win.history.state,[mark]:value});
 function ensureGuard(){if(!mobile())return;if(win.history.state?.[mark]!=='guard'){win.history.replaceState(state('base'),'');win.history.pushState(state('guard'),'');}}
 function reset(){armed=false;if(timer!==null){win.clearTimeout(timer);timer=null;}onPrompt('');ensureGuard();}
 function top(){return [...layers.values()].sort((a,b)=>b.priority-a.priority||b.order-a.order)[0];}
 function closeTop(){const layer=top();if(!layer)return false;reset();layer.close();return true;}
 function pop(){
  if(!mobile()||win.history.state?.[mark]!=='base')return;
  if(closeTop())return;
  // Leave the base entry active: the next native Back can leave normally.
  armed=true;onPrompt('Pressione voltar novamente para sair.');
  timer=win.setTimeout(()=>{timer=null;armed=false;onPrompt('');ensureGuard();},2200);
 }
 function key(event){if(event.key==='Escape'&&closeTop()){event.preventDefault();}}
 function interact(){if(armed)reset();}
 return {
  start(){if(started)return;started=true;ensureGuard();win.addEventListener('popstate',pop);win.addEventListener('keydown',key);win.addEventListener('pointerdown',interact);},
  stop(){started=false;if(timer!==null)win.clearTimeout(timer);timer=null;armed=false;win.removeEventListener('popstate',pop);win.removeEventListener('keydown',key);win.removeEventListener('pointerdown',interact);},
  register(close,priority=20){const id=++sequence;layers.set(id,{close,priority,order:id});reset();return()=>layers.delete(id);},
  reset,
 };
}
