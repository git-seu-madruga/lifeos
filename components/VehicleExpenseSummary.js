"use client";
import {useState} from 'react';
import MonthInput from './MonthInput';
import MonthPicker from './MonthPicker';
import VehicleIcon from './VehicleIcon';
import {currentMonth,money} from '../lib/finance';
import {vehicleExpenseTotals} from '../lib/vehicles';
export default function VehicleExpenseSummary({entries}){
 const [month,setMonth]=useState(currentMonth());
 const totals=vehicleExpenseTotals(entries,month,month.slice(0,4));
 function moveMonth(step){const [y,m]=month.split('-').map(Number),index=y*12+m-1+step,nextYear=Math.floor(index/12);if(nextYear>=1000&&nextYear<=9999)setMonth(`${nextYear}-${String(index%12+1).padStart(2,'0')}`);}
 return <div className="vehicle-stat money vehicle-finance-stat"><div className="vehicle-finance-title"><VehicleIcon name="money"/><span>Despesas do veículo</span></div><div className="vehicle-card-period vehicle-summary-period"><button className="ghost" aria-label="Mês anterior do resumo" onClick={()=>moveMonth(-1)}>‹</button><MonthInput label="Mês e ano do resumo do veículo" value={month} onChange={setMonth}/><MonthPicker value={month} onChange={setMonth}/><button className="ghost" aria-label="Próximo mês do resumo" onClick={()=>moveMonth(1)}>›</button><button className="ghost" onClick={()=>setMonth(currentMonth())}>Hoje</button></div><div className="vehicle-finance-periods">{[['Combustível no mês',totals.fuelMonth],['Combustível no ano',totals.fuelYear],['Despesas no mês',totals.month],['Despesas no ano',totals.year]].map(([label,value])=><section key={label}><span>{label}</span><strong>{money(value)}</strong></section>)}</div><small className="vehicle-finance-global">Acumulado · Manutenção e despesas {money(totals.expenses)} + combustível {money(totals.fuel)} = total {money(totals.total)}</small></div>;
}
