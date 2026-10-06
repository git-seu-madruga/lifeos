import {AppError} from './auth';
export function normalizeFilmResults(data){
 return (Array.isArray(data?.results)?data.results:[]).filter(p=>Number.isInteger(p.id)&&p.id>0&&typeof (p.title||p.original_title)==='string'&&(p.title||p.original_title).trim()).slice(0,12).map(p=>({
  id:String(p.id),name:(p.title||p.original_title).slice(0,300),author:'',
  year:/^\d{4}-\d{2}-\d{2}$/.test(p.release_date||'')?Number(p.release_date.slice(0,4)):null,
  coverUrl:/^\/[a-zA-Z0-9_-]+\.(jpg|png)$/.test(p.poster_path||'')?'https://image.tmdb.org/t/p/w500'+p.poster_path:'',
  sourceUrl:`https://www.themoviedb.org/movie/${p.id}`,provider:'TMDB'
 }));
}
export async function searchFilms(query){
 const token=process.env.TMDB_READ_ACCESS_TOKEN?.trim();
 if(!token)throw new AppError('Configure TMDB_READ_ACCESS_TOKEN na Vercel para buscar filmes. O cadastro manual continua disponível.',503);
 const url=new URL('https://api.themoviedb.org/3/search/movie');
 url.search=new URLSearchParams({query,language:'pt-BR',include_adult:'false',page:'1'}).toString();
 let response;try{response=await fetch(url.href,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});}catch{throw new AppError('A busca de filmes está indisponível. Tente novamente ou cadastre manualmente.',502);}
 if(response.status===401||response.status===403)throw new AppError('O TMDB não autorizou a busca. Confira TMDB_READ_ACCESS_TOKEN na Vercel.',502);
 if(!response.ok)throw new AppError(response.status===429?'O TMDB limitou as buscas. Aguarde e tente novamente.':'Não foi possível consultar o TMDB. Tente novamente ou cadastre manualmente.',response.status===429?429:502);
 const data=await response.json().catch(()=>null);
 if(!Array.isArray(data?.results))throw new AppError('O TMDB retornou uma resposta inválida.',502);
 return normalizeFilmResults(data);
}
