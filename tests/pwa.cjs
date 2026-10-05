const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const handlers = {};
let requested = 0;
vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'), {
  self: {location:{origin:'https://lifeos.test'},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting:async()=>{},clients:{claim:async()=>{}}},
  fetch:async()=>{requested++;throw new Error('offline');}, Response, URL
});
(async()=>{
  for (const path of ['/api/notion','/api/session','/api/auth/google/callback','/api/notion/attachment','/_next/static/test.js']) {
    handlers.fetch({request:{url:'https://lifeos.test'+path,method:'GET',mode:path.startsWith('/api/')?'navigate':'cors'},respondWith:()=>assert.fail('Private API/static request intercepted')});
  }
  assert.equal(requested,0);
  let result;
  handlers.fetch({request:{url:'https://lifeos.test/',method:'GET',mode:'navigate'},respondWith:r=>result=r});
  const response=await result;
  assert.equal(response.status,503); assert.equal(response.headers.get('cache-control'),'no-store');
  assert.match(await response.text(),/sem conexão/);
  const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
  assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.display,'fullscreen');
  for (const icon of manifest.icons) assert.ok(fs.existsSync('public'+icon.src));
  console.log('PASS: PWA não intercepta APIs/autenticação; fallback offline e manifest válidos.');
})().catch(error=>{console.error(error);process.exit(1);});
