import {ensureWritable} from '../../../../lib/server/maintenance';
import {authorizeLive,checkOrigin,json,failure,seal,AppError} from '../../../../lib/server/auth';
import {downloadMediaCover} from '../../../../lib/server/mediaCover';
import {uploadFile} from '../../../../lib/server/notion';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request){
 let stage='request';
 try{
  const user=await authorizeLive(request);checkOrigin(request);await ensureWritable();
  if(Number(request.headers.get('content-length')||0)>4096)throw new AppError('Solicitação muito grande.',413);
  const {url,name}=await request.json();
  if(typeof url!=='string'||url.length>1500||typeof name!=='string'||name.length>300)throw new AppError('Dados da capa inválidos.');
  stage='download';const file=await downloadMediaCover(url,name);
  stage='upload';const result=await uploadFile(file);
  stage='proof';return json({...result,uploadProof:seal({user:user.id,uploadId:result.uploadId,exp:Date.now()+7*86400000})});
 }catch(error){
  if(error instanceof AppError)return failure(error);
  console.error('LifeOS media-cover failure',{stage,type:error?.name||'Error'});
  return failure(new AppError(stage==='download'?'Não foi possível preparar a capa importada. Tente novamente ou envie a imagem manualmente.':stage==='upload'?'Não foi possível enviar a capa ao Notion. Tente novamente.':stage==='proof'?'Não foi possível autorizar o salvamento da capa. Tente novamente.':'Solicitação de capa inválida.',stage==='request'?400:502));
 }
}
