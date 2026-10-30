"use client";
import {useEffect,useRef,useState,createContext,useContext} from 'react';
import {useEditor,EditorContent,NodeViewWrapper,ReactNodeViewRenderer} from '@tiptap/react';
import {Node,mergeAttributes} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import FileHandler from '@tiptap/extension-file-handler';
import {api} from '../lib/api';
import {emptyIdeaDoc,safeIdeaUrl,ideaUid} from '../lib/someday';
import {prepareIdeaImage} from '../lib/ideaImages';

const AttachmentContext=createContext([]);
export const ideaFileUrl=file=>file?.pageId?'/api/notion/attachment?kind='+encodeURIComponent(file.kind||'someday')+'&id='+encodeURIComponent(file.pageId)+'&index='+file.index+'&name='+encodeURIComponent(file.name):file?.notion?.[file.notion.type]?.url||'';

export default function IdeaEditor({doc,attachments,onChange,onImage,onBusy,onError,label="Anotações da ideia",autoFocus=false}){
 const latest=useRef({attachments,onChange,onImage,onBusy,onError});latest.current={attachments,onChange,onImage,onBusy,onError};
 const editorRef=useRef(null),alive=useRef(true),input=useRef(null),jobs=useRef(0),[revision,setRevision]=useState(0);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const applyFiles=async(editor,files,pos)=>{
  if(!editor||editor.isDestroyed)return;
  jobs.current++;latest.current.onBusy?.(true);
  try{for(const original of files){
   const file=await prepareIdeaImage(original),form=new FormData();form.append('file',file,file.name);
   const uploaded=await api('/api/notion/upload',{method:'POST',body:form});
   if(!alive.current||editor.isDestroyed)return;
   latest.current.onImage({id:'a:'+ideaUid(),name:file.name,...uploaded});
   const node={type:'ideaImage',attrs:{attachmentId:file.name,alt:original.name==='image.png'?'Imagem colada':original.name.slice(0,300)}};
   // Do not reuse a paste position after awaiting the network: typing may have moved it.
   editor.chain().focus().insertContent([node,{type:'paragraph'}]).run();
  }}catch(error){if(alive.current)latest.current.onError(error.message);}
  finally{jobs.current--;if(alive.current)latest.current.onBusy?.(jobs.current>0);}
 };
 const preview=async(editor,value)=>{
  const url=safeIdeaUrl(value);if(!url)return false;
  const id=ideaUid();editor.chain().focus().insertContent([{type:'ideaBookmark',attrs:{id,url,title:new URL(url).hostname,description:'',image:''}},{type:'paragraph'}]).run();
  try{
   const data=await api('/api/notion/link-preview',{method:'POST',body:JSON.stringify({url})});
   if(!alive.current||editor.isDestroyed)return true;
   editor.state.doc.descendants((node,pos)=>{if(node.type.name==='ideaBookmark'&&node.attrs.id===id)editor.view.dispatch(editor.state.tr.setNodeMarkup(pos,undefined,{...node.attrs,...data,id}));});
  }catch(error){if(alive.current)latest.current.onError(error.message);}
  return true;
 };
 const editor=useEditor({
  immediatelyRender:false,
  autofocus:autoFocus?'end':false,
  extensions:[
   StarterKit.configure({heading:{levels:[2,3]},codeBlock:false,code:false,link:{openOnClick:true,protocols:['https'],defaultProtocol:'https',isAllowedUri:url=>!!safeIdeaUrl(url),HTMLAttributes:{target:'_blank',rel:'noopener noreferrer'}},trailingNode:false}),
   Node.create({name:'ideaImage',group:'block',atom:true,draggable:false,addAttributes(){return {attachmentId:{default:''},alt:{default:''}};},parseHTML(){return [{tag:'figure[data-idea-image]'}];},renderHTML({HTMLAttributes}){return ['figure',mergeAttributes(HTMLAttributes,{'data-idea-image':''})];},addNodeView(){return ReactNodeViewRenderer(({node,deleteNode})=>{
    const files=useContext(AttachmentContext),file=files.find(a=>a.name===node.attrs.attachmentId),url=ideaFileUrl(file);
    return <NodeViewWrapper className="sd-inline-image" contentEditable={false}>{url?<img src={url} alt={node.attrs.alt} loading="lazy"/>:<span>Imagem enviada · salvando referência no Notion…</span>}<button type="button" className="sd-node-remove" aria-label="Retirar imagem do texto" onClick={deleteNode}>×</button>{node.attrs.alt&&<small>{node.attrs.alt}</small>}</NodeViewWrapper>;
   });}}),
   Node.create({name:'ideaBookmark',group:'block',atom:true,draggable:false,addAttributes(){return Object.fromEntries(['id','url','title','description','image'].map(k=>[k,{default:''}]));},parseHTML(){return [{tag:'div[data-idea-bookmark]'}];},renderHTML({HTMLAttributes}){return ['div',mergeAttributes(HTMLAttributes,{'data-idea-bookmark':''})];},addNodeView(){return ReactNodeViewRenderer(({node,getPos})=>{
    const a=node.attrs;return <NodeViewWrapper className="sd-bookmark" contentEditable={false}>
     <a href={safeIdeaUrl(a.url)||undefined} target="_blank" rel="noopener noreferrer">{a.image&&<img src={'/api/notion/link-preview?image='+encodeURIComponent(a.image)} alt="" loading="lazy" onError={event=>{event.currentTarget.hidden=true;}}/>}<span><strong>{a.title||a.url}</strong>{a.description&&<small>{a.description}</small>}<em>{(()=>{try{return new URL(a.url).hostname;}catch{return '';}})()}</em></span></a>
     <button type="button" className="sd-node-remove" aria-label="Manter apenas o link" title="Manter apenas o link" onClick={()=>{const position=getPos(),active=editorRef.current;if(typeof position!=='number'||!active||active.isDestroyed)return;active.commands.insertContentAt({from:position,to:position+node.nodeSize},{type:'paragraph',content:[{type:'text',text:a.url,marks:[{type:'link',attrs:{href:a.url}}]}]});}}>↗</button>
    </NodeViewWrapper>;
   });}}),
   FileHandler.configure({allowedMimeTypes:['image/jpeg','image/png','image/webp','image/gif'],onPaste:(editor,files)=>applyFiles(editor,files),onDrop:(editor,files,pos)=>applyFiles(editor,files,pos)}),
  ],
  content:doc||emptyIdeaDoc(),
  editorProps:{attributes:{class:'sd-prose',role:'textbox','aria-label':label,'aria-multiline':'true'},handlePaste:(view,event)=>{
   if(event.clipboardData?.files.length)return false;
   const text=event.clipboardData?.getData('text/plain').trim();if(text&&safeIdeaUrl(text)){event.preventDefault();if(!editorRef.current)return false;preview(editorRef.current,text);return true;}return false;
  }},
  onUpdate:({editor})=>latest.current.onChange(editor.getJSON()),
  onSelectionUpdate:()=>setRevision(n=>n+1),
 });
 editorRef.current=editor;
 useEffect(()=>{if(editor&&!editor.isDestroyed&&JSON.stringify(editor.getJSON())!==JSON.stringify(doc||emptyIdeaDoc()))editor.commands.setContent(doc||emptyIdeaDoc(),{emitUpdate:false});},[doc,editor]);
 if(!editor)return <p className="muted">Abrindo editor…</p>;
 const tool=(label,action,active=false)=> <button type="button" key={label} title={label} aria-label={label} aria-pressed={active} onMouseDown={e=>e.preventDefault()} onClick={action}>{label}</button>;
 return <div className="sd-editor">
  <div className="sd-editor-tools" role="toolbar" aria-label="Formatação das anotações">
   {tool('Negrito',()=>editor.chain().focus().toggleBold().run(),editor.isActive('bold'))}{tool('Itálico',()=>editor.chain().focus().toggleItalic().run(),editor.isActive('italic'))}
   {tool('Lista',()=>editor.chain().focus().toggleBulletList().run(),editor.isActive('bulletList'))}{tool('Título',()=>editor.chain().focus().toggleHeading({level:2}).run(),editor.isActive('heading'))}
   {tool('Imagem',()=>input.current.click())}{tool('Link',()=>{const url=window.prompt('Cole um endereço HTTPS para adicionar a prévia:');if(url&&!safeIdeaUrl(url))latest.current.onError('Use um endereço HTTPS válido.');else if(url)preview(editor,url);})}
   <input hidden ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={e=>{applyFiles(editor,Array.from(e.target.files||[]));e.target.value='';}}/>
  </div>
  <AttachmentContext.Provider value={attachments}><EditorContent editor={editor}/></AttachmentContext.Provider>
  <small className="sd-editor-hint">Cole imagens ou links. Enter cria um parágrafo; Shift + Enter quebra a linha.</small>
 </div>;
}
