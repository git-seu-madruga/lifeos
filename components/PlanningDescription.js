"use client";
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {planningDoc,planningTextField,planningDocumentPatch,planningManualAttachments,setPlanningDocument,setPlanningManualAttachments,validatePlanningDocument} from '../lib/planningDocument';
import {holdEditor} from '../lib/editingGuard';
import DiaryDocument from './DiaryDocument';
import LinkText from './LinkText';
import ProjectAttachments from './ProjectAttachments';
const IdeaEditor=dynamic(()=>import('./IdeaEditor'),{ssr:false,loading:()=> <p className="muted">Abrindo editor…</p>});
export default function PlanningDescription({item,kind,onChange,readOnly=false,onBusy}){
 const latest=useRef({item,onChange,readOnly});latest.current={item,onChange,readOnly};
 const [error,setError]=useState(''),[previews,setPreviews]=useState([]),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!readOnly)return holdEditor();},[readOnly]);
 useEffect(()=>()=>onBusy?.(false),[]);
 useEffect(()=>{const files=(item.attachments||[]).map(file=>({...file,...(file.file instanceof Blob?{previewUrl:URL.createObjectURL(file.file)}:{})}));setPreviews(files);return()=>files.forEach(file=>{if(file.previewUrl)URL.revokeObjectURL(file.previewUrl);});},[item.attachments]);
 function change(next){if(latest.current.readOnly)return;const error=validatePlanningDocument(next,kind);if(error){setError(error);return;}latest.current.item=next;setError('');latest.current.onChange(planningDocumentPatch(next,kind));}
 function uploading(value){setBusy(value);onBusy?.(value);}
 return <div className="planning-description">
  <div className="field"><span className="label">{kind==='tasks'?'Anotações':'Descrição'}</span>
   {readOnly?(item.doc?<DiaryDocument doc={item.doc} attachments={item.attachments} kind={kind}/>:<div className="planning-legacy"><LinkText text={item[planningTextField(kind)]||''}/></div>):<IdeaEditor label={kind==='tasks'?'Anotações da tarefa':'Descrição do projeto'} doc={planningDoc(item,kind)} attachments={previews} emojiPicker retainImageFiles imagePrefix="planning-inline-" onBusy={uploading} onError={setError}
    onImage={image=>change({...latest.current.item,attachments:[...(latest.current.item.attachments||[]),image]})}
    onChange={doc=>change(setPlanningDocument(latest.current.item,kind,doc))}/>}
   {error&&<p className="date-error" role="alert">{error}</p>}
   {busy&&<p className="muted small" role="status">Enviando imagem…</p>}
  </div>
  <ProjectAttachments items={planningManualAttachments(item)} entity={kind==='tasks'?'tarefa':'projeto'} readOnly={readOnly||busy} nameForFile={file=>file.name.startsWith('planning-inline-')?'arquivo-'+file.name:file.name} onChange={files=>change(setPlanningManualAttachments(latest.current.item,files))}/>
 </div>;
}
