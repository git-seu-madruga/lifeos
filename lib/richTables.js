// Shared limits for the editor and the server's JSON validator.
export const TABLE_LIMITS={rows:50,columns:12,cells:300};
export const TABLE_NODES=['table','tableRow','tableCell','tableHeader'];
export function tableCellError(cell){
 const a=cell.attrs||{},cols=a.colspan===undefined?1:a.colspan,rows=a.rowspan===undefined?1:a.rowspan;
 if(Object.keys(a).some(key=>!['colspan','rowspan','colwidth','align'].includes(key))||!Number.isInteger(cols)||cols<1||cols>TABLE_LIMITS.columns||!Number.isInteger(rows)||rows<1||rows>TABLE_LIMITS.rows)return 'Mesclagem de células inválida.';
 if(a.align!=null&&!['left','center','right'].includes(a.align))return 'Alinhamento de célula inválido.';
 if(a.colwidth!=null&&(!Array.isArray(a.colwidth)||a.colwidth.length!==cols||a.colwidth.some(width=>!Number.isInteger(width)||width<1||width>2000)))return 'Largura de célula inválida.';
 if(!Array.isArray(cell.content)||!cell.content.length)return 'Uma célula precisa de conteúdo de texto.';
 return '';
}
export function tableShapeError(table){
 const rows=table.content;
 if(!Array.isArray(rows)||!rows.length||rows.length>TABLE_LIMITS.rows)return 'Use de 1 a 50 linhas por tabela.';
 const grid=Array.from({length:rows.length},()=>[]);let width=0;
 for(let y=0;y<rows.length;y++){
  const row=rows[y];if(row?.type!=='tableRow'||row.content!==undefined&&!Array.isArray(row.content)||(row.content||[]).length>TABLE_LIMITS.columns)return 'Linha de tabela inválida.';
  let x=0;
  for(const cell of row.content||[]){
   if(!['tableCell','tableHeader'].includes(cell?.type))return 'Célula de tabela inválida.';
   const error=tableCellError(cell);if(error)return error;
   const cols=cell.attrs?.colspan??1,span=cell.attrs?.rowspan??1;
   while(grid[y][x])x++;
   if(x+cols>TABLE_LIMITS.columns||y+span>rows.length)return 'Mesclagem fora dos limites da tabela.';
   for(let dy=y;dy<y+span;dy++)for(let dx=x;dx<x+cols;dx++){
    if(grid[dy][dx])return 'Há células sobrepostas na tabela.';
    grid[dy][dx]=true;
   }
   x+=cols;
  }
  width=Math.max(width,grid[y].length);
 }
 if(!width)return 'Tabela sem células.';
 if(width*rows.length>TABLE_LIMITS.cells)return 'Use até 300 posições de células por tabela.';
 if(grid.some(row=>row.length!==width||Array.from({length:width},(_,i)=>!row[i]).some(Boolean)))return 'A tabela tem linhas incompletas.';
 return '';
}
