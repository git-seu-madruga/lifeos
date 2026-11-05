const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc'),React=require('react');
const folder=path.resolve('.inbox-test');const files=['lib/wellness.js','lib/habits.js','lib/illustrations.js','components/Inbox.js','components/InboxImages.js','lib/inboxImages.js','lib/inboxAttachments.js','components/AutoTextarea.js','components/ModalLayer.js','lib/backdropGesture.js','components/LinkText.js','lib/useBackNavigation.js','lib/editingGuard.js','lib/backNavigation.js','lib/inboxInput.js','lib/nav.js'];
for(const file of files){const dest=path.join(folder,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,swc.transformSync(fs.readFileSync(file,'utf8'),{jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}
const saved={useState:React.useState,useRef:React.useRef,useEffect:React.useEffect},oldWindow=global.window;const slots=[];let index=0,mobile=true,added=[];
React.useState=initial=>{const i=index++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>slots[i]=typeof value==='function'?value(slots[i]):value];};React.useRef=value=>({current:value});React.useEffect=()=>{};global.window={matchMedia:()=>({matches:mobile})};
function walk(node,check){if(!node||typeof node!=='object')return null;if(check(node))return node;for(const child of React.Children.toArray(node.props?.children)){const match=walk(child,check);if(match)return match;}return null;}
try{
 const Inbox=require(path.join(folder,'components/Inbox')).default;function render(){index=0;return Inbox({items:[],tabId:'compras',onAdd:text=>added.push(text)});}const input=tree=>walk(tree,node=>node.type?.name==='AutoTextarea');
 let tree=render();input(tree).props.onChange({target:{value:'Mercado\nArroz\nCafé'}});tree=render();let prevented=false;input(tree).props.onKeyDown({key:'Enter',nativeEvent:{isComposing:false},preventDefault:()=>prevented=true});assert.equal(prevented,false);assert.equal(added.length,0);assert.equal(input(tree).props.enterKeyHint,'enter');
 walk(tree,node=>node.type==='button'&&node.props.children==='Adicionar').props.onClick();assert.deepEqual(added,['Mercado\nArroz\nCafé']);tree=render();assert.equal(input(tree).props.value,'');assert.equal(walk(tree,node=>node.type==='button'&&node.props.children==='Adicionar').props.disabled,true);
 input(tree).props.onChange({target:{value:'Rascunho\ncontinuação'}});tree=render();walk(tree,node=>node.type==='button'&&node.props['aria-expanded']===false).props.onClick();tree=render();walk(tree,node=>node.type==='button'&&node.props['aria-expanded']===true).props.onClick();tree=render();assert.equal(input(tree).props.value,'Rascunho\ncontinuação');
 mobile=false;input(tree).props.onKeyDown({key:'Enter',shiftKey:true,nativeEvent:{isComposing:false},preventDefault:()=>{throw Error('Shift+Enter deve inserir linha');}});assert.equal(added.length,1);input(tree).props.onKeyDown({key:'Enter',nativeEvent:{isComposing:false},preventDefault:()=>prevented=true});assert.equal(added.length,2);assert.equal(added[1],'Rascunho\ncontinuação');
 // Regression: opening an Inbox item must work even for tabs without a conversion target.
 const {NAV}=require(path.join(folder,'lib/nav'));let converted=[];const entry={id:'entry',text:'Minha ideia\nConteúdo com detalhes'};
 for(const tab of [...NAV.map(t=>t.id),'aba-sem-destino']){
  slots.length=0;
  const show=()=>{index=0;return Inbox({items:[entry],tabId:tab,onConvert:(item,kind)=>{converted.push(kind);return true;},onUpdate(){},onDelete(){},onAdd(){}});};
  let view=show();walk(view,n=>n.props?.className==='inbox-item').props.onClick();assert.doesNotThrow(()=>{view=show();},'Abrir Inbox em '+tab);
  const convert=walk(view,n=>n.type==='button'&&n.props.className==='primary'&&Array.isArray(n.props.children)&&n.props.children[0]==='Transformar em ');
  if(tab==='algumdia'){assert.ok(convert);convert.props.onClick();assert.equal(converted.at(-1),'someday');}
  if(tab==='aba-sem-destino')assert.equal(convert,null);
 }

 // Pressure conversion is available only for the exact format and never closes an invalid entry.
 for(const [text,attachments,valid] of [['130 68 55',[],true],['130/68 55',[],false],['130 68 55\n',[],false],['130 68 55',[{name:'photo.png'}],false]]){
  slots.length=0;let count=0;const current={id:'pressure-ui',text,attachments};
  const show=()=>{index=0;return Inbox({items:[current],tabId:'bemestar',onConvert:(item,kind)=>{assert.equal(kind,'pressure');count++;return true;}});};
  let view=show();walk(view,n=>n.props.className==='inbox-item').props.onClick();view=show();const button=walk(view,n=>n.type==='button'&&Array.isArray(n.props.children)&&n.props.children[0]==='Transformar em ');assert.equal(button.props.disabled,!valid);button.props.onClick();assert.equal(count,valid?1:0);view=show();assert.equal(!!walk(view,n=>n.props.role==='dialog'),!valid);
 }
 const {pastedInboxImages,inboxImageUrl}=require(path.join(folder,'lib/inboxImages'));
 const png=new File(['image bytes'],'clipboard.png',{type:'image/png'});
 const paste=file=>({clipboardData:{items:[{kind:'file',type:file.type,getAsFile:()=>file}]},preventDefault(){this.prevented=true;}});
 assert.equal(pastedInboxImages({clipboardData:{items:[{kind:'string',type:'text/html'}]},preventDefault(){throw Error('Texto deve manter paste nativo');}}),null);
 let event=paste(png);const files=pastedInboxImages(event);assert.ok(event.prevented);assert.equal(files[0].file,png);assert.match(files[0].name,/^inbox-.*\.png$/);assert.notEqual(pastedInboxImages(paste(png))[0].name,files[0].name);
 assert.throws(()=>pastedInboxImages(paste(new File(['x'],'evil.svg',{type:'image/svg+xml'}))),/PNG/);
 assert.throws(()=>pastedInboxImages(paste(new File([new Uint8Array(4*1024*1024+1)],'big.png',{type:'image/png'}))),/4 MB/);
 assert.throws(()=>pastedInboxImages(paste(png),Array(100).fill(files[0])),/100 imagens/);
 assert.match(inboxImageUrl({pageId:'page',index:3,name:'inbox-a.png',url:'https://expired.test'}),/^\/api\/notion\/attachment\?kind=inbox/);
 slots.length=0;let addedFiles;const composer=()=>{index=0;return Inbox({items:[],tabId:'tarefas',onAdd:(text,attachments)=>addedFiles={text,attachments}});};
 tree=composer();input(tree).props.onPaste(paste(png));tree=composer();assert.equal(walk(tree,n=>n.type==='button'&&n.props.children==='Adicionar').props.disabled,false);walk(tree,n=>n.type==='button'&&n.props.children==='Adicionar').props.onClick();assert.equal(addedFiles.text,'');assert.equal(addedFiles.attachments[0].file,png);
 for(const tab of NAV.map(t=>t.id)){
  slots.length=0;let count=0;let current={...entry,attachments:files};
  const show=()=>{index=0;return Inbox({items:[current],tabId:tab,onConvert(){count++;},onUpdate(id,text,attachments){current={...current,text,attachments};}});};
  let view=show();walk(view,n=>n.props?.className==='inbox-item').props.onClick();view=show();
  const button=walk(view,n=>n.type==='button'&&Array.isArray(n.props.children)&&n.props.children[0]==='Transformar em ');
  if(button){assert.equal(button.props.disabled,!['diario','tarefas','projetos','algumdia'].includes(tab));button.props.onClick();assert.equal(count,['diario','tarefas','projetos','algumdia'].includes(tab)?1:0);}
  const images=walk(view,n=>n.type?.name==='InboxImages'&&n.props.items===current.attachments);images.props.onChange([]);view=show();
  const unlocked=walk(view,n=>n.type==='button'&&Array.isArray(n.props.children)&&n.props.children[0]==='Transformar em ');if(unlocked&&unlocked.props.title===undefined)assert.equal(unlocked.props.disabled,tab==='bemestar'||!require(path.join(folder,'lib/nav')).INBOX_TARGETS[tab]?.kind);
 }
 // A discrete picker accepts mixed files, preserves text and clears invalid selection.
 const attachmentsApi=require(path.join(folder,'lib/inboxAttachments'));
 const pdf=new File(['%PDF-test'],'documento.pdf',{type:'application/pdf'});
 assert.equal(attachmentsApi.inboxAttachmentLabel(attachmentsApi.selectedInboxAttachments([pdf])[0]),'documento.pdf');
 assert.throws(()=>attachmentsApi.selectedInboxAttachments([new File([new Uint8Array(4*1024*1024+1)],'big.pdf')]),/4 MB/);
 assert.throws(()=>attachmentsApi.selectedInboxAttachments([pdf],Array(100).fill(files[0])),/100 anexos/);
 assert.notEqual(attachmentsApi.selectedInboxAttachments([pdf])[0].name,attachmentsApi.selectedInboxAttachments([pdf])[0].name);
 slots.length=0;let savedEntry;
 const fileComposer=()=>{index=0;return Inbox({items:[],tabId:'tarefas',onAdd:(text,attachments)=>savedEntry={text,attachments}});};
 let composerTree=fileComposer();input(composerTree).props.onChange({target:{value:'Manter texto'}});composerTree=fileComposer();
 const pick=walk(composerTree,n=>n.type==='input'&&n.props.type==='file');assert.ok(pick.props.multiple);
 const selection={files:[pdf,png],value:'file'};pick.props.onChange({target:selection});assert.equal(selection.value,'');
 composerTree=fileComposer();assert.equal(input(composerTree).props.value,'Manter texto');
 walk(composerTree,n=>n.type==='button'&&n.props.children==='Adicionar').props.onClick();assert.equal(savedEntry.attachments.length,2);assert.equal(savedEntry.attachments[0].file,pdf);assert.equal(savedEntry.text,'Manter texto');
 // Files open in a new tab without forcing download, never as broken images.
 slots.length=0;index=0;const FilePreview=require(path.join(folder,'components/InboxImages')).InboxImageThumbnail({item:savedEntry.attachments[0]});
 const filePreview=FilePreview.type(FilePreview.props);const fileLink=walk(filePreview,n=>n.type==='a');assert.equal(fileLink.props.target,'_blank');assert.equal(fileLink.props.download,undefined);assert.ok(fileLink.props.rel.includes('noopener'));let linkStopped=false;fileLink.props.onClick({stopPropagation(){linkStopped=true;}});assert.equal(linkStopped,true);assert.equal(walk(filePreview,n=>n.type==='img'),null);
 // The list thumbnail opens the full image on the first click without opening the entry.
 slots.length=0;index=0;const Preview=require(path.join(folder,'components/InboxImages')).InboxImageThumbnail({item:files[0]});
 index=0;let preview=Preview.type(Preview.props);let stopped=false;walk(preview,n=>n.props?.['aria-label']==='Ampliar imagem').props.onClick({stopPropagation(){stopped=true;}});index=0;preview=Preview.type(Preview.props);assert.ok(stopped);assert.ok(walk(preview,n=>n.props?.role==='dialog'&&n.props['aria-label']==='Imagem do Inbox'));
 // Opening a thumbnail starts fitted; original size and fitting are explicit and keyboard accessible.
 const imageRender=()=>{index=0;return Preview.type(Preview.props);};
 assert.ok(walk(preview,n=>n.props?.className==='inbox-image-viewport'));
 walk(preview,n=>n.props?.['aria-label']==='Ver imagem no tamanho original (100%)').props.onClick();preview=imageRender();
 assert.ok(walk(preview,n=>n.props?.className==='inbox-image-viewport original'));
 assert.equal(walk(preview,n=>n.props?.['aria-label']==='Ver imagem no tamanho original (100%)').props['aria-pressed'],true);
 const newTab=walk(preview,n=>n.type==='a'&&n.props.children==='Abrir em outra aba');assert.equal(newTab.props.target,'_blank');assert.equal(newTab.props.download,undefined);
 walk(preview,n=>n.type==='button'&&n.props.children==='Ajustar').props.onClick();preview=imageRender();assert.ok(walk(preview,n=>n.props?.className==='inbox-image-viewport'));
 const zoomImage=walk(preview,n=>n.type==='img'&&n.props.role==='button');let zoomKeyPrevented=false;zoomImage.props.onKeyDown({key:'Enter',preventDefault(){zoomKeyPrevented=true;}});preview=imageRender();assert.equal(zoomKeyPrevented,true);assert.ok(walk(preview,n=>n.props?.className==='inbox-image-viewport original'));
 walk(preview,n=>n.type==='button'&&n.props.children==='Fechar').props.onClick();preview=imageRender();walk(preview,n=>n.props?.['aria-label']==='Ampliar imagem').props.onClick({stopPropagation(){}});preview=imageRender();assert.ok(walk(preview,n=>n.props?.className==='inbox-image-viewport'),'Reopening starts fitted again');
 console.log('PASSOU: Inbox mobile aceita quebras de linha e botão Adicionar; desktop mantém atalhos; recolher preserva o texto.');
}finally{Object.assign(React,saved);if(oldWindow===undefined)delete global.window;else global.window=oldWindow;fs.rmSync(folder,{recursive:true,force:true});}
