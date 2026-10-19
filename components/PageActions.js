"use client";
import {createContext,useContext} from 'react';
import {createPortal} from 'react-dom';

export const PageActionsTarget=createContext(undefined);

// Keep each action in its view so its existing form state and handlers stay intact.
export default function PageActions({children}){
 const target=useContext(PageActionsTarget);
 const actions=<div className="page-primary-actions">{children}</div>;
 if(target===undefined)return actions;
 return target?createPortal(actions,target):null;
}
