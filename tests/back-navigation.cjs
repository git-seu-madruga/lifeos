const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc');
const folder=path.resolve('.back-test');fs.mkdirSync(folder,{recursive:true});
for(const file of ['backNavigation','inboxInput','useBackNavigation'])fs.writeFileSync(path.join(folder,file+'.js'),swc.transformSync(fs.readFileSync('lib/'+file+'.js','utf8'),{jsc:{target:'es2022',parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code);
function browser(mobile=true){
 const listeners=new Map(),timers=new Map();let seq=0,index=1;const entries=[{external:true},{nextState:'keep'}];
 function dispatch(name,event={}){let stopped=false;event.stopImmediatePropagation=()=>{stopped=true;};for(const listener of [...(listeners.get(name)||[])].sort((a,b)=>Number(b.capture)-Number(a.capture))){listener.fn(event);if(stopped)break;}return stopped;}
 const win={navigation:{addEventListener:(...args)=>win.addEventListener(...args),removeEventListener:(...args)=>win.removeEventListener(...args)},matchMedia:()=>({matches:mobile}),addEventListener:(name,fn,capture=false)=>{listeners.set(name,[...(listeners.get(name)||[]),{fn,capture}]);},removeEventListener:(name,fn,capture=false)=>{listeners.set(name,(listeners.get(name)||[]).filter(listener=>listener.fn!==fn||listener.capture!==capture));},setTimeout:fn=>{timers.set(++seq,fn);return seq;},clearTimeout:id=>timers.delete(id)};
 win.history={get state(){return entries[index];},replaceState:s=>{entries[index]=s;},pushState:s=>{entries.splice(index+1);entries.push(s);index++;},back:()=>{if(index>0){index--;dispatch('popstate',{state:entries[index]});}},forward:()=>{if(index<entries.length-1){index++;dispatch('popstate',{state:entries[index]});}}};
 return {win,entries,get index(){return index;},expire(){for(const [id,fn] of [...timers]){timers.delete(id);fn();}},key(){let prevented=false;dispatch('keydown',{key:'Escape',preventDefault:()=>{prevented=true;}});return prevented;},touch(){dispatch('click',{target:{closest:()=>true}});},gesture(){dispatch('pointerdown');},scroll(target){dispatch('scroll',{target});},navigate(event){dispatch('navigate',event);},resume(){dispatch('pageshow');}};
}

try{
 const {createBackNavigation}=require(path.join(folder,'backNavigation')),{shouldSubmitInbox}=require(path.join(folder,'inboxInput'));
 const b=browser(),messages=[];b.win.history.scrollRestoration='auto';let writes=0;const rawPush=b.win.history.pushState;b.win.history.pushState=s=>{writes++;rawPush(s);};const nav=createBackNavigation(b.win,{onPrompt:m=>messages.push(m)});nav.start();assert.equal(b.win.history.scrollRestoration,'manual');assert.equal(b.index,2);assert.equal(b.win.history.state.nextState,'keep');nav.start();assert.equal(b.entries.length,3);
 let interception; b.navigate({navigationType:'traverse',canIntercept:true,destination:{getState:()=>b.entries[1]},intercept:options=>interception=options});assert.deepEqual(interception,{scroll:'manual',focusReset:'manual'});interception=null;b.navigate({navigationType:'traverse',canIntercept:true,destination:{getState:()=>b.entries[0]},intercept:options=>interception=options});assert.equal(interception,null,'Exit traversal must remain native');
 let page=0,modal=0,inbox=0;const pageDone=nav.register(()=>page++,10),inboxDone=nav.register(()=>inbox++,15),modalDone=nav.register(()=>modal++,20);
 b.win.history.back();assert.equal(modal,1);assert.equal(page,0);assert.equal(inbox,0);assert.equal(b.index,2);assert.equal(b.entries.length,3);assert.ok(!messages.at(-1));modalDone();b.win.history.back();assert.equal(inbox,1);inboxDone();assert.equal(b.key(),true);assert.equal(page,1);pageDone();
 // Manual close unregisters without adding history; first Back prompts, second leaves.
 for(let n=0;n<20;n++)nav.register(()=>{},20)();assert.equal(b.entries.length,3);b.win.history.back();assert.equal(b.index,1);assert.ok(messages.at(-1).includes('novamente'));b.gesture();assert.equal(b.index,1,'A native Back gesture must not rearm the guard');b.win.history.back();assert.equal(b.index,0);assert.equal(writes,1,'Nenhuma reinserção após voltar, fechar ou interagir');nav.stop();assert.equal(b.win.history.scrollRestoration,'auto');
 const c=browser(),toast=[];const nav2=createBackNavigation(c.win,{onPrompt:m=>toast.push(m)});nav2.start();c.win.history.back();c.expire();assert.equal(c.index,2);assert.equal(toast.at(-1),'');c.win.history.back();c.touch();assert.equal(c.index,2);assert.equal(toast.at(-1),'');
 c.win.history.back();let edit=0;const editDone=nav2.register(()=>edit++,20);assert.equal(c.index,2);c.win.history.back();assert.equal(edit,1);assert.equal(c.index,2);editDone();nav2.stop();nav2.start();assert.equal(c.entries.length,3,'Remount/reload does not stack guards');nav2.stop();
 const desktop=browser(false),nav3=createBackNavigation(desktop.win);nav3.start();assert.equal(desktop.index,1);let escape=0;const done=nav3.register(()=>escape++);assert.equal(desktop.key(),true);assert.equal(escape,1);assert.equal(desktop.entries.length,2);done();nav3.stop();
 // Router registered first: our capture handler must prevent route restoration.
 const fresh=browser(),prompts=[];let restores=0;fresh.win.addEventListener('popstate',()=>restores++);const startup=createBackNavigation(fresh.win,{onPrompt:m=>prompts.push(m)});startup.start();
 fresh.win.history.replaceState({__NA:true,tree:'hydrated'},'');startup.reset();assert.equal(fresh.entries.length,3,'Hydration repair must not add another history entry');assert.equal(fresh.win.history.state.tree,'hydrated');fresh.win.history.back();assert.ok(prompts.at(-1).includes('novamente'),'First Back after loading must prompt without changing tabs');assert.equal(restores,0,'Owned Back must not reach Next.js');fresh.expire();assert.equal(fresh.index,2);
 const close=startup.register(()=>{},20);fresh.win.history.back();assert.equal(restores,0,'Closing panel must not restore main page');close();fresh.win.history.replaceState({__NA:true,tree:'after-resume'},'');fresh.resume();assert.equal(fresh.entries.length,3);assert.equal(fresh.win.history.state.lifeosBackGuard,'guard');startup.stop();startup.start();fresh.win.history.back();assert.equal(restores,0,'Capture registration must survive remount');fresh.win.history.back();assert.equal(fresh.index,0);assert.equal(restores,1,'Unrelated navigation is not intercepted');startup.stop();
 const wrapped=browser();let routerWrites=0;const nativePush=wrapped.win.history.pushState,nativeReplace=wrapped.win.history.replaceState;wrapped.win.History={prototype:{pushState:nativePush,replaceState:nativeReplace}};wrapped.win.history.pushState=()=>{routerWrites++;};wrapped.win.history.replaceState=()=>{routerWrites++;};const isolated=createBackNavigation(wrapped.win);isolated.start();assert.equal(wrapped.index,2);assert.equal(routerWrites,0,'Native history avoids router wrappers');wrapped.win.history.back();wrapped.expire();assert.equal(wrapped.index,2);assert.equal(wrapped.entries.length,3);for(let i=0;i<10;i++){wrapped.touch();wrapped.win.history.back();wrapped.expire();}assert.equal(wrapped.entries.length,3);assert.equal(routerWrites,0);isolated.stop();
 const reload=browser();reload.win.history.replaceState({lifeosBackGuard:'guard',lifeosBackDocument:'previous-document'},'');let reloadPrompt='';const reloaded=createBackNavigation(reload.win,{onPrompt:m=>reloadPrompt=m});reloaded.start();assert.equal(reload.index,2);reload.win.history.back();assert.ok(reloadPrompt.includes('novamente'),'Reload must use a guard in the current document');reloaded.stop();
 // Before authentication the hook must leave the login history untouched.
 const React=require('react'),originalEffect=React.useEffect,oldWindow=global.window,oldCustomEvent=global.CustomEvent;
 const authBrowser=browser(),effectSlots=[];let effectIndex=0;
 authBrowser.win.dispatchEvent=()=>{};global.window=authBrowser.win;global.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options?.detail;}};
 React.useEffect=(effect,deps)=>{const i=effectIndex++,old=effectSlots[i];if(!old||deps.some((value,j)=>value!==old.deps[j])){old?.cleanup?.();effectSlots[i]={deps,cleanup:effect()};}};
 try{
  const {useAppBackNavigation}=require(path.join(folder,'useBackNavigation'));
  const renderAuth=(authenticated,ready)=>{effectIndex=0;useAppBackNavigation(authenticated,ready);};
  renderAuth(false,false);assert.equal(authBrowser.entries.length,2,'Login must not create an exit guard');
  renderAuth(true,false);assert.equal(authBrowser.entries.length,3,'Protection begins after authentication');
  renderAuth(true,true);assert.equal(authBrowser.entries.length,3,'Loading Notion must not duplicate the guard');
  renderAuth(false,false);for(const effect of effectSlots)effect.cleanup?.();
 }finally{React.useEffect=originalEffect;if(oldWindow===undefined)delete global.window;else global.window=oldWindow;if(oldCustomEvent===undefined)delete global.CustomEvent;else global.CustomEvent=oldCustomEvent;}
 // Navigation must not scan the DOM or write application scroll positions.
 const scrolling=browser();let forcedScroll=0,scans=0;
 const viewport={scrollTop:900,scrollLeft:144};
 scrolling.win.document={querySelectorAll:()=>{scans++;return [viewport];},addEventListener(){},removeEventListener(){}};
 scrolling.win.scrollTo=()=>forcedScroll++;
 const light=createBackNavigation(scrolling.win);light.start();scrolling.scroll(viewport);
 scrolling.navigate({navigationType:'traverse',canIntercept:true,destination:{getState:()=>scrolling.entries[1]},intercept:()=>{}});
 scrolling.win.history.back();assert.equal(viewport.scrollTop,900);assert.equal(viewport.scrollLeft,144);
 scrolling.expire();assert.equal(scrolling.index,2);assert.equal(viewport.scrollTop,900);
 scrolling.win.history.back();scrolling.gesture();scrolling.win.history.back();assert.equal(scrolling.index,0);light.stop();
 assert.equal(forcedScroll,0,'Back protection never forces scroll');assert.equal(scans,0,'Back protection never scans the DOM');
 const enter={key:'Enter',nativeEvent:{isComposing:false}};assert.equal(shouldSubmitInbox(enter,true),false);assert.equal(shouldSubmitInbox(enter,false),true);assert.equal(shouldSubmitInbox({...enter,shiftKey:true},false),false);assert.equal(shouldSubmitInbox({...enter,nativeEvent:{isComposing:true}},false),false);assert.equal(shouldSubmitInbox({...enter,keyCode:229},false),false);assert.equal(shouldSubmitInbox({key:'a'},false),false);
 console.log('PASSOU: voltar fecha a camada superior; duas voltas para sair; expiração e interação restauram a proteção; histórico sem acúmulo; Escape e Enter mobile multilinha.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
