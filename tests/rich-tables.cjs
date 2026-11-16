const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {Editor}=require('@tiptap/core'),StarterKit=require('@tiptap/starter-kit').default,recipeTable=require('./recipe-table.cjs');
const folder=fs.mkdtempSync(path.join(process.cwd(),'.rich-tables-test-'));
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir));for(const name of fs.readdirSync(dir))if(name.endsWith('.js'))fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}
try{
 const sd=require(path.join(folder,'lib/someday')),table=require(path.join(folder,'lib/richTableEditor')),rules=require(path.join(folder,'lib/richTables'));
 const doc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Antes'}]},recipeTable(),{type:'paragraph',content:[{type:'text',text:'Modo de preparo'}]}]};
 assert.equal(sd.validateIdeaDoc(doc),'');assert.equal(sd.ideaText(doc),'Antes\nReceita de teste\nIngrediente | Quantidade\nFarinha | 500 g\nÁgua | 360 ml\nModo de preparo');
 for(const kind of ['diary','tasks','projects','recados']){
  const View=require(path.join(folder,'components/DiaryDocument')).default,html=renderToStaticMarkup(React.createElement(View,{doc,kind}));
  assert.match(html,/<table class="lifeos-rich-table" style="min-width:280px"><tbody>/);assert.match(html,/<th colSpan="2" rowSpan="1">/);assert.match(html,/<td colSpan="1" rowSpan="1"><p>500 g/);assert.doesNotMatch(html,/contenteditable|Excluir tabela/);
 }
 const variants=[
  d=>d.content[1].content[0].content[0].attrs.colspan=0,
  d=>d.content[1].content[0].content[0].attrs.rowspan=99,
  d=>d.content[1].content[0].content[0].attrs.colspan=1.5,
  d=>d.content[1].content[0].content[0].attrs.colspan='2',
  d=>d.content[1].content[1].content.pop(),
  d=>d.content[1].content[0].content[0].attrs.style='background:url(javascript:evil)',
  d=>d.content[1].content[0].content[0].attrs.colwidth=[20],
  d=>d.content[1].content[0].content[0].attrs.align='left; color:red',
  d=>d.content[1].content[0].content[0].content.push(recipeTable()),
  d=>d.content[1].content[0].content[0].content=[{type:'text',text:'Fora de parágrafo'}],
  d=>d.content[1].content[0].content[0].content[0].content[0].marks=[{type:'link',attrs:{href:'javascript:evil()'}}],
  d=>d.content.push({type:'tableCell',content:[{type:'paragraph'}]}),
 ];
 for(const mutate of variants){const bad=structuredClone(doc);mutate(bad);assert.ok(sd.validateIdeaDoc(bad),'Malformed table rejected');}
 let problems=[];
 const editor=new Editor({element:null,extensions:[StarterKit.configure({trailingNode:false}),table.richTableKit,table.richTableGuard(error=>problems.push(error))],content:doc});
 // Use real ProseMirror plugins/transactions in a headless editor (no production services).
 editor.editorState=editor.state.reconfigure({plugins:editor.extensionManager.plugins});
 const locate=(type,index=0)=>{const found=[];editor.state.doc.descendants((node,pos)=>{if(node.type.name===type)found.push(pos);});return found[index];};
 const selectCell=index=>editor.commands.setTextSelection(locate('tableCell',index)+2);
 selectCell(0);assert.deepEqual(table.tableDimensions(editor),{rows:4,columns:2});
 assert.equal(table.mergeTitleRow(editor,false),true);assert.equal(table.mergeTitleRow(editor),true);assert.equal(editor.getJSON().content[1].content[2].content[0].attrs.colspan,2);assert.ok(sd.ideaText(editor.getJSON()).includes('500 g'));
 assert.equal(editor.commands.splitCell(),true);assert.equal(sd.validateIdeaDoc(editor.getJSON()),'');
 assert.equal(editor.commands.addRowAfter(),true);assert.equal(editor.commands.addColumnAfter(),true);assert.equal(sd.validateIdeaDoc(editor.getJSON()),'');
 selectCell(0);assert.equal(editor.commands.deleteColumn(),true);selectCell(0);assert.equal(editor.commands.deleteRow(),true);assert.deepEqual(table.tableDimensions(editor),{rows:4,columns:2});
 assert.equal(table.paragraphAfterTable(editor),true);assert.equal(editor.state.selection.$from.parent.type.name,'paragraph');assert.equal(editor.state.doc.nodeAt(editor.state.selection.$from.before())?.type.name,'paragraph');assert.equal(editor.getJSON().content[2].type,'paragraph');
 editor.commands.setContent(doc);selectCell(0);
 const from=locate('tableCell',0),to=locate('tableCell',3);editor.commands.setCellSelection({anchorCell:from,headCell:to});assert.equal(editor.commands.mergeCells(),true);const merged=editor.getJSON();assert.equal(sd.validateIdeaDoc(merged),'','Vertical merges including rows covered entirely by rowspan');
 assert.equal(merged.content[1].content[2].content[0].attrs.rowspan,2);assert.equal(editor.commands.splitCell(),true);assert.equal(sd.validateIdeaDoc(editor.getJSON()),'');
 editor.commands.setContent({type:'doc',content:[{type:'paragraph'}]});editor.commands.insertTable({rows:50,cols:6,withHeaderRow:true});const limit=JSON.stringify(editor.getJSON());editor.commands.addRowAfter();assert.equal(JSON.stringify(editor.getJSON()),limit,'Keyboard/commands cannot silently exceed the row limit');assert.ok(problems.length);
 editor.commands.addColumnAfter();assert.equal(JSON.stringify(editor.getJSON()),limit,'Cell limit is enforced by the document transaction guard');
 assert.equal(table.validTableSize(50,6),true);assert.equal(table.validTableSize(50,7),false);assert.equal(table.validTableSize(1,13),false);assert.equal(table.validTableSize(0,3),false);
 editor.commands.deleteTable();assert.equal(editor.getJSON().content.some(n=>n.type==='table'),false);editor.destroy();
 const planning=require(path.join(folder,'lib/planningDocument')),diary=require(path.join(folder,'lib/diary')),reference=require(path.join(folder,'lib/reference')),diff=require(path.join(folder,'lib/notionDiff'));
 for(const kind of ['tasks','projects']){const item=planning.setPlanningDocument({id:'item',attachments:[]},kind,doc);assert.equal(planning.validatePlanningDocument(item,kind),'');assert.match(item[planning.planningTextField(kind)],/Farinha \| 500 g/);}
 assert.equal(diary.validateDiary({id:'day',date:'2026-11-16',doc,text:sd.ideaText(doc),attachments:[]}),'');
 const area=sd.makeArea('Receitas'),idea=sd.makeIdea(area);idea.name='Receita';idea.data.doc=doc;assert.equal(sd.validateSomeday(idea),'');
 const category=reference.makeReferenceCategory('Receitas'),material=reference.makeReferenceMaterial(category);material.name='Receita';material.data.doc=doc;assert.equal(reference.validateReference(material),'');
 const base={projects:[],tasks:[],diary:[],inbox:[],reference:[category,material]},next=structuredClone(base);next.reference[1].data.doc.content[1].content[2].content[1].content[0].content[0].marks=[{type:'bold'}];assert.equal(diff.diffState(base,next).reference.upserts.length,1,'Table formatting remains an incremental document update');
 console.log('PASSOU: comandos reais de tabelas/mesclagem/separação, limites, validação segura, renderização bloqueada, projeção pesquisável e compatibilidade com todas as áreas ricas.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
