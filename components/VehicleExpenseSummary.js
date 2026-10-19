"use client";
import MonthInput from './MonthInput';
import MonthPicker from './MonthPicker';
import VehicleIcon from './VehicleIcon';
import {currentMonth,money} from '../lib/finance';
import {vehicleExpenseTotals} from '../lib/vehicles';
export default function VehicleExpenseSummary({entries,month=currentMonth(),onMonthChange=()=>{},onSelectChart=()=>{},activeChart='consumption'}){
 const setMonth=onMonthChange;
 const totals=vehicleExpenseTotals(entries,month,month.slice(0,4));
 function moveMonth(step){const [y,m]=month.split('-').map(Number),index=y*12+m-1+step,nextYear=Math.floor(index/12);if(nextYear>=1000&&nextYear<=9999)setMonth(`${nextYear}-${String(index%12+1).padStart(2,'0')}`);}
 return <div className="vehicle-stat money vehicle-finance-stat"><div className="vehicle-finance-title"><VehicleIcon name="money"/><span>Despesas do veículo</span></div><div className="vehicle-card-period vehicle-summary-period"><button className="ghost" aria-label="Mês anterior do resumo" onClick={()=>moveMonth(-1)}>‹</button><MonthInput label="Mês e ano do resumo do veículo" value={month} onChange={setMonth}/><button className="ghost" aria-label="Próximo mês do resumo" onClick={()=>moveMonth(1)}>›</button><MonthPicker value={month} onChange={setMonth}/><button className="ghost" onClick={()=>setMonth(currentMonth())}>Hoje</button></div><div className="vehicle-finance-periods">{[['Combustível no mês',totals.fuelMonth,'fuel-month'],['Combustível no ano',totals.fuelYear,'fuel-years'],['Despesas no mês',totals.month,'expense-month'],['Despesas no ano',totals.year,'expense-years']].map(([label,value,chart])=><section key={label}><span>{label}</span><button className="vehicle-metric-button" aria-label={label+': mostrar gráfico'} aria-pressed={activeChart===chart} onClick={()=>onSelectChart(chart)}><strong>{money(value)}</strong></button></section>)}</div><small className="vehicle-finance-global">Acumulado · Manutenção e despesas {money(totals.expenses)} + combustível {money(totals.fuel)} = total {money(totals.total)}</small></div>;
}
