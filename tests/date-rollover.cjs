const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc'),React=require('react');
const root=fs.mkdtempSync(path.join(process.cwd(),'.date-rollover-test-')),old={useState:React.useState,useEffect:React.useEffect,useRef:React.useRef,Date:global.Date,window:global.window,document:global.document,setInterval:global.setInterval,clearInterval:global.clearInterval};
for(const file of ['useDateRollover','habits','illustrations'])fs.writeFileSync(path.join(root,file+'.js'),swc.transformSync(fs.readFileSync('lib/'+file+'.js','utf8'),{jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
let now=Date.parse('2026-12-31T23:59:00Z'),states=[],refs=[],effects=[],pending=[],index=0,rindex=0,eindex=0,dirty=false,blocked=false,value,choose,currentDefault;const intervals=new Map();let intervalId=0;
global.Date=class extends old.Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
global.window=new EventTarget();global.document=new EventTarget();document.hidden=false;
global.setInterval=fn=>{intervals.set(++intervalId,fn);return intervalId;};global.clearInterval=id=>intervals.delete(id);
React.useState=initial=>{const i=index++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],next=>{const value=typeof next==='function'?next(states[i]):next;if(value!==states[i]){states[i]=value;dirty=true;}}];};
React.useRef=initial=>{const i=rindex++;return refs[i]||(refs[i]={current:initial});};
React.useEffect=(fn,deps)=>{const i=eindex++,before=effects[i];if(!before||!deps||deps.some((v,j)=>!Object.is(v,before.deps?.[j]))||deps.length!==before.deps?.length)pending.push(()=>{before?.cleanup?.();effects[i]={deps,cleanup:fn()};});};
try{
 const {habitToday}=require(path.join(root,'habits')),{useDateRollover}=require(path.join(root,'useDateRollover'));
 const render=()=>{let turns=0;do{assert.ok(++turns<10,'No render loop');dirty=false;index=rindex=eindex=0;pending=[];const [day,setDay]=React.useState(habitToday);[choose,currentDefault]=useDateRollover(day,setDay,{blocked:()=>blocked});value=day;for(const effect of pending)effect();}while(dirty);return value;};
 assert.equal(render(),'2026-12-31');now=old.Date.parse('2027-01-01T02:59:00Z');window.dispatchEvent(new Event('lifeos-refresh-date'));assert.equal(render(),'2026-12-31','Ainda é 31/12 em Brasília');
 now=old.Date.parse('2027-01-01T03:01:00Z');assert.equal(currentDefault(),'2027-01-01','Formulário aberto agora usa data fresca antes do timer');window.dispatchEvent(new Event('lifeos-refresh-date'));assert.equal(render(),'2027-01-01','Atualizar acompanha virada de ano');
 choose('2026-12-15');render();window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('lifeos-refresh'));assert.equal(render(),'2026-12-15','Histórico escolhido manualmente é preservado');
 choose(habitToday());render();blocked=true;now=old.Date.parse('2027-01-02T12:00:00Z');window.dispatchEvent(new Event('focus'));assert.equal(render(),'2027-01-01');assert.equal(currentDefault(),'2027-01-01','Formulário em preenchimento mantém sua data');blocked=false;assert.equal(render(),'2027-01-02','Próxima entrada volta ao dia atual após terminar o formulário');
 document.hidden=true;now=old.Date.parse('2027-01-03T12:00:00Z');for(const interval of intervals.values())interval();assert.equal(states[0],'2027-01-02','Timer não atua com a página oculta');document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(render(),'2027-01-03');
 now=old.Date.parse('2027-01-04T12:00:00Z');window.dispatchEvent(new Event('pageshow'));assert.equal(render(),'2027-01-04','Retorno de página congelada atualiza o padrão');
 choose('');render();window.dispatchEvent(new Event('lifeos-refresh-date'));assert.equal(render(),'','Digitação incompleta não é substituída');
 for(const effect of effects)effect?.cleanup?.();assert.equal(intervals.size,0,'Timers removidos ao sair da tela');
 console.log('PASSOU: meia-noite de Brasília, virada de ano, atualização manual, foco/visibilidade, página congelada, data manual, formulário em edição e limpeza de timers.');
}finally{React.useState=old.useState;React.useEffect=old.useEffect;React.useRef=old.useRef;global.Date=old.Date;global.setInterval=old.setInterval;global.clearInterval=old.clearInterval;if(old.window===undefined)delete global.window;else global.window=old.window;if(old.document===undefined)delete global.document;else global.document=old.document;fs.rmSync(root,{recursive:true,force:true});}
