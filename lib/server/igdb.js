import {AppError} from './auth';
let token=null,refresh=null,queue=Promise.resolve(),lastRequest=0;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function credentials(){const clientId=process.env.IGDB_CLIENT_ID,secret=process.env.IGDB_CLIENT_SECRET;if(!clientId||!secret)throw new AppError('Configure IGDB_CLIENT_ID e IGDB_CLIENT_SECRET na Vercel para buscar jogos. O cadastro manual continua disponível.',503);return {clientId,secret};}
async function accessToken(){
 const {clientId,secret}=credentials();
 if(token?.clientId===clientId&&token.until>Date.now())return token.value;
 if(refresh)return refresh;
 refresh=(async()=>{let response;try{response=await fetch('https://id.twitch.tv/oauth2/token',{method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:secret,grant_type:'client_credentials'}).toString()});}catch{throw new AppError('Não foi possível conectar à Twitch para autorizar a busca. Tente novamente.',502);}
 if(!response.ok)throw new AppError('A Twitch não autorizou a busca. Confira as credenciais IGDB na Vercel.',502);
 const data=await response.json().catch(()=>null);if(typeof data?.access_token!=='string'||!data.access_token||!Number.isFinite(data.expires_in)||data.expires_in<=0)throw new AppError('A Twitch retornou uma autorização inválida.',502);
 token={clientId,value:data.access_token,until:Date.now()+Math.max(0,data.expires_in-60)*1000};return token.value;
 })();try{return await refresh;}finally{refresh=null;}
}
export function normalizeGameResults(data){return (Array.isArray(data)?data:[]).filter(p=>typeof p.name==='string'&&p.name.trim()).slice(0,12).map(p=>({id:String(p.id),name:p.name.slice(0,300),author:'',year:Number.isFinite(p.first_release_date)?new Date(p.first_release_date*1000).getUTCFullYear():null,platforms:(p.platforms||[]).map(v=>typeof v.name==='string'?v.name:'').filter(Boolean).join(', ').slice(0,300),coverUrl:/^[a-zA-Z0-9_-]+$/.test(p.cover?.image_id||'')?`https://images.igdb.com/igdb/image/upload/t_cover_big/${p.cover.image_id}.jpg`:'',sourceUrl:typeof p.slug==='string'&&/^[a-z0-9-]+$/.test(p.slug)?`https://www.igdb.com/games/${p.slug}`:'',provider:'IGDB'}));}
export async function searchGames(query){
 const {clientId}=credentials();
 const body=`search ${JSON.stringify(query)}; fields name,slug,cover.image_id,first_release_date,platforms.name; limit 12;`;
 const run=async()=>{for(let attempt=0;attempt<2;attempt++){
  const authorization=await accessToken();await pause(Math.max(0,260-(Date.now()-lastRequest)));lastRequest=Date.now();
  let response;try{response=await fetch('https://api.igdb.com/v4/games',{method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{'Client-ID':clientId,Authorization:`Bearer ${authorization}`,Accept:'application/json','Content-Type':'text/plain'},body});}catch{throw new AppError('A busca de jogos está indisponível. Tente novamente ou cadastre manualmente.',502);}
  if(response.status===401&&attempt===0){token=null;await response.body?.cancel();continue;}
  if(!response.ok)throw new AppError(response.status===429?'O IGDB limitou as buscas. Aguarde alguns segundos e tente novamente.':'Não foi possível consultar o IGDB. Confira a configuração ou tente novamente.',response.status===429?429:502);
  const data=await response.json().catch(()=>null);if(!Array.isArray(data))throw new AppError('O IGDB retornou uma resposta inválida.',502);return normalizeGameResults(data);
 }};
 const result=queue.then(run,run);queue=result.catch(()=>{});return result;
}
