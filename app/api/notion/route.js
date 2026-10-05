import { authorize, json, failure } from '../../../lib/server/auth';
import {sharedActivity} from '../../../lib/server/coordination';
import { readSnapshot } from '../../../lib/server/notion';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(request) {
  try { const user=authorize(request);const {state}=await readSnapshot(false,user);return json({...state,user,sharedActivity:await sharedActivity()}); }
  catch(error) { return failure(error); }
}
