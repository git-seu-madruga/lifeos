"use client";
import {useEffect,useState} from 'react';
import ModalLayer from './ModalLayer';
import {inboxImageUrl} from '../lib/inboxImages';
function Image({item,onRemove}){
 const [local,setLocal]=useState(''),[expanded,setExpanded]=useState(false);
 useEffect(()=>{if(!item.file){setLocal('');return;}const url=URL.createObjectURL(item.file);setLocal(url);return()=>URL.revokeObjectURL(url);},[item.file]);
 const url=item.file?local:inboxImageUrl(item);
 return <div className="inbox-image"><button type="button" className="ghost inbox-image-thumb" aria-label="Ampliar imagem" onKeyDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setExpanded(true);}}>{url&&<img src={url} alt="Imagem colada no Inbox" />}</button>{onRemove&&<button type="button" className="ghost inbox-image-remove" aria-label="Remover imagem" onClick={onRemove}>×</button>}<ModalLayer open={expanded} onClose={()=>setExpanded(false)}>{expanded&&<div className="overlay" onClick={e=>{e.stopPropagation();setExpanded(false);}}><section className="panel inbox-image-full" role="dialog" aria-modal="true" aria-label="Imagem do Inbox" onClick={e=>e.stopPropagation()}><div className="panel-head"><button type="button" className="ghost" onClick={()=>setExpanded(false)}>Fechar</button></div><img src={url} alt="Imagem colada no Inbox ampliada" /></section></div>}</ModalLayer></div>;
}
export default function InboxImages({items=[],onChange}){return items.length>0&&<div className="inbox-images">{items.map(item=><Image key={item.id} item={item} onRemove={()=>onChange(items.filter(file=>file.id!==item.id))}/>)}</div>;}

export function InboxImageThumbnail({item}){return <Image item={item}/>;}
