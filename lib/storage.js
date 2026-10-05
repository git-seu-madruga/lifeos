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
export async function readPrivateDraft(key,secret){const stored=await readState(key);if(!stored)return null;if(stored.v!==1||!secret)throw new Error('Este rascunho local não pode ser aberto nesta sessão.');try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(stored.iv)},await draftCryptoKey(secret),from64(stored.data));return JSON.parse(new TextDecoder().decode(plain));}catch{throw new Error('Não foi possível abrir o rascunho desta conta. Não troque a chave da sessão enquanto houver alterações pendentes.');}}
export async function savePrivateDraft(state,key,secret){if(!secret)throw new Error('Entre novamente para salvar o rascunho com segurança.');const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv},await draftCryptoKey(secret),new TextEncoder().encode(JSON.stringify(state)));await saveState({v:1,iv:bytes64(iv),data:bytes64(new Uint8Array(data))},key);}
