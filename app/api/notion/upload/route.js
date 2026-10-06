import {ensureWritable} from '../../../../lib/server/maintenance';
import { authorize, seal, checkOrigin, json, failure } from '../../../../lib/server/auth';
import { uploadFile } from '../../../../lib/server/notion';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request) {
  try { const user=authorize(request);checkOrigin(request);await ensureWritable(); const form = await request.formData(); const result=await uploadFile(form.get('file'));return json({...result,uploadProof:seal({user:user.id,uploadId:result.uploadId,exp:Date.now()+7*86400000})}); }
  catch(error) { return failure(error); }
}
