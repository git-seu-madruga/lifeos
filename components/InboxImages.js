"use client";
import {useEffect,useState} from 'react';
import ModalLayer from './ModalLayer';
import {isInboxImage,inboxAttachmentLabel} from '../lib/inboxAttachments';
import {inboxImageUrl} from '../lib/inboxImages';
function Image({item,onRemove}){
 const [local,setLocal]=useState(''),[expanded,setExpanded]=useState(false),[original,setOriginal]=useState(false);
 useEffect(()=>{if(!item.file){setLocal('');return;}const url=URL.createObjectURL(item.file);setLocal(url);return()=>URL.revokeObjectURL(url);},[item.file]);
 const url=item.file?local:inboxImageUrl(item);
 if(!isInboxImage(item))return <div className="inbox-file"><a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}>📎 {inboxAttachmentLabel(item)}</a>{onRemove&&<button type="button" className="ghost" aria-label="Remover anexo" onClick={onRemove}>×</button>}</div>;
 return <div className="inbox-image"><button type="button" className="ghost inbox-image-thumb" aria-label="Ampliar imagem" onKeyDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setOriginal(false);setExpanded(true);}}>{url&&<img src={url} loading="lazy" decoding="async" alt={inboxAttachmentLabel(item)} />}</button>{onRemove&&<button type="button" className="ghost inbox-image-remove" aria-label="Remover imagem" onClick={onRemove}>×</button>}<ModalLayer open={expanded} onClose={()=>setExpanded(false)}>{expanded&&<div className="overlay" onClick={e=>{e.stopPropagation();setExpanded(false);}}><section className="panel inbox-image-full" role="dialog" aria-modal="true" aria-label="Imagem do Inbox" onClick={e=>e.stopPropagation()}><div className="panel-head inbox-image-tools"><button type="button" className="ghost" aria-pressed={!original} onClick={()=>setOriginal(false)}>Ajustar</button><button type="button" className="ghost" aria-label="Ver imagem no tamanho original (100%)" aria-pressed={original} onClick={()=>setOriginal(true)}>100%</button><a className="ghost" href={url} target="_blank" rel="noopener noreferrer">Abrir em outra aba</a><button type="button" className="ghost" onClick={()=>setExpanded(false)}>Fechar</button></div><div className={'inbox-image-viewport'+(original?' original':'')}><img src={url} alt="Imagem do Inbox ampliada" draggable={false} role="button" tabIndex={0} aria-label={original?'Ajustar imagem ao painel':'Ampliar imagem para tamanho original'} aria-pressed={original} onClick={()=>setOriginal(value=>!value)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setOriginal(value=>!value);}}}/></div></section></div>}</ModalLayer></div>;
}
export default function InboxImages({items=[],onChange}){return items.length>0&&<div className="inbox-images">{items.map(item=><Image key={item.id} item={item} onRemove={()=>onChange(items.filter(file=>file.id!==item.id))}/>)}</div>;}

export function InboxImageThumbnail({item}){return <Image item={item}/>;}
