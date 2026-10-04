import { authorize, checkOrigin, json, failure, AppError } from '../../../../lib/server/auth';
import { synchronize } from '../../../../lib/server/sync';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request) {
  try {
    authorize(request); checkOrigin(request);
    if (Number(request.headers.get('content-length') || 0) > 4 * 1024 * 1024) throw new AppError('Solicitação muito grande.',413);
    const { base, next } = await request.json();
    return json(await synchronize(base,next));
  } catch(error) { return failure(error); }
}
