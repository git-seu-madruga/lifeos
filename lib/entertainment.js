export const MEDIA_STATUS={planned:'Quero começar',active:'Em andamento',done:'Concluído'};
export const MEDIA_TYPES={book:'Livro',film:'Filme',game:'Jogo',series:'Série',custom:'Outro'};
export const MEDIA_ICONS=['book','film','game','series','music','headphones','podcast','comic','star','heart','camera','ticket','puzzle','globe','palette','sparkles'];
export const MEDIA_COLORS=['#6ea8fe','#f26d82','#57d98b','#a78bfa','#e6b84b','#51cbd5','#f59e70','#e8eaef'];
export const DEFAULT_SECTIONS=[{name:'Leitura',type:'book',icon:'book',color:MEDIA_COLORS[0]},{name:'Filmes',type:'film',icon:'film',color:MEDIA_COLORS[1]},{name:'Jogos',type:'game',icon:'game',color:MEDIA_COLORS[2]},{name:'Séries',type:'series',icon:'series',color:MEDIA_COLORS[3]}];
export function mediaLabels(type){return {book:{want:'Quero ler',active:'Lendo',done:'Lido',action:'Marcar como lido'},film:{want:'Quero assistir',active:'Assistindo',done:'Assistido',action:'Marcar como assistido'},game:{want:'Quero jogar',active:'Jogando',done:'Jogado',action:'Marcar como jogado'},series:{want:'Quero assistir',active:'Assistindo',done:'Assistida',action:'Marcar como assistida'}}[type]||{want:'Quero começar',active:'Em andamento',done:'Concluído',action:'Marcar como concluído'};}
export function safeMediaUrl(value){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export function validMediaSection(item){return !!item.name?.trim()&&item.name.length<=100&&Object.hasOwn(MEDIA_TYPES,item.type)&&MEDIA_ICONS.includes(item.icon)&&MEDIA_COLORS.includes(item.color);}
export function validMedia(item){return (!item.completedOn||validCompletionDate(item.completedOn))&&(item.platforms==null||(typeof item.platforms==='string'&&item.platforms.length<=1000))&&(item.year==null||(Number.isInteger(item.year)&&item.year>=1000&&item.year<=3000))&&!!item.name?.trim()&&item.name.length<=300&&typeof item.author==='string'&&item.author.length<=300&&typeof item.comment==='string'&&item.comment.length<=10000&&Object.hasOwn(MEDIA_STATUS,item.status)&&Number.isInteger(item.rating)&&item.rating>=0&&item.rating<=5&&safeMediaUrl(item.coverUrl)&&safeMediaUrl(item.sourceUrl)&&typeof item.provider==='string'&&item.provider.length<=100&&(!item.attachments||item.attachments.length<=1);}
export function filterMedia(items,query,status){const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=normalize(query.trim());return items.filter(item=>(status==='all'||item.status===status)&&normalize(item.name+' '+item.author+' '+item.comment+' '+(item.platforms||'')+' '+(item.year||'')).includes(q));}

export function missingMainSections(sections){return DEFAULT_SECTIONS.filter(main=>!sections.some(section=>section.type===main.type));}
export function createMainSections(sections,makeId){
  const missing=missingMainSections(sections).map(section=>({...section}));
  const result=sections.map(section=>{
    if(!section.name?.trim()&&!section.type&&!section.icon&&!section.color&&missing.length){return {...section,...missing.shift()};}
    return section;
  });
  return [...result,...missing.map(section=>({...section,id:makeId()}))];
}
export function sectionValidationError(item){
 if(typeof item.name!=='string'||!item.name.trim()||item.name.length>100)return 'Informe um nome com até 100 caracteres.';
 if(!Object.hasOwn(MEDIA_TYPES,item.type))return 'Escolha o tipo de conteúdo no editor da seção.';
 if(!MEDIA_ICONS.includes(item.icon))return 'Escolha um ícone no editor da seção.';
 if(!MEDIA_COLORS.includes(item.color))return 'Escolha uma cor no editor da seção.';
 return '';
}

// Preserve record IDs and contents while consolidating into the four fixed sections.
export function fixedEntertainmentSections(sections,items,makeId){
 const used=new Set();
 const fixed=DEFAULT_SECTIONS.map(main=>{
  const existing=sections.find(p=>p.type===main.type&&!used.has(p.id))||sections.find(p=>!p.name?.trim()&&!p.type&&!used.has(p.id));
  if(existing)used.add(existing.id);
  return {...existing,...main,id:existing?.id||makeId()};
 });
 const byId=new Map(sections.map(p=>[p.id,p]));
 return {mediaSections:fixed,media:items.map(item=>{
  if(fixed.some(section=>section.id===item.section))return item;
  const target=fixed.find(section=>section.type===byId.get(item.section)?.type)||fixed[0];
  return {...item,section:target.id};
 })};
}

export function validCompletionDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));return y>=1000&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;}
export function completedMedia(items,period){return items.filter(item=>item.status==='done'&&validCompletionDate(item.completedOn)&&item.completedOn.startsWith(period)).sort((a,b)=>a.completedOn.localeCompare(b.completedOn));}

export function orderMediaGroup(items,status){return status==='done'?[...items].sort((a,b)=>(b.completedOn||'').localeCompare(a.completedOn||'')):[...items].sort((a,b)=>(a._createdAt||0)-(b._createdAt||0));}
