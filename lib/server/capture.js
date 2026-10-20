import {randomBytes,createHash,createHmac} from 'node:crypto';
import {AppError,allowedEmails,appOrigin,configured} from './auth';
import {redis,withWriteLock} from './coordination';
import {schema,notion,encode,plain} from './notion';
import {databaseRouting,withDatabaseRouting} from './routing';
import {requireGoogle} from './qrAuth';

const hash=value=>createHash('sha256').update(value).digest('hex');
const requestKey=id=>'lifeos:capture:pair:'+id;
const deviceKey=id=>'lifeos:capture:device:'+id;
const indexKey=user=>'lifeos:capture:user:'+hash(user);
const PAIR_MS=10*60*1000,DEVICE_MS=90*24*60*60*1000;
const validId=id=>typeof id==='string'&&/^[a-f0-9]{48}$/.test(id);
const parse=value=>value?JSON.parse(value):null;

export async function startCapture(request,input){
 if(!configured())throw new AppError('Configure o LifeOS antes de conectar o aplicativo.',503);
 if(typeof input.secretHash!=='string'||!/^[a-f0-9]{64}$/.test(input.secretHash))throw new AppError('Pedido inválido.');
 const address=(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 const rate='lifeos:capture:rate:'+createHmac('sha256',process.env.LIFEOS_SESSION_SECRET).update(address).digest('hex');
 const count=await redis(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n",1,rate]);
 if(Number(count)>20)throw new AppError('Muitas tentativas. Aguarde alguns minutos.',429);
 const id=randomBytes(24).toString('hex'),token=randomBytes(32).toString('hex'),expiresAt=Date.now()+PAIR_MS;
 const code=String(randomBytes(4).readUInt32BE()%1000000).padStart(6,'0');
 await redis(['SET',requestKey(id),JSON.stringify({secretHash:input.secretHash,approvalHash:hash(token),expiresAt,status:'pending',code,device:String(input.device||'Android').slice(0,100)}),'PX',PAIR_MS]);
 return {id,code,expiresAt,url:appOrigin()+'/capture/pair#id='+id+'&token='+token};
}
async function pairDetails(id,token){
 if(!validId(id)||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))throw new AppError('Pedido inválido.');
 const data=parse(await redis(['GET',requestKey(id)]));
 if(!data||data.expiresAt<=Date.now()||data.approvalHash!==hash(token))throw new AppError('Este pedido expirou. Conecte novamente no aplicativo Android.',410);
 return data;
}
export async function captureDetails(user,id,token){requireGoogle(user);const data=await pairDetails(id,token);return {code:data.code,device:data.device,status:data.status,expiresAt:data.expiresAt};}
export async function approveCapture(user,id,token,approve){
 requireGoogle(user);await pairDetails(id,token);
 const now=Date.now(),expiresAt=now+DEVICE_MS;
 const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local d=cjson.decode(raw); if d.status~='pending' or d.approvalHash~=ARGV[1] or d.expiresAt<=tonumber(ARGV[2]) then return 0 end; d.status=ARGV[3]; if d.status=='approved' then local u=cjson.decode(ARGV[4]); u.secretHash=d.secretHash; u.device=d.device; u.createdAt=tonumber(ARGV[2]); u.expiresAt=tonumber(ARGV[5]); redis.call('SET',KEYS[2],cjson.encode(u),'PX',ARGV[6]); redis.call('SADD',KEYS[3],ARGV[7]); redis.call('EXPIRE',KEYS[3],ARGV[8]); end; redis.call('SET',KEYS[1],cjson.encode(d),'PX',d.expiresAt-tonumber(ARGV[2])); return 1";
 const result=await redis(['EVAL',script,3,requestKey(id),deviceKey(id),indexKey(user.id),hash(token),now,approve?'approved':'denied',JSON.stringify({userId:user.id,email:user.email,name:user.name}),expiresAt,DEVICE_MS,id,Math.ceil(DEVICE_MS/1000)]);
 if(Number(result)!==1)throw new AppError('Pedido já respondido ou expirado.',409);
 return {approved:!!approve};
}
function credentials(request){
 const match=(request.headers.get('authorization')||'').match(/^Bearer ([a-f0-9]{48})\.([a-f0-9]{64})$/);
 if(!match)throw new AppError('Conecte o aplicativo ao LifeOS.',401);
 return {id:match[1],secretHash:hash(match[2])};
}
export async function captureIdentity(request){
 const proof=credentials(request),device=parse(await redis(['GET',deviceKey(proof.id)]));
 if(!device||device.secretHash!==proof.secretHash||device.expiresAt<=Date.now()||!allowedEmails().includes(device.email))throw new AppError('A autorização terminou. Reconecte o aplicativo. Seus textos continuam no aparelho.',401);
 return {...proof,user:{id:device.userId,email:device.email,name:device.name},expiresAt:device.expiresAt};
}
export async function captureStatus(request){
 try{const identity=await captureIdentity(request);return {status:'approved',user:identity.user,expiresAt:identity.expiresAt};}
 catch(error){if(error.status!==401)throw error;}
 const proof=credentials(request),data=parse(await redis(['GET',requestKey(proof.id)]));
 if(!data||data.secretHash!==proof.secretHash||data.expiresAt<=Date.now())throw new AppError('Pedido expirado. Conecte novamente.',401);
 return {status:data.status==='denied'?'denied':'pending',expiresAt:data.expiresAt};
}
export async function listCaptureDevices(user){
 requireGoogle(user);const ids=await redis(['SMEMBERS',indexKey(user.id)])||[],devices=[];
 for(const id of ids){if(!validId(id))continue;const item=parse(await redis(['GET',deviceKey(id)]));if(item?.userId===user.id&&item.expiresAt>Date.now())devices.push({id,device:item.device,createdAt:item.createdAt,expiresAt:item.expiresAt});else await redis(['SREM',indexKey(user.id),id]);}
 return devices.sort((a,b)=>b.createdAt-a.createdAt);
}
export async function revokeCapture(user,id){
 requireGoogle(user);if(!validId(id))throw new AppError('Dispositivo inválido.');
 const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 1 end; local d=cjson.decode(raw); if d.userId~=ARGV[1] then return 0 end; redis.call('DEL',KEYS[1]); redis.call('SREM',KEYS[2],ARGV[2]); return 1";
 if(Number(await redis(['EVAL',script,2,deviceKey(id),indexKey(user.id),user.id,id]))!==1)throw new AppError('Este dispositivo pertence a outra conta.',403);
 return {revoked:true};
}
export async function disconnectCapture(request){const identity=await captureIdentity(request);await redis(['DEL',deviceKey(identity.id)]);await redis(['SREM',indexKey(identity.user.id),identity.id]);return {disconnected:true};}

export async function captureInbox(request,input){
 const identity=await captureIdentity(request),user=identity.user;
 if(typeof input.id!=='string'||!/^[a-f0-9-]{36}$/.test(input.id)||typeof input.text!=='string'||!input.text.trim()||input.text.length>10000)throw new AppError('Informe uma entrada com até 10.000 caracteres.');
 const id='capture:'+hash(user.id+':'+input.id),digest=hash(input.text),receiptKey='lifeos:capture:receipt:'+hash(id);
 return withWriteLock(async guard=>withDatabaseRouting(await databaseRouting(),async()=>{
  const receipt=parse(await redis(['GET',receiptKey]));
  if(receipt&&receipt.digest!==digest)throw new AppError('O identificador desta entrada já foi usado com outro texto.',422);
  if(receipt?.status==='saved')return {saved:true,id:input.id};
  const source=await schema('inbox',true);
  // Query only this stable entry ID. Never download any other collection or full Inbox.
  const found=await notion(`/data_sources/${source.id}/query`,{method:'POST',body:{page_size:2,filter:{property:source.tracking.name,rich_text:{equals:id}}}});
  if(found.results?.length){
   const row=found.results[0];
   if(plain(row.properties[source.owner.name]?.rich_text)!==user.id||plain(row.properties[source.fields.text.name]?.rich_text)!==input.text)throw new AppError('O registro remoto precisa de conferência antes de reenviar.',409);
   await redis(['SET',receiptKey,JSON.stringify({status:'saved',digest})]);return {saved:true,id:input.id};
  }
  // An uncertain Notion response must not cause a second POST (even if the first entry was converted/deleted).
  if(receipt)throw new AppError('Aguardando confirmação de um envio anterior. O texto permanece no aparelho; confira o Inbox antes de qualquer nova tentativa manual.',409);
  await guard();
  await redis(['SET',receiptKey,JSON.stringify({status:'sending',digest})]);
  const properties=encode('inbox',{text:input.text},source);
  properties[source.tracking.name]={rich_text:[{text:{content:id}}]};
  properties[source.owner.name]={rich_text:[{text:{content:user.id}}]};
  const saved=await notion('/pages',{method:'POST',body:{parent:{type:'data_source_id',data_source_id:source.id},properties}});
  if(!saved?.id)throw new AppError('O Notion não confirmou o registro. A captura continua pendente.',502);
  await redis(['SET',receiptKey,JSON.stringify({status:'saved',digest})]);
  return {saved:true,id:input.id};
 }));
}
