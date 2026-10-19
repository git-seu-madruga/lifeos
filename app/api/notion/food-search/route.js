import {authorizeLive,json,failure} from '../../../../lib/server/auth';
import {searchProducts} from '../../../../lib/server/foodSearch';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){try{await authorizeLive(request);return json({results:await searchProducts(new URL(request.url).searchParams.get('q'))});}catch(error){return failure(error);}}
