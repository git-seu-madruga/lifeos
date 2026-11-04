const assert=require('node:assert/strict'),{testEnvironment,verify}=require('../scripts/verify.cjs');
const source={PATH:'/bin',NOTION_TOKEN:'private',LIFEOS_ACCOUNT_NAMES:'private',GOOGLE_CLIENT_SECRET:'private',UPSTASH_REDIS_REST_TOKEN:'private',IGDB_CLIENT_SECRET:'private',TMDB_READ_ACCESS_TOKEN:'private',NEXT_PUBLIC_SAMPLE:'private'};
assert.deepEqual(testEnvironment(source),{PATH:'/bin',NODE_ENV:'test'});assert.equal(source.NOTION_TOKEN,'private');
let calls=[];assert.equal(verify((command,args,options)=>{calls.push({command,args,env:options.env});return {status:0};},source),0);assert.equal(calls.length,3);assert.deepEqual(calls[0].args,['test']);assert.deepEqual(calls[1].args,['run','build']);assert.deepEqual(calls[2].args,['tests/privacy.cjs','--build']);assert.equal(calls[1].env,source);assert.equal(calls[0].env.NOTION_TOKEN,undefined);assert.equal(calls[2].env.NOTION_TOKEN,undefined);
for(const failure of [0,1,2]){let count=0;assert.equal(verify(()=>({status:count++===failure?7:0}),source),7);assert.equal(count,failure+1,'A failed verification stops publication');}
assert.equal(verify(()=>({status:null,signal:'SIGTERM'}),source),1);
console.log('PASSOU: verificações em sequência, interrupção na primeira falha e credenciais privadas ausentes nos testes.');
