const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const folder=path.resolve('.tasks-ui-test');
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir),{recursive:true});for(const name of fs.readdirSync(dir)){if(!name.endsWith('.js'))continue;fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
const saved={useState:React.useState,useMemo:React.useMemo,useEffect:React.useEffect};
let slots=[],index=0;
React.useState=value=>{const i=index++;if(!(i in slots))slots[i]=typeof value==='function'?value():value;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];};React.useMemo=fn=>fn();React.useEffect=()=>{};
const walk=(node,result=[])=>{if(Array.isArray(node)){node.forEach(n=>walk(n,result));return result;}if(node?.props){result.push(node);walk(node.props.children,result);}return result;};
try{
 const View=require(path.join(folder,'components/TasksView')).default;
 let tasks=[],projectOpened=null;const user={email:'leticiacost3@gmail.com'},projects=[{id:'p',name:'Projeto',context:'personal',shared:true,responsible:'periclesbernardes@gmail.com',milestones:[]}];
 const props=()=>({tasks,projects,setTasks:fn=>{tasks=fn(tasks);},user,context:'all',sub:'status',onOpenProject:id=>{projectOpened=id;}});
 const tree=()=>{index=0;return walk(View(props()));};
 for(let n=0;n<3;n++){
  tree().find(e=>e.type==='button'&&e.props.children==='+ Nova tarefa').props.onClick();assert.equal(tasks.length,1);
  const nodes=tree();assert.equal(nodes.filter(e=>e.type==='li').length,0,'Rascunho intocado não entra no quadro');
  nodes.find(e=>e.type?.name==='ModalLayer').props.onClose();assert.equal(tasks.length,0,'Fechar descarta imediatamente');
 }
 tasks=[{id:'blank',title:'',status:'todo',priority:'medium',context:'personal',project:'p',shared:true,responsible:user.email}];
 let nodes=tree(),row=nodes.find(e=>e.type==='li');row.props.onClick({target:{closest:()=>null}});assert.ok(tree().some(e=>e.type?.name==='ModalLayer'&&e.props.open),'Clicar no espaço abre tarefa sem título');
 tree().find(e=>e.type?.name==='ModalLayer').props.onClose();nodes=tree();nodes.find(e=>e.type==='button'&&e.props.className==='proj').props.onClick();row=nodes.find(e=>e.type==='li');row.props.onClick({target:{closest:()=>({})}});assert.equal(projectOpened,'p');assert.equal(tree().find(e=>e.type?.name==='ModalLayer').props.open,false,'Botão do projeto não abre a tarefa');
 const Fields=require(path.join(folder,'components/SharingFields')).default;let patch;walk(Fields({item:{},user,onChange:p=>patch=p})).find(e=>e.type==='input').props.onChange({target:{checked:true}});assert.equal(patch.responsible,user.email,'Responsável inicial é o usuário logado');
 const Brand=require(path.join(folder,'components/Brand')).default;const notice=renderToStaticMarkup(React.createElement(Brand,{notice:true})),normal=renderToStaticMarkup(React.createElement(Brand));assert.ok(notice.includes('brand-heart')&&notice.includes('Life')&&notice.includes('brand-os'));assert.ok(!normal.includes('<button'),'Logo comum não tem ação');
 console.log('PASSOU: tarefas intocadas descartadas sem acúmulo, área da linha abre tarefa sem título, projeto independente, responsável padrão e logo normal sem ação.');
}finally{Object.assign(React,saved);fs.rmSync(folder,{recursive:true,force:true});}
