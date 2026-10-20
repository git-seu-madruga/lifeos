import {checkOrigin,json,failure,AppError} from '../../../../lib/server/auth';
import {captureInbox} from '../../../../lib/server/capture';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function POST(request){try{checkOrigin(request);const raw=await request.text();if(raw.length>65000)throw new AppError('Entrada muito grande.',413);return json(await captureInbox(request,JSON.parse(raw)));}catch(error){return failure(error);}}
