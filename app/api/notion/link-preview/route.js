import {authorizeLive,checkOrigin,json,failure,AppError} from '../../../../lib/server/auth';
import {previewLink,previewImage} from '../../../../lib/server/linkPreview';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=30;
export async function POST(request){try{const user=await authorizeLive(request);checkOrigin(request);const raw=await request.text();if(raw.length>3000)throw new AppError('Endereço muito extenso.',413);return json(await previewLink(JSON.parse(raw).url,user));}catch(error){return failure(error);}}
export async function GET(request){try{await authorizeLive(request);const result=await previewImage(new URL(request.url).searchParams.get('image'));return new Response(result.bytes,{headers:{'Content-Type':result.type,'Cache-Control':'private, max-age=86400','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});}catch(error){return failure(error);}}
