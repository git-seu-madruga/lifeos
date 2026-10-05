"use client";
import {createPortal} from 'react-dom';
// Retira os diálogos dos contextos de empilhamento da barra lateral sticky.
export default function ModalLayer({children}){
 return typeof document==='undefined'?null:createPortal(children,document.body);
}
