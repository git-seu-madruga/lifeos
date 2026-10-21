import {illustrationById,habitIllustrationId} from '../lib/illustrations';
export default function HabitIcon({id,size=28}){
 const art=illustrationById(habitIllustrationId(id))||illustrationById('art-star');
 return <img className="habit-art" src={art.src} width={size} height={size} alt="" aria-hidden="true" loading="lazy" draggable={false}/>;
}
