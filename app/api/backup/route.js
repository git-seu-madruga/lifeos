import {authorize,checkOrigin,json,failure,AppError} from '../../../lib/server/auth';
import {backupStatus,startBackup,backupStep,cancelBackup} from '../../../lib/server/backup';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(request){try{return json(await backupStatus(authorize(request)));}catch(e){return failure(e);}}
export async function POST(request){try{const user=authorize(request);checkOrigin(request);const data=await request.json();if(data.action==='start')return json(await startBackup(user,'backup'));if(data.action==='restore'){if(data.confirm!=='RESTAURAR')throw new AppError('Confirme a restauração.');return json(await startBackup(user,'restore',data.backupId));}if(data.action==='step')return json(await backupStep(user,data.id));if(data.action==='cancel')return json(await cancelBackup(user,data.id));throw new AppError('Ação inválida.');}catch(e){return failure(e);}}
