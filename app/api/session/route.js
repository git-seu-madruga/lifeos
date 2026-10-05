import {readSession,configured,logoutCookie,checkOrigin,json,failure,AppError} from '../../../lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){const user=readSession(request);return json({authenticated:!!user,configured:configured(),user});}
export async function POST(){return failure(new AppError('O acesso por senha foi substituído pelo login Google.',405));}
export async function DELETE(request){try{checkOrigin(request);return json({authenticated:false},200,{'Set-Cookie':logoutCookie()});}catch(error){return failure(error);}}
