const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc');
const folder=path.resolve('.back-test');fs.mkdirSync(folder,{recursive:true});
for(const file of ['backNavigation','inboxInput'])fs.writeFileSync(path.join(folder,file+'.js'),swc.transformSync(fs.readFileSync('lib/'+file+'.js','utf8'),{jsc:{target:'es2022'},module:{type:'commonjs'}}).code);
function browser(mobile=true){
 const listeners=new Map(),timers=new Map();let seq=0,index=1;const entries=[{external:true},{nextState:'keep'}];
 const win={matchMedia:()=>({matches:mobile}),addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);},setTimeout:fn=>{timers.set(++seq,fn);return seq;},clearTimeout:id=>timers.delete(id)};
 win.history={get state(){return entries[index];},replaceState:s=>{entries[index]=s;},pushState:s=>{entries.splice(index+1);entries.push(s);index++;},back:()=>{if(index>0){index--;listeners.get('popstate')?.({state:entries[index]});}}};
 return {win,entries,get index(){return index;},expire(){for(const [id,fn] of [...timers]){timers.delete(id);fn();}},key(){let prevented=false;listeners.get('keydown')?.({key:'Escape',preventDefault:()=>{prevented=true;}});return prevented;},touch(){listeners.get('pointerdown')?.({});}};
}
try{
 const {createBackNavigation}=require(path.join(folder,'backNavigation')),{shouldSubmitInbox}=require(path.join(folder,'inboxInput'));
 const b=browser(),messages=[];const nav=createBackNavigation(b.win,{onPrompt:m=>messages.push(m)});nav.start();assert.equal(b.index,2);assert.equal(b.win.history.state.nextState,'keep');nav.start();assert.equal(b.entries.length,3);
 let page=0,modal=0,inbox=0;const pageDone=nav.register(()=>page++,10),inboxDone=nav.register(()=>inbox++,15),modalDone=nav.register(()=>modal++,20);
 b.win.history.back();assert.equal(modal,1);assert.equal(page,0);assert.equal(inbox,0);assert.equal(b.index,2);assert.equal(b.entries.length,3);assert.ok(!messages.at(-1));modalDone();b.win.history.back();assert.equal(inbox,1);inboxDone();assert.equal(b.key(),true);assert.equal(page,1);pageDone();
 // Manual close unregisters without adding history; first Back prompts, second leaves.
 for(let n=0;n<20;n++)nav.register(()=>{},20)();assert.equal(b.entries.length,3);b.win.history.back();assert.equal(b.index,1);assert.ok(messages.at(-1).includes('novamente'));b.win.history.back();assert.equal(b.index,0);nav.stop();
 const c=browser(),toast=[];const nav2=createBackNavigation(c.win,{onPrompt:m=>toast.push(m)});nav2.start();c.win.history.back();c.expire();assert.equal(c.index,2);assert.equal(toast.at(-1),'');c.win.history.back();c.touch();assert.equal(c.index,2);assert.equal(toast.at(-1),'');
 c.win.history.back();let edit=0;const editDone=nav2.register(()=>edit++,20);assert.equal(c.index,2);c.win.history.back();assert.equal(edit,1);assert.equal(c.index,2);editDone();nav2.stop();nav2.start();assert.equal(c.entries.length,3,'Remount/reload does not stack guards');nav2.stop();
 const desktop=browser(false),nav3=createBackNavigation(desktop.win);nav3.start();assert.equal(desktop.index,1);let escape=0;const done=nav3.register(()=>escape++);assert.equal(desktop.key(),true);assert.equal(escape,1);assert.equal(desktop.entries.length,2);done();nav3.stop();
 const enter={key:'Enter',nativeEvent:{isComposing:false}};assert.equal(shouldSubmitInbox(enter,true),false);assert.equal(shouldSubmitInbox(enter,false),true);assert.equal(shouldSubmitInbox({...enter,shiftKey:true},false),false);assert.equal(shouldSubmitInbox({...enter,nativeEvent:{isComposing:true}},false),false);assert.equal(shouldSubmitInbox({...enter,keyCode:229},false),false);assert.equal(shouldSubmitInbox({key:'a'},false),false);
 console.log('PASSOU: voltar fecha a camada superior; duas voltas para sair; expiração e interação restauram a proteção; histórico sem acúmulo; Escape e Enter mobile multilinha.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
