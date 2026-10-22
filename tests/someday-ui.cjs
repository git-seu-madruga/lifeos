const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc'),React=require('react');
const root=fs.mkdtempSync(path.join(process.cwd(),'.someday-ui-test-'));
for(const dir of ['lib','components']){fs.mkdirSync(path.join(root,dir));for(const file of fs.readdirSync(dir)){if(!file.endsWith('.js'))continue;fs.writeFileSync(path.join(root,dir,file),swc.transformSync(fs.readFileSync(path.join(dir,file),'utf8'),{filename:file,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
const original={useState:React.useState,useEffect:React.useEffect,useRef:React.useRef};let slots=[],cursor=0,records=[],managed=0;
React.useState=initial=>{const at=cursor++;if(!(at in slots))slots[at]=typeof initial==='function'?initial():initial;return [slots[at],value=>slots[at]=typeof value==='function'?value(slots[at]):value];};React.useEffect=()=>{};React.useRef=value=>({current:value});
function all(node,predicate,result=[]){if(!node||typeof node!=='object')return result;if(predicate(node))result.push(node);for(const child of React.Children.toArray(node.props?.children))all(child,predicate,result);return result;}
const text=node=>typeof node==='string'?node:typeof node==='number'?String(node):React.Children.toArray(node?.props?.children).map(text).join('');
try{
 const domain=require(path.join(root,'lib/someday')),View=require(path.join(root,'components/SomedayView')).default;
 const areaA=domain.makeArea('Viagens'),areaB=domain.makeArea('Criação'),archived=domain.makeArea('Antiga');archived.data.archived=true;
 const idea=(a,name,context='personal')=>{const v=domain.makeIdea(a,context);v.name=name;v.data.doc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Conteúdo de '+name}]}]};return v;};
 const personal=idea(areaA,'Passeio com café'),work=idea(areaB,'Um jogo novo','work'),old=idea(null,'Legado'),hidden=idea(archived,'Histórico');records=[areaA,areaB,archived,personal,work,old,hidden];
 assert.equal(domain.selectSomedayIdeas(records,{area:areaA.data.uid,context:'personal',favorites:true,query:'JOGO'}).at(0).id,work.id,'Pesquisa ignora gaveta, contexto e favoritas');
 assert.equal(domain.selectSomedayIdeas(records,{query:'CAFE'}).at(0).id,personal.id,'Busca sem acentos');
 assert.equal(domain.somedayDrawers(records).find(d=>d.id==='all').count,4);assert.equal(domain.somedayDrawers(records).some(d=>d.id==='organize'),false);assert.ok(domain.somedayDrawers(records).some(d=>d.id===archived.data.uid));
 const render=()=>{cursor=0;return View({records,setRecords:update=>records=typeof update==='function'?update(records):update,configured:true,context:'personal',onManageAreas:()=>managed++,onPromote(){}});};
 let tree=render();assert.equal(all(tree,n=>n.props?.className==='sd-drawer').length,4);assert.equal(all(tree,n=>n.props?.className==='sd-card').length,0,'Primeira página mostra gavetas, sem cards de ideias');
 all(tree,n=>n.props?.className==='sd-drawer'&&text(n).includes('Viagens'))[0].props.onClick();tree=render();assert.equal(all(tree,n=>n.props?.className==='sd-card').length,1);assert.ok(text(tree).includes('Passeio com café'));assert.ok(!text(tree).includes('Um jogo novo'));
 all(tree,n=>n.props?.type==='search')[0].props.onChange({target:{value:'jogo'}});tree=render();assert.ok(text(tree).includes('Um jogo novo'));assert.ok(!text(tree).includes('Passeio com café'));
 all(tree,n=>n.props?.type==='search')[0].props.onChange({target:{value:''}});tree=render();all(tree,n=>n.type==='button'&&text(n)==='← Áreas')[0].props.onClick();tree=render();assert.ok(all(tree,n=>n.props?.className==='sd-drawer').length);
 all(tree,n=>n.type==='button'&&text(n)==='+ Nova ideia')[0].props.onClick();tree=render();assert.ok(all(tree,n=>n.props?.role==='dialog'&&n.props['aria-label']==='Escolha a área da ideia').length);assert.equal(records.filter(r=>r.type==='idea').length,4,'Abrir criação não salva ideia sem área');
 const choices=all(tree,n=>n.props?.className==='sd-area-choice-list')[0];assert.equal(all(choices,n=>n.type==='button').length,2,'Só áreas ativas para novas ideias');all(choices,n=>n.type==='button'&&text(n)==='Criação')[0].props.onClick();tree=render();const detail=all(tree,n=>n.type?.name==='IdeaDetail')[0];assert.equal(detail.props.record.data.area,areaB.data.uid);assert.equal(records.filter(r=>r.type==='idea').length,4,'Escolha da área ainda mantém rascunho intocado');
 console.log('PASSOU: gavetas, contagens, legados, busca global, retorno, área obrigatória e criação sem registro vazio.');
}finally{Object.assign(React,original);fs.rmSync(root,{recursive:true,force:true});}
