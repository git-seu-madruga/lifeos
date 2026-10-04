import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
const COOKIE = 'lifeos_session';
const AGE = 7 * 24 * 60 * 60;
const attempts = new Map();
export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const digest = value => createHash('sha256').update(String(value)).digest();
export function configured() { return !!process.env.LIFEOS_PASSWORD && !!process.env.NOTION_TOKEN; }
function signature(value) { return createHmac('sha256', process.env.LIFEOS_PASSWORD || '').update(value).digest('base64url'); }
export function authenticated(request) {
  if (!process.env.LIFEOS_PASSWORD) return false;
  const cookie = (request.headers.get('cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!cookie) return false;
  const [expires, nonce, signed] = cookie.split('.');
  if (!/^[0-9]{13,16}$/.test(expires || '') || !/^[A-Za-z0-9_-]+$/.test(nonce || '') || !/^[A-Za-z0-9_-]{43}$/.test(signed || '') || Number(expires) < Date.now()) return false;
  const expected = signature(`${expires}.${nonce}`);
  return signed.length === expected.length && timingSafeEqual(Buffer.from(signed), Buffer.from(expected));
}
export function authorize(request) {
  if (!configured()) throw new AppError('Configure NOTION_TOKEN e LIFEOS_PASSWORD nas variáveis de ambiente da Vercel e faça uma nova implantação.', 503);
  if (!authenticated(request)) throw new AppError('Entre com sua senha para acessar o LifeOS.', 401);
}
export function checkOrigin(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new AppError('Origem da solicitação inválida.', 403);
}
export function login(request, password) {
  if (!configured()) throw new AppError('Configure NOTION_TOKEN e LIFEOS_PASSWORD na Vercel e faça uma nova implantação.', 503);
  checkOrigin(request);
  const key = digest((request.headers.get('x-forwarded-for') || 'local').split(',')[0]).toString('hex');
  const now = Date.now();
  for (const [id, attempt] of attempts) if (attempt.until < now) attempts.delete(id);
  const attempt = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
  if (attempt.count >= 5) throw new AppError('Muitas tentativas. Aguarde 15 minutos para tentar novamente.', 429);
  if (!timingSafeEqual(digest(password), digest(process.env.LIFEOS_PASSWORD))) {
    attempt.count++; attempts.set(key, attempt);
    throw new AppError('Senha incorreta.', 401);
  }
  attempts.delete(key);
  const value = `${now + AGE * 1000}.${randomBytes(24).toString('base64url')}`;
  return `${COOKIE}=${value}.${signature(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${AGE}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
export function logoutCookie() { return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`; }
export function json(value, status = 200, headers = {}) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', ...headers } }); }
export function failure(error) {
  return json({ error: error instanceof AppError ? error.message : 'Não foi possível concluir a operação. Tente novamente.' }, error.status || 500);
}
