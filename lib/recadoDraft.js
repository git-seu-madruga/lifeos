import {readPrivateDraft,savePrivateDraft} from './storage';

// One queue per storage key also covers a quick unmount/remount of the tab.
const queues=new Map();
function ordered(key,operation){
 const previous=queues.get(key)||Promise.resolve();
 const result=previous.catch(()=>{}).then(operation);
 const tail=result.catch(()=>{});queues.set(key,tail);
 tail.then(()=>{if(queues.get(key)===tail)queues.delete(key);});
 return result;
}
export function createRecadoDraft({key,secret,temporary,onRestore,onStatus,delay=250}){
 let active=true,ready=false,loading=false,timer=null,pending=null,revision=0,requested='',readError='',writeError='';
 const status=()=>{if(active)onStatus({ready,readError,writeError});};
 function persist(value){
  const version=++revision;
  return ordered(key,()=>savePrivateDraft(value,key,secret)).then(()=>{
   if(version===revision){writeError='';status();}return true;
  },()=>{if(version===revision){writeError='Não foi possível salvar o rascunho neste navegador. O texto continua aberto; tente novamente antes de sair.';status();}return false;});
 }
 function flush(){
  clearTimeout(timer);timer=null;
  if(!ready||temporary||!pending)return Promise.resolve(true);
  const value=pending;pending=null;return persist(value);
 }
 return {
  async load(){
   if(!active||loading)return;loading=true;ready=false;readError='';status();
   try{
    const draft=temporary?null:await ordered(key,()=>readPrivateDraft(key,secret));
    if(!active)return;
    const normalized=onRestore(draft);requested=JSON.stringify(normalized);ready=true;status();
   }catch{if(active){readError='Não foi possível recuperar o rascunho. A edição está protegida para evitar substituir o conteúdo salvo. Tente novamente.';status();}}finally{loading=false;}
  },
  schedule(value){
   if(!active||!ready||temporary)return;
   const fingerprint=JSON.stringify(value);if(fingerprint===requested)return;
   requested=fingerprint;clearTimeout(timer);timer=null;
   pending=value;timer=setTimeout(flush,delay);
  },
  saveNow(value){
   if(!ready||temporary)return Promise.resolve(true);
   requested=JSON.stringify(value);pending=value;return flush();
  },
  retry(value){return this.saveNow(value);},
  dispose(){flush();active=false;}
 };
}
