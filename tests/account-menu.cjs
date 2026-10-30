const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),swc=require('next/dist/build/swc'),React=require('react');
const root=fs.mkdtempSync(path.join(process.cwd(),'.account-menu-test-'));
for(const file of ['components/AccountMenu.js','lib/useBackNavigation.js','lib/backNavigation.js','lib/editingGuard.js']){const out=path.join(root,file);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,swc.transformSync(fs.readFileSync(file,'utf8'),{jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}
const original={useState:React.useState,useRef:React.useRef,useEffect:React.useEffect};let slots=[],cursor=0,locked=0,exited=0;
React.useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];};React.useRef=value=>({current:value});React.useEffect=()=>{};
const all=(node,test)=>{if(!node||typeof node!=='object')return [];return [...(test(node)?[node]:[]),...React.Children.toArray(node.props?.children).flatMap(child=>all(child,test))];};
const text=node=>typeof node==='string'?node:React.Children.toArray(node?.props?.children).map(text).join('');
try{
 const Menu=require(path.join(root,'components/AccountMenu')).default;let user={name:'Pessoa',email:'p@example.com',temporary:true,expiresAt:Date.now()+60000};const render=()=>{cursor=0;return Menu({user,onLock:()=>locked++,onLogout:()=>exited++,onSessions(){},onBackup(){}});};
 let tree=render();all(tree,n=>n.props?.className==='account-trigger')[0].props.onClick();tree=render();const lock=all(tree,n=>n.props?.role==='menuitem'&&text(n).includes('Bloquear sessão'));assert.equal(lock.length,1);lock[0].props.onClick();assert.equal(locked,1);assert.equal(exited,0);assert.equal(all(render(),n=>n.props?.role==='menu').length,0,'Fecha menu ao bloquear');
 user={...user,temporary:false};slots=[];tree=render();all(tree,n=>n.props?.className==='account-trigger')[0].props.onClick();tree=render();assert.equal(all(tree,n=>text(n).includes('Bloquear sessão')&&n.props?.role==='menuitem').length,0);assert.equal(all(tree,n=>n.props?.role==='menuitem'&&text(n)==='Computadores autorizados').length,1);all(tree,n=>n.props?.role==='menuitem'&&text(n)==='Sair')[0].props.onClick();assert.equal(exited,1);
 console.log('PASSOU: menu oferece bloqueio manual somente na sessão temporária, fecha ao bloquear e preserva sair/gestão do login Google.');
}finally{Object.assign(React,original);fs.rmSync(root,{recursive:true,force:true});}
