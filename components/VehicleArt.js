import {VEHICLE_COLORS,VEHICLE_MODELS} from '../lib/vehicles';
const EMOJI={car:{hatch:'oncoming_automobile',sedan:'automobile',suv:'sport_utility_vehicle',pickup:'pickup_truck'},moto:{street:'motorcycle',scooter:'motor_scooter',trail:'motorcycle',sport:'motorcycle'}};
export default function VehicleArt({kind='car',model='hatch',color=VEHICLE_COLORS[0]}){
 const type=EMOJI[kind]?kind:'car',slug=EMOJI[type][model]||EMOJI[type][VEHICLE_MODELS[type][0][0]],paint=VEHICLE_COLORS.includes(color)?color:VEHICLE_COLORS[0],label=VEHICLE_MODELS[type].find(([id])=>id===model)?.[1]||(type==='car'?'Carro':'Moto');
 return <img className="vehicle-art vehicle-emoji" src={`/emoji/fluent-vehicles/${slug}-${paint.slice(1)}.svg`} width="145" height="96" alt={`${type==='car'?'Carro':'Moto'}: ${label}`} draggable={false}/>;
}
