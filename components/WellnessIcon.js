import HabitIcon from './HabitIcon';
// Domain keys stay stable; only their illustration changes.
const WELLNESS_ART={humor:'art-smiling-face-with-smiling-eyes',mente:'art-brain',intestino:'art-pile-of-poo',body:'art-balance-scale',pressure:'art-anatomical-heart',energy:'art-high-voltage',stress:'art-face-exhaling',dores:'art-adhesive-bandage'};
export default function WellnessIcon({id,size=28}){
 return <HabitIcon id={WELLNESS_ART[id]||id} size={size}/>;
}
