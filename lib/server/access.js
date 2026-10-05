import {AppError,legacyEmail} from './auth';
export const PRIVATE_KINDS=['projects','milestones','tasks','inbox','diary','habits','habitLogs'];
export const SHARED_KINDS=['shopping','contacts','categories','transactions'];
export function canRead(kind,row,source,user){if(!user)return true;if(SHARED_KINDS.includes(kind))return true;if(!PRIVATE_KINDS.includes(kind))return false;const owner=(row.properties[source.owner.name]?.rich_text||[]).map(p=>p.plain_text??p.text?.content??'').join('');return owner===user.id||(!owner&&user.email===legacyEmail());}
export function ensureAccess(kind,row,source,user){if(!canRead(kind,row,source,user))throw new AppError('Este registro pertence a outro usuário.',403);}
