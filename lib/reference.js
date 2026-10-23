import {emptyIdeaDoc,ideaUid,ideaText,IDEA_COLORS,validateSomeday,normalizeAreaName} from './someday';
export const makeReferenceCategory=(name,icon='art-books',color=IDEA_COLORS[3])=>{const uid=ideaUid();return {id:'ref-category:'+uid,name:name.trim(),type:'category',data:{uid,icon,color,description:'',archived:false},attachments:[]};};
export function makeReferenceMaterial(category){const uid=ideaUid(),now=Date.now();return {id:'ref-material:'+uid,name:'',type:'material',data:{uid,category:category?.data.uid||'',icon:category?.data.icon||'art-books',color:category?.data.color||IDEA_COLORS[3],favorite:false,createdAt:now,updatedAt:now,doc:emptyIdeaDoc()},attachments:[]};}
export function validateReference(item){
 if(!item||!['category','material'].includes(item.type)||!Array.isArray(item.attachments)||item.context!=null&&item.context!=='personal')return 'Material ou categoria de referência inválido.';
 if(item.data?.promoted||item.status||item.due)return 'Materiais de referência não são tarefas, projetos ou ideias.';
 if(item.type==='category'&&item.data?.description!=null&&(typeof item.data.description!=='string'||item.data.description.length>300))return 'Use até 300 caracteres na descrição da categoria.';
 if(item.type==='category'&&item.name?.length>100)return 'Use até 100 caracteres no nome da categoria.';
 if(item.type==='material'&&(typeof item.data?.category!=='string'||!item.data.category||item.data.category.length>100||!Number.isFinite(item.data.updatedAt)||item.data.updatedAt<=0))return 'Escolha uma categoria válida para o material.';
 const error=validateSomeday({...item,type:item.type==='category'?'area':'idea',context:'personal',data:{...item.data,area:item.data?.category}});
 return error.replaceAll('Algum dia','Referência Geral').replaceAll('ideia/área','material/categoria').replaceAll('ideia','material').replaceAll('Área','Categoria');
}
export function referenceCatalogError(records){
 if(!Array.isArray(records)||records.length>5000)return 'Use até 5.000 materiais e categorias.';
 const categories=records.filter(r=>r.type==='category');
 if(categories.length>100)return 'Use até 100 categorias de referência.';
 if(new Set(records.map(r=>r.data.uid)).size!==records.length)return 'Há identificadores repetidos na biblioteca. Atualize os dados.';
 const names=categories.filter(c=>!c.data.archived).map(c=>normalizeAreaName(c.name));
 if(new Set(names).size!==names.length)return 'Já existe uma categoria com esse nome.';
 for(const r of records)if(r.type==='material'&&!categories.some(c=>c.data.uid===r.data.category))return 'A categoria deste material não existe. Atualize os dados.';
 return '';
}
export function saveReferenceCategory(records,category){
 const previous=records.find(r=>r.id===category.id),error=validateReference(category);
 if(category.type!=='category'||error)throw new Error(error||'Categoria inválida.');
 if(previous&&(previous.type!==category.type||previous.data.uid!==category.data.uid))throw new Error('O identificador da categoria não pode mudar.');
 const next=previous?records.map(r=>r.id===category.id?category:r):[...records,category],message=referenceCatalogError(next);
 if(message)throw new Error(message);return next;
}
export function referenceMaterials(records,{category=null,query='',favorites=false}={}){
 const terms=normalizeAreaName(query).split(/\s+/).filter(Boolean);
 return records.filter(r=>r.type==='material'&&(!favorites||r.data.favorite)&&(terms.length||!category||category==='all'||r.data.category===category)&&terms.every(t=>normalizeAreaName(r.name+' '+ideaText(r.data.doc)+' '+r.attachments.map(a=>a.name).join(' ')).includes(t))).sort((a,b)=>(b.data.updatedAt||b.data.createdAt)-(a.data.updatedAt||a.data.createdAt)||a.name.localeCompare(b.name,'pt-BR'));
}
export const referenceDrawers=records=>records.filter(r=>r.type==='category'&&(!r.data.archived||records.some(m=>m.type==='material'&&m.data.category===r.data.uid))).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(c=>({...c,count:records.filter(m=>m.type==='material'&&m.data.category===c.data.uid).length}));
export function removeReferenceAttachment(record,file){const remove=n=>({...n,...(n.content?{content:n.content.filter(c=>!(c.type==='ideaImage'&&c.attrs?.attachmentId===file.name)).map(remove)}:{})});return {attachments:record.attachments.filter(a=>a.name!==file.name),data:{doc:remove(record.data.doc)}};}
