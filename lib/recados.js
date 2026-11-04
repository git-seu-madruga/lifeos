export const RECADO_TIMEZONE='America/Sao_Paulo';
export function recadoToday(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:RECADO_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function validRecadoMonth(value){return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)&&Number(value.slice(0,4))>=2000&&Number(value.slice(0,4))<=9998;}
export function recadoMonthBounds(month){if(!validRecadoMonth(month))throw new Error('Mês inválido.');const [year,m]=month.split('-').map(Number);return [month+'-01',`${m===12?year+1:year}-${String(m===12?1:m+1).padStart(2,'0')}-01`];}
export function recadoName(email,user){return user?.participants?.find(p=>p.email===email)?.name||(user?.email===email?user.name:'')||String(email||'').split('@')[0]||'Outra conta';}
export function recadoId(day,email){return `recado:${day}:${email}`;}

export function hasUnreadRecadoToday(items,email,today=recadoToday()){return (items||[]).some(item=>item.date===today&&item.recipient===email&&!item.read);}
