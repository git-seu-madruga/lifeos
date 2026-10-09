const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve('.wellness-test');
for(const dir of ['lib','components']){fs.mkdirSync(path.join(root,dir),{recursive:true});for(const name of fs.readdirSync(dir)){if(!name.endsWith('.js'))continue;fs.writeFileSync(path.join(root,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
try{
 const {validateWellness,upsertWellness,latestMeasurements}=require(path.join(root,'lib/wellness')),day=require(path.join(root,'lib/habits')).habitToday();
 const pressure={id:'p1',name:'Pressão',date:day,type:'pressure',data:{time:'09:00',systolic:124,diastolic:76,bpm:62}};
 assert.equal(validateWellness(pressure),'');assert.ok(validateWellness({...pressure,data:{...pressure.data,bpm:0}}));assert.ok(validateWellness({...pressure,date:'2999-01-01'}));assert.ok(validateWellness({...pressure,date:'2026-02-30'}));
 const body={...pressure,type:'body',data:{weight:136,fat:null}};assert.equal(validateWellness(body),'');assert.ok(validateWellness({...body,data:{weight:136,fat:101}}));assert.equal(validateWellness({...body,data:{weight:136,fat:28.4}}),'');
 const cycle={...pressure,type:'cycle',data:{subject:'leticiacost3@gmail.com',menstruation:'Sim',flow:'Leve',cramps:'Leve'}};assert.equal(validateWellness(cycle,'cycle'),'');assert.ok(validateWellness({...cycle,data:{...cycle.data,subject:'periclesbernardes@gmail.com'}},'cycle'));
 assert.equal(upsertWellness([pressure],{...pressure,data:{...pressure.data,bpm:64}}).length,1);assert.equal(latestMeasurements([pressure,{...pressure,id:'p2',data:{...pressure.data,time:'10:00'}}],'pressure')[0].id,'p2');
 const View=require(path.join(root,'components/WellnessView')).default;
 const html=renderToStaticMarkup(React.createElement(View,{remote:{user:{id:'test'},wellness:[pressure,body],cycle:[],setWellness(){},habits:[],habitLogs:[],habitsConfigured:true,wellnessConfigured:true,cycleConfigured:true}}));
 for(const label of ['Bem-estar','Ciclo da Letícia','Pressão e BPM','Peso e gordura','Seu progresso','Mostrar hábitos encerrados','Atualize quando houver uma nova medição'])assert.ok(html.includes(label),label);
 assert.ok(html.includes('well-petal'));assert.ok(html.includes('habit-matrix'));
 const nav=require(path.join(root,'lib/nav')).NAV;assert.ok(nav.some(p=>p.id==='bemestar'));assert.ok(!nav.some(p=>p.id==='habitos'));
 console.log('PASSOU: validação de medidas e ciclo, datas, campos opcionais, histórico, painel e preservação do resumo de hábitos.');
}finally{fs.rmSync(root,{recursive:true});}
