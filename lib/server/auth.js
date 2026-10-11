import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
const COOKIE='lifeos_google_session',AGE=7*24*60*60;
export class AppError extends Error{constructor(message,status=400){super(message);this.status=status;}}
export const allowedEmails=()=>[...new Set((process.env.LIFEOS_ALLOWED_GOOGLE_EMAILS||'').split(',').map(p=>p.trim().toLowerCase()).filter(Boolean))];
export const legacyEmail=()=>String(process.env.LIFEOS_LEGACY_OWNER_EMAIL||'').trim().toLowerCase();
export function appOrigin(){const url=new URL(process.env.LIFEOS_APP_URL||'http://localhost:3000');if(url.protocol!=='https:'&&!(process.env.NODE_ENV!=='production'&&url.hostname==='localhost'))throw new AppError('Configure LIFEOS_APP_URL com HTTPS.',503);return url.origin;}
export function configured(){return !!(process.env.NOTION_TOKEN&&process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.LIFEOS_APP_URL&&process.env.LIFEOS_SESSION_SECRET?.length>=32&&allowedEmails().length===2&&allowedEmails().includes(legacyEmail()));}
const signature=value=>createHmac('sha256',process.env.LIFEOS_SESSION_SECRET||'').update(value).digest('base64url');
export function seal(payload){const value=Buffer.from(JSON.stringify(payload)).toString('base64url');return value+'.'+signature(value);}
export function unseal(value){try{if(typeof value!=='string'||value.length>6000)return null;const [data,signed,...rest]=value.split('.');if(rest.length||!signed)return null;const expected=signature(data);if(signed.length!==expected.length||!timingSafeEqual(Buffer.from(signed),Buffer.from(expected)))return null;return JSON.parse(Buffer.from(data,'base64url').toString());}catch{return null;}}
export function cookieValue(request,name){return (request.headers.get('cookie')||'').split(';').map(p=>p.trim()).find(p=>p.startsWith(name+'='))?.slice(name.length+1);}
export function readSession(request){if(!configured())return null;const user=unseal(cookieValue(request,COOKIE));if(!user||user.exp<=Date.now()||user.exp>Date.now()+AGE*1000+60000||typeof user.id!=='string'||!/^google:[A-Za-z0-9_-]{1,255}$/.test(user.id)||!allowedEmails().includes(user.email))return null;return {id:user.id,email:user.email,name:user.name,...(user.mode==='qr'?{temporary:true,sessionId:user.sid,expiresAt:user.exp,idleSeconds:600}:{}),isLegacyOwner:user.email===legacyEmail(),draftKey:user.mode==='qr'?null:createHmac('sha256',process.env.LIFEOS_SESSION_SECRET).update('draft:'+user.id).digest('base64')};}
export const authenticated=request=>!!readSession(request);
export function authorize(request){if(!configured())throw new AppError('Configure o login Google conforme as instruções do pacote.',503);const user=readSession(request);if(!user)throw new AppError('Entre com sua conta Google autorizada.',401);if(request.headers.get('x-lifeos-user')&&request.headers.get('x-lifeos-user')!==user.id)throw new AppError('A conta mudou em outra janela. Entre novamente antes de salvar.',401);return user;}
export function checkOrigin(request){const origin=request.headers.get('origin');if(origin&&origin!==appOrigin())throw new AppError('Origem da solicitação inválida.',403);if(request.headers.get('sec-fetch-site')==='cross-site')throw new AppError('Solicitação não permitida.',403);}
export function sessionCookie(user){const value=seal({...user,exp:Date.now()+AGE*1000,nonce:randomBytes(16).toString('hex')});return `${COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${AGE}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
export const logoutCookie=()=>`${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV==='production'?'; Secure':''}`;
export function json(value,status=200,headers={}){return Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});}
export function failure(error){return json({error:error instanceof AppError?error.message:'Não foi possível concluir a operação. Tente novamente.'},error instanceof AppError?error.status:500);}

// Every protected route checks temporary sessions against Redis; ordinary Google sessions keep their existing flow.
export async function liveSession(request,touch=true){const user=readSession(request);if(!user?.temporary)return user;const {verifyQrSession}=await import('./qrAuth');return await verifyQrSession(user,touch)?user:null;}
export async function authorizeLive(request){const original=authorize(request);if(original.temporary&&!await liveSession(request))throw new AppError('A sessão temporária terminou ou foi desconectada. Entre novamente.',401);return original;}
export function temporaryCookie(user,sid,expiresAt){return `${COOKIE}=${seal({id:user.id,email:user.email,name:user.name,mode:'qr',sid,exp:expiresAt})}; HttpOnly; SameSite=Lax; Path=/${process.env.NODE_ENV==='production'?'; Secure':''}`;}
