const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os'),{EventEmitter}=require('node:events'),{Readable}=require('node:stream');
const swc=require('next/dist/build/swc'),root=path.resolve('.someday-test');
function compile(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){compile(p);continue;}if(!p.endsWith('.js'))continue;const dest=path.join(root,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,swc.transformSync(fs.readFileSync(p,'utf8'),{jsc:{parser:{syntax:'ecmascript',jsx:true},target:'es2022'},module:{type:'commonjs'}}).code);}}compile('lib');
const domain=require(path.join(root,'lib/someday')),preview=require(path.join(root,'lib/server/linkPreview')),diff=require(path.join(root,'lib/notionDiff'));
const state={someday:[],projects:[],tasks:[],inbox:[],diary:[]};
const transport=(replies,calls)=>((url,options,callback)=>{calls.push({url:url.href,options});const req=new EventEmitter();req.end=()=>queueMicrotask(()=>{const reply=replies.shift();assert.ok(reply,'Resposta simulada ausente');const res=Readable.from([Buffer.from(reply.body||'')]);res.statusCode=reply.status||200;res.headers={'content-type':'text/html',...reply.headers};callback(res);});return req;});
const publicDns=async()=>[{address:'93.184.216.34',family:4}];
(async()=>{try{
 const a=domain.makeArea('Criação','palette',domain.IDEA_COLORS[1]),idea=domain.makeIdea(a,'personal');idea.name='Um jogo';idea.data.doc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Uma inspiração',marks:[{type:'bold'}]}]},{type:'ideaImage',attrs:{attachmentId:'stable-image.png',alt:'Esboço'}},{type:'ideaBookmark',attrs:{id:'link-1',url:'https://example.com/',title:'Referência',description:'Uma página',image:''}}]};idea.attachments=[{id:'temporary-id',name:'stable-image.png',notion:{type:'external',external:{url:'https://example.com/image.png'}}}];
 assert.equal(domain.validateSomeday(a),'');assert.equal(domain.validateSomeday(idea),'');
 assert.equal(domain.validateSomeday({...idea,attachments:[{...idea.attachments[0],id:'restored-page-new-id'}]}),'','Texto usa nome estável e sobrevive à restauração de IDs');
 assert.ok(domain.validateSomeday({...idea,attachments:[]}));
 const bad=structuredClone(idea);bad.data.doc.content.push({type:'ideaBookmark',attrs:{id:'bad',url:'javascript:alert(1)',title:'x',description:'',image:''}});assert.ok(domain.validateSomeday(bad));
 assert.ok(domain.validateIdeaDoc({type:'doc',content:[{type:'script',text:'x'}]}));
 assert.equal(domain.safeIdeaUrl('https://example.com/path'),'https://example.com/path');assert.equal(domain.safeIdeaUrl('data:image/png;base64,a'),'');
 assert.ok(domain.ideaText(idea.data.doc).includes('https://example.com/'));
 for(const kind of ['task','project']){
  const original={...state,someday:[a,idea]},next=domain.promoteIdea(original,idea.id,kind),collection=kind==='task'?'tasks':'projects';
  assert.equal(next[collection].length,1);assert.equal(next[collection][0].context,'personal');assert.equal(next[collection][0].attachments.length,1);assert.ok((next[collection][0].notes||next[collection][0].description).includes('Uma inspiração'));
  assert.equal(original.someday[1].data.promoted,undefined);assert.deepEqual(next.someday[1].data.doc,idea.data.doc);assert.throws(()=>domain.promoteIdea(next,idea.id,kind),/já foi transformada/);
  const compact=diff.compactSyncState(original,next);assert.ok(compact.next[collection].length);assert.ok(compact.next.someday.some(r=>r.type==='area'));
 }
 for(const url of ['http://example.com','https://localhost/','https://127.0.0.1/','https://169.254.169.254/','https://10.0.0.2/','https://100.64.0.1/','https://user:pass@example.com/','https://example.com:8443/'])assert.throws(()=>preview.publicPreviewUrl(url));
 for(const ip of ['::1','::ffff:127.0.0.1','192.168.1.1','172.16.0.1','169.254.169.254'])assert.equal(preview.publicIp(ip),false);
 assert.equal(preview.publicIp('8.8.8.8'),true);
 let calls=[];
 const html='<title>Fallback</title><meta content="Jogo &amp; Arte" property="og:title"><meta name="description" content="Uma &quot;ideia&quot;"><meta property="og:image" content="/cover.png">';
 const data=await preview.fetchPreviewBytes('https://example.com/hello',{resolve:publicDns,request:transport([{body:html}],calls)});
 const metadata=preview.parseLinkMetadata(data.bytes.toString(),data.url);assert.equal(metadata.title,'Jogo & Arte');assert.equal(metadata.image,'https://example.com/cover.png');assert.equal(metadata.description,'Uma "ideia"');
 await new Promise((resolve,reject)=>calls[0].options.lookup('example.com',{},(error,address)=>{assert.ifError(error);assert.equal(address,'93.184.216.34');resolve();}));
 assert.equal(calls[0].options.headers.Cookie,undefined);
 calls=[];await assert.rejects(()=>preview.fetchPreviewBytes('https://example.com/',{resolve:async()=>[{address:'127.0.0.1',family:4}],request:transport([],calls)}));assert.equal(calls.length,0);
 calls=[];await assert.rejects(()=>preview.fetchPreviewBytes('https://example.com/',{resolve:publicDns,request:transport([{status:302,headers:{location:'https://169.254.169.254/latest/'}}],calls)}));assert.equal(calls.length,1,'Redirecionamento privado é bloqueado antes da requisição');
 const bounded=await preview.fetchPreviewBytes('https://example.com/',{resolve:publicDns,request:transport([{headers:{'content-length':'9999999'},body:html+' '.repeat(300000)}],[])});assert.equal(bounded.bytes.length,256*1024);assert.equal(preview.parseLinkMetadata(bounded.bytes.toString(),bounded.url).title,'Jogo & Arte','Basta ler o início de páginas grandes');
 await assert.rejects(()=>preview.fetchPreviewBytes('https://example.com/',{image:true,resolve:publicDns,request:transport([{headers:{'content-length':'9999999'}}],[])}));
 await assert.rejects(()=>preview.fetchPreviewBytes('https://example.com/',{image:true,resolve:publicDns,request:transport([{headers:{'content-type':'image/svg+xml'},body:'<svg/>'}],[])}));
 console.log('PASSOU: ideias/áreas, documento rico, imagens estáveis, conversões, dependências, metadados e prévias com DNS fixado e bloqueio de endereços privados.');
}finally{fs.rmSync(root,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
