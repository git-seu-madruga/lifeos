import { authorize, failure, AppError } from '../../../../lib/server/auth';
import { ownedPage } from '../../../../lib/server/notion';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  try {
    authorize(request);
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind'), id = searchParams.get('id'), index = Number(searchParams.get('index'));
    if (!['projects','tasks'].includes(kind) || !/^[\da-f-]{32,36}$/i.test(id || '') || !Number.isInteger(index) || index < 0) throw new AppError('Anexo inválido.');
    const { page, source } = await ownedPage(kind,id);
    const list = page.properties[source.fields.attachments.name]?.files || [];
    const name = searchParams.get('name');
    const file = list[index]?.name === name ? list[index] : list.find(item => item.name === name);
    const url = file?.[file.type]?.url;
    if (!url || !/^https:\/\//.test(url)) throw new AppError('O arquivo não está mais disponível.',404);
    return new Response(null,{status:302,headers:{Location:url,'Cache-Control':'no-store'}});
  } catch(error) { return failure(error); }
}
