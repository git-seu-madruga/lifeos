const assert=require('node:assert/strict'),path=require('path'),fs=require('fs'),swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const folder=path.resolve('.birthday-test');
for(const dir of ['lib','components']){fs.mkdirSync(path.join(folder,dir),{recursive:true});for(const name of fs.readdirSync(dir)){if(!name.endsWith('.js'))continue;fs.writeFileSync(path.join(folder,dir,name),swc.transformSync(fs.readFileSync(path.join(dir,name),'utf8'),{filename:name,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2022'},module:{type:'commonjs'}}).code);}}
try{
 const b=require(path.join(folder,'lib/birthdays'));const known={id:'a',name:'Ána',day:5,month:10,year:1990,notes:'Prima\nhttps://example.com'},unknown={id:'b',name:'Bia',day:7,month:10,year:null},today=new Date(2026,9,5,12);
 assert.equal(b.parseBirthday('07/10').person.year,null);assert.equal(b.validateBirthday({...known,notes:'Informação\nem duas linhas'},today),'');assert.ok(b.validateBirthday({...known,notes:'a'.repeat(5001)},today));assert.ok(b.validateBirthday({...known,notes:123},today));assert.equal(b.parseBirthday('07/10/1990').person.year,1990);assert.ok(b.parseBirthday('31/04').error);assert.ok(b.parseBirthday('29/02/1991').error);assert.equal(b.parseBirthday('29/02').person.day,29);
 assert.equal(b.contactFromInbox({text:'Ana\n05/10/1990'}).person.name,'Ana');assert.ok(b.contactFromInbox({text:'Ana'}).error);assert.ok(b.contactFromInbox({text:'Ana\n05/10\nextra'}).error);
 assert.equal(b.nextBirthday(known,today).age,36);assert.equal(b.nextBirthday(known,today).days,0);assert.equal(b.nextBirthday(unknown,today).age,null);assert.equal(b.nextBirthday(known,new Date(2026,9,6,12)).age,37);
 assert.equal(b.nextBirthday({name:'X',day:1,month:1,year:null},new Date(2026,11,30,12)).days,2);assert.equal(b.birthdayInYear({day:29,month:2,year:null},2026).getDate(),28);
 assert.equal(b.birthdaySummary([unknown,known],'ana',2026,10,today).contacts.length,1);assert.equal(b.birthdaySummary([unknown,known],'',2026,10,today).week.length,2);assert.equal(b.birthdayLabel(unknown),'07/10');assert.ok(b.validateBirthday({...known,year:2027},today));
 const Icon=require(path.join(folder,'components/TabIcon')).default;
 const iconFor=people=>renderToStaticMarkup(React.createElement(Icon,{id:'aniversarios',highlighted:b.birthdaySummary(people,'',2026,10,today).week.length>0}));
 assert.ok(iconFor([known]).includes('birthday-notice'),'Hoje destaca o ícone');
 assert.ok(iconFor([{name:'Em seis dias',day:11,month:10,year:null}]).includes('birthday-notice'));
 assert.ok(!iconFor([{name:'Em sete dias',day:12,month:10,year:null}]).includes('birthday-notice'),'Mesmo intervalo da lista Próximos 7 dias');
 assert.ok(!iconFor([]).includes('birthday-notice'),'Sem contatos restaura o ícone padrão');
 assert.ok(b.birthdaySummary([{name:'Ano novo',day:1,month:1,year:null}],'',2026,12,new Date(2026,11,30,12)).week.length);
 const View=require(path.join(folder,'components/BirthdaysView')).default;const html=renderToStaticMarkup(React.createElement(View,{contacts:[known,unknown],configured:true,setContacts:()=>{}}));assert.ok(!html.includes('<h1>Aniversários</h1>'));assert.ok(html.includes('+ Novo contato'));assert.ok(html.includes('birthday-contact-notes'));assert.ok(html.includes('href="https://example.com/"'));assert.ok(html.includes('07/10'));assert.ok(!html.includes('NaN'));assert.ok(html.includes('Excluir'));const setup=renderToStaticMarkup(React.createElement(View,{configured:false}));assert.ok(setup.includes('NOTION_CONTACTS_DATABASE_ID'));
 console.log('PASSOU: aniversários com ano opcional, idade, virada de ano, 29/02, busca, validação do Inbox e renderização da nova aba.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
