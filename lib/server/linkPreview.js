import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {createHash} from 'node:crypto';
import ipaddr from 'ipaddr.js';
import {AppError} from './auth';
import {redis} from './coordination';

export function publicPreviewUrl(value){
 let u;try{u=new URL(value);}catch{throw new AppError('Cole um endereço HTTPS válido.',422);}
 const host=u.hostname.replace(/^\[|\]$/g,'');
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.href.length>2000||!host.includes('.')||/\.(local|localhost|internal|test|invalid)$/i.test(host)||host==='localhost'||ipaddr.isValid(host)&&!publicIp(host))throw new AppError('Este endereço não pode gerar prévia.',422);
 u.hash='';return u;
}
export function publicIp(value){try{return ipaddr.process(value).range()==='unicast';}catch{return false;}}

// Pin the validated DNS answer to the HTTPS socket, including every redirect.
// Cookies, authentication headers and pasted page markup are never forwarded.
export async function fetchPreviewBytes(value,{image=false,resolve=lookup,request=https.request}={}){
 let url=publicPreviewUrl(value);const deadline=Date.now()+12000,limit=image?1024*1024:256*1024;
 for(let hop=0;hop<4;hop++){
  const remaining=deadline-Date.now();if(remaining<=0)throw new AppError('A página demorou para responder.',502);
  const addresses=await Promise.race([resolve(url.hostname,{all:true,verbatim:true}),new Promise((_,reject)=>{const t=setTimeout(()=>reject(new AppError('A página demorou para responder.',502)),Math.min(remaining,4000));t.unref?.();})]);
  if(!addresses.length||addresses.some(a=>!publicIp(a.address)))throw new AppError('O endereço da página não é público.',422);
  const pinned=addresses[0];
  const result=await new Promise((resolveResponse,reject)=>{
   const req=request(url,{method:'GET',headers:{Accept:image?'image/png,image/jpeg,image/webp,image/gif':'text/html,application/xhtml+xml','Accept-Encoding':'identity','User-Agent':'LifeOS-LinkPreview/1.0'},lookup:(host,options,callback)=>callback(null,options?.all?[{address:pinned.address,family:pinned.family}]:pinned.address,options?.all?undefined:pinned.family),signal:AbortSignal.timeout(Math.max(1,Math.min(6000,deadline-Date.now())))},res=>{
    const status=res.statusCode||0;
    if(status>=300&&status<400){res.resume();if(!res.headers.location){reject(new AppError('A página não informou o destino da prévia.',502));return;}resolveResponse({redirect:res.headers.location});return;}
    if(status<200||status>=300){res.resume();reject(new AppError('A página não disponibilizou uma prévia.',502));return;}
    if(res.headers['content-encoding']&&res.headers['content-encoding']!=='identity'){res.destroy();reject(new AppError('Formato de resposta não suportado.',502));return;}
    if(image&&Number(res.headers['content-length']||0)>limit){res.destroy();reject(new AppError('A prévia ultrapassou o limite de tamanho.',413));return;}
    const type=String(res.headers['content-type']||'').split(';')[0].trim().toLowerCase();
    if(image?!['image/jpeg','image/png','image/webp','image/gif'].includes(type):!['text/html','application/xhtml+xml'].includes(type)){res.destroy();reject(new AppError('A fonte não disponibilizou o formato esperado.',422));return;}
    const chunks=[];let size=0;res.on('data',chunk=>{const available=limit-size;size+=chunk.length;if(size>limit){if(image){res.destroy();reject(new AppError('A prévia ultrapassou o limite de tamanho.',413));}else{chunks.push(chunk.subarray(0,Math.max(0,available)));resolveResponse({bytes:Buffer.concat(chunks),type,url:url.href});res.destroy();}}else chunks.push(chunk);});
    res.on('end',()=>resolveResponse({bytes:Buffer.concat(chunks),type,url:url.href}));res.on('error',reject);
   });req.on('error',reject);req.end();
  });
  if(!result.redirect)return result;
  if(hop===3)throw new AppError('A página redirecionou muitas vezes.',502);
  url=publicPreviewUrl(new URL(result.redirect,url).href);
 }
}
const entities=text=>String(text||'').replace(/&#(x[\da-f]+|\d+);/gi,(_,code)=>{const n=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):Number(code);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/&(amp|quot|apos|lt|gt|nbsp);/gi,(_,key)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '}[key.toLowerCase()]));
const clean=(value,max)=>entities(value).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim().slice(0,max);
export function parseLinkMetadata(html,url){
 const tags=new Map();for(const match of html.matchAll(/<meta\b[^>]*>/gi)){
  const attrs={};for(const attr of match[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))attrs[attr[1].toLowerCase()]=attr[2]??attr[3]??attr[4];
  const key=(attrs.property||attrs.name||'').toLowerCase();if(!tags.has(key))tags.set(key,attrs.content||'');
 }
 const title=clean(tags.get('og:title')||tags.get('twitter:title')||html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||new URL(url).hostname,300);
 const description=clean(tags.get('og:description')||tags.get('description')||tags.get('twitter:description'),700);
 let image='';try{const raw=entities(tags.get('og:image')||tags.get('twitter:image'));if(raw)image=publicPreviewUrl(new URL(raw,url).href).href;}catch{}
 return {url,title,description,image};
}
export async function previewLink(value,user){
 const url=publicPreviewUrl(value).href,digest=createHash('sha256').update(user.id+':'+url).digest('hex'),key='lifeos:link-preview:'+digest;
 const cached=await redis(['GET',key]);if(cached){try{return JSON.parse(cached);}catch{}}
 const rate='lifeos:link-preview-rate:'+createHash('sha256').update(user.id).digest('hex');
 const n=await redis(['EVAL',"local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],3600) end;return n",1,rate]);
 if(Number(n)>60)throw new AppError('Muitas prévias nesta hora. O link continua utilizável sem miniatura.',429);
 let response;try{response=await fetchPreviewBytes(url);}catch(e){if(e instanceof AppError)throw e;throw new AppError('Não foi possível obter a prévia. O endereço pode ser mantido como link.',502);}
 const result=parseLinkMetadata(response.bytes.toString('utf8'),response.url);
 await redis(['SET',key,JSON.stringify(result),'EX',7*86400]);return result;
}
export async function previewImage(url){
 let data;try{data=await fetchPreviewBytes(url,{image:true});}catch(e){if(e instanceof AppError)throw e;throw new AppError('Miniatura indisponível.',502);}
 const b=data.bytes,type=b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255?'image/jpeg':b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'?'image/webp':b.length>=6&&['GIF87a','GIF89a'].includes(b.toString('ascii',0,6))?'image/gif':'';
 if(!type)throw new AppError('Miniatura incompatível.',422);return {bytes:b,type};
}
