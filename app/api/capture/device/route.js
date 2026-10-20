import {checkOrigin,authorizeLive,json,failure,AppError} from '../../../../lib/server/auth';
import {startCapture,captureStatus,captureDetails,approveCapture,listCaptureDevices,revokeCapture,disconnectCapture} from '../../../../lib/server/capture';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{checkOrigin(request);if(new URL(request.url).searchParams.get('action')==='devices')return json({devices:await listCaptureDevices(await authorizeLive(request))});return json(await captureStatus(request));}catch(error){return failure(error);}}
export async function POST(request){try{
 checkOrigin(request);const raw=await request.text();if(raw.length>3000)throw new AppError('Pedido muito grande.',413);const input=JSON.parse(raw);
 if(input.action==='start')return json(await startCapture(request,input));
 if(input.action==='disconnect')return json(await disconnectCapture(request));
 const user=await authorizeLive(request);
 if(input.action==='details')return json(await captureDetails(user,input.id,input.token));
 if(input.action==='approve'||input.action==='deny')return json(await approveCapture(user,input.id,input.token,input.action==='approve'));
 if(input.action==='revoke')return json(await revokeCapture(user,input.id));
 throw new AppError('Operação inválida.');
 }catch(error){return failure(error);}}
