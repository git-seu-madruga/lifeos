import HabitIcon from './HabitIcon';
export default function WellnessIcon({id,size=28}){
 const paths={humor:<><circle cx="12" cy="12" r="9"/><path d="M8 14c1 4 7 4 8 0M8 9h.01M16 9h.01"/></>,mente:<><path d="M12 5c-4-5-9 0-7 4-5 3-3 8 1 8-1 4 5 6 6 2V5zm0 0c4-5 9 0 7 4 5 3 3 8-1 8 1 4-5 6-6 2M7 7l2 2M5 12h4M8 17l2-2M17 7l-2 2M19 12h-4M16 17l-2-2"/></>,intestino:<><path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-3v3M8 5a3 3 0 0 0-3 3v10M8 9h7a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h5M8 2v3"/></>,body:<><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 10a5 5 0 0 1 10 0h-10zm5 0 2-3"/></>,pressure:<><path d="M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13zM3 12h5l2-4 3 8 2-4h6"/></>};
 if(!paths[id])return <HabitIcon id={id} size={size}/>;
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>;
}
