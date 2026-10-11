import {authorizeLive,json,failure} from '../../../../lib/server/auth';
import {searchMedia} from '../../../../lib/server/mediaSearch';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){try{const user=await authorizeLive(request),params=new URL(request.url).searchParams;return json({results:await searchMedia(params.get('type'),params.get('q'),user)});}catch(error){return failure(error);}}
