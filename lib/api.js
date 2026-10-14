let apiUser=null,apiLocked=false;
export function setApiLocked(value){apiLocked=!!value;}
export function setApiUser(user){apiUser=user?.id||null;}
export async function api(path, options = {}) {
  if(apiLocked&&!path.startsWith('/api/session')&&!path.startsWith('/api/auth/qr'))throw Object.assign(new Error('Sessão bloqueada. Desbloqueie para continuar.'),{status:428});
  let response;
  try { response = await fetch(path, { ...options,headers:{...options.headers,...(apiUser&&(path.startsWith('/api/notion')||path.startsWith('/api/recados')||path.startsWith('/api/backup')||path.startsWith('/api/auth/qr'))?{'X-LifeOS-User':apiUser}:{}),...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{})}, cache: 'no-store',  }); }
  catch { throw new Error('Sem conexão com o servidor. Suas alterações estão mantidas; tente novamente.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Não foi possível concluir a operação.'); error.status = response.status;if(response.status===428&&typeof window!=='undefined')window.dispatchEvent?.(new Event('lifeos-qr-locked')); throw error; }
  return data;
}
