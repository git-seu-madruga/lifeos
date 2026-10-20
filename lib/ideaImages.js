// Resize clipboard/camera images before upload. Never stores base64 in the document.
export async function prepareIdeaImage(file){
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('Use uma imagem JPG, PNG, WebP ou GIF.');
 if(file.size>20*1024*1024)throw new Error('A imagem original deve ter até 20 MB.');
 const uid=crypto.randomUUID();
 if(file.type==='image/gif'){if(file.size>4*1024*1024)throw new Error('Use um GIF de até 4 MB.');return new File([file],uid+'.gif',{type:file.type});}
 const url=URL.createObjectURL(file);
 try{
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Não foi possível abrir a imagem.'));img.src=url;});
  const scale=Math.min(1,1600/image.naturalWidth,1600/image.naturalHeight),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.83));
  if(!blob||blob.size>4*1024*1024)throw new Error('A imagem ficou maior que 4 MB. Escolha uma versão menor.');
  return new File([blob],uid+'.'+(blob.type==='image/png'?'png':'webp'),{type:blob.type});
 }finally{URL.revokeObjectURL(url);}
}
