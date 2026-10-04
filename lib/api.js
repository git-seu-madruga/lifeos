export async function api(path, options = {}) {
  let response;
  try { response = await fetch(path, { ...options, cache: 'no-store', ...(options.body && !(options.body instanceof FormData) ? { headers: { 'Content-Type':'application/json', ...options.headers } } : {}) }); }
  catch { throw new Error('Sem conexão com o servidor. Suas alterações estão mantidas; tente novamente.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Não foi possível concluir a operação.'); error.status = response.status; throw error; }
  return data;
}
