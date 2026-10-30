const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react');
const folder=fs.mkdtempSync(path.join(process.cwd(),'.followups-test-'));
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir));for(const name of fs.readdirSync(dir))if(name.endsWith('.js'))fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}
const saved={useState:React.useState,useMemo:React.useMemo,useRef:React.useRef,useEffect:React.useEffect},oldWindow=global.window;
try{
 const f=require(path.join(folder,'lib/followups')),domain=require(path.join(folder,'lib/tasks'));
 const base=(date='2026-10-30',extra={})=>({id:'f',title:'Consultar concurso',status:'hold',priority:'medium',context:'personal',project:null,notes:'https://example.com',due:'2020-01-01',recurrence:{...f.makeFollowup(date),...extra}});
 assert.equal(f.followupToday(new Date('2026-10-31T01:00:00Z')),'2026-10-30');
 let task=base(),done=f.completeFollowup(task,'Sem novidades','2026-10-30',1234);
 assert.equal(done.status,'hold');assert.equal(done.recurrence.next,'2026-11-06');assert.equal(done.recurrence.total,1);assert.equal(done.recurrence.history[0].note,'Sem novidades');assert.equal(done.due,'2020-01-01');assert.equal(f.validateFollowup(done),'');assert.equal(f.completeFollowup(done,'','2026-10-30'),done,'Double click never registers a future cycle');assert.equal(task.recurrence.total,0);
 assert.equal(f.nextFollowupDate({...task.recurrence,mode:'fixed'},'2026-11-09'),'2026-11-13','Fixed schedule skips missed checks');
 assert.equal(f.nextFollowupDate({...task.recurrence,mode:'after'},'2026-11-09'),'2026-11-16');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2026-01-31'),mode:'fixed',unit:'months',every:1},'2026-01-31'),'2026-02-28');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2024-01-31'),mode:'fixed',unit:'months',every:1,next:'2024-02-29'},'2024-02-29'),'2024-03-31','Monthly fixed schedule never drifts');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2024-01-31'),unit:'months',every:1},'2024-02-29'),'2024-03-29');
 const weekly={...f.makeFollowup('2026-10-30'),mode:'fixed',unit:'weeks',every:1,weekdays:[1,5]};
 assert.equal(f.nextFollowupDate(weekly,'2026-10-30'),'2026-11-02');assert.equal(f.nextFollowupDate({...weekly,every:2},'2026-10-30'),'2026-11-09');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2026-10-30'),unit:'days',every:1},'2026-10-30'),'2026-10-31');
 assert.equal(f.completeFollowup({...task,locked:true},'','2026-10-30').recurrence.total,0);
 assert.equal(f.completeFollowup(base('2026-10-30',{state:'paused'}),'','2026-10-30').recurrence.total,0);
 const ended=f.endFollowup(task);assert.equal(ended.status,'done');assert.equal(ended.recurrence.state,'ended');assert.equal(f.validateFollowup(ended),'');assert.equal(domain.patchTask(ended,{status:'todo'}).status,'hold');
 const closed=domain.closeProjectTask(task);assert.equal(closed.recurrence.state,'ended');assert.equal(closed.recurrence.total,0);assert.equal(closed.recurrence.next,task.recurrence.next);assert.equal(domain.closeProjectTask(closed),closed);
 assert.equal(domain.patchTask(task,{status:'doing'}).status,'hold');assert.equal(domain.patchTask({...task,locked:true},{status:'done'}).locked,true);
 const ordinary={id:'o',status:'hold',followUp:'2026-10-30',due:'2026-10-31'};assert.equal(domain.patchTask(ordinary,{status:'done'}).status,'done');assert.equal(domain.taskDate(ordinary),'2026-10-30');assert.equal(domain.taskDate(task),'2026-10-30');
 assert.ok(f.validateFollowup(base('2026-02-30')));assert.ok(f.validateFollowup(base('2026-10-30',{every:0})));assert.ok(f.validateFollowup({...task,status:'done'}));assert.equal(f.validateFollowup(ordinary),'');
 let many=base('2025-01-01',{every:1});for(let i=0;i<205;i++)many=f.completeFollowup(many,'Consulta',many.recurrence.next,1234+i);assert.equal(many.recurrence.history.length,200);assert.equal(many.recurrence.total,205);assert.equal(f.validateFollowup(many),'');
 assert.equal(f.hasFollowupNotice([{...task,project:'p'}],[{id:'p',status:'paused'}],'2026-10-30'),false);assert.equal(f.hasFollowupNotice([{...task,project:'p'}],[{id:'p',status:'active'}],'2026-10-30'),true);assert.equal(f.taskVisibleOutsideProject(ordinary,[]),true);
 assert.equal(f.followupDateInfo(task,'2026-10-31').text,'1d atrasado');assert.equal(f.followupDateInfo(task,'2026-10-30').text,'Hoje');
 let slots=[],cursor=0;React.useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];};React.useMemo=fn=>fn();React.useRef=value=>({current:value});React.useEffect=()=>{};
 const walk=(node,result=[])=>{if(Array.isArray(node))node.forEach(n=>walk(n,result));else if(node?.props){result.push(node);walk(node.props.children,result);}return result;};
 const View=require(path.join(folder,'components/TasksView')).default,today=f.followupToday();
 let projects=[{id:'p',status:'paused',name:'Projeto pausado',context:'personal',milestones:[]}];
 let tasks=[{...ordinary,title:'Aguardando',priority:'medium',context:'personal'},{...base(today),id:'today'},{...base('2999-01-01'),id:'future'},{...base(today),id:'hidden',project:'p'},{...ordinary,id:'ordinary-hidden',title:'Oculta',priority:'medium',context:'personal',project:'p'}];
 const render=()=>{cursor=0;return walk(View({tasks,projects,context:'all',sub:'status',setTasks:fn=>tasks=fn(tasks),onOpenProject(){}}));};
 let nodes=render();assert.deepEqual(nodes.filter(n=>n.type==='li').map(n=>n.key),['o','today','future']);assert.ok(!nodes.some(n=>n.props.className==='seg-row followup-switch'),'No separate view');assert.ok(nodes.some(n=>n.props.children==='On hold / Follow-up'));
 const check=nodes.find(n=>n.props['aria-label']==='Acompanhamento feito: Consultar concurso'&&!n.props.disabled);check.props.onChange();assert.equal(tasks.find(t=>t.id==='today').status,'hold');assert.equal(tasks.find(t=>t.id==='today').recurrence.total,1);assert.equal(render().filter(n=>n.type==='li').length,3,'Remains in hold after checking');
 projects=projects.map(p=>({...p,status:'active'}));assert.equal(render().filter(n=>n.type==='li').length,5,'Resuming project restores both kinds');projects=projects.map(p=>({...p,status:'paused'}));nodes=render();nodes.find(n=>n.props['aria-label']==='Buscar').props.onChange({target:{value:'Oculta'}});assert.equal(render().filter(n=>n.type==='li').length,0,'Paused tasks stay hidden during search');
 // The same details editor configures type, interval and manual lifecycle.
 slots=[];cursor=0;const Detail=require(path.join(folder,'components/TaskDetail')).default;let update;
 nodes=walk(Detail({task:{...ordinary,title:'Normal',notes:'',context:'personal',priority:'medium'},projects:[],update:(id,p)=>{update=p;},onClose(){}}));nodes.find(n=>n.props['aria-label']==='Tipo da tarefa').props.onChange({target:{value:'followup'}});assert.equal(update.status,'hold');assert.equal(update.recurrence.state,'active');
 slots=[];let current=base(today);const Fields=require(path.join(folder,'components/FollowupFields')).default,fields=()=>{cursor=0;return walk(Fields({task:current,set:patch=>current=domain.patchTask(current,patch)}));};
 fields().find(n=>n.props['aria-label']==='Observação da consulta').props.onChange({target:{value:'Sem publicações'}});fields().find(n=>n.props.children==='Acompanhamento feito').props.onClick();assert.equal(current.recurrence.history[0].note,'Sem publicações');assert.equal(current.status,'hold');
 let approve=false;global.window={confirm:()=>approve};fields().find(n=>n.props.children==='Encerrar acompanhamento').props.onClick();assert.equal(current.recurrence.state,'active');approve=true;fields().find(n=>n.props.children==='Encerrar acompanhamento').props.onClick();assert.equal(current.recurrence.state,'ended');
 fields().find(n=>n.props.children==='Retomar acompanhamento').props.onClick();assert.equal(current.status,'hold');assert.equal(current.recurrence.state,'active');
 // Project actions explicitly confirm and end recurrences, including individually paused ones.
 slots=[];const ProjectView=require(path.join(folder,'components/ProjectsView')).default;let projectList=[{id:'parent',name:'Concurso',context:'personal',status:'active',area:'',due:null,description:'',attachments:[],milestones:[]}],message='';
 tasks=[{...base(today),id:'linked',project:'parent',recurrence:{...f.makeFollowup(today),state:'paused'}},{...ordinary,id:'linked-ordinary',project:'parent',title:'Aguardando retorno',context:'personal',priority:'medium'}];
 const projectTree=()=>{cursor=0;return walk(ProjectView({tasks,projects:projectList,setTasks:fn=>tasks=fn(tasks),setProjects:fn=>projectList=fn(projectList),context:'all',sub:'ativos',selected:'parent',onSelect(){}}));};
 const setProjectStatus=value=>projectTree().find(n=>n.type==='select'&&n.props.value===projectList[0].status).props.onChange({target:{value}});
 global.window={confirm:text=>{message=text;return approve;}};approve=false;setProjectStatus('done');assert.equal(projectList[0].status,'active');assert.equal(tasks[0].recurrence.state,'paused');assert.ok(message.includes('follow-ups')&&message.includes('em aberto'));
 approve=true;setProjectStatus('done');assert.equal(tasks[0].status,'done');assert.equal(tasks[0].recurrence.state,'ended');assert.equal(tasks[0].recurrence.total,0);assert.equal(tasks[1].status,'done');assert.equal(projectList[0].status,'done');
 setProjectStatus('active');assert.equal(tasks[0].recurrence.state,'ended');
 console.log('PASSOU: follow-ups em On hold, recorrência após consulta/calendário fixo, dias da semana, meses/bissexto, idempotência, prazo informativo, histórico, bloqueio, pausa de projetos, filtros e ciclo manual.');
}finally{Object.assign(React,saved);if(oldWindow===undefined)delete global.window;else global.window=oldWindow;fs.rmSync(folder,{recursive:true,force:true});}
