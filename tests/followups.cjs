const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react');
const folder=fs.mkdtempSync(path.join(process.cwd(),'.followups-test-'));
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir));for(const name of fs.readdirSync(dir))if(name.endsWith('.js'))fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}
const saved={useState:React.useState,useMemo:React.useMemo,useRef:React.useRef,useEffect:React.useEffect},oldWindow=global.window;
try{
 const f=require(path.join(folder,'lib/followups')),domain=require(path.join(folder,'lib/tasks'));
 const base=(date='2026-10-30',extra={})=>({id:'f',title:'Consultar concurso',status:'hold',priority:'medium',context:'personal',project:null,notes:'https://example.com',due:'2020-01-01',recurrence:{...f.makeFollowup(date),...extra}});
 assert.equal(f.followupToday(new Date('2026-10-31T01:00:00Z')),'2026-10-30');
 let task=base(),done=f.completeFollowup(task,'2026-10-30');
 assert.equal(done.status,'hold');assert.equal(done.recurrence.next,'2026-11-06');assert.equal(done.recurrence.lastCheck.date,'2026-10-30');assert.ok(!('history' in done.recurrence));assert.ok(!('total' in done.recurrence));assert.equal(done.notes,task.notes);assert.equal(done.due,'2020-01-01');assert.equal(f.validateFollowup(done),'');assert.equal(f.completeFollowup(done,'2026-10-30'),done,'Double click never registers a future cycle');assert.equal(task.recurrence.lastCheck,null);
 // A check is a receipt until the next cycle, never an inferred completion.
 const receiptBefore=JSON.stringify(done);
 assert.equal(f.followupChecked(task,'2026-10-30'),false);
 assert.equal(f.followupChecked(base('2027-01-01'),'2026-10-30'),false,'Future unconsulted tasks stay empty');
 assert.equal(f.followupChecked(done,'2026-10-30'),true);
 assert.equal(f.followupChecked(done,'2026-11-05'),true,'Weekly receipt survives the following days');
 assert.equal(f.followupChecked(done,'2026-11-06'),false,'Next date clears the receipt');
 assert.equal(f.followupChecked(done,'2026-11-07'),false,'Overdue checks remain empty');
 assert.equal(f.followupChecked(done,'2026-10-29'),false,'Never show a future history entry as done');
 assert.equal(f.followupChecked({...done,locked:true},'2026-10-31'),true);
 assert.equal(f.followupChecked({...done,recurrence:{...done.recurrence,next:'2026-11-10'}},'2026-10-31'),false,'Rescheduling does not inherit an old receipt');
 assert.equal(JSON.stringify(done),receiptBefore,'Visual rollover never changes persisted data');
 const daily=f.completeFollowup(base('2026-10-30',{every:1}),'2026-10-30');
 assert.equal(f.followupChecked(daily,'2026-10-30'),true);assert.equal(f.followupChecked(daily,'2026-10-31'),false);
 for(const mode of ['after','fixed']){
  const late=f.completeFollowup(base('2026-10-30',{mode}),'2026-11-09');
  assert.equal(f.followupChecked(late,'2026-11-09'),true);assert.equal(f.followupChecked(late,late.recurrence.next),false);
  const second=f.completeFollowup(late,late.recurrence.next);
  assert.equal(f.followupChecked(second,late.recurrence.next),true);assert.notEqual(second.recurrence.lastCheck.id,late.recurrence.lastCheck.id);
 }
 assert.equal(f.nextFollowupDate({...task.recurrence,mode:'fixed'},'2026-11-09'),'2026-11-13','Fixed schedule skips missed checks');
 assert.equal(f.nextFollowupDate({...task.recurrence,mode:'after'},'2026-11-09'),'2026-11-16');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2026-01-31'),mode:'fixed',unit:'months',every:1},'2026-01-31'),'2026-02-28');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2024-01-31'),mode:'fixed',unit:'months',every:1,next:'2024-02-29'},'2024-02-29'),'2024-03-31','Monthly fixed schedule never drifts');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2024-01-31'),unit:'months',every:1},'2024-02-29'),'2024-03-29');
 const weekly={...f.makeFollowup('2026-10-30'),mode:'fixed',unit:'weeks',every:1,weekdays:[1,5]};
 assert.equal(f.nextFollowupDate(weekly,'2026-10-30'),'2026-11-02');assert.equal(f.nextFollowupDate({...weekly,every:2},'2026-10-30'),'2026-11-09');
 assert.equal(f.nextFollowupDate({...f.makeFollowup('2026-10-30'),unit:'days',every:1},'2026-10-30'),'2026-10-31');
 assert.equal(f.completeFollowup({...task,locked:true},'2026-10-30').recurrence.lastCheck,null);
 const legacy={...task,recurrence:{...task.recurrence,version:1,state:'paused',history:[{id:'old',date:'2026-10-23',at:1234,scheduledFor:'2026-10-23',next:'2026-10-30',note:'Old comment'}],total:1}};
 const legacyBefore=JSON.stringify(legacy);assert.equal(f.validateFollowup(legacy),'');
 assert.equal(f.followupDue(legacy,'2026-10-30'),true,'Individual pause is no longer a separate lifecycle');
 const upgraded=f.completeFollowup(legacy,'2026-10-30');assert.equal(upgraded.recurrence.version,2);assert.ok(!JSON.stringify(upgraded).includes('Old comment'));assert.equal(JSON.stringify(legacy),legacyBefore,'Never migrate baselines in place');
 assert.equal(f.followupChecked({...legacy,recurrence:{...legacy.recurrence,next:'2026-10-30'}},'2026-10-29'),true,'Legacy visual check stays available');
 const closed=domain.closeProjectTask(task);assert.equal(closed.status,'done');assert.equal(closed.recurrence,null);assert.equal(domain.closeProjectTask(closed),closed);
 assert.equal(domain.patchTask(task,{status:'doing'}).status,'hold');assert.equal(domain.patchTask({...task,locked:true},{status:'done'}).locked,true);
 const ordinary={id:'o',status:'hold',followUp:'2026-10-30',due:'2026-10-31'};assert.equal(domain.patchTask(ordinary,{status:'done'}).status,'done');assert.equal(domain.taskDate(ordinary),'2026-10-30');assert.equal(domain.taskDate(task),'2026-10-30');
 assert.ok(f.validateFollowup(base('2026-02-30')));assert.ok(f.validateFollowup(base('2026-10-30',{every:0})));assert.ok(f.validateFollowup({...task,status:'done'}));assert.equal(f.validateFollowup(ordinary),'');
 let many=base('2025-01-01',{every:1});for(let i=0;i<205;i++)many=f.completeFollowup(many,many.recurrence.next);assert.ok(!('history' in many.recurrence));assert.ok(!('total' in many.recurrence));assert.equal(f.validateFollowup(many),'');
 assert.ok(f.validateFollowup({...done,recurrence:{...done.recurrence,lastCheck:{...done.recurrence.lastCheck,note:'Not allowed'}}}));
 assert.equal(f.hasFollowupNotice([{...task,project:'p'}],[{id:'p',status:'paused'}],'2026-10-30'),false);assert.equal(f.hasFollowupNotice([{...task,project:'p'}],[{id:'p',status:'active'}],'2026-10-30'),true);assert.equal(f.taskVisibleOutsideProject(ordinary,[]),true);
 assert.equal(f.followupDateInfo(task,'2026-10-31').text,'1d atrasado');assert.equal(f.followupDateInfo(task,'2026-10-30').text,'Hoje');
 let slots=[],cursor=0;React.useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];};React.useMemo=fn=>fn();React.useRef=value=>({current:value});React.useEffect=()=>{};
 const walk=(node,result=[])=>{if(Array.isArray(node))node.forEach(n=>walk(n,result));else if(node?.props){result.push(node);walk(node.props.children,result);}return result;};
 const View=require(path.join(folder,'components/TasksView')).default,today=f.followupToday();
 let projects=[{id:'p',status:'paused',name:'Projeto pausado',context:'personal',milestones:[]}];
 let tasks=[{...ordinary,title:'Aguardando',priority:'medium',context:'personal'},{...base(today),id:'today'},{...base('2999-01-01'),id:'future'},{...base(today),id:'hidden',project:'p'},{...ordinary,id:'ordinary-hidden',title:'Oculta',priority:'medium',context:'personal',project:'p'}];
 const render=()=>{cursor=0;return walk(View({tasks,projects,context:'all',sub:'status',setTasks:fn=>tasks=fn(tasks),onOpenProject(){}}));};
 let nodes=render();assert.deepEqual(nodes.filter(n=>n.type==='li').map(n=>n.key),['o','today','future']);assert.ok(!nodes.some(n=>n.props.className==='seg-row followup-switch'),'No separate view');assert.ok(nodes.some(n=>n.props.children==='On hold / Follow-up'));
 const check=nodes.find(n=>n.props['aria-label']==='Acompanhamento feito: Consultar concurso'&&!n.props.disabled);check.props.onChange();assert.equal(tasks.find(t=>t.id==='today').status,'hold');assert.equal(tasks.find(t=>t.id==='today').recurrence.lastCheck.date,today);assert.equal(render().filter(n=>n.type==='li').length,3,'Remains in hold after checking');
 const taskRow=id=>render().find(n=>n.type==='li'&&n.key===id),rowCheck=id=>walk(taskRow(id)).find(n=>n.type==='input'&&n.props.type==='checkbox');
 assert.equal(rowCheck('today').props.checked,true);assert.equal(rowCheck('today').props.disabled,true);
 assert.ok(!taskRow('today').props.className.includes('done'),'Visual receipt never strikes out the title');
 assert.equal(rowCheck('future').props.checked,false);assert.equal(rowCheck('o').props.checked,false);
 const justChecked=tasks.find(t=>t.id==='today'),historyBefore=JSON.stringify(justChecked.recurrence.lastCheck);
 rowCheck('today').props.onChange();assert.equal(JSON.stringify(tasks.find(t=>t.id==='today').recurrence.lastCheck),historyBefore,'Repeated click cannot add a check');
 // Simulate the day state delivered by useDateRollover while this view stays mounted.
 slots[7]=justChecked.recurrence.next;
 assert.equal(rowCheck('today').props.checked,false);assert.equal(rowCheck('today').props.disabled,false);
 assert.equal(JSON.stringify(tasks.find(t=>t.id==='today').recurrence.lastCheck),historyBefore);
 slots[7]=today;
 projects=projects.map(p=>({...p,status:'active'}));assert.equal(render().filter(n=>n.type==='li').length,5,'Resuming project restores both kinds');projects=projects.map(p=>({...p,status:'paused'}));nodes=render();nodes.find(n=>n.props['aria-label']==='Buscar').props.onChange({target:{value:'Oculta'}});assert.equal(render().filter(n=>n.type==='li').length,0,'Paused tasks stay hidden during search');
 // The same details editor configures type, interval and manual lifecycle.
 slots=[];cursor=0;const Detail=require(path.join(folder,'components/TaskDetail')).default;let update;
 nodes=walk(Detail({task:{...ordinary,title:'Normal',notes:'',context:'personal',priority:'medium'},projects:[],update:(id,p)=>{update=p;},onClose(){}}));nodes.find(n=>n.props.role==='switch').props.onClick();assert.equal(update.status,'hold');assert.equal(update.recurrence.version,2);
 assert.ok(!nodes.some(n=>n.props['aria-label']==='Tipo da tarefa'));assert.equal(nodes.find(n=>n.props.role==='switch').props['aria-checked'],false);
 slots=[];cursor=0;const configured=base(today),configuredNodes=walk(Detail({task:configured,projects:[],update:(id,p)=>{update=p;},onClose(){}}));const fupToggle=configuredNodes.find(n=>n.props.role==='switch');assert.equal(fupToggle.props['aria-checked'],true);
 assert.ok(configuredNodes.findIndex(n=>n.type==='textarea'&&n.props.value===configured.notes)<configuredNodes.findIndex(n=>n.type?.name==='FollowupFields'),'Main task fields precede all recurrence fields');
 fupToggle.props.onClick();assert.deepEqual(update,{recurrence:null,status:'hold',completedAt:null},'Disabling recurrence preserves the base task fields and status');
 const checkedTask=f.completeFollowup(configured,today);assert.equal(checkedTask.recurrence.version,2);slots=[];cursor=0;const afterCheck=walk(Detail({task:checkedTask,projects:[],update(){},onClose(){}}));assert.equal(afterCheck.find(n=>n.props.role==='switch').props['aria-checked'],true,'A check never turns the toggle off');
 slots=[];cursor=0;const lockedDetail=walk(Detail({task:{...configured,locked:true},projects:[],update(){throw Error('Locked toggle wrote');},onClose(){}}));assert.equal(lockedDetail.find(n=>n.props.role==='switch').props.disabled,true);lockedDetail.find(n=>n.props.role==='switch').props.onClick();
 slots=[];let current=base(today);const Fields=require(path.join(folder,'components/FollowupFields')).default,fields=()=>{cursor=0;return walk(Fields({task:current,set:patch=>current=domain.patchTask(current,patch)}));};
 assert.ok(!fields().some(n=>n.type==='textarea'||n.type==='details'||['Encerrar acompanhamento','Pausar acompanhamento','Retomar acompanhamento'].includes(n.props.children)));
 fields().find(n=>n.props.children==='Acompanhamento feito').props.onClick();assert.equal(current.recurrence.lastCheck.date,today);assert.equal(current.status,'hold');assert.equal(current.notes,base(today).notes);
 global.window={confirm(){throw Error('Disabling the toggle should not prompt');}};
 for(const candidate of [checkedTask,{...legacy,title:'Legacy',notes:'Keep me'},{...legacy,status:'done',recurrence:{...legacy.recurrence,state:'ended'}}]){
  slots=[];cursor=0;const detail=walk(Detail({task:candidate,projects:[],update:(id,patch)=>{current=domain.patchTask(candidate,patch);},onClose(){}}));
  detail.find(n=>n.props.role==='switch').props.onClick();assert.equal(current.status,'hold');assert.equal(current.recurrence,null);assert.equal(current.notes,candidate.notes);assert.equal(current.due,candidate.due);assert.equal(current.completedAt,null);
 }
 let approve=false;
 // Project actions explicitly confirm and end recurrences, including individually paused ones.
 slots=[];const ProjectView=require(path.join(folder,'components/ProjectsView')).default;let projectList=[{id:'parent',name:'Concurso',context:'personal',status:'active',area:'',due:null,description:'',attachments:[],milestones:[]}],message='';
 tasks=[{...base(today),id:'linked',project:'parent'},{...ordinary,id:'linked-ordinary',project:'parent',title:'Aguardando retorno',context:'personal',priority:'medium'}];
 const projectTree=()=>{cursor=0;return walk(ProjectView({tasks,projects:projectList,setTasks:fn=>tasks=fn(tasks),setProjects:fn=>projectList=fn(projectList),context:'all',sub:'ativos',selected:'parent',onSelect(){}}));};
 const setProjectStatus=value=>projectTree().find(n=>n.type==='select'&&n.props.value===projectList[0].status).props.onChange({target:{value}});
 global.window={confirm:text=>{message=text;return approve;}};approve=false;setProjectStatus('done');assert.equal(projectList[0].status,'active');assert.equal(tasks[0].recurrence.version,2);assert.ok(message.includes('follow-ups')&&message.includes('em aberto'));
 approve=true;setProjectStatus('done');assert.equal(tasks[0].status,'done');assert.equal(tasks[0].recurrence,null);assert.equal(tasks[1].status,'done');assert.equal(projectList[0].status,'done');
 setProjectStatus('active');assert.equal(tasks[0].recurrence,null);
 // Project lists use the same receipt and live date as the global task list.
 tasks=[{...checkedTask,id:'project-receipt',project:'parent'},{...ordinary,id:'project-ordinary',project:'parent'}];
 const projectCheck=id=>walk(projectTree().find(n=>n.type==='li'&&n.key===id)).find(n=>n.type==='input'&&n.props.type==='checkbox');
 assert.equal(projectCheck('project-receipt').props.checked,true);assert.equal(projectCheck('project-receipt').props.disabled,true);
 assert.equal(projectCheck('project-ordinary').props.checked,false);
 slots[1]=checkedTask.recurrence.next;
 assert.equal(projectCheck('project-receipt').props.checked,false);assert.equal(projectCheck('project-receipt').props.disabled,false);
 tasks[0]={...tasks[0],locked:true};assert.equal(projectCheck('project-receipt').props.disabled,true);
 console.log('PASSOU: follow-ups em On hold, recorrência após consulta/calendário fixo, dias da semana, meses/bissexto, idempotência, prazo informativo, check sem histórico, toggle de desativação, bloqueio, pausa de projetos, filtros e ciclo manual.');
}finally{Object.assign(React,saved);if(oldWindow===undefined)delete global.window;else global.window=oldWindow;fs.rmSync(folder,{recursive:true,force:true});}
