// Untouched entries exist only in the open editor, not in persisted snapshots.
export const withoutUntouchedEntries=items=>(items||[]).filter(item=>!item._untouchedDraft);
export function promoteDraftEdits(previous,next){
 const old=new Map((previous||[]).map(item=>[item.id,item]));
 return next.map(item=>{const before=old.get(item.id);if(before?._untouchedDraft&&item!==before&&(item._untouchedDraft===false||Object.keys(item).some(key=>!key.startsWith('_')&&JSON.stringify(item[key]??null)!==JSON.stringify(before[key]??null)))){const {_untouchedDraft,...saved}=item;return saved;}return item;});
}

export function withoutUntouchedState(state){return {...state,projects:withoutUntouchedEntries(state.projects),tasks:withoutUntouchedEntries(state.tasks)};}
