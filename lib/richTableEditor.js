import {Extension} from '@tiptap/core';
import {TableKit} from '@tiptap/extension-table';
import {Plugin} from '@tiptap/pm/state';
import {TABLE_LIMITS,tableShapeError} from './richTables';

export const richTableKit=TableKit.configure({table:{resizable:false,cellMinWidth:80,renderWrapper:true,HTMLAttributes:{class:'lifeos-rich-table'}}});
export function richTableGuard(onError){return Extension.create({
 name:'richTableGuard',
 addProseMirrorPlugins(){return [new Plugin({filterTransaction(transaction){
  if(!transaction.docChanged)return true;
  let error='';transaction.doc.descendants(node=>{
   if(node.type.name!=='table')return true;
   error=error||tableShapeError(node.toJSON());
   node.descendants(child=>{if(child.type.name==='table')error='Tabelas dentro de tabelas não são suportadas.';});
   return false;
  });
  if(error)onError(error);return !error;
 }})];},
});}
// A one-tap title row avoids having to drag-select cells on a phone.
export function mergeTitleRow(editor,run=true){
 const {$from}=editor.state.selection;let depth=$from.depth;
 while(depth>0&&$from.node(depth).type.name!=='tableRow')depth--;
 if(!depth)return false;
 const row=$from.node(depth);if(row.childCount<2)return false;
 let valid=true;row.forEach(cell=>{if(cell.attrs.rowspan!==1)valid=false;});
 const table=$from.node(depth-1),rowIndex=$from.index(depth-1),gridWidth=table.firstChild.content.content.reduce((sum,cell)=>sum+cell.attrs.colspan,0);
 const width=row.content.content.reduce((sum,cell)=>sum+cell.attrs.colspan,0);
 if(!valid||width!==gridWidth)return false;
 // A preceding row may span into this one. In that case, keep regular selection-based merging.
 for(let y=0;y<rowIndex;y++){let spans=false;table.child(y).forEach(cell=>{if(cell.attrs.rowspan>rowIndex-y)spans=true;});if(spans)return false;}
 if(!run)return true;
 const start=$from.start(depth),last=start+row.nodeSize-2-row.lastChild.nodeSize;
 return editor.chain().setCellSelection({anchorCell:start,headCell:last}).mergeCells().run();
}
export function tableDimensions(editor){
 const {$from}=editor.state.selection;
 for(let d=$from.depth;d>0;d--)if($from.node(d).type.name==='table'){
  const table=$from.node(d);return {rows:table.childCount,columns:table.firstChild.content.content.reduce((sum,cell)=>sum+cell.attrs.colspan,0)};
 }
 return null;
}
export function validTableSize(rows,columns){return Number.isInteger(rows)&&rows>0&&rows<=TABLE_LIMITS.rows&&Number.isInteger(columns)&&columns>0&&columns<=TABLE_LIMITS.columns&&rows*columns<=TABLE_LIMITS.cells;}

export function paragraphAfterTable(editor){
 const {$from}=editor.state.selection;let depth=$from.depth;
 while(depth>0&&$from.node(depth).type.name!=='table')depth--;
 if(!depth)return false;
 const pos=$from.after(depth);
 return editor.chain().insertContentAt(pos,{type:'paragraph'}).setTextSelection(pos+1).run();
}
