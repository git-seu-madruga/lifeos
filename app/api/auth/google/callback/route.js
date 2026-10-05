import {finishGoogle,clearFlow} from '../../../../../lib/server/google';
import {appOrigin,AppError} from '../../../../../lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){const headers=new Headers({'Cache-Control':'no-store'});headers.append('Set-Cookie',clearFlow());try{const result=await finishGoogle(request);headers.append('Set-Cookie',result.cookie);headers.set('Location',appOrigin()+'/');}catch(error){const message=error instanceof AppError?error.message:'Não foi possível concluir o login Google. Tente novamente.';headers.set('Location',appOrigin()+'/?loginError='+encodeURIComponent(message));}return new Response(null,{status:303,headers});}
