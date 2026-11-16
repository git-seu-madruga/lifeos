// Generic recipe fixture; no personal recipes or account data.
module.exports=()=>{
 const p=text=>({type:'paragraph',content:[{type:'text',text}]}),cell=(text,type='tableCell',colspan=1)=>({type,attrs:{colspan,rowspan:1,colwidth:null,align:null},content:[p(text)]});
 return {type:'table',content:[
  {type:'tableRow',content:[cell('Receita de teste','tableHeader',2)]},
  {type:'tableRow',content:[cell('Ingrediente','tableHeader'),cell('Quantidade','tableHeader')]},
  {type:'tableRow',content:[cell('Farinha'),cell('500 g')]},
  {type:'tableRow',content:[cell('Água'),cell('360 ml')]},
 ]};
};
