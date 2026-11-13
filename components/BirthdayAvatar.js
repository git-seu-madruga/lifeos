"use client";
import {useEffect,useState} from 'react';
import HabitIcon from './HabitIcon';
import {birthdayPhotoUrl} from '../lib/birthdays';
export default function BirthdayAvatar({person,size=38,onPreview,expanded=false}){
 const file=person.attachments?.[0], [localUrl,setLocalUrl]=useState(''),[failed,setFailed]=useState('');
 useEffect(()=>{if(!file?.file){setLocalUrl('');return;}const url=URL.createObjectURL(file.file);setLocalUrl(url);return ()=>URL.revokeObjectURL(url);},[file?.file]);
 const src=file?.file?localUrl:birthdayPhotoUrl(file),initials=String(person.name||'').trim().split(/\s+/).slice(0,2).map(word=>Array.from(word)[0]||'').join('').toLocaleUpperCase('pt-BR');
 const artwork=src&&failed!==src?<img src={src} alt="" loading="lazy" onError={()=>setFailed(src)}/>:person.icon?<HabitIcon id={person.icon} size={Math.round(size*.72)}/>:<span>{initials||'＋'}</span>;
 if(onPreview&&(file||person.icon))return <button type="button" className="birthday-avatar birthday-avatar-trigger" style={{width:size,height:size}} aria-label={`Ampliar ${file?'foto':'emoji'} de ${person.name||'contato'}`} onClick={event=>{event.stopPropagation();onPreview();}}>{artwork}</button>;
 return <span className={'birthday-avatar'+(expanded?' birthday-portrait':'')} style={{width:size,height:size}} aria-hidden="true">{artwork}</span>;
}
