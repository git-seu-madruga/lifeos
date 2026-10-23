const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const folder=path.resolve('.diary-test');
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir),{recursive:true});for(const name of fs.readdirSync(dir)){if(!name.endsWith('.js'))continue;const source=fs.readFileSync(path.join(dir,name),'utf8');fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(source,{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
try {
 const {calendarDays,dateKey,moveTab,normalizeTabOrder,appendInboxToDiary,hasDiaryText,updateDiaryEntry,searchDiaryEntries}=require(path.join(folder,'lib/diary'));
 const feb=calendarDays(2024,1);assert.equal(feb.length,42);assert.equal(feb.filter(day=>!day.outside).length,29);assert.equal(feb[0].date,'2024-01-28');assert.equal(new Set(feb.map(day=>day.date)).size,42);
 assert.equal(calendarDays(2025,1).filter(day=>!day.outside).length,28);assert.ok(calendarDays(2026,11).some(day=>day.date.startsWith('2027')));
 const order=['projetos','tarefas','diario','financas'];assert.deepEqual(moveTab(order,'diario','projetos'),['diario','projetos','tarefas','financas']);assert.deepEqual(moveTab(order,'projetos','financas'),['tarefas','diario','financas','projetos']);assert.deepEqual(normalizeTabOrder(['diario','diario','unknown'],order),['diario','projetos','tarefas','financas']);
 const {DiaryEntry,default:DiaryView}=require(path.join(folder,'components/DiaryView'));
 const entry={id:'d',date:'2026-10-04',text:'## Título\n**Negrito** e *itálico*\n- Um\n- Dois\n<script>alert(1)</script>',attachments:[]};
 const readonly=renderToStaticMarkup(React.createElement(DiaryEntry,{date:entry.date,entry,onChange(){},onClose(){}}));
 assert.match(readonly,/Editar entrada/);assert.doesNotMatch(readonly,/<textarea|type="file"|Excluir anexo/);assert.match(readonly,/<strong>Negrito<\/strong>/);assert.match(readonly,/<em>itálico<\/em>/);assert.match(readonly,/<ul><li>Um<\/li><li>Dois<\/li><\/ul>/);assert.doesNotMatch(readonly,/<script>/);assert.match(readonly,/&lt;script&gt;/);
 const reopened=renderToStaticMarkup(React.createElement(DiaryEntry,{date:entry.date,entry,initialEditing:true,onChange(){},onClose(){}}));assert.match(reopened,/<textarea/);assert.match(reopened,/Concluir edição/);
 const added=appendInboxToDiary([entry],{text:'Texto do Inbox\nOutra linha'},entry.date);assert.equal(added.entries.length,1);assert.equal(added.entry.text,entry.text+'\nTexto do Inbox\nOutra linha');assert.equal(added.entry.attachments,entry.attachments);assert.equal(entry.text.includes('Texto do Inbox'),false);
 const fresh=appendInboxToDiary([],{text:'Anotação completa'},'2026-10-05');assert.equal(fresh.entry.date,'2026-10-05');assert.equal(fresh.entry.text,'Anotação completa');assert.throws(()=>appendInboxToDiary([{...entry,text:'x'.repeat(10000)}],{text:'Mais'},entry.date),/continua no Inbox/);
 const empty=renderToStaticMarkup(React.createElement(DiaryEntry,{date:entry.date,onChange(){},onClose(){}}));assert.match(empty,/<textarea/);assert.match(empty,/type="file"/);assert.match(empty,/Concluir edição/);
 const erased={...entry,text:' '+String.fromCharCode(10)+' '};
 assert.equal(hasDiaryText(erased),false);assert.deepEqual(updateDiaryEntry([entry],erased),[]);
 const erasedHtml=renderToStaticMarkup(React.createElement(DiaryEntry,{date:entry.date,entry:erased,onChange(){},onClose(){}}));assert.match(erasedHtml,/<textarea/);assert.doesNotMatch(erasedHtml,/Editar entrada/);
 const withFile={...erased,attachments:[{id:'a',name:'ref.txt'}]};assert.equal(updateDiaryEntry([entry],withFile)[0].attachments.length,1);assert.equal(hasDiaryText(withFile),false);
 const calendar=renderToStaticMarkup(React.createElement(DiaryView,{entries:[],configured:true,setEntries(){}}));assert.match(calendar,/aria-current="date"/);assert.match(calendar,new RegExp(dateKey(new Date()).split('-').reverse().join('/')));assert.equal((calendar.match(/class="diary-day/g)||[]).length,42);
 const setup=renderToStaticMarkup(React.createElement(DiaryView,{entries:[],configured:false,setEntries(){}}));assert.match(setup,/NOTION_DIARY_DATABASE_ID/);

 const longEntry={id:'search-old',date:'2022-01-03',text:'Começo distante '+('palavra '.repeat(35))+'antes do passeio tomei um Café gostoso com calma depois voltei para casa '+('final '.repeat(35)),attachments:[]};
 const newer={id:'search-new',date:'2026-10-23',text:'No café encontrei amigos e conversamos.',attachments:[]};
 const noText={id:'attachments-only',date:'2026-10-22',text:'   ',attachments:[{id:'a',name:'cafe.pdf'}]};
 const original=JSON.stringify([entry,longEntry,newer,noText]);
 const found=searchDiaryEntries([entry,longEntry,newer,noText],'CAFE');assert.deepEqual(found.map(r=>r.entry.id),['search-new','search-old']);
 assert.equal(found[1].parts.filter(p=>p.match).map(p=>p.text).join(''),'Café');const excerpt=found[1].parts.map(p=>p.text).join('');assert.ok(excerpt.startsWith('…'));assert.ok(excerpt.endsWith('…'));assert.ok(excerpt.includes('antes do passeio'));assert.ok(excerpt.includes('gostoso com calma'));assert.ok(!excerpt.includes('Começo distante'));
 assert.equal(searchDiaryEntries([longEntry],'passeio cafe').length,1);assert.equal(searchDiaryEntries([longEntry],'passeio inexistente').length,0);assert.deepEqual(searchDiaryEntries([entry],'  '),[]);assert.equal(searchDiaryEntries([entry],'<script>').length,1,'Texto perigoso é tratado como texto');
 const firstLast={...entry,text:'Café com amigos no CAFÉ'};assert.equal(searchDiaryEntries([firstLast],'cafe')[0].parts.filter(p=>p.match).length,2);assert.equal(searchDiaryEntries([{...entry,text:'🍰 Café com uma xícara ☕'}],'cafe')[0].parts.find(p=>p.match).text,'Café');assert.equal(searchDiaryEntries([{...entry,text:'[teste] de conteúdo'}],'[teste]')[0].parts.find(p=>p.match).text,'[teste]','Consulta não vira expressão regular');assert.equal(JSON.stringify([entry,longEntry,newer,noText]),original);
 const originalRef=React.useRef;React.useRef=value=>({current:value});const originalEffect=React.useEffect;React.useEffect=()=>{};
 const originalState=React.useState,slots=[];let cursor=0;
 React.useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];};
 function walk(node,predicate){if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of React.Children.toArray(node.props?.children)){const found=walk(child,predicate);if(found)return found;}return null;}
 try {
   const render=()=>{cursor=0;return DiaryView({entries:[entry,longEntry,newer,noText],configured:true,setEntries(){}});};
   let tree=render();const input=walk(tree,node=>node.type?.name==='DateInput');assert.ok(input);assert.equal(input.props.className,'search');
   input.props.onChange({target:{value:'2026-10-04'}});tree=render();let opened=walk(tree,node=>node.type===DiaryEntry);assert.equal(opened.props.date,'2026-10-04');assert.equal(opened.props.entry,entry);
   opened.props.onClose();tree=render();assert.equal(walk(tree,node=>node.type===DiaryEntry),null);
   walk(tree,node=>node.type?.name==='DateInput').props.onChange({target:{value:'2027-02-15'}});tree=render();opened=walk(tree,node=>node.type===DiaryEntry);assert.equal(opened.props.date,'2027-02-15');assert.equal(opened.props.entry,undefined);assert.equal(slots[0],'2027-02-15');
   opened.props.onClose();tree=render();const previousView=slots[0];
   walk(tree,n=>n.props?.type==='search').props.onChange({target:{value:'CAFE'}});tree=render();assert.equal(walk(tree,n=>n.props?.className==='diary-calendar'),null,'Calendário sai durante a busca');assert.equal(walk(tree,n=>n.props?.className==='diary-controls'),null);assert.equal(walk(tree,n=>n.type?.name==='DateInput'),null);
   const result=walk(tree,n=>n.props?.className==='diary-search-card');assert.ok(result);assert.equal(walk(result,n=>n.type==='time').props.dateTime,newer.date);assert.ok(walk(result,n=>n.type==='mark'));result.props.onClick();tree=render();opened=walk(tree,n=>n.type===DiaryEntry);assert.equal(opened.props.entry,newer);assert.equal(opened.props.initialEditing,false,'Busca abre em leitura bloqueada');assert.equal(walk(tree,n=>n.props?.className==='diary-search-results'),null);
   opened.props.onClose();tree=render();assert.ok(walk(tree,n=>n.props?.className==='diary-search-results'));walk(tree,n=>n.props?.type==='search').props.onChange({target:{value:'nao-encontrado'}});tree=render();assert.ok(walk(tree,n=>n.props?.className==='diary-search-empty muted'));
   walk(tree,n=>n.props?.type==='search').props.onChange({target:{value:''}});tree=render();assert.ok(walk(tree,n=>n.props?.className==='diary-calendar'),'Limpar restaura calendário');assert.equal(slots[0],newer.date,'Abrir resultado acompanha sua data no calendário');
 } finally {React.useState=originalState;React.useEffect=originalEffect;React.useRef=originalRef;}
 console.log('PASSOU: calendário bissexto e mudança de ano, ordem das abas, leitura bloqueada, formatação segura, edição de entrada nova, anexos bloqueados e destaque de hoje.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
