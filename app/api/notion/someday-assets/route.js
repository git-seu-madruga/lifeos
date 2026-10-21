import {authorizeLive,json,failure,AppError} from '../../../../lib/server/auth';
import {ownedPage,decode} from '../../../../lib/server/notion';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{
 const user=await authorizeLive(request),id=new URL(request.url).searchParams.get('id');
 if(!/^[\da-f-]{32,36}$/i.test(id||''))throw new AppError('Salve a ideia antes de transformá-la.',422);
 const {page,source}=await ownedPage('someday',id,user);
 return json({attachments:decode('someday',page,source).attachments});
}catch(error){return failure(error);}}
