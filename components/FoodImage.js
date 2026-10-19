"use client";
import {useEffect,useState} from 'react';
import {foodIcon,safeFoodImage} from '../lib/nutrition';
export default function FoodImage({food,size=52}){
 const remote=safeFoodImage(food?.image),[failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[remote]);
 return <img className="food-image" alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" src={remote&&!failed?remote:`/emoji/fluent-food/${foodIcon(food)}.png`} onError={()=>{if(remote&&!failed)setFailed(true);}}/>;
}
