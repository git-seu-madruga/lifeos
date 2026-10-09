"use client";
import {RESPONSIBLES,sharingPatch} from '../lib/sharing';
export default function SharingFields({item,user,onChange,locked=false}){
 return <div className="field-row sharing-fields"><div className="field"><label className="sharing-check"><input type="checkbox" checked={!!item.shared} disabled={locked} onChange={e=>onChange(sharingPatch(e.target.checked,item.responsible,user?.email))}/> Compartilhado</label>{locked&&<span className="muted small">Definido pelo projeto</span>}</div>{item.shared&&<div className="field"><span className="label">Responsável</span><select aria-label="Responsável" required value={item.responsible||''} onChange={e=>onChange({responsible:e.target.value})}><option value="" disabled>Selecione o responsável</option>{RESPONSIBLES.map(p=><option key={p.email} value={p.email}>{p.name}</option>)}</select></div>}</div>;
}
