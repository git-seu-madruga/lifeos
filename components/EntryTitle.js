"use client";
import {useState} from 'react';
export default function EntryTitle({value,newEntry=false,placeholder,onChange,...props}){
 const [started,setStarted]=useState(false);
 return <input {...props} value={newEntry&&!started&&value===placeholder?'':value} placeholder={placeholder} autoFocus={newEntry} onChange={event=>{setStarted(true);onChange(event);}}/>;
}
