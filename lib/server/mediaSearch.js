import {searchFilms} from './tmdb';
import {searchGames} from './igdb';
import {AppError,legacyEmail} from './auth';
const cache=new Map(),recent=new Map();
const text=(value,max=300)=>typeof value==='string'?value.slice(0,max):'';
function https(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}}
export function normalizeBookResults(data){return (data.docs||[]).slice(0,12).filter(p=>p.title).map(p=>{const edition=p.editions?.docs?.[0];const cover=edition?.cover_i||p.cover_i;return ({id:text(p.key),name:text(edition?.title||p.title),author:(p.author_name||[]).filter(v=>typeof v==='string').join(', ').slice(0,300),year:p.first_publish_year||null,coverUrl:Number.isInteger(cover)&&cover>0?`https://covers.openlibrary.org/b/id/${cover}-M.jpg`:'',sourceUrl:/^\/works\/OL\d+W$/.test(p.key||'')?'https://openlibrary.org'+p.key:'',provider:'Open Library'});});}
export function normalizeSeriesResults(data){return (Array.isArray(data)?data:[]).slice(0,12).filter(p=>p.show?.name).map(({show:p})=>({id:String(p.id),name:text(p.name),author:'',year:/^\d{4}-/.test(p.premiered||'')?Number(p.premiered.slice(0,4)):null,coverUrl:https(p.image?.medium||p.image?.original),sourceUrl:https(p.url),provider:'TVmaze'}));}
export async function searchMedia(type,query,user){
 if(!['book','series','game','film'].includes(type))throw new AppError('A busca está disponível para livros, séries, jogos e filmes.');
 const q=String(query||'').trim();if(q.length<2||q.length>150)throw new AppError('Digite de 2 a 150 caracteres para buscar.');
 const key=type+':'+q.toLowerCase(),cached=cache.get(key);if(cached&&cached.until>Date.now())return cached.results;
 const now=Date.now();if(now-(recent.get(user.id)||0)<1200)throw new AppError('Aguarde um instante antes de buscar novamente.',429);recent.set(user.id,now);
 if(recent.size>100)recent.delete(recent.keys().next().value);
 if(type==='game'||type==='film'){const results=await (type==='game'?searchGames(q):searchFilms(q));if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{until:Date.now()+600000,results});return results;}
 const url=type==='book'?`https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&lang=pt&limit=12&fields=key,title,author_name,cover_i,first_publish_year,editions,editions.key,editions.title,editions.cover_i,editions.language`:`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`;
 let response;try{response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json','User-Agent':`LifeOS/1.0 (${legacyEmail()})`}});}catch{throw new AppError('A busca está indisponível. Tente novamente ou cadastre manualmente.',502);}
 if(!response.ok)throw new AppError(response.status===429?'A fonte limitou as buscas. Aguarde e tente novamente.':'Não foi possível consultar a fonte. Cadastre manualmente ou tente depois.',response.status===429?429:502);
 let data;try{data=await response.json();}catch{throw new AppError('A fonte retornou uma resposta inválida.',502);}
 const results=type==='book'?normalizeBookResults(data):normalizeSeriesResults(data);
 if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{until:Date.now()+600000,results});return results;
}
