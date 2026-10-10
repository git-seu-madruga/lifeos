import { authorizeLive, checkOrigin, json, failure, AppError } from '../../../../lib/server/auth';
import {withWriteLock,sharedActivity,redis} from '../../../../lib/server/coordination';
import {withDatabaseRouting} from '../../../../lib/server/routing';
import {ROUTING_KEY} from '../../../../lib/server/maintenance';
import { synchronize } from '../../../../lib/server/sync';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request) {
  try {
    const user=await authorizeLive(request);checkOrigin(request);
    if (Number(request.headers.get('content-length') || 0) > 4 * 1024 * 1024) throw new AppError('Solicitação muito grande.',413);
    const { base, next,revision,partial } = await request.json();
    return json(await withWriteLock(async guard=>{const routing=JSON.parse(await redis(['GET',ROUTING_KEY])||'{}');if((revision||'')!==(routing.version||''))throw new AppError('Os bancos foram restaurados em outra instância. Seu texto foi preservado. Atualize os dados antes de continuar.',409);return {...await withDatabaseRouting(routing,()=>synchronize(base,next,user,guard,partial===true)),sharedActivity:await sharedActivity()};}));
  } catch(error) { return failure(error); }
}
