"use client";
export function textLinks(value){
 const text=String(value||''),parts=[];let cursor=0;
 for(const match of text.matchAll(/(?:https?:\/\/|www\.)[^\s<>"']+/gi)){
  if(match.index>0&&/[\w@]/.test(text[match.index-1]))continue;
  let label=match[0].replace(/[.,;:!?]+$/,'');
  for(const [open,close]of [['(',')'],['[',']'],['{','}']])while(label.endsWith(close)&&label.split(close).length>label.split(open).length)label=label.slice(0,-1);
  let url;try{url=new URL(/^www\./i.test(label)?'https://'+label:label);}catch{continue;}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.'))continue;
  if(match.index>cursor)parts.push({text:text.slice(cursor,match.index)});
  parts.push({text:label,href:url.href});cursor=match.index+label.length;
 }
 if(cursor<text.length)parts.push({text:text.slice(cursor)});return parts;
}
export default function LinkText({text}){return textLinks(text).map((part,index)=>part.href?<a key={index} className="auto-link" href={part.href} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}>{part.text}</a>:part.text);}
export function TextLinks({text}){const links=textLinks(text).filter(p=>p.href);return links.length?<div className="text-links" aria-label="Links do texto">{links.map((part,index)=><LinkText key={index} text={part.text}/>)}</div>:null;}
