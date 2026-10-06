import {AsyncLocalStorage} from 'node:async_hooks';
import {redis} from './coordination';
import {ROUTING_KEY} from './maintenance';
const context=new AsyncLocalStorage();
export const withDatabaseRouting=(routing,fn)=>context.run(routing,fn);
export async function databaseRouting(){return context.getStore()||JSON.parse(await redis(['GET',ROUTING_KEY])||'{}');}
