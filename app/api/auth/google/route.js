import {startGoogle} from '../../../../lib/server/google';
import {failure} from '../../../../lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){try{const result=startGoogle();return new Response(null,{status:302,headers:{Location:result.url,'Set-Cookie':result.cookie,'Cache-Control':'no-store'}});}catch(error){return failure(error);}}
