import React from 'react';
import {safeIdeaUrl} from '../lib/someday';
// Read-only rendering shares the editor's document format without editable nodes.
const fileUrl=file=>file?.pageId?'/api/notion/attachment?kind=diary&id='+encodeURIComponent(file.pageId)+'&index='+file.index+'&name='+encodeURIComponent(file.name):safeIdeaUrl(file?.notion?.[file.notion.type]?.url||'');
export default function DiaryDocument({doc,attachments=[]}){
 function render(node,key){
  const children=(node.content||[]).map((child,i)=>render(child,i));
  if(node.type==='text'){
   let text=node.text;
   for(const mark of node.marks||[]){
    if(mark.type==='bold')text=<strong>{text}</strong>;
    else if(mark.type==='italic')text=<em>{text}</em>;
    else if(mark.type==='strike')text=<s>{text}</s>;
    else if(mark.type==='underline')text=<u>{text}</u>;
    else if(mark.type==='link'&&safeIdeaUrl(mark.attrs?.href))text=<a href={safeIdeaUrl(mark.attrs.href)} target="_blank" rel="noopener noreferrer">{text}</a>;
   }
   return <React.Fragment key={key}>{text}</React.Fragment>;
  }
  if(node.type==='ideaImage'){
   const url=fileUrl(attachments.find(a=>a.name===node.attrs?.attachmentId));
   return url?<figure className="sd-inline-image" key={key}><a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={node.attrs?.alt||'Imagem do Diário'} loading="lazy"/></a>{node.attrs?.alt&&<figcaption>{node.attrs.alt}</figcaption>}</figure>:null;
  }
  if(node.type==='ideaBookmark'){
   const a=node.attrs||{},url=safeIdeaUrl(a.url);if(!url)return null;
   return <div className="sd-bookmark" key={key}><a href={url} target="_blank" rel="noopener noreferrer">{safeIdeaUrl(a.image)&&<img src={'/api/notion/link-preview?image='+encodeURIComponent(a.image)} alt="" loading="lazy"/>}<span><strong>{a.title||url}</strong>{a.description&&<small>{a.description}</small>}<em>{new URL(url).hostname}</em></span></a></div>;
  }
  const tag={paragraph:'p',heading:node.attrs?.level===3?'h3':'h2',bulletList:'ul',orderedList:'ol',listItem:'li',blockquote:'blockquote',hardBreak:'br',horizontalRule:'hr'}[node.type];
  if(node.type==='paragraph'&&!children.length)return <p key={key}><br/></p>;
  if(tag)return React.createElement(tag,{key,...(node.type==='orderedList'?{start:node.attrs?.start||1}:{})},...children);
  return <React.Fragment key={key}>{children}</React.Fragment>;
 }
 return <div className="sd-prose diary-document">{render(doc,'doc')}</div>;
}
