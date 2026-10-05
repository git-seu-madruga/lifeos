import {authorize,checkOrigin,json,failure,seal,AppError} from '../../../../lib/server/auth';
import {downloadMediaCover} from '../../../../lib/server/mediaCover';
import {uploadFile} from '../../../../lib/server/notion';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request){try{const user=authorize(request);checkOrigin(request);if(Number(request.headers.get('content-length')||0)>4096)throw new AppError('Solicitação muito grande.',413);const {url,name}=await request.json();if(typeof url!=='string'||url.length>1500||typeof name!=='string'||name.length>300)throw new AppError('Dados da capa inválidos.');const file=await downloadMediaCover(url,name),result=await uploadFile(file);return json({...result,uploadProof:seal({user:user.id,uploadId:result.uploadId,exp:Date.now()+7*86400000})});}catch(error){return failure(error);}}
