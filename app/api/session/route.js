import { authenticated, configured, login, logoutCookie, checkOrigin, json, failure } from '../../../lib/server/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request) { return json({ authenticated: authenticated(request), configured: configured() }); }
export async function POST(request) {
  try { const { password } = await request.json(); return json({ authenticated: true }, 200, { 'Set-Cookie': login(request, password) }); }
  catch (error) { return failure(error); }
}
export async function DELETE(request) {
  try { checkOrigin(request); return json({ authenticated: false }, 200, { 'Set-Cookie': logoutCookie() }); }
  catch (error) { return failure(error); }
}
