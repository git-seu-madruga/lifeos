// Local form drafts may not yet be present in the shared autosave state.
let openEditors=0;
export const hasOpenEditor=()=>openEditors>0;
export function holdEditor(){
 openEditors++;let released=false;
 return ()=>{if(released)return;released=true;openEditors--;if(!openEditors&&typeof window!=='undefined')window.dispatchEvent?.(new Event('lifeos-editors-closed'));};
}
