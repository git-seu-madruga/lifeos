import { authorize, json, failure,AppError } from '../../../lib/server/auth';
import {sharedActivity,redis} from '../../../lib/server/coordination';
import {withDatabaseRouting} from '../../../lib/server/routing';
import {ROUTING_KEY} from '../../../lib/server/maintenance';
import { readSnapshot } from '../../../lib/server/notion';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(request) {
  try { const user=authorize(request);const before=JSON.parse(await redis(['GET',ROUTING_KEY])||'{}');const {state}=await withDatabaseRouting(before,()=>readSnapshot(false,user));const after=JSON.parse(await redis(['GET',ROUTING_KEY])||'{}');if((before.version||'')!==(after.version||''))throw new AppError('Uma restauração foi concluída durante a consulta. Atualize novamente.',409);return json({...state,_routingVersion:after.version||'',user,sharedActivity:await sharedActivity()}); }
  catch(error) { return failure(error); }
}
