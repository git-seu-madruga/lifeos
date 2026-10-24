// Each group is read atomically before its tabs can edit related records.
export const STARTUP_GROUPS={
 inbox:{tabs:[],kinds:['inbox'],flags:[]},
 planning:{tabs:['projetos','tarefas','algumdia'],kinds:['projects','milestones','tasks','someday'],flags:['somedayConfigured']},
 diary:{tabs:['diario'],kinds:['diary'],flags:['diaryConfigured']},
 finance:{tabs:['financas'],kinds:['categories','transactions'],flags:['financeConfigured']},
 contacts:{tabs:['aniversarios'],kinds:['contacts'],flags:['contactsConfigured']},
 shopping:{tabs:['compras'],kinds:['shopping'],flags:['shoppingConfigured']},
 wellness:{tabs:['bemestar'],kinds:['wellness','cycle','habits','habitLogs'],flags:['wellnessConfigured','cycleConfigured','habitsConfigured']},
 media:{tabs:['entretenimento'],kinds:['mediaSections','media'],flags:['mediaConfigured']},
 recados:{tabs:['recados'],kinds:[],flags:[]},
 vehicles:{tabs:['veiculos'],kinds:['vehicles'],flags:['vehiclesConfigured']},
 nutrition:{tabs:['acompanhamento'],kinds:['nutrition'],flags:['nutritionConfigured']},
 reference:{tabs:['referencia'],kinds:['reference'],flags:['referenceConfigured']}
};
export const startupGroupForTab=tab=>Object.keys(STARTUP_GROUPS).find(key=>STARTUP_GROUPS[key].tabs.includes(tab));
export function startupOrder(tabs=[],priority){return [...new Set(['inbox',startupGroupForTab(priority),...tabs.map(startupGroupForTab),...Object.keys(STARTUP_GROUPS)].filter(Boolean))];}
export function emptyStartupState(user){const state={user,_routingVersion:'',sharedActivity:{}};for(const group of Object.values(STARTUP_GROUPS)){for(const kind of group.kinds)if(kind!=='milestones')state[kind]=[];for(const flag of group.flags)state[flag]=false;}return state;}
export function mergeStartupGroup(previous,incoming,key){const group=STARTUP_GROUPS[key],next={...previous};for(const kind of group.kinds)if(kind!=='milestones'){if(!Array.isArray(incoming[kind]))throw new Error('Resposta incompleta ao carregar esta área. Tente novamente.');next[kind]=incoming[kind];}for(const flag of group.flags)next[flag]=!!incoming[flag];next._routingVersion=incoming._routingVersion||'';
 const activity={...previous.sharedActivity};for(const [kind,value] of Object.entries(incoming.sharedActivity||{}))if(!activity[kind]||value.at>activity[kind].at)activity[kind]=value;next.sharedActivity=activity;return next;}
// Saving an earlier group must not roll back groups which finished loading meanwhile.
export function advanceSyncBaseline(latest,sent,changes){const next={...latest};for(const [kind,group] of Object.entries(changes))if(group.upserts.length||group.deletions.length){const collection=kind==='milestones'?'projects':kind;next[collection]=sent[collection];}return next;}
