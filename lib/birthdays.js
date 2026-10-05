export const todayLocal=()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);};
const iso=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const birthdayLabel=person=>`${String(person.day).padStart(2,'0')}/${String(person.month).padStart(2,'0')}${person.year?'/'+person.year:''}`;
export const birthdayDayMonth=person=>birthdayLabel({...person,year:null});
export function validateBirthday(person,today=todayLocal()) {
 if(!person.name?.trim()||person.name.length>200)return 'Informe um nome com até 200 caracteres.';
 if(!Number.isInteger(person.day)||!Number.isInteger(person.month))return 'Informe dia e mês válidos.';
 const year=person.year ?? null;
 if(year!==null&&(!Number.isInteger(year)||year<1000||year>today.getFullYear()))return 'Informe um ano de nascimento válido ou deixe vazio.';
 const date=new Date(year||2000,person.month-1,person.day,12);
 if(date.getFullYear()!==(year||2000)||date.getMonth()!==person.month-1||date.getDate()!==person.day)return 'Data de aniversário inválida.';
 if(year&&date>today)return 'A data de nascimento não pode estar no futuro.';
 return '';
}
export function parseBirthday(text,name='Contato') {
 const match=text.trim().match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{4}))?$/);
 if(!match)return {error:'Use DD/MM ou DD/MM/AAAA na segunda linha.'};
 const person={name,day:Number(match[1]),month:Number(match[2]),year:match[3]?Number(match[3]):null};
 const error=validateBirthday(person);return error?{error}:{person};
}
export function contactFromInbox(item) {
 const lines=item.text.trim().split(/\r?\n/);
 if(lines.length!==2)return {error:'Use duas linhas: nome na primeira e DD/MM ou DD/MM/AAAA na segunda. O texto continua no Inbox.'};
 return parseBirthday(lines[1],lines[0].trim());
}
export const sortedContacts=people=>[...people].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base',numeric:true}));
export function birthdayInYear(person,year) {
 if(person.year&&year<person.year)return null;
 let day=person.day;
 if(person.month===2&&day===29&&new Date(year,2,0).getDate()===28)day=28;
 return new Date(year,person.month-1,day,12);
}
export const ageInYear=(person,year)=>person.year&&year>=person.year?year-person.year:null;
export function nextBirthday(person,today=todayLocal()) {
 let year=today.getFullYear(),date=birthdayInYear(person,year);
 if(!date||date<today)date=birthdayInYear(person,++year);
 const days=Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);
 return {date:iso(date),days,age:ageInYear(person,date.getFullYear())};
}
export const upcomingLabel=next=>next.days===0?'Hoje':next.days<=30?`Em ${next.days} dia${next.days===1?'':'s'}`:next.date.split('-').reverse().join('/');
export function birthdaySummary(people,query,year,month,today=todayLocal()) {
 const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const contacts=sortedContacts(people.filter(person=>normalize(person.name).includes(normalize(query.trim()))));
 const week=contacts.map(person=>({...person,next:nextBirthday(person,today)})).filter(person=>person.next.days<=6).sort((a,b)=>a.next.days-b.next.days||a.name.localeCompare(b.name,'pt-BR'));
 const monthly=contacts.filter(person=>person.month===month&&(!person.year||person.year<=year)).sort((a,b)=>a.day-b.day||a.name.localeCompare(b.name,'pt-BR'));
 return {contacts,week,monthly};
}
