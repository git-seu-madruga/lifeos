import {randomBytes,createHash,createHmac} from 'node:crypto';
import {redis} from './coordination';
import {AppError,appOrigin,configured,seal,unseal,cookieValue,temporaryCookie} from './auth';
const COOKIE='lifeos_qr_request',WINDOW=120000,LIFETIME=1800000,IDLE=600000;
const hash=value=>createHash('sha256').update(value).digest('hex');
const key=id=>'lifeos:qr:request:'+id,sessionKey=id=>'lifeos:qr:session:'+id,indexKey=id=>'lifeos:qr:user:'+hash(id);
const validId=id=>typeof id==='string'&&/^[a-f0-9]{48}$/.test(id);
const secure=()=>process.env.NODE_ENV==='production'?'; Secure':'';
export const clearQrCookie=()=>`${COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/auth/qr; Max-Age=0${secure()}`;
function browser(request){const value=unseal(cookieValue(request,COOKIE));if(!value||!validId(value.id)||typeof value.proof!=='string'||value.exp<=Date.now())throw new AppError('O QR Code expirou. Gere outro neste computador.',401);return value;}
async function challenge(id,token){if(!validId(id)||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))throw new AppError('QR Code inválido.',400);const raw=await redis(['GET',key(id)]),data=raw?JSON.parse(raw):null;if(!data||data.exp<=Date.now()||data.tokenHash!==hash(token))throw new AppError('O QR Code expirou ou já foi utilizado.',410);return data;}
export function requireGoogle(user){if(!user||user.temporary)throw new AppError('Autorize pelo celular com uma sessão iniciada pelo Google. Sessões por QR Code não podem autorizar outros computadores.',403);}
export async function startQr(request){
 if(!configured())throw new AppError('Configure o login Google primeiro.',503);
 const address=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')||'unknown';
 const limit='lifeos:qr:rate:'+createHmac('sha256',process.env.LIFEOS_SESSION_SECRET).update(address.split(',')[0].trim()).digest('hex');
 const count=await redis(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n",1,limit]);if(Number(count)>30)throw new AppError('Muitas tentativas. Aguarde alguns minutos.',429);
 const id=randomBytes(24).toString('hex'),proof=randomBytes(32).toString('hex'),token=randomBytes(32).toString('hex'),exp=Date.now()+WINDOW;
 const code=String(parseInt(randomBytes(3).toString('hex'),16)%1000000).padStart(6,'0');
 const data={proofHash:hash(proof),tokenHash:hash(token),exp,createdAt:Date.now(),code,status:'pending',device:(request.headers.get('user-agent')||'Computador').slice(0,160)};
 await redis(['SET',key(id),JSON.stringify(data),'PX',WINDOW]);
 return {url:appOrigin()+'/pair#id='+id+'&token='+token,code,expiresAt:exp,cookie:`${COOKIE}=${seal({id,proof,exp})}; HttpOnly; SameSite=Strict; Path=/api/auth/qr; Max-Age=120${secure()}`};
}
export async function qrDetails(user,id,token){requireGoogle(user);const data=await challenge(id,token);if(data.status!=='pending')throw new AppError('Este pedido já foi respondido.',409);return {code:data.code,device:data.device,expiresAt:data.exp,origin:appOrigin()};}
export async function approveQr(user,id,token,approve){
 requireGoogle(user);await challenge(id,token);
 const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local d=cjson.decode(raw); if d.status~='pending' or d.tokenHash~=ARGV[1] or d.exp<=tonumber(ARGV[2]) then return 0 end; d.status=ARGV[3]; d.user=cjson.decode(ARGV[4]); redis.call('SET',KEYS[1],cjson.encode(d),'PX',d.exp-tonumber(ARGV[2])); return 1";
 const result=await redis(['EVAL',script,1,key(id),hash(token),Date.now(),approve?'approved':'denied',JSON.stringify({id:user.id,email:user.email,name:user.name})]);if(Number(result)!==1)throw new AppError('Este QR Code já foi respondido ou expirou.',409);return {approved:!!approve};
}
export async function pollQr(request){const proof=browser(request),raw=await redis(['GET',key(proof.id)]),data=raw?JSON.parse(raw):null;if(!data||data.exp<=Date.now()||data.proofHash!==hash(proof.proof))throw new AppError('O QR Code expirou. Gere outro.',410);return {status:data.status,expiresAt:data.exp};}
export async function redeemQr(request){
 const proof=browser(request),raw=await redis(['GET',key(proof.id)]),data=raw?JSON.parse(raw):null;
 if(!data||!data.user||data.status!=='approved'||data.proofHash!==hash(proof.proof)||data.exp<=Date.now())throw new AppError('Pedido não autorizado ou expirado.',401);
 const sid=randomBytes(24).toString('hex'),now=Date.now(),exp=now+LIFETIME,session={userId:data.user.id,email:data.user.email,createdAt:now,lastSeen:now,exp,device:data.device};
 const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local d=cjson.decode(raw); if d.status~='approved' or d.proofHash~=ARGV[1] or d.exp<=tonumber(ARGV[2]) then return 0 end; redis.call('DEL',KEYS[1]); redis.call('SET',KEYS[2],ARGV[3],'PX',ARGV[4]); redis.call('SADD',KEYS[3],ARGV[5]); redis.call('EXPIRE',KEYS[3],86400); return 1";
 const result=await redis(['EVAL',script,3,key(proof.id),sessionKey(sid),indexKey(data.user.id),hash(proof.proof),now,JSON.stringify(session),LIFETIME,sid]);if(Number(result)!==1)throw new AppError('Este QR Code já foi utilizado.',409);
 return {cookie:temporaryCookie(data.user,sid,exp),expiresAt:exp};
}
export async function verifyQrSession(user,touch=true){
 if(!validId(user.sessionId))return false;
 const script="local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local d=cjson.decode(raw); local now=tonumber(ARGV[2]); if d.userId~=ARGV[1] or d.email~=ARGV[5] or d.exp<=now or now-d.lastSeen>=tonumber(ARGV[3]) then redis.call('DEL',KEYS[1]); return 0 end; if ARGV[4]=='1' then d.lastSeen=now; redis.call('SET',KEYS[1],cjson.encode(d),'PX',d.exp-now) end; return 1";
 return Number(await redis(['EVAL',script,1,sessionKey(user.sessionId),user.id,Date.now(),IDLE,touch?'1':'0',user.email]))===1;
}
export async function listQrSessions(user){requireGoogle(user);const ids=await redis(['SMEMBERS',indexKey(user.id)])||[],items=[];for(const id of ids){if(!validId(id))continue;const raw=await redis(['GET',sessionKey(id)]),data=raw?JSON.parse(raw):null;if(data?.userId===user.id&&data.exp>Date.now()&&Date.now()-data.lastSeen<IDLE)items.push({id,device:data.device,createdAt:data.createdAt,expiresAt:data.exp});else await redis(['SREM',indexKey(user.id),id]);}return items.sort((a,b)=>b.createdAt-a.createdAt);}
export async function revokeQrSession(user,sid){if(!validId(sid))throw new AppError('Sessão inválida.');const result=await redis(['EVAL',"local raw=redis.call('GET',KEYS[1]); if not raw then return 1 end; local d=cjson.decode(raw); if d.userId~=ARGV[1] then return 0 end; redis.call('DEL',KEYS[1]); redis.call('SREM',KEYS[2],ARGV[2]); return 1",2,sessionKey(sid),indexKey(user.id),user.id,sid]);if(Number(result)!==1)throw new AppError('Você só pode desconectar seus próprios computadores.',403);return {revoked:true};}
