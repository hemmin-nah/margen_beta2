'use strict';
/* MARGEN · Modelo de selección y geometría de la pizarra libre.
 * Este módulo no accede al DOM, Tauri, SQLite ni al estado de la aplicación.
 * Conserva el esquema existente (groupId / stampInstanceId, ambos opcionales).
 * Los controladores de puntero y las operaciones de guardado viven en margen-1132.js.
 */
const MARGEN_BOARD_MODEL=(()=>{
 const emptySelection=()=>({elements:new Set(),strokes:new Set()});
 const withSets=selection=>({elements:new Set(selection.elements),strokes:new Set(selection.strokes)});
 const members=(elements,strokes,selection)=>[
  ...elements.filter(item=>selection.elements.has(item.id)),
  ...strokes.filter(stroke=>selection.strokes.has(stroke.id))
 ];

 function expandSelection(elements,strokes,elementIds,strokeIds){
  const result={elements:new Set(elementIds),strokes:new Set(strokeIds)};
  // Índices por grupo y por impresión: un grupo puede contener elementos y trazos,
  // mientras que stampInstanceId sólo une los trazos de un mismo sello.
  const groups=new Map(),stamps=new Map();
  const index=(map,id,type,obj)=>{
   if(!id)return;
   if(!map.has(id))map.set(id,[]);
   map.get(id).push({type,obj});
  };
  const elementIndex=new Map(),strokeIndex=new Map();
  for(const item of elements){elementIndex.set(item.id,item);index(groups,item.groupId,'elements',item)}
  for(const stroke of strokes){strokeIndex.set(stroke.id,stroke);index(groups,stroke.groupId,'strokes',stroke);index(stamps,stroke.stampInstanceId,'strokes',stroke)}
  const queue=[...result.elements].map(id=>({type:'elements',id})).concat([...result.strokes].map(id=>({type:'strokes',id})));
  const add=(type,obj)=>{
   const bucket=result[type];
   if(bucket.has(obj.id))return;
   bucket.add(obj.id);queue.push({type,id:obj.id});
  };
  for(let i=0;i<queue.length;i++){
   const {type,id}=queue[i],item=(type==='elements'?elementIndex:strokeIndex).get(id);
   if(!item)continue;
   if(item.groupId)for(const m of groups.get(item.groupId)||[])add(m.type,m.obj);
   if(type==='strokes'&&item.stampInstanceId)for(const m of stamps.get(item.stampInstanceId)||[])add(m.type,m.obj);
  }
  return result;
 }

 function allSelected(membersSelection,current){
  return [...membersSelection.elements].every(id=>current.elements.has(id))
   && [...membersSelection.strokes].every(id=>current.strokes.has(id));
 }
 function toggleSelection(membersSelection,current,additive){
  const next=additive?withSets(current):emptySelection();
  const remove=additive&&allSelected(membersSelection,next);
  for(const type of ['elements','strokes'])for(const id of membersSelection[type]){
   if(remove)next[type].delete(id);else next[type].add(id);
  }
  return next;
 }

 function intersects(a,b){
  return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 }
 function strokeBounds(stroke){
  const points=stroke.points||[];
  if(!points.length)return null;
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of points){
   minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
   minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
  }
  const pad=(Number(stroke.width)||4)/2;
  return {x:minX-pad,y:minY-pad,w:maxX-minX+pad*2,h:maxY-minY+pad*2};
 }
 function inMarquee(elements,strokes,rectangle){
  const found=emptySelection();
  for(const item of elements){
   const rect={x:Number(item.x)||0,y:Number(item.y)||0,w:Number(item.w)||0,h:Number(item.h)||0};
   if(intersects(rect,rectangle))found.elements.add(item.id);
  }
  for(const stroke of strokes){
   const bounds=strokeBounds(stroke);
   if(bounds&&intersects(bounds,rectangle))found.strokes.add(stroke.id);
  }
  return found;
 }

 function clampTranslation(originals,dx,dy,worldW,worldH){
  if(!originals.length)return {x:dx,y:dy};
  const left=Math.min(...originals.map(row=>row.x));
  const top=Math.min(...originals.map(row=>row.y));
  const right=Math.max(...originals.map(row=>row.x+(row.item.w||80)));
  const bottom=Math.max(...originals.map(row=>row.y+(row.item.h||60)));
  return {
   x:Math.max(-left,Math.min(worldW-right,dx)),
   y:Math.max(-top,Math.min(worldH-bottom,dy))
  };
 }

 function copyForPaste(clipboard,makeId,offset=45){
  const elements=[],strokes=[],elementIds=new Set(),strokeIds=new Set();
  const groups=new Map(),stamps=new Map();
  const nextId=(map,id)=>{
   if(!id)return id;
   if(!map.has(id))map.set(id,makeId());
   return map.get(id);
  };
  for(const source of clipboard.elements||[]){
   const item=structuredClone(source);
   item.id=makeId();item.x=(Number(item.x)||0)+offset;item.y=(Number(item.y)||0)+offset;
   if(item.groupId)item.groupId=nextId(groups,item.groupId);
   elements.push(item);elementIds.add(item.id);
  }
  for(const source of clipboard.strokes||[]){
   const stroke=structuredClone(source);
   stroke.id=makeId();stroke.points=(stroke.points||[]).map(p=>({x:p.x+offset,y:p.y+offset}));
   if(stroke.groupId)stroke.groupId=nextId(groups,stroke.groupId);
   if(stroke.stampInstanceId)stroke.stampInstanceId=nextId(stamps,stroke.stampInstanceId);
   strokes.push(stroke);strokeIds.add(stroke.id);
  }
  return {elements,strokes,elementIds,strokeIds};
 }

 return Object.freeze({emptySelection,members,expandSelection,allSelected,toggleSelection,intersects,strokeBounds,inMarquee,clampTranslation,copyForPaste});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=MARGEN_BOARD_MODEL;
