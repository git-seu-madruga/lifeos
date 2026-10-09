"use client";
import {RESPONSIBLES,sharingPatch,responsibleName} from '../lib/sharing';
export default function SharingFields({item,user,onChange,locked=false,project=false}){
 function change(shared){
  if(!shared&&item.shared){const owner=item._ownerEmail||user?.email;const name=responsibleName(owner)||owner;const message=project?`Descompartilhar este projeto? O projeto, seus marcos e todas as suas tarefas ficarão privados para ${name}. Os responsáveis das tarefas serão removidos. Continuar?`:`Descompartilhar esta tarefa? Ela ficará privada para ${name}, seu proprietário original. O responsável atual será removido. Continuar?`;if(!window.confirm(message))return;}
  onChange(project?{shared:!!shared}:sharingPatch(shared,item.responsible,user?.email));
 }
 return <div className="field-row sharing-fields"><div className="field"><label className={'sharing-check'+(item.shared?' sharing-highlight':'')}><input type="checkbox" checked={!!item.shared} disabled={locked} onChange={e=>change(e.target.checked)}/> Compartilhado</label>{locked&&<span className="muted small">Definido pelo projeto</span>}</div>{item.shared&&!project&&<div className="field"><span className="label">Responsável</span><select aria-label="Responsável" required value={item.responsible||''} onChange={e=>onChange({responsible:e.target.value})}><option value="" disabled>Selecione o responsável</option>{RESPONSIBLES.map(p=><option key={p.email} value={p.email}>{p.name}</option>)}</select></div>}</div>;
}
