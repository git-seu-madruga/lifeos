// Account directory is delivered only inside an authenticated server response.
export const participantsFor=user=>Array.isArray(user?.participants)?user.participants.filter(p=>typeof p?.email==='string'&&typeof p?.name==='string'):user?.email?[{email:user.email,name:user.name||user.email.split('@')[0]}]:[];
export const responsibleName=(email,people=[])=>people.find(p=>p.email===email)?.name||String(email||'').split('@')[0];
export const sharingPatch=(shared,responsible,email)=>({shared:!!shared,responsible:shared?(responsible||email||''):''});
