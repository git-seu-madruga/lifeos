import {readSession,liveSession,configured,logoutCookie,checkOrigin,json,failure,AppError} from '../../../lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{const user=await liveSession(request,false);return json({authenticated:!!user,configured:configured(),user});}catch(error){return failure(error);}}
export async function POST(){return failure(new AppError('O acesso por senha foi substituído pelo login Google.',405));}
export async function DELETE(request){try{checkOrigin(request);const user=readSession(request);if(user?.temporary){const {revokeQrSession}=await import('../../../lib/server/qrAuth');await revokeQrSession(user,user.sessionId);}return json({authenticated:false},200,{'Set-Cookie':logoutCookie()});}catch(error){return failure(error);}}
