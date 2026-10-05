let apiUser=null;
export function setApiUser(user){apiUser=user?.id||null;}
export async function api(path, options = {}) {
  let response;
  try { response = await fetch(path, { ...options,headers:{...options.headers,...(apiUser&&path.startsWith('/api/notion')?{'X-LifeOS-User':apiUser}:{}),...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{})}, cache: 'no-store',  }); }
  catch { throw new Error('Sem conexão com o servidor. Suas alterações estão mantidas; tente novamente.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Não foi possível concluir a operação.'); error.status = response.status; throw error; }
  return data;
}
