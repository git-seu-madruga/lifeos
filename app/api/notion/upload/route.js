import { authorize, checkOrigin, json, failure } from '../../../../lib/server/auth';
import { uploadFile } from '../../../../lib/server/notion';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request) {
  try { authorize(request); checkOrigin(request); const form = await request.formData(); return json(await uploadFile(form.get('file'))); }
  catch(error) { return failure(error); }
}
