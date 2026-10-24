// Only binary clipboard images are accepted; HTML and remote image URLs stay plain text.
const EXTENSIONS={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
export function pastedInboxImages(event,existing=[]){
 const entries=Array.from(event.clipboardData?.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/'));
 if(!entries.length)return null;
 event.preventDefault();
 const files=entries.map(item=>item.getAsFile());
 if(files.some(file=>!file||!EXTENSIONS[file.type]))throw new Error('Cole uma imagem PNG, JPG, WebP ou GIF.');
 if(files.some(file=>file.size>4*1024*1024))throw new Error('O limite é 4 MB por imagem.');
 if(existing.length+files.length>100)throw new Error('O limite é 100 imagens por entrada.');
 return files.map(file=>{const id=crypto.randomUUID();return {id:'inbox-'+id,name:'inbox-'+id+'.'+EXTENSIONS[file.type],file};});
}
export function inboxImageUrl(item){return item.pageId?`/api/notion/attachment?kind=inbox&id=${item.pageId}&index=${item.index}&name=${encodeURIComponent(item.name)}`:item.url||'';}
