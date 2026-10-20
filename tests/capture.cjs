// Executes the production Redis Lua scripts in an isolated Lua VM; no real service is contacted.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc');
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const root=path.resolve('.capture-test');
for(const folder of ['lib','app/api/capture']){
 const compile=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory()){compile(p);continue;}if(!p.endsWith('.js'))continue;const target=path.join(root,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,swc.transformSync(fs.readFileSync(p,'utf8'),{jsc:{parser:{syntax:'ecmascript',jsx:true},target:'es2022'},module:{type:'commonjs'}}).code);}};compile(folder);
}
process.env.NOTION_TOKEN='test';process.env.GOOGLE_CLIENT_ID='test';process.env.GOOGLE_CLIENT_SECRET='test';process.env.LIFEOS_SESSION_SECRET='x'.repeat(48);process.env.LIFEOS_APP_URL='https://lifeos.test';process.env.LIFEOS_ALLOWED_GOOGLE_EMAILS='periclesbernardes@gmail.com,leticiacost3@gmail.com';process.env.LIFEOS_LEGACY_OWNER_EMAIL='periclesbernardes@gmail.com';process.env.UPSTASH_REDIS_REST_URL='https://redis.test';process.env.UPSTASH_REDIS_REST_TOKEN='write-test';
let now=Date.now();const originalNow=Date.now,originalFetch=global.fetch;Date.now=()=>now;const store=new Map(),sets=new Map(),ttls=new Map();
function redis(args){const [command,key,...rest]=args.map(String);if(ttls.has(key)&&ttls.get(key)<=now){store.delete(key);sets.delete(key);ttls.delete(key);}switch(command.toUpperCase()){
 case 'GET':return store.get(key)||null;
 case 'SET':store.set(key,rest[0]);{const px=rest.indexOf('PX');if(px>=0)ttls.set(key,now+Number(rest[px+1]));}return 'OK';
 case 'DEL':store.delete(key);sets.delete(key);ttls.delete(key);return 1;
 case 'INCR':{const n=Number(store.get(key)||0)+1;store.set(key,String(n));return n;}
 case 'EXPIRE':ttls.set(key,now+Number(rest[0])*1000);return 1;
 case 'SADD':{const values=sets.get(key)||new Set();rest.forEach(v=>values.add(v));sets.set(key,values);return 1;}
 case 'SREM':rest.forEach(v=>sets.get(key)?.delete(v));return 1;
 case 'SMEMBERS':return [...(sets.get(key)||[])];
 default:throw Error('Unsupported Redis command '+command);
}}
function push(L,value){if(value===null||value===undefined)lua.lua_pushnil(L);else if(typeof value==='string')lua.lua_pushstring(L,to_luastring(value));else if(typeof value==='number')lua.lua_pushnumber(L,value);else if(typeof value==='boolean')lua.lua_pushboolean(L,value);else{lua.lua_newtable(L);for(const [k,v] of Object.entries(value)){push(L,v);if(Array.isArray(value))lua.lua_rawseti(L,-2,Number(k)+1);else lua.lua_setfield(L,-2,to_luastring(k));}}}
function read(L,index){const type=lua.lua_type(L,index);if(type===lua.LUA_TNIL)return null;if(type===lua.LUA_TSTRING)return to_jsstring(lua.lua_tostring(L,index));if(type===lua.LUA_TNUMBER)return lua.lua_tonumber(L,index);if(type===lua.LUA_TBOOLEAN)return lua.lua_toboolean(L,index);if(type===lua.LUA_TTABLE){const result={},absolute=lua.lua_absindex(L,index);lua.lua_pushnil(L);while(lua.lua_next(L,absolute)){result[read(L,-2)]=read(L,-1);lua.lua_pop(L,1);}return result;}throw Error('Unsupported Lua type');}
function evalLua(script,keys,args){const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);push(L,keys);lua.lua_setglobal(L,to_luastring('KEYS'));push(L,args.map(String));lua.lua_setglobal(L,to_luastring('ARGV'));lua.lua_newtable(L);lua.lua_pushjsfunction(L,()=>{const values=[];for(let i=1;i<=lua.lua_gettop(L);i++)values.push(read(L,i));push(L,redis(values));return 1;});lua.lua_setfield(L,-2,to_luastring('call'));lua.lua_setglobal(L,to_luastring('redis'));lua.lua_newtable(L);lua.lua_pushjsfunction(L,()=>{push(L,JSON.parse(read(L,1)));return 1;});lua.lua_setfield(L,-2,to_luastring('decode'));lua.lua_pushjsfunction(L,()=>{push(L,JSON.stringify(read(L,1)));return 1;});lua.lua_setfield(L,-2,to_luastring('encode'));lua.lua_setglobal(L,to_luastring('cjson'));if(lauxlib.luaL_dostring(L,to_luastring(script))!==lua.LUA_OK)throw Error(read(L,-1));const result=read(L,-1);lua.lua_close(L);return result;}
global.fetch=async(url,options)=>{assert.equal(url,'https://redis.test');const cmd=JSON.parse(options.body);let result;if(cmd[0]==='EVAL'){const n=Number(cmd[2]);result=evalLua(cmd[1],cmd.slice(3,3+n),cmd.slice(3+n));}else result=redis(cmd);return Response.json({result});};

const {randomUUID,createHash}=require('node:crypto');
const auth=require(path.join(root,'lib/server/auth')),capture=require(path.join(root,'lib/server/capture')),route=require(path.join(root,'app/api/capture/device/route')),inboxRoute=require(path.join(root,'app/api/capture/inbox/route'));
const principal={id:'google:p',name:'Péricles',email:'periclesbernardes@gmail.com'},other={id:'google:l',name:'Letícia',email:'leticiacost3@gmail.com'};
const request=(cookie='',input,headers={})=>new Request('https://lifeos.test/api/capture/device',{method:input?'POST':'GET',headers:{cookie,origin:'https://lifeos.test',...headers},...(input?{body:JSON.stringify(input)}:{})});
const dataOf=start=>{const url=new URL(start.url),params=new URLSearchParams(url.hash.slice(1));return {id:params.get('id'),token:params.get('token')};};
const digest=v=>createHash('sha256').update(v).digest('hex');
const redisFetch=global.fetch,pages=new Map(),calls=[];let postCount=0,uncertainAfter=false,uncertainBefore=false,rejectCreate=0;
process.env.NOTION_INBOX_DATABASE_ID='inbox-test';
let source={id:'inbox-source',properties:{Nome:{name:'Nome',type:'title'},Conteúdo:{name:'Conteúdo',type:'rich_text'}}};
global.fetch=async(url,options={})=>{
 if(url==='https://redis.test')return redisFetch(url,options);
 const path=new URL(url).pathname.slice(3),body=options.body?JSON.parse(options.body):null;calls.push({path,body,method:options.method});
 assert.equal(options.headers.Authorization,'Bearer test');
 if(path==='/databases/inbox-test')return Response.json({data_sources:[{id:source.id}]});
 if(path==='/data_sources/inbox-source'){
  if(options.method==='PATCH')for(const [name,type]of Object.entries(body.properties))source.properties[name]={name,type:Object.keys(type)[0]};
  return Response.json(source);
 }
 if(path==='/data_sources/inbox-source/query'){
  assert.ok(body.filter.rich_text.equals.startsWith('capture:'));
  return Response.json({results:[...pages.values()].filter(p=>!p.in_trash&&p.properties['LifeOS ID'].rich_text[0].text.content===body.filter.rich_text.equals)});
 }
 if(path==='/pages'&&options.method==='POST'){
  postCount++;if(uncertainBefore){uncertainBefore=false;throw Error('Network lost before write');}
  if(rejectCreate)return Response.json({message:'Simulated rejection'},{status:rejectCreate,headers:{'retry-after':'0'}});
  const page={id:randomUUID(),properties:body.properties,parent:body.parent};pages.set(page.id,page);
  if(uncertainAfter){uncertainAfter=false;throw Error('Response lost after write');}return Response.json(page);
 }
 throw Error('Unexpected Notion call '+path);
};
(async()=>{try{
 const secret='a'.repeat(64),start=await capture.startCapture(request(),{secretHash:digest(secret),device:'Android teste'}),proof=dataOf(start),native=request('',undefined,{authorization:'Bearer '+start.id+'.'+secret});
 assert.equal((await capture.captureStatus(native)).status,'pending');
 assert.equal((await route.POST(request('',{action:'approve',...proof}))).status,401);
 await assert.rejects(capture.captureDetails({...principal,temporary:true},proof.id,proof.token),e=>e.status===403);
 assert.equal((await capture.captureDetails(principal,proof.id,proof.token)).code,start.code);
 await capture.approveCapture(principal,proof.id,proof.token,true);
 await assert.rejects(capture.approveCapture(other,proof.id,proof.token,true),e=>e.status===409);
 assert.equal((await capture.captureStatus(native)).user.id,principal.id);
 assert.equal((await capture.listCaptureDevices(other)).length,0);assert.equal((await capture.listCaptureDevices(principal)).length,1);
 await assert.rejects(capture.revokeCapture(other,start.id),e=>e.status===403);
 const item={id:randomUUID(),text:'Uma captura\nEm várias linhas'};
 const result=await capture.captureInbox(native,item);assert.equal(result.saved,true);assert.equal(postCount,1);assert.equal([...pages.values()][0].properties['LifeOS Usuário'].rich_text[0].text.content,principal.id);
 assert.ok(!auth.readSession(native),'Credencial do app não autoriza sessão web');
 await capture.captureInbox(native,item);assert.equal(postCount,1,'Reenvio não duplica');
 [...pages.values()][0].in_trash=true;await capture.captureInbox(native,item);assert.equal(postCount,1,'Recibo impede recriar após conversão/exclusão no Inbox');
 await assert.rejects(capture.captureInbox(native,{...item,text:'Outro texto'}),e=>e.status===422);
 uncertainAfter=true;const lost={id:randomUUID(),text:'Resposta perdida'};await assert.rejects(capture.captureInbox(native,lost));const before=postCount;assert.equal((await capture.captureInbox(native,lost)).saved,true);assert.equal(postCount,before,'Consulta exata recupera gravação de resposta perdida');
 uncertainBefore=true;const ambiguous={id:randomUUID(),text:'Resultado incerto'};await assert.rejects(capture.captureInbox(native,ambiguous));const after=postCount;await assert.rejects(capture.captureInbox(native,ambiguous),e=>e.status===409);assert.equal(postCount,after,'Falha ambígua não dispara um segundo POST');
 for(const status of [400,401,403,404,413,422,429]){
  rejectCreate=status;const retry={id:randomUUID(),text:'Recusada explicitamente '+status},size=pages.size;
  await assert.rejects(capture.captureInbox(native,retry),e=>e.notionStatus===status);
  assert.equal(pages.size,size,'Recusa não criou página');
  await assert.rejects(capture.captureInbox(native,{...retry,text:'Mudou o texto'}),e=>e.status===422,'Recibo mantém proteção do conteúdo');
  rejectCreate=0;assert.equal((await capture.captureInbox(native,retry)).saved,true,'Recusa explícita permite nova tentativa segura');
  const posts=postCount;await capture.captureInbox(native,retry);assert.equal(postCount,posts,'Nova confirmação não duplica');
 }
 rejectCreate=503;const serverError={id:randomUUID(),text:'Falha 5xx incerta'};
 await assert.rejects(capture.captureInbox(native,serverError),e=>e.notionStatus===503);
 rejectCreate=0;const uncertainPosts=postCount;await assert.rejects(capture.captureInbox(native,serverError),e=>e.status===409);assert.equal(postCount,uncertainPosts,'5xx não autoriza criar uma cópia');
 store.set('lifeos:maintenance:v1',JSON.stringify({id:'backup'}));await assert.rejects(capture.captureInbox(native,{id:randomUUID(),text:'Durante backup'}),e=>e.status===423);store.delete('lifeos:maintenance:v1');
 await assert.rejects(capture.captureInbox(native,{id:randomUUID(),text:'a'.repeat(10001)}),e=>e.status===400);
 await assert.rejects(capture.captureStatus(request('',undefined,{authorization:'Bearer '+start.id+'.'+'b'.repeat(64)})),e=>e.status===401);
 const secretB='b'.repeat(64),startB=await capture.startCapture(request(),{secretHash:digest(secretB),device:'Android Letícia'}),proofB=dataOf(startB);await capture.approveCapture(other,startB.id,proofB.token,true);const nativeB=request('',undefined,{authorization:'Bearer '+startB.id+'.'+secretB});await capture.captureInbox(nativeB,{id:item.id,text:'Da Letícia',userId:principal.id});assert.equal([...pages.values()].at(-1).properties['LifeOS Usuário'].rich_text[0].text.content,other.id,'Proprietário vem da credencial e IDs iguais são isolados por conta');
 assert.ok(calls.every(c=>c.path.includes('inbox')||c.path==='/pages'),'Somente o banco Inbox é acessado');
 const cookie=auth.sessionCookie(principal).split(';')[0];assert.equal((await route.POST(request(cookie,{action:'revoke',id:start.id},{origin:'https://evil.test'}))).status,403);
 assert.equal((await route.POST(request(cookie,{action:'details',...proof},{'X-LifeOS-User':other.id}))).status,401);
 await capture.revokeCapture(principal,start.id);await assert.rejects(capture.captureInbox(native,item),e=>e.status===401);
 const denied=await capture.startCapture(request(),{secretHash:digest(secret),device:'Outro'}),deniedProof=dataOf(denied);await capture.approveCapture(other,denied.id,deniedProof.token,false);assert.equal((await capture.captureStatus(request('',undefined,{authorization:'Bearer '+denied.id+'.'+secret}))).status,'denied');
 now+=90*24*60*60*1000;await assert.rejects(capture.captureInbox(nativeB,{id:randomUUID(),text:'Expirado'}),e=>e.status===401);
 const expires=await capture.startCapture(request(),{secretHash:digest(secret),device:'Expira'});now+=600001;await assert.rejects(capture.captureStatus(request('',undefined,{authorization:'Bearer '+expires.id+'.'+secret})),e=>e.status===401);
 for(let i=0;i<21;i++)await route.POST(request('',{action:'start',secretHash:digest(secret)},{'x-vercel-forwarded-for':'abuse'}));assert.equal((await route.POST(request('',{action:'start',secretHash:digest(secret)},{'x-vercel-forwarded-for':'abuse'}))).status,429);
 console.log('PASSOU: pareamento nativo com Lua real, duas contas, escopo apenas Inbox, dono protegido, revogação, expiração, origem, manutenção, envio incremental, recibos e resposta perdida sem duplicação.');
}finally{Date.now=originalNow;global.fetch=originalFetch;fs.rmSync(root,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
