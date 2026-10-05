import {AppError} from './auth';
const LIMIT=4*1024*1024;
export function allowedCoverUrl(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return false;return (u.hostname==='covers.openlibrary.org'&&/^\/b\/id\/\d+-(S|M|L)\.jpg$/.test(u.pathname))||(u.hostname==='images.igdb.com'&&/^\/igdb\/image\/upload\/t_cover_big\/[a-zA-Z0-9_-]+\.jpg$/.test(u.pathname))||(u.hostname==='static.tvmaze.com'&&/^\/uploads\/images\/[a-z_]+\/\d+\/\d+\.(jpg|png|webp)$/.test(u.pathname));}catch{return false;}}
function imageType(bytes){if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return ['image/jpeg','jpg'];if(bytes.length>=8&&Buffer.from(bytes.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10])))return ['image/png','png'];if(bytes.length>=12&&Buffer.from(bytes.subarray(0,4)).toString()==='RIFF'&&Buffer.from(bytes.subarray(8,12)).toString()==='WEBP')return ['image/webp','webp'];if(bytes.length>=6&&['GIF87a','GIF89a'].includes(Buffer.from(bytes.subarray(0,6)).toString()))return ['image/gif','gif'];throw new AppError('A fonte não retornou uma imagem compatível. Use upload manual.',502);}
export async function downloadMediaCover(value,name='capa'){
 if(!allowedCoverUrl(value))throw new AppError('A cópia automática aceita apenas capas da Open Library, do TVmaze e do IGDB. Use upload para outras fontes.');
 let url=new URL(value);if(url.hostname==='covers.openlibrary.org')url.searchParams.set('default','false');
 let response;
 try{for(let i=0;i<4;i++){
  response=await fetch(url.href,{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{Accept:'image/jpeg,image/png,image/webp,image/gif'}});
  if(response.status>=300&&response.status<400){const next=new URL(response.headers.get('location')||'',url);await response.body?.cancel();if(!allowedCoverUrl(next.href))throw new AppError('A fonte redirecionou a capa para um endereço não suportado. Use upload manual.',502);url=next;continue;}break;
 }}catch(e){if(e instanceof AppError)throw e;throw new AppError('Não foi possível baixar a capa. Tente novamente ou use upload manual.',502);}
 if(!response?.ok){await response?.body?.cancel();throw new AppError('A capa não está disponível para cópia. Use upload manual ou mantenha o link.',502);}
 if(Number(response.headers.get('content-length'))>LIMIT){await response.body?.cancel();throw new AppError('A capa ultrapassa 4 MB. Use uma imagem menor.',413);}
 const reader=response.body?.getReader();if(!reader)throw new AppError('A fonte não retornou uma capa.',502);
 const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>LIMIT){await reader.cancel();throw new AppError('A capa ultrapassa 4 MB.',413);}chunks.push(value);}}catch(e){if(e instanceof AppError)throw e;throw new AppError('O download da capa foi interrompido. Tente novamente.',502);}
 const bytes=Buffer.concat(chunks),[type,ext]=imageType(bytes);const title=String(name||'capa').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,80)||'capa';return new File([bytes],title+'.'+ext,{type});
}
