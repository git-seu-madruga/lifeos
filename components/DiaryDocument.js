import React from 'react';
import {illustrationById} from '../lib/illustrations';
import {safeIdeaUrl} from '../lib/someday';
// Read-only rendering shares the editor's document format without editable nodes.
const fileUrl=(file,kind)=>file?.pageId?'/api/notion/attachment?kind='+encodeURIComponent(kind)+'&id='+encodeURIComponent(file.pageId)+'&index='+file.index+'&name='+encodeURIComponent(file.name):safeIdeaUrl(file?.notion?.[file.notion.type]?.url||'');
export default function DiaryDocument({doc,attachments=[],kind='diary'}){
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
  if(node.type==='ideaEmoji'){const art=illustrationById(node.attrs?.id);return art?<img className="sd-inline-emoji" key={key} src={art.src} alt={art.label} title={art.label} width="28" height="28" loading="lazy"/>:null;}
  if(node.type==='ideaImage'){
   const url=fileUrl(attachments.find(a=>a.name===node.attrs?.attachmentId),kind);
   return url?<figure className="sd-inline-image" key={key}><a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={node.attrs?.alt||(kind==='recados'?'Imagem do recado':kind==='diary'?'Imagem do Diário':'Imagem da descrição')} loading="lazy"/></a>{node.attrs?.alt&&<figcaption>{node.attrs.alt}</figcaption>}</figure>:null;
  }
  if(node.type==='ideaBookmark'){
   const a=node.attrs||{},url=safeIdeaUrl(a.url);if(!url)return null;
   return <div className="sd-bookmark" key={key}><a href={url} target="_blank" rel="noopener noreferrer">{safeIdeaUrl(a.image)&&<img src={'/api/notion/link-preview?image='+encodeURIComponent(a.image)} alt="" loading="lazy"/>}<span><strong>{a.title||url}</strong>{a.description&&<small>{a.description}</small>}<em>{new URL(url).hostname}</em></span></a></div>;
  }
  if(node.type==='table'){const columns=(node.content?.[0]?.content||[]).reduce((sum,cell)=>sum+(Number.isInteger(cell.attrs?.colspan)&&cell.attrs.colspan>0&&cell.attrs.colspan<=12?cell.attrs.colspan:1),0);return <div className="tableWrapper" key={key}><table className="lifeos-rich-table" style={{minWidth:Math.max(280,Math.min(columns,12)*80)}}><tbody>{children}</tbody></table></div>;}
  if(node.type==='tableRow')return <tr key={key}>{children}</tr>;
  if(node.type==='tableCell'||node.type==='tableHeader'){
   const a=node.attrs||{},colSpan=Number.isInteger(a.colspan)&&a.colspan>0&&a.colspan<=12?a.colspan:1,rowSpan=Number.isInteger(a.rowspan)&&a.rowspan>0&&a.rowspan<=50?a.rowspan:1;
   return React.createElement(node.type==='tableHeader'?'th':'td',{key,colSpan,rowSpan,...(['left','center','right'].includes(a.align)?{style:{textAlign:a.align}}:{})},...children);
  }
  const tag={paragraph:'p',heading:node.attrs?.level===3?'h3':'h2',bulletList:'ul',orderedList:'ol',listItem:'li',blockquote:'blockquote',hardBreak:'br',horizontalRule:'hr'}[node.type];
  if(node.type==='paragraph'&&!children.length)return <p key={key}><br/></p>;
  if(tag)return React.createElement(tag,{key,...(node.type==='orderedList'?{start:node.attrs?.start||1}:{})},...children);
  return <React.Fragment key={key}>{children}</React.Fragment>;
 }
 return <div className="sd-prose diary-document">{render(doc,'doc')}</div>;
}
