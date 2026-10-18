"use client";
import {useState} from 'react';
import MonthInput from './MonthInput';
import VehicleIcon from './VehicleIcon';
import {currentMonth,money} from '../lib/finance';
import {vehicleExpenseTotals} from '../lib/vehicles';
export default function VehicleExpenseSummary({entries}){
 const [month,setMonth]=useState(currentMonth()),[year,setYear]=useState(()=>currentMonth().slice(0,4));
 const totals=vehicleExpenseTotals(entries,month,year),validYear=/^[1-9]\d{3}$/.test(year);
 function moveMonth(step){const [y,m]=month.split('-').map(Number),index=y*12+m-1+step,nextYear=Math.floor(index/12);if(nextYear>=1000&&nextYear<=9999)setMonth(`${nextYear}-${String(index%12+1).padStart(2,'0')}`);}
 function moveYear(step){if(validYear){const next=Number(year)+step;if(next>=1000&&next<=9999)setYear(String(next));}}
 return <div className="vehicle-stat money vehicle-finance-stat"><div className="vehicle-finance-title"><VehicleIcon name="money"/><span>Despesas do veículo</span></div><div className="vehicle-finance-periods"><section><span>Despesas no mês</span><strong>{money(totals.month)}</strong><div className="vehicle-card-period"><button className="ghost" aria-label="Mês anterior das despesas" onClick={()=>moveMonth(-1)}>‹</button><MonthInput label="Mês do resumo de despesas" value={month} onChange={setMonth}/><button className="ghost" aria-label="Próximo mês das despesas" onClick={()=>moveMonth(1)}>›</button><button className="ghost" onClick={()=>setMonth(currentMonth())}>Hoje</button></div></section><section><span>Despesas no ano</span><strong>{validYear?money(totals.year):'—'}</strong><div className="vehicle-card-period"><button className="ghost" aria-label="Ano anterior das despesas" disabled={!validYear} onClick={()=>moveYear(-1)}>‹</button><input className="search" aria-label="Ano do resumo de despesas" inputMode="numeric" maxLength={4} value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,'').slice(0,4))} aria-invalid={!validYear}/><button className="ghost" aria-label="Próximo ano das despesas" disabled={!validYear} onClick={()=>moveYear(1)}>›</button><button className="ghost" onClick={()=>setYear(currentMonth().slice(0,4))}>Hoje</button></div></section></div><small className="vehicle-finance-global">Acumulado · Manutenção e despesas {money(totals.expenses)} + combustível {money(totals.fuel)} = total {money(totals.total)}</small>{totals.unknown>0&&<small className="vehicle-finance-global">{totals.unknown} registros sem valor informado, fora das somas.</small>}</div>;
}
