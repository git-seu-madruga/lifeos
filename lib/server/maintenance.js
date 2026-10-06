import {redis} from './coordination';
import {AppError} from './auth';
export const MAINTENANCE_KEY='lifeos:maintenance:v1';
export const ROUTING_KEY='lifeos:database-routing:v1';
export async function maintenance(){const value=await redis(['GET',MAINTENANCE_KEY]);try{return value?JSON.parse(value):null;}catch{throw new AppError('Estado de manutenção inválido. Contate o administrador.',503);}}
export async function ensureWritable(jobId){const state=await maintenance();if(state&&state.id!==jobId)throw new AppError('Backup ou restauração em andamento. Suas alterações continuam pendentes; aguarde a conclusão.',423);}
