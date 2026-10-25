import {authorizeLive,json,failure,AppError} from '../../../../lib/server/auth';
import {ownedPage} from '../../../../lib/server/notion';
import {redis} from '../../../../lib/server/coordination';
import {withDatabaseRouting} from '../../../../lib/server/routing';
import {ROUTING_KEY} from '../../../../lib/server/maintenance';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{
 const user=await authorizeLive(request),id=new URL(request.url).searchParams.get('id');
 if(!/^[a-f\d-]{32,36}$/i.test(id||''))throw new AppError('Tarefa inválida.',422);
 const before=JSON.parse(await redis(['GET',ROUTING_KEY])||'{}');
 const {page,source}=await withDatabaseRouting(before,()=>ownedPage('tasks',id,user));
 const after=JSON.parse(await redis(['GET',ROUTING_KEY])||'{}');
 if((before.version||'')!==(after.version||''))throw new AppError('Os bancos foram restaurados. Use Atualizar.',409);
 return json({locked:!!page.properties[source.fields.locked.name]?.checkbox,_routingVersion:after.version||''});
}catch(e){return failure(e);}}
