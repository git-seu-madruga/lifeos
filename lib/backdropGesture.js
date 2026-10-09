// A backdrop click may be synthesized when a text-selection drag ends outside a panel.
export function createBackdropGesture(){
 let start=null;
 return {
  down(event){start={target:event.target,id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};},
  move(event){if(start&&start.id===event.pointerId&&(Math.abs(event.clientX-start.x)>5||Math.abs(event.clientY-start.y)>5))start.moved=true;},
  cancel(){start=null;},
  click(event){const previous=start;start=null;
   if(!event.target?.matches?.('.overlay'))return true;
   if(event.detail===0)return true; // Keyboard/programmatic activation retains its usual behavior.
   return !!previous&&previous.target===event.target&&!previous.moved;
  }
 };
}
