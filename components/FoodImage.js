"use client";
import {useEffect,useState} from 'react';
import {illustrationById} from '../lib/illustrations';
import {foodIcon,safeFoodImage} from '../lib/nutrition';
export default function FoodImage({food,size=52}){
 const remote=safeFoodImage(food?.image),[failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[remote]);
 return <img className="food-image" alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" src={remote&&!failed?remote:(illustrationById(foodIcon(food))?.src||`/emoji/fluent-food/${foodIcon(food)}.png`)} onError={()=>{if(remote&&!failed)setFailed(true);}}/>;
}
