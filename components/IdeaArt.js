import {IDEA_ICONS} from '../lib/someday';
export const IDEA_ICON_LABELS={seedling:'Broto',bulb:'Ideia',dice:'Jogos',travel:'Viagem',home:'Casa',books:'Livros',palette:'Criação',camera:'Fotografia',mountain:'Natureza',sparkles:'Inspiração'};
export default function IdeaArt({icon='seedling',size=54}){return <img src={'/emoji/fluent-ideas/'+(IDEA_ICONS.includes(icon)?icon:'seedling')+'.png'} width={size} height={size} alt="" loading="lazy" draggable={false}/>;}
