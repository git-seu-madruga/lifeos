export const dateKey = date => `${String(date.getFullYear()).padStart(4,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function calendarDays(year,month) {
  const first=new Date(year,month,1,12);
  const start=new Date(year,month,1-first.getDay(),12);
  return Array.from({length:42},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);return {date:dateKey(date),day:date.getDate(),outside:date.getMonth()!==month};});
}
export function normalizeTabOrder(order,ids) {
  return [...new Set([...(Array.isArray(order)?order:[]).filter(id=>ids.includes(id)),...ids])];
}
export function moveTab(order,from,to) {
  if(from===to||!order.includes(from)||!order.includes(to))return order;
  const next=order.filter(id=>id!==from);next.splice(order.indexOf(to),0,from);return next;
}
