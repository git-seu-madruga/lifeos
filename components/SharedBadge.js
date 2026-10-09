import {responsibleName} from '../lib/sharing';
export default function SharedBadge({responsible,project=false}){
 return <span className="chip shared-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 13a5 5 0 0 1 3 5v3"/></svg>{project?'Compartilhado':'Compartilhada'}{responsibleName(responsible)&&` · ${responsibleName(responsible)}`}</span>;
}
