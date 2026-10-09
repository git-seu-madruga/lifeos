const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),swc=require('next/dist/build/swc');
const folder=path.resolve('.backdrop-test');fs.mkdirSync(folder,{recursive:true});
try{
 const target=path.join(folder,'gesture.cjs');fs.writeFileSync(target,swc.transformSync(fs.readFileSync('lib/backdropGesture.js','utf8'),{filename:'backdropGesture.js',jsc:{parser:{syntax:'ecmascript'},target:'es2022'},module:{type:'commonjs'}}).code);
 const {createBackdropGesture}=require(target),guard=createBackdropGesture(),backdrop={matches:s=>s==='.overlay'},text={matches:()=>false},button={matches:()=>false};
 const down=(target,x=10,y=10,id=1)=>guard.down({target,clientX:x,clientY:y,pointerId:id});
 const click=(target,detail=1)=>guard.click({target,detail});
 down(text);assert.equal(click(backdrop),false,'Seleção iniciada no texto não fecha');
 down(text);guard.move({pointerId:1,clientX:150,clientY:30});assert.equal(click(backdrop),false,'Arrastar para fora não fecha');
 down(backdrop);assert.equal(click(backdrop),true,'Clique direto no fundo fecha');
 down(backdrop);guard.move({pointerId:1,clientX:80,clientY:10});assert.equal(click(backdrop),false,'Arrastar iniciado no fundo também não fecha');
 down(button);assert.equal(click(button),true,'Botões internos mantêm ação');
 down(text);assert.equal(click(text),true,'Seleção interna não é interceptada');
 down(backdrop);guard.cancel();assert.equal(click(backdrop),false,'Gesto cancelado não fecha');
 down(backdrop,0,0,2);assert.equal(click(backdrop),true,'Novo toque continua funcionando depois de gesto cancelado');
 assert.equal(click(backdrop,0),true,'Ativação sem ponteiro preservada');
 console.log('PASSOU: seleção de texto, arraste para fora, movimento no fundo, clique direto, botões internos, cancelamento e novo toque.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
