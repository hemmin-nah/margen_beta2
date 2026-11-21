'use strict';
// Pruebas unitarias sin navegador: reglas de selección y movimiento de la pizarra.
const assert=require('node:assert/strict');
const B=require('../frontend/assets/margen-board-model.js');
const note={id:'a',type:'note',x:20,y:30,w:100,h:70,groupId:'g1'};
const image={id:'b',type:'image',x:150,y:30,w:50,h:70,groupId:'g1'};
const linked={id:'c',type:'text',x:210,y:30,w:50,h:70,groupId:'g2'};
const line={id:'t1',points:[{x:40,y:50},{x:110,y:90}],width:4,groupId:'g1',stampInstanceId:'stamp1'};
const sibling={id:'t2',points:[{x:300,y:300},{x:325,y:310}],width:4,groupId:'g2',stampInstanceId:'stamp1'};
const independent={id:'t3',points:[{x:500,y:500}],width:4};
const elements=[note,image,linked],strokes=[line,sibling,independent];
const seed=new Set(['a']);
const expanded=B.expandSelection(elements,strokes,seed,new Set());
assert.deepEqual([...expanded.elements].sort(),['a','b','c']);
assert.deepEqual([...expanded.strokes].sort(),['t1','t2']);
assert.deepEqual([...seed],['a'],'la entrada no debe mutarse');
assert.deepEqual([...B.expandSelection(elements,strokes,new Set(),new Set(['t3'])).strokes],['t3']);
assert.deepEqual([...B.expandSelection(elements,strokes,new Set(['missing']),new Set()).elements],['missing']);
// Ctrl+clic agrega y al repetir alterna sin cambiar la selección origen.
const previous={elements:new Set(['c']),strokes:new Set(['t3'])};
const added=B.toggleSelection({elements:new Set(['a','b']),strokes:new Set(['t1'])},previous,true);
assert.equal(added.elements.size,3);assert.equal(added.strokes.size,2);
assert.equal(previous.elements.size,1);assert.equal(previous.strokes.size,1);
const removed=B.toggleSelection({elements:new Set(['a','b']),strokes:new Set(['t1'])},added,true);
assert.deepEqual([...removed.elements],['c']);assert.deepEqual([...removed.strokes],['t3']);
assert.equal(B.toggleSelection({elements:new Set(['a']),strokes:new Set()},previous,false).elements.size,1);
// El rectángulo detecta notas y trazos, incluso puntos únicos, sin tocar el estado.
const pick=B.inMarquee(elements,strokes,{x:25,y:20,w:30,h:60});
assert.deepEqual([...pick.elements],['a']);assert.deepEqual([...pick.strokes],['t1']);
assert.deepEqual([...B.inMarquee([],strokes,{x:499,y:499,w:3,h:3}).strokes],['t3']);
assert.equal(B.strokeBounds({id:'empty',points:[]}),null);
assert.equal(B.intersects({x:0,y:0,w:10,h:10},{x:10,y:0,w:20,h:20}),false,'tocar borde no es intersección');
// Mantener el mismo delta para el grupo completo, sin saltos en bordes.
const original=[{item:note,x:20,y:30},{item:image,x:150,y:30}];
assert.deepEqual(B.clampTranslation(original,-40,-60,400,300),{x:-20,y:-30});
assert.deepEqual(B.clampTranslation(original,999,999,400,300),{x:200,y:200});
assert.deepEqual(B.clampTranslation([],999,-999,400,300),{x:999,y:-999});
// Copiar/pegar mantiene vínculos internos sin reutilizar IDs del grupo original.
const source={elements:[note,image],strokes:[line,sibling,independent]};
const originalJson=JSON.stringify(source);
let id=0;const copied=B.copyForPaste(source,()=>`new-${++id}`);
assert.equal(copied.elements.length,2);assert.equal(copied.strokes.length,3);
assert.equal(copied.elementIds.size,2);assert.equal(copied.strokeIds.size,3);
assert.equal(copied.elements[0].x,65);
assert.equal(copied.strokes[0].points[0].x,85);
assert.equal(copied.elements[0].groupId,copied.elements[1].groupId);
assert.equal(copied.elements[0].groupId,copied.strokes[0].groupId);
assert.notEqual(copied.elements[0].groupId,note.groupId);
assert.notEqual(copied.strokes[0].groupId,copied.strokes[1].groupId);
assert.equal(copied.strokes[0].stampInstanceId,copied.strokes[1].stampInstanceId);
assert.notEqual(copied.strokes[0].stampInstanceId,line.stampInstanceId);
assert.equal(copied.strokes[2].groupId,undefined);
assert.equal(JSON.stringify(source),originalJson,'pegar no modifica los originales');
// Formato JSON del libro: groupId y stampInstanceId sobreviven a serialización.
assert.equal(JSON.parse(JSON.stringify(copied.strokes[0])).groupId,copied.strokes[0].groupId);
console.log('PASS modelo pizarra 1.13.2: grupos, sellos, área, límites, selección, copias y datos');
