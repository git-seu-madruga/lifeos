// Two-tap mobile ordering must never capture the native scrolling gesture.
const assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),swc=require('next/dist/build/swc');
const page=fs.readFileSync('app/page.js','utf8'),css=fs.readFileSync('app/globals.css','utf8');
function loadDomain(file){const domain=new Module(module.filename);domain.require=request=>request.startsWith('.')?loadDomain(require('node:path').resolve(require('node:path').dirname(file),request+'.js')):require(request);domain._compile(swc.transformSync(fs.readFileSync(file,'utf8'),{filename:file,jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code,file);return domain.exports;}
const {moveTabBefore,moveTab}=loadDomain(require('node:path').resolve('lib/diary.js'));
const original=['projetos','tarefas','diario','financas'];
assert.deepEqual(moveTabBefore(original,'projetos','financas'),['tarefas','diario','projetos','financas']);
assert.deepEqual(moveTabBefore(original,'financas','projetos'),['financas','projetos','tarefas','diario']);
assert.deepEqual(moveTabBefore(original,'tarefas','diario'),original);
assert.equal(moveTabBefore(original,'tarefas','tarefas'),original);
assert.equal(moveTabBefore(original,'ausente','tarefas'),original);
assert.deepEqual(original,['projetos','tarefas','diario','financas'],'Não mutar ordem anterior');
assert.deepEqual(moveTab(original,'projetos','tarefas'),['tarefas','projetos','diario','financas'],'Atalho desktop mantém movimento para direita');
const pickBody=page.match(/function pickTab\(id\)\{([\s\S]*?)\n  \}\n  function toggleTabOrder/)[1];
const toggleBody=page.match(/function toggleTabOrder\(\)\{([^\n]*)\}/)[1];
let ordering=true,source=null,order=[...original],active='tarefas',detail='project',dragged='diario';
const state=(old,update)=>typeof update==='function'?update(old):update;
const setters=[v=>order=state(order,v),v=>source=state(source,v),v=>active=state(active,v),v=>detail=state(detail,v)];
const pick=id=>Function('id','touchReorder','reorderSource','setTabOrder','setReorderSource','setTabId','setSelected','moveTabBefore',pickBody)(id,ordering,source,...setters,moveTabBefore);
pick('projetos');assert.equal(source,'projetos');assert.deepEqual(order,original);assert.equal(active,'tarefas');assert.equal(detail,'project');
// Scrolling has no custom pointer handler, so it preserves selection until the next tap.
assert.ok(!page.includes('onPointerDown=')&&!page.includes('setPointerCapture')&&!page.includes('touchDrag'));
pick('financas');assert.deepEqual(order,['tarefas','diario','projetos','financas']);assert.equal(source,null);assert.equal(active,'tarefas');
pick('financas');pick('tarefas');assert.deepEqual(order,['financas','tarefas','diario','projetos']);
pick('diario');pick('diario');assert.equal(source,null,'Mesmo botão desmarca');
pick('projetos');Function('setTouchReorder','setReorderSource','setDragged',toggleBody)(v=>ordering=state(ordering,v),setters[1],v=>dragged=state(dragged,v));assert.equal(ordering,false);assert.equal(source,null);assert.equal(dragged,null);
pick('diario');assert.equal(active,'diario');assert.equal(detail,null,'Após concluir, toque abre a aba');
assert.ok(page.includes('draggable={!touchMode&&!touchReorder}'));
assert.ok(page.includes('data-expanded={t.id===tabId||touchReorder}'));
assert.ok(css.includes('.tabs.reordering .tab{touch-action:auto}'));
assert.ok(css.includes('-webkit-overflow-scrolling:touch')&&css.includes('scrollbar-width:none'));
console.log('PASSOU: reordenação mobile por dois toques, inserção antes em ambas as direções, seleção/desmarcação, confirmação, navegação normal e rolagem nativa sem captura.');
