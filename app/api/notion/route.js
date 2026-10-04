import { authorize, json, failure } from '../../../lib/server/auth';
import { readSnapshot } from '../../../lib/server/notion';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(request) {
  try { authorize(request); const { state } = await readSnapshot(); return json(state); }
  catch(error) { return failure(error); }
}
