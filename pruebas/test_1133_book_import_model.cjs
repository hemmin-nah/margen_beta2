'use strict';
const assert=require('node:assert/strict');
const {inspect,prepare,append}=require('../frontend/assets/margen-book-import-model.js');
const book={id:'id-book',name:'La historia',chapters:[{id:'c1',title:'Inicio',html:'<p>Hola</p>',characterId:'p1'}],boards:[{id:'b1',elements:[{id:'n1',groupId:'g1'}],strokes:[]}],notes:[],characters:[{id:'p1',title:'Ana'}],settings:[],outlines:[],chronologies:[],coverData:'data:image/png;base64,Zm9v'};
const original={format:'MARGEN_BOOK',formatVersion:1,book};
const valid=inspect(original);assert.deepEqual(valid,book);assert.notEqual(valid,book);valid.name='TEMP';assert.equal(book.name,'La historia');
for(const invalid of [null,{}, {version:1,projects:[]},{format:'MARGEN_BOOK',formatVersion:2,book},
  {format:'MARGEN_BOOK',formatVersion:1,book:{...book,chapters:undefined}},
  {format:'MARGEN_BOOK',formatVersion:1,book:{...book,id:''}},
  {format:'MARGEN_BOOK',formatVersion:1,book:{...book,_margenLazy:true}}]){
  assert.throws(()=>inspect(invalid));
}
const first=prepare(book,['different'],[],['Other'],()=> 'new-id');
assert.equal(first.book.id,'id-book');assert.equal(first.duplicated,false);
const copied=prepare(book,['id-book'],[],['La historia','La historia · importado'],()=> 'another-id');
assert.equal(copied.book.id,'another-id');assert.equal(copied.book.name,'La historia · importado 2');assert.equal(copied.duplicated,true);
assert.equal(copied.book.chapters[0].characterId,'p1');assert.equal(copied.book.characters[0].id,'p1');assert.equal(copied.book.boards[0].elements[0].groupId,'g1');
const inTrash=prepare(book,[],['id-book'],[],()=> 'reclaimed-id');assert.equal(inTrash.book.id,'reclaimed-id');
const preserved={version:1,projects:[{id:'other',name:'Otro'}],activeProjectId:'other',theme:'dark'};
const result=append(preserved,copied.book);assert.equal(result.projects.length,2);assert.equal(preserved.projects.length,1);assert.equal(result.projects[0],preserved.projects[0]);assert.equal(result.theme,'dark');
assert.throws(()=>append(preserved,{...book,id:'other'}));
assert.throws(()=>prepare(book,['id-book'],[],[],()=> 'id-book'));
console.log('PASS MARGEN 1.13.3 import model — payload, conflicts, references, append');
