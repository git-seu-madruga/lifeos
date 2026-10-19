import {createHash} from 'node:crypto';
import {AppError,legacyEmail} from './auth';
import {redis} from './coordination';
import {normalizeFood} from '../nutrition';

export function normalizeProducts(data){
 const products=data.product?[data.product]:data.products||[];
 return products.filter(p=>p.code&&(p.product_name_pt||p.product_name)).flatMap(p=>{
  const n=p.nutriments||{},parse=v=>v==null||v===''?null:Number(v);
  let kcal=parse(n['energy-kcal_100g']);
  if(kcal==null){const kj=parse(n['energy-kj_100g']??n.energy_100g);if(kj!=null)kcal=kj/4.184;}
  if(!Number.isFinite(kcal)||kcal<0||kcal>1000)return [];
  const unit=p.serving_quantity_unit==='ml'||/\bml\b|\d\s*l\b/i.test(p.quantity||'')?'ml':'g';
  const images=p.selected_images?.front?.small||p.selected_images?.front?.display||{};
  return [normalizeFood({id:'off:'+p.code,name:(p.product_name_pt||p.product_name)+(p.brands?' · '+p.brands:''),category:(p.categories||'').slice(0,200),source:'Open Food Facts',kcal100:Math.round(kcal*10000)/10000,unit,portionQuantity:p.serving_quantity_unit===unit?parse(p.serving_quantity):null,image:images.pt||images[p.lc]||images.en||Object.values(images)[0]||p.image_front_small_url||''})];
 }).slice(0,20);
}
export async function searchProducts(query){
 const q=String(query||'').trim();if(q.length<2||q.length>120)throw new AppError('Digite de 2 a 120 caracteres ou um código de barras.');
 const digest=createHash('sha256').update(q.toLowerCase()).digest('hex'),key='lifeos:foods:off:v1:'+digest;
 const cached=await redis(['GET',key]);if(cached){try{return JSON.parse(cached);}catch{ /* Re-fetch a malformed cache entry. */ }}
 const now=Date.now(),windowKey='lifeos:foods:off:rate:'+Math.floor(now/60000);
 const count=await redis(['EVAL',"local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],70) end;return n",1,windowKey]);
 if(count>8)throw new AppError('O limite de buscas de produtos foi atingido. Aguarde um minuto ou use a base brasileira e os favoritos.',429);
 const fields='code,product_name,product_name_pt,brands,categories,nutriments,quantity,serving_quantity,serving_quantity_unit,selected_images,image_front_small_url,lc';
 const barcode=/^\d{8,14}$/.test(q);
 const url=barcode?`https://world.openfoodfacts.org/api/v2/product/${q}.json?fields=${fields}`:'https://world.openfoodfacts.org/cgi/search.pl?'+new URLSearchParams({search_terms:q,search_simple:'1',action:'process',json:'1',page_size:'20',lc:'pt',fields,tagtype_0:'countries',tag_contains_0:'contains',tag_0:'brazil'});
 let response;try{response=await fetch(url,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(12000),headers:{Accept:'application/json','User-Agent':`LifeOS/1.0 (${legacyEmail()})`}});}catch{throw new AppError('A busca de produtos está indisponível. Use a base brasileira ou cadastre o alimento manualmente.',502);}
 if(!response.ok)throw new AppError(response.status===429?'A fonte limitou as buscas. Aguarde um minuto.':'Não foi possível buscar os produtos. Tente novamente ou cadastre manualmente.',response.status===429?429:502);
 let data;try{data=await response.json();}catch{throw new AppError('A fonte retornou dados inválidos.',502);}
 const results=normalizeProducts(data);await redis(['SET',key,JSON.stringify(results),'EX',21600]);return results;
}
