const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const folder=path.resolve('.finance-test');
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir),{recursive:true});for(const name of fs.readdirSync(dir)){if(!name.endsWith('.js'))continue;fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
try{
 const {parseMonth,maskMonth,parseMoney,consolidate,sankeyLayout,currentMonth,maskReal,completeReal}=require(path.join(folder,'lib/finance'));
 assert.deepEqual(parseMonth('3',2026),{value:'2026-03'});assert.deepEqual(parseMonth('11/2025'),{value:'2025-11'});assert.ok(parseMonth('13').error);assert.ok(parseMonth('02/26').error);assert.equal(maskMonth('122026'),'12/2026');
 assert.equal(maskReal('1250'),'R$ 1.250');assert.equal(completeReal('1250'),'R$ 1.250,00');assert.equal(completeReal('1250,5'),'R$ 1.250,50');assert.equal(maskReal('R$ 1.250,56'),'R$ 1.250,56');assert.equal(completeReal(''),'');
 assert.equal(parseMoney('1.234,56'),123456);assert.equal(parseMoney('12,3'),1230);assert.equal(parseMoney('0,01'),1);assert.equal(parseMoney('-5'),null);assert.equal(parseMoney('0'),null);assert.equal(parseMoney('1,234'),null);
 const categories=[{id:'a',name:'Salário',flow:'in'},{id:'b',name:'Contas',flow:'out'}],month=currentMonth();
 const tx=[{id:'1',category:'a',amount:100000,month},{id:'2',category:'b',amount:60000,month},{id:'3',category:'a',amount:12345,month:'2025-01'}];
 const positive=consolidate(categories,tx,month,month);assert.equal(positive.balance,40000);assert.equal(positive.right.find(n=>n.system).value,40000);assert.equal(positive.left.some(n=>n.system),false);
 const negative=consolidate(categories,[{category:'b',amount:60000,month}],month,month);assert.equal(negative.balance,-60000);assert.equal(negative.left[0].flow,'deficit');assert.equal(negative.right.some(n=>n.system),false);assert.equal(negative.left.reduce((s,n)=>s+n.value,0),negative.right.reduce((s,n)=>s+n.value,0));
 const zero=consolidate(categories,[{category:'a',amount:1,month},{category:'b',amount:1,month}],month,month);assert.equal(zero.balance,0);assert.equal([...zero.left,...zero.right].some(n=>n.system),false);
 const year=consolidate(categories,tx,'2025-01','2025-12');assert.equal(year.income,12345);assert.equal(year.expense,0);assert.equal(consolidate(categories,tx,'2025-01',month).income,112345);
 const layout=sankeyLayout(positive);assert.ok(Math.abs(layout.left.reduce((s,n)=>s+n.h,0)-layout.right.reduce((s,n)=>s+n.h,0))<0.001);assert.ok(sankeyLayout(positive,{a:20}).left[0].y!==layout.left[0].y);
 const FinanceView=require(path.join(folder,'components/FinanceView')).default;
 const html=renderToStaticMarkup(React.createElement(FinanceView,{categories,transactions:tx,configured:true,setFinance(){}}));assert.match(html,/Saldo restante/);assert.match(html,/Gerenciar categorias/);assert.match(html,/R\$ 400,00/);assert.match(html,/role="button"/);assert.match(html,/Adicionar valor/);
 const deficitHtml=renderToStaticMarkup(React.createElement(FinanceView,{categories,transactions:[{category:'b',amount:60000,month}],configured:true,setFinance(){}}));assert.match(deficitHtml,/Saldo faltante/);assert.match(deficitHtml,/#f26d64/);
 const setup=renderToStaticMarkup(React.createElement(FinanceView,{configured:false,setFinance(){}}));assert.match(setup,/NOTION_FINANCE_CATEGORIES_DATABASE_ID/);

 const oldRAF=global.requestAnimationFrame;global.requestAnimationFrame=()=>{};
 const originalState=React.useState,slots=[];let cursor=0,model={categories:[],transactions:[]};
 React.useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],update=>{slots[i]=typeof update==='function'?update(slots[i]):update;}];};
 function walk(node,predicate){if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of React.Children.toArray(node.props?.children)){const result=walk(child,predicate);if(result)return result;}return null;}
 const button=(tree,text)=>walk(tree,node=>node.type==='button'&&node.props.children===text);
 const label=(tree,text)=>walk(tree,node=>node.type==='label'&&React.Children.toArray(node.props.children)[0]===text);
 const control=(node,type)=>walk(node,item=>item.type===type);
 try{
  const render=()=>{cursor=0;return FinanceView({...model,configured:true,setFinance:update=>{model=typeof update==='function'?update(model):update;}});};
  let tree=render();button(tree,'Gerenciar categorias').props.onClick();tree=render();control(label(tree,'Nome'),'input').props.onChange({target:{value:'Salário'}});tree=render();button(tree,'+ Criar categoria').props.onClick();assert.equal(model.categories.length,1);assert.equal(model.categories[0].flow,'in');
  tree=render();button(tree,'Fechar').props.onClick();tree=render();control(label(tree,'Categoria'),'select').props.onChange({target:{value:model.categories[0].id}});control(label(tree,'Valor'),'input').props.onChange({target:{value:'1.500,00',selectionStart:8}});tree=render();button(tree,'+ Adicionar').props.onClick();assert.equal(model.transactions.length,1);assert.equal(model.transactions[0].amount,150000);
  tree=render();walk(tree,node=>node.type?.name==='Sankey').props.onSelect(model.categories[0].id);tree=render();button(tree,'Editar').props.onClick();tree=render();walk(tree,node=>node.type==='input'&&node.props.value==='R$ 1.500,00').props.onChange({target:{value:'2000,00',selectionStart:7}});tree=render();button(tree,'Salvar').props.onClick();assert.equal(model.transactions[0].amount,200000);
  global.window={confirm:()=>false};tree=render();button(tree,'Excluir').props.onClick();assert.equal(model.transactions.length,1,'Cancelar exclusão mantém o registro');global.window.confirm=()=>true;button(tree,'Excluir').props.onClick();assert.equal(model.transactions.length,0);
 }finally{React.useState=originalState;global.requestAnimationFrame=oldRAF;delete global.window;}
 console.log('PASSOU: mês com ano automático, valores em centavos, consolidação anual e por período, sobra e déficit automáticos, proporções do Sankey, blocos interativos e tela de configuração.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
