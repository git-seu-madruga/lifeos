const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc');
const root=path.resolve('.nutrition-test');fs.mkdirSync(path.join(root,'lib/server'),{recursive:true});
for(const name of ['nutrition','habits'])fs.writeFileSync(path.join(root,'lib',name+'.js'),swc.transformSync(fs.readFileSync('lib/'+name+'.js','utf8'),{jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
fs.writeFileSync(path.join(root,'lib/server/foodSearch.js'),swc.transformSync(fs.readFileSync('lib/server/foodSearch.js','utf8'),{jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
let count=0,fetches=0;const cache=new Map();
class AppError extends Error{constructor(message,status=422){super(message);this.status=status;}}
fs.writeFileSync(path.join(root,'lib/server/auth.js'),'');fs.writeFileSync(path.join(root,'lib/server/coordination.js'),'');
require.cache[path.join(root,'lib/server/auth.js')]={exports:{AppError,legacyEmail:()=> 'test@example.test'}};
require.cache[path.join(root,'lib/server/coordination.js')]={exports:{redis:async c=>c[0]==='GET'?cache.get(c[1]):c[0]==='SET'?(cache.set(c[1],c[2]),'OK'):++count}};
(async()=>{try{
 const n=require(path.join(root,'lib/nutrition')),s=require(path.join(root,'lib/server/foodSearch'));
 const food=n.normalizeFood({id:'taco:3',name:'Arroz cozido',kcal100:128,unit:'g',portionQuantity:50,source:'TACO'});
 assert.equal(n.foodKcal(food,160),204.8);assert.equal(n.foodKcal(food,2,'portion'),128);assert.equal(n.foodIcon(food),'rice');assert.equal(n.safeFoodImage('https://evil.test/photo.png'),'');assert.equal(n.safeFoodImage('javascript:alert(1)'),'');
 assert.equal(n.searchFoods([food],'ARROZ COZÍDO').length,1);
 const recipe=n.recipeFood('Receita',[{food,quantity:200,measure:'g'},{food,quantity:100,measure:'g'}],400);assert.equal(recipe.kcal100,96);
 const date='2026-10-01',day={id:'day',name:'Rotina',type:'day',date,data:{uid:'day:'+date,target:670,water:true,strength:true,sleepHours:7}},entry=(id,kcal,inside)=>({id,name:'Alimento',type:'entry',date,data:{uid:id,food:{...food,kcal100:kcal},quantity:100,measure:'g',kcal,inside,meal:'Almoço'}});
 let records=[day,entry('inside',540,true),entry('outside',60,false)],stats=n.nutritionDay(records,date);
 assert.equal(stats.adherence,.9);assert.equal(stats.quality,.9);assert.equal(stats.remaining,70);
 assert.equal(n.nutritionDay([{...day,data:{...day.data,aerobic:true}},...records.slice(1)],date).quality,.9,'Dois exercícios não duplicam o peso');
 assert.ok(Math.abs(n.nutritionDay([{...day,data:{...day.data,strength:false}},...records.slice(1)],date).quality-.72)<1e-9);
 assert.ok(Math.abs(n.nutritionDay([day,entry('inside',600,true),entry('outside',400,false)],date).quality-.18)<1e-9,'Acima da meta perde os 70%, e adesão multiplica toda a base');
 assert.equal(n.nutritionDay([day],date).quality,null,'Sem alimentação não inventa qualidade');
 assert.equal(n.nutritionSummary(records,'2026-10').logged,1);assert.equal(n.nutritionSummary(records,'2026-10').good,1);assert.equal(n.nutritionSummary(records,'2025').quality,null);
 assert.equal(n.validateNutrition(day),'');assert.ok(n.validateNutrition({...day,data:{...day.data,sleepHours:25}}));assert.ok(n.validateNutrition({...day,date:'2026-02-30'}));assert.ok(n.validateNutrition({...records[1],data:{...records[1].data,kcal:1}}));
 const recipeRecord={id:'recipe',name:recipe.name,type:'food',date:null,data:{uid:'recipe',food:recipe,favorite:false,archived:false,ingredients:[{food,quantity:300,measure:'g'}],yieldGrams:400}};assert.equal(n.validateNutrition(recipeRecord),'');assert.ok(n.validateNutrition({...recipeRecord,data:{...recipeRecord.data,yieldGrams:200}}));
 const taco=require('../lib/data/taco.json');assert.equal(taco.length,591);assert.equal(new Set(taco.map(p=>p.id)).size,591);assert.ok(taco.every(p=>n.validFood(p)));assert.ok(taco.every(p=>p.category!=='Número do'));assert.equal(taco.find(p=>p.id==='taco:3').kcal100,128.2585);
 for(const icon of n.FOOD_ICONS){const b=fs.readFileSync('public/emoji/fluent-food/'+icon+'.png');assert.equal(b.subarray(1,4).toString(),'PNG');}
 const product={code:'1234567890123',product_name:'Produto',product_name_pt:'Produto brasileiro',brands:'Marca',quantity:'1 L',serving_quantity:200,serving_quantity_unit:'ml',nutriments:{'energy-kcal_100g':60},image_front_small_url:'https://images.openfoodfacts.org/product.png'};
 let result=s.normalizeProducts({products:[product,{...product,code:'missing',nutriments:{}},{...product,code:'zero',nutriments:{'energy-kcal_100g':0}}]});assert.equal(result.length,2);assert.equal(result[0].unit,'ml');assert.equal(result[0].portionQuantity,200);assert.equal(result[0].kcal100,60);assert.equal(result[1].kcal100,0);
 assert.equal(s.normalizeProducts({products:[{...product,nutriments:{energy_100g:418.4}}]})[0].kcal100,100);
 assert.equal(s.normalizeProducts({products:[{...product,nutriments:{'energy-kcal_100g':'NaN'}}]}).length,0);
 global.fetch=async(url,options)=>{fetches++;assert.ok(String(url).startsWith('https://world.openfoodfacts.org/'));assert.ok(options.headers['User-Agent'].includes('LifeOS'));return Response.json({products:[product]});};
 const products=await s.searchProducts('iogurte');assert.equal(products.length,1);await s.searchProducts('IOGURTE');assert.equal(fetches,1,'Cache compartilhado evita consultas repetidas');
 count=8;await assert.rejects(()=>s.searchProducts('outra busca'),e=>e.status===429);assert.equal(fetches,1,'Limite bloqueia antes da consulta externa');
 console.log('PASSOU: TACO oficial, kcal e porções, receitas, fórmula de qualidade, médias sem dias vazios, validação, ícones, produtos sem dados, kcal/kJ, cache e limites da busca.');
 }finally{fs.rmSync(root,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
