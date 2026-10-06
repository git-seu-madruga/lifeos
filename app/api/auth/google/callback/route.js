import {finishGoogle,clearFlow,googlePopupFlow} from '../../../../../lib/server/google';
import {googleCompletion} from '../../../../../lib/server/googleCompletion';
import {appOrigin,AppError} from '../../../../../lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){
 const headers=new Headers({'Cache-Control':'no-store'}),popup=googlePopupFlow(request);let error='';
 headers.append('Set-Cookie',clearFlow());
 try{const result=await finishGoogle(request);headers.append('Set-Cookie',result.cookie);}
 catch(cause){error=cause instanceof AppError?cause.message:'Não foi possível concluir o login Google. Tente novamente.';}
 if(popup){const page=googleCompletion(appOrigin(),error);for(const [key,value] of Object.entries(page.headers))headers.set(key,value);return new Response(page.body,{status:200,headers});}
 headers.set('Location',appOrigin()+(error?'/?loginError='+encodeURIComponent(error):'/'));
 return new Response(null,{status:303,headers});
}
