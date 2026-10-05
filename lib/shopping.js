export const shoppingId=()=> 'shop'+Date.now().toString(36)+Math.random().toString(36).slice(2);
export function validateShopping(list){
 if(typeof list.name!=='string'||!list.name.trim()||list.name.length>200)return 'Informe um nome de lista com até 200 caracteres.';
 if(!['personal','work'].includes(list.context))return 'Escolha Pessoal ou Trabalho para a lista.';
 if(!Array.isArray(list.items)||list.items.length>500||list.items.some(item=>typeof item.id!=='string'||!item.id||typeof item.text!=='string'||!item.text.trim()||item.text.length>500)||new Set(list.items.map(item=>item.id)).size!==list.items.length)return 'Use até 500 itens, cada um com até 500 caracteres.';
 if(JSON.stringify(list.items).length>50000)return 'A lista está muito grande. Divida os itens em mais listas.';
 return '';
}
export function parseShoppingItems(text){
 // O Notion também permite edição manual: uma linha para cada item.
 return String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(text=>({id:shoppingId(),text}));
}
export function shoppingFromInbox(lists,text,context){
 const [first,...lines]=text.trim().split(/\r?\n/),name=first?.trim();
 const items=parseShoppingItems(lines.join('\n'));
 if(!name||!items.length)throw new Error('Use o nome da lista na primeira linha e pelo menos um item nas linhas seguintes. O texto continua no Inbox.');
 const matches=lists.filter(list=>list.context===context&&list.name.trim().toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR'));
 if(matches.length>1)throw new Error('Há mais de uma lista com este nome neste contexto. Renomeie uma delas antes de converter. O texto continua no Inbox.');
 const existing=matches[0],list={...(existing||{}),id:existing?.id||shoppingId(),name:existing?.name||name,context,items:[...items,...(existing?.items||[])]};
 const error=validateShopping(list);if(error)throw new Error(error);
 return {id:list.id,lists:existing?lists.map(item=>item.id===list.id?list:item):[...lists,list]};
}
export function decodeShoppingItems(value){
 if(!value)return [];
 // JSON mantém os identificadores dos itens estáveis para reenvios e conflitos.
 if(value.trim().startsWith('[')){
  let items;try{items=JSON.parse(value);}catch{throw new Error('O campo Itens da lista contém JSON inválido. Corrija no Notion ou use uma linha por item.');}
  if(!Array.isArray(items)||items.some(item=>typeof item.id!=='string'||typeof item.text!=='string'))throw new Error('O campo Itens da lista contém dados inválidos.');
  return items;
 }
 // IDs determinísticos: ler uma lista manual não cria alterações artificiais.
 return value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((text,index)=>({id:'manual-'+index+'-'+Array.from(text).reduce((hash,char)=>(Math.imul(hash,31)+char.charCodeAt(0))|0,0).toString(36),text}));
}

export function moveShoppingItem(items,from,to){
 const source=items.findIndex(item=>item.id===from),target=items.findIndex(item=>item.id===to);
 if(source<0||target<0||source===target)return items;
 const next=[...items], [item]=next.splice(source,1);next.splice(target,0,item);return next;
}

export function normalizeShoppingOrder(saved,ids){
 const known=new Set(ids),order=[...new Set((Array.isArray(saved)?saved:[]).filter(id=>known.has(id)))];
 return [...order,...ids.filter(id=>!order.includes(id))];
}
