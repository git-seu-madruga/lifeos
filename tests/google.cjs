const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc');
const root=path.resolve('.google-test');fs.mkdirSync(path.join(root,'lib/server'),{recursive:true});
for(const name of ['auth.js','google.js','googleCompletion.js'])fs.writeFileSync(path.join(root,'lib/server',name),swc.transformSync(fs.readFileSync(path.join('lib/server',name),'utf8'),{jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
process.env.NOTION_TOKEN='test';process.env.GOOGLE_CLIENT_ID='client.apps.googleusercontent.com';process.env.GOOGLE_CLIENT_SECRET='secret';process.env.LIFEOS_SESSION_SECRET='x'.repeat(48);process.env.LIFEOS_APP_URL='https://lifeos.example.invalid';process.env.LIFEOS_ALLOWED_GOOGLE_EMAILS='primary.example@gmail.com,secondary.example@gmail.com';process.env.LIFEOS_LEGACY_OWNER_EMAIL='primary.example@gmail.com';
const auth=require(path.join(root,'lib/server/auth')),google=require(path.join(root,'lib/server/google')),{OAuth2Client}=require('google-auth-library');
(async()=>{try{
 const flow=google.startGoogle(),url=new URL(flow.url),cookie=flow.cookie.split(';')[0],data=auth.unseal(cookie.split('=')[1]);assert.equal(url.hostname,'accounts.google.com');assert.equal(url.searchParams.get('redirect_uri'),process.env.LIFEOS_APP_URL+'/api/auth/google/callback');assert.equal(url.searchParams.get('code_challenge_method'),'S256');assert.equal(url.searchParams.get('nonce'),data.nonce);assert.ok(flow.cookie.includes('HttpOnly'));assert.ok(flow.cookie.includes('SameSite=Lax'));
 const popupFlow=google.startGoogle(true),popupData=auth.unseal(popupFlow.cookie.split(';')[0].split('=')[1]);assert.equal(popupData.popup,true);assert.equal(google.googlePopupFlow(new Request(process.env.LIFEOS_APP_URL+'/api/auth/google/callback?state='+popupData.state,{headers:{cookie:popupFlow.cookie.split(';')[0]}})),true);assert.equal(google.googlePopupFlow(new Request(process.env.LIFEOS_APP_URL+'/api/auth/google/callback?state=wrong',{headers:{cookie:popupFlow.cookie.split(';')[0]}})),false);
 const {googleCompletion}=require(path.join(root,'lib/server/googleCompletion'));const completion=googleCompletion(process.env.LIFEOS_APP_URL,'</script><script>alert(1)</script>');assert.ok(completion.body.includes('postMessage'));assert.ok(completion.body.includes('window.close()'));assert.ok(completion.body.includes("localStorage.setItem('lifeos-login-complete'"));assert.ok(completion.headers['Content-Security-Policy'].includes("frame-ancestors 'none'"));assert.equal(completion.body.includes('</script><script>alert(1)'),false);assert.equal(completion.body.includes('lifeos_google_session'),false);
 const payload={sub:'10001',email:'primary.example@gmail.com',email_verified:true,name:'Principal',nonce:data.nonce};assert.equal(google.validateGooglePayload(payload,data.nonce).id,'google:10001');assert.throws(()=>google.validateGooglePayload({...payload,email:'stranger@gmail.com'},data.nonce),error=>error.status===403);assert.throws(()=>google.validateGooglePayload({...payload,email_verified:false},data.nonce),error=>error.status===401);assert.throws(()=>google.validateGooglePayload(payload,'wrong-nonce'),error=>error.status===401);
 // Simulate Google's HTTP responses, then let the real OAuth library verify the signature and claims.
 const {generateKeyPairSync,sign}=require('node:crypto');
 const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const certificate=publicKey.export({type:'spki',format:'pem'});
 const now=Math.floor(Date.now()/1000);
 function token(claims, signingKey=privateKey){
  const header={alg:'RS256',typ:'JWT',kid:'test-key'};
  const body={iss:'https://accounts.google.com',aud:process.env.GOOGLE_CLIENT_ID,iat:now,exp:now+300,...claims};
  const unsigned=[header,body].map(value=>Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return unsigned+'.'+sign('RSA-SHA256',Buffer.from(unsigned),signingKey).toString('base64url');
 }
 const originalGet=OAuth2Client.prototype.getToken,originalCerts=OAuth2Client.prototype.getFederatedSignonCertsAsync;
 let idToken=token(payload);
 OAuth2Client.prototype.getToken=async ({codeVerifier})=>{
  assert.equal(codeVerifier,data.verifier);
  return {tokens:{id_token:idToken}};
 };
 OAuth2Client.prototype.getFederatedSignonCertsAsync=async()=>({certs:{'test-key':certificate},format:'PEM'});
 try{
  const origin=process.env.LIFEOS_APP_URL;
  const callback=(state=data.state)=>new Request(origin+'/api/auth/google/callback?code=test-code&state='+state,{headers:{cookie}});
  for(const account of [payload,{...payload,sub:'10002',email:'secondary.example@gmail.com'}]){
   idToken=token(account);
   const result=await google.finishGoogle(callback());
   const session=result.cookie.split(';')[0];
   const request=new Request(origin+'/api/notion',{headers:{cookie:session}});
   assert.equal(auth.authorize(request).email,account.email);
   assert.equal(auth.authenticated(new Request(request.url,{headers:{cookie:session+'tampered'}})),false);
   assert.throws(()=>auth.authorize(new Request(request.url,{headers:{cookie:session,'X-LifeOS-User':'google:someone-else'}})),error=>error.status===401);
  }
  await assert.rejects(()=>google.finishGoogle(callback('wrong')),error=>error.status===401);
  idToken=token({...payload,aud:'other-client'});
  await assert.rejects(()=>google.finishGoogle(callback()),/audience|recipient/i);
  const otherKey=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey;
  idToken=token(payload,otherKey);
  await assert.rejects(()=>google.finishGoogle(callback()),/signature/i);
 }finally{
  OAuth2Client.prototype.getToken=originalGet;
  OAuth2Client.prototype.getFederatedSignonCertsAsync=originalCerts;
 }
 const expired=auth.seal({id:'google:10001',email:payload.email,exp:Date.now()-1});assert.equal(auth.authenticated(new Request(process.env.LIFEOS_APP_URL,{headers:{cookie:'lifeos_google_session='+expired}})),false);assert.equal(auth.authenticated(new Request(process.env.LIFEOS_APP_URL,{headers:{cookie:'lifeos_session=old-password-cookie'}})),false);assert.throws(()=>auth.checkOrigin(new Request(process.env.LIFEOS_APP_URL,{headers:{origin:'https://evil.test'}})),error=>error.status===403);
 console.log('PASSOU: OAuth com assinatura RSA, audience, state, nonce e PKCE; apenas duas contas; sessão assinada; expiração; troca de usuário e ausência de acesso por senha.');
}finally{fs.rmSync(root,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1;});
