"use client";
import {useRef,useState} from 'react';
// Um único caminho de eventos para mouse, caneta e toque.
export default function useShoppingDrag(attribute,onMove){
 const active=useRef(null),suppress=useRef(false);
 const [dragging,setDragging]=useState(null),[over,setOver]=useState(null);
 function clear(){active.current=null;setDragging(null);setOver(null);}
 function targetAt(event){const element=document.elementFromPoint(event.clientX,event.clientY)?.closest(`[${attribute}]`);return element?.getAttribute(attribute);}
 function bind(id){return {
  onPointerDown(event){if(event.button!==undefined&&event.button!==0)return;event.preventDefault();active.current={id,target:id,x:event.clientX,y:event.clientY,moved:false};event.currentTarget.setPointerCapture(event.pointerId);},
  onPointerMove(event){const state=active.current;if(!state)return;if(Math.hypot(event.clientX-state.x,event.clientY-state.y)>6){state.moved=true;setDragging(state.id);}if(state.moved){const target=targetAt(event);if(target){state.target=target;setOver(target);}if(event.clientY<65)window.scrollBy(0,-14);else if(event.clientY>window.innerHeight-65)window.scrollBy(0,14);}},
  onPointerUp(event){const state=active.current;if(state?.moved){const target=targetAt(event)||state.target;onMove(state.id,target);suppress.current=true;setTimeout(()=>{suppress.current=false;},0);}clear();},
  onPointerCancel:clear,onLostPointerCapture:clear,
  onDragStart(event){event.preventDefault();},
 };}
 return {bind,dragging,over,suppress};
}
