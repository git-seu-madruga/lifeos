const DB = 'lifeos-local';
function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readState(key = 'current') {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readonly');
    const request = tx.objectStore('state').get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
export async function saveState(state, key = 'current') {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readwrite');
    tx.objectStore('state').put(state, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

const bytes64=bytes=>{let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.slice(i,i+8192));return btoa(value);};
const from64=value=>Uint8Array.from(atob(value),char=>char.charCodeAt(0));
async function draftCryptoKey(secret){return crypto.subtle.importKey('raw',from64(secret),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function readPrivateDraft(key,secret){const stored=await readState(key);if(!stored)return null;if(stored.v!==1||!secret)throw new Error('Este rascunho local não pode ser aberto nesta sessão.');try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(stored.iv)},await draftCryptoKey(secret),from64(stored.data));return await inboxDraftFiles(JSON.parse(new TextDecoder().decode(plain)),false);}catch{throw new Error('Não foi possível abrir o rascunho desta conta. Não troque a chave da sessão enquanto houver alterações pendentes.');}}
export async function savePrivateDraft(state,key,secret){if(!secret)throw new Error('Entre novamente para salvar o rascunho com segurança.');const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv},await draftCryptoKey(secret),new TextEncoder().encode(JSON.stringify(await inboxDraftFiles(state,true))));await saveState({v:1,iv:bytes64(iv),data:bytes64(new Uint8Array(data))},key);}

// JSON encryption must retain clipboard File bytes for pending Inbox drafts.
async function inboxDraftFiles(state,encode){
 const snapshot=async value=>!value?.inbox?value:{...value,inbox:await Promise.all(value.inbox.map(async entry=>!entry.attachments?entry:{...entry,attachments:await Promise.all(entry.attachments.map(async attachment=>{
  const file=attachment.file;
  if(encode&&typeof Blob!=='undefined'&&file instanceof Blob)return {...attachment,file:{_lifeosInboxFile:1,name:file.name||attachment.name,type:file.type,bytes:bytes64(new Uint8Array(await file.arrayBuffer()))}};
  if(!encode&&file?._lifeosInboxFile===1)return {...attachment,file:new File([from64(file.bytes)],file.name,{type:file.type})};
  return attachment;
 }))} ))};
 return state&&{...state,...(state.base?{base:await snapshot(state.base)}:{}),...(state.next?{next:await snapshot(state.next)}:{})};
}
