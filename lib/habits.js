export const HABIT_COLORS=[{id:'blue',name:'Azul',hex:'#258cff'},{id:'green',name:'Verde',hex:'#16cf88'},{id:'purple',name:'Roxo',hex:'#b554f5'},{id:'orange',name:'Laranja',hex:'#ff9d42'},{id:'cyan',name:'Turquesa',hex:'#18ced8'},{id:'pink',name:'Rosa',hex:'#f568a8'},{id:'yellow',name:'Amarelo',hex:'#e8c344'},{id:'red',name:'Vermelho',hex:'#f57575'}];
export const HABIT_ICONS=[['book','Leitura'],['water','Água'],['stretch','Alongamento'],['walk','Caminhada'],['study','Estudo'],['fitness','Exercício'],['sleep','Sono'],['food','Alimentação'],['heart','Saúde'],['meditate','Meditação'],['home','Casa'],['work','Trabalho'],['music','Música'],['sun','Rotina'],['plant','Natureza'],['star','Objetivo']];
export const habitColor=id=>HABIT_COLORS.find(c=>c.id===id)||HABIT_COLORS[0];
export const habitToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const habitUid=()=> 'habit'+Date.now().toString(36)+Math.random().toString(36).slice(2);
export function validHabit(habit){
 if(!habit.name?.trim()||habit.name.length>200)return 'Informe um nome com até 200 caracteres.';
 if(!['work','personal'].includes(habit.context))return 'Escolha o contexto.';
 if(!HABIT_COLORS.some(c=>c.id===habit.color)||!HABIT_ICONS.some(([id])=>id===habit.icon))return 'Escolha uma cor e um ícone da paleta.';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(habit.start||'')||habit.start>habitToday())return 'Informe uma data de início válida, até hoje.';
 return '';
}
export function toggleHabit(logs,habit,date){
 if(date>habitToday()||date<habit.start)throw new Error('Marque apenas dias entre o início do hábito e hoje.');
 const existing=logs.find(log=>log.habit===habit.id&&log.date===date);
 return existing?logs.filter(log=>!(log.habit===habit.id&&log.date===date)):[...logs,{id:habitUid(),name:habit.name+' · '+date,habit:habit.id,date}];
}
export function habitPeriod(habit,logs,start,end,today=habitToday()){
 const from=habit.start>start?habit.start:start,to=end<today?end:today;
 if(from>to)return {done:0,total:0,percent:0};
 const total=Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000)+1;
 const done=new Set(logs.filter(log=>log.habit===habit.id&&log.date>=from&&log.date<=to).map(log=>log.date)).size;
 return {done,total,percent:total?Math.round(done/total*100):0};
}
export const habitMonthDays=(year,month)=>Array.from({length:new Date(year,month,0).getDate()},(_,i)=>`${year}-${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`);
