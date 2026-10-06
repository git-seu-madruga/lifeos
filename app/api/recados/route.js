import {authorize,checkOrigin,json,failure,AppError} from '../../../lib/server/auth';
import {listRecados,sendRecado,markRecadoRead} from '../../../lib/server/recados';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(request){try{const user=authorize(request);return json(await listRecados(user,new URL(request.url).searchParams.get('month')));}catch(error){return failure(error);}}
export async function POST(request){try{const user=authorize(request);checkOrigin(request);const input=await request.json();if(input.action==='send')return json({item:await sendRecado(user,input)});if(input.action==='read')return json({item:await markRecadoRead(user,input.id)});throw new AppError('Operação inválida.');}catch(error){return failure(error);}}
