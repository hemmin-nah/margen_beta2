'use strict';
/* MARGEN 1.13.2 — selección y agrupación real en pizarras libres.
 * Respeta los datos existentes: groupId es opcional en elementos y trazos;
 * stampInstanceId sigue identificando cada impresión vectorial.
 */
const m1132T=(es,en)=>m145Prefs?.().language==='en'?en:es;
const m1132Elements=()=>activeBoard()?.elements||[];
const m1132Strokes=()=>activeBoard()?.strokes||[];
function m1132Selected(){
 return {elements:new Set(boardSelectedIds?.size?[...boardSelectedIds]:(selectedElement?[selectedElement]:[])),strokes:new Set(m113SelectedStrokeIds)};
}
// Reglas de pertenencia y selección en el modelo puro de pizarra.
function m1132Expand(elementIds,strokeIds){
 return MARGEN_BOARD_MODEL.expandSelection(m1132Elements(),m1132Strokes(),elementIds,strokeIds);
}
function m1132Select(elementIds,strokeIds){
 boardSelectedIds.clear();for(const id of elementIds)boardSelectedIds.add(id);
 m113SelectedStrokeIds.clear();for(const id of strokeIds)m113SelectedStrokeIds.add(id);
 selectedElement=[...boardSelectedIds][0]||null;
 const chosen=m1132Elements().find(x=>x.id===selectedElement);
 document.querySelectorAll('#board-items .board-item').forEach(el=>el.classList.toggle('selected',el.dataset.eid===selectedElement));
 const tools=document.getElementById('selection-tools');if(tools)tools.classList.toggle('visible',!!selectedElement);
 const color=document.getElementById('selection-color-wrap'),input=document.getElementById('selected-note-color');
 if(color)color.style.display=chosen?.type==='note'?'flex':'none';
 if(input&&chosen?.type==='note')input.value=safeColor(chosen.color,'#f8ebbf');
 updateBoardSelectionButtons();m113DrawStrokes();
}
function m1132ClearSelection(){m1132Select(new Set(),new Set());try{m1211SelectedStamp=null}catch(_e){}}
function m1132ToggleSelection(members,additive){
 const next=MARGEN_BOARD_MODEL.toggleSelection(members,m1132Selected(),additive);
 m1132Select(next.elements,next.strokes);
}
// La función de 1.13.0 descarta las trazas seleccionadas al pulsar una nota.
// Se conserva ese comportamiento para objetos sueltos; en un grupo mixto,
// tanto las notas como los trazos deben quedar seleccionados juntos.
const m1132OldSetSelected=setSelected;
setSelected=function(id){
 if(!m113IsFreeBoard())return m1132OldSetSelected(id);
 if(!id){m1132ClearSelection();return}
 const members=m1132Expand(new Set([id]),new Set());
 m1132Select(members.elements,members.strokes);
};

const m1132OldButtons=updateBoardSelectionButtons;
updateBoardSelectionButtons=function(){
 m1132OldButtons();if(!m113IsFreeBoard())return;
 const chosen=m1132Selected(),count=chosen.elements.size+chosen.strokes.size;
 const group=document.getElementById('board-group'),ungroup=document.getElementById('board-ungroup');
 if(group)group.disabled=count<2;
 if(ungroup)ungroup.disabled=!MARGEN_BOARD_MODEL.members(m1132Elements(),m1132Strokes(),chosen).some(x=>x.groupId);
 const label=document.getElementById('board-selection-count');if(label)label.textContent=count>1?`${count} ${m1132T('seleccionados','selected')} · `:'';
};

// Única sesión de puntero para arrastre, marco y resize de la pizarra.
// Identifica el dedo/ratón correcto y retira SIEMPRE los tres listeners,
// también en pointercancel: evita sesiones acumuladas al cambiar de herramienta.
function m1132TrackPointer(start,callbacks){
 const pointerId=start.pointerId;
 const stop=()=>{
  window.removeEventListener('pointermove',onMove,true);
  window.removeEventListener('pointerup',onEnd,true);
  window.removeEventListener('pointercancel',onCancel,true);
 };
 const onMove=e=>{if(e.pointerId===pointerId)callbacks.move?.(e)};
 const onEnd=e=>{if(e.pointerId!==pointerId)return;stop();callbacks.end?.(e)};
 const onCancel=e=>{if(e.pointerId!==pointerId)return;stop();callbacks.cancel?.(e)};
 window.addEventListener('pointermove',onMove,true);
 window.addEventListener('pointerup',onEnd,true);
 window.addEventListener('pointercancel',onCancel,true);
 return stop;
}

// Sustituimos el manejador anterior, que consideraba fondo cualquier clic en
// un SVG de trazo e iniciaba la selección de área ANTES del movimiento.
// El marco nace sólo tras arrastrar al menos 5px sobre fondo realmente vacío.
m1211BindBoardSelection=function(){
 if(!m113IsFreeBoard())return;
 const vp=document.getElementById('board-viewport'),items=document.getElementById('board-items');
 if(!vp||!items||vp.dataset.m1132SelectBound)return;
 vp.dataset.m1132SelectBound='1';
 items.addEventListener('pointerdown',e=>{
  if(boardTool!=='select'||e.button!==0||!(e.ctrlKey||e.metaKey||e.shiftKey))return;
  const node=e.target.closest('.board-item');if(!node||e.target.closest('input,textarea,[contenteditable="true"],button,select,.item-popmenu,.resize-grip'))return;
  e.preventDefault();e.stopImmediatePropagation();
  m1132ToggleSelection(m1132Expand(new Set([node.dataset.eid]),new Set()),true);
 },true);
 vp.addEventListener('pointerdown',e=>{
  if(boardTool!=='select'||m113SpaceDown||e.button!==0)return;
  if(e.target.closest('.board-item,[data-m113-stroke],[data-m1211-stamp-hit],.selection-tools,.zoom-controls,.m1132-marquee'))return;
  if(e.target.closest('button,input,textarea,select,[contenteditable="true"]'))return;
  const origin={x:e.clientX,y:e.clientY},start=m1211BoardCoords(e),additive=e.ctrlKey||e.metaKey||e.shiftKey;
  let frame=null,marquee=false;
  if(!additive)m1132ClearSelection();
  const move=ev=>{
   const dx=ev.clientX-origin.x,dy=ev.clientY-origin.y;
   if(!marquee&&Math.hypot(dx,dy)<5)return;
   if(!marquee){marquee=true;frame=document.createElement('div');frame.className='m1132-marquee';vp.append(frame)}
   const now=m1211BoardCoords(ev),b=activeBoard(),z=b?.zoom||1;
   frame.style.left=(Math.min(start.x,now.x)*z+(b?.panX||0))+'px';
   frame.style.top=(Math.min(start.y,now.y)*z+(b?.panY||0))+'px';
   frame.style.width=Math.abs(start.x-now.x)*z+'px';
   frame.style.height=Math.abs(start.y-now.y)*z+'px';
  };
  const finish=ev=>{
   frame?.remove();if(!marquee)return;
   const end=m1211BoardCoords(ev),box={x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),w:Math.abs(start.x-end.x),h:Math.abs(start.y-end.y)};
   const choice=additive?m1132Selected():MARGEN_BOARD_MODEL.emptySelection();
   const found=MARGEN_BOARD_MODEL.inMarquee(m1132Elements(),m1132Strokes(),box);
   for(const id of found.elements)choice.elements.add(id);
   for(const id of found.strokes)choice.strokes.add(id);
   const expanded=m1132Expand(choice.elements,choice.strokes);m1132Select(expanded.elements,expanded.strokes);
  };
  m1132TrackPointer(e,{move,end:finish,cancel:()=>frame?.remove()});
  e.preventDefault();
 },true);
};

function m1132MoveSelection(event,elementIds,strokeIds){
 const b=activeBoard(),z=b?.zoom||1,start={x:event.clientX,y:event.clientY},els=m1132Elements().filter(x=>elementIds.has(x.id)),sts=m1132Strokes().filter(s=>strokeIds.has(s.id));
 if([...els,...sts].some(x=>x.locked)){showToast(m1132T('Hay un objeto bloqueado en la selección.','There is a locked object in the selection.'));return}
 const originals=els.map(item=>({item,x:Number(item.x)||0,y:Number(item.y)||0}));
 const originalStrokes=sts.map(stroke=>({stroke,points:(stroke.points||[]).map(p=>({...p}))}));
 let started=false;
 const move=e=>{
  const dx=(e.clientX-start.x)/z,dy=(e.clientY-start.y)/z;
  if(!started&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<3)return;
  if(!started){m113PushUndo();started=true}
  // El cálculo de límites se comparte entre todos los miembros del grupo.
  const {x:ox,y:oy}=MARGEN_BOARD_MODEL.clampTranslation(originals,dx,dy,M113_WORLD_W,M113_WORLD_H);
  for(const row of originals){row.item.x=row.x+ox;row.item.y=row.y+oy;const node=document.querySelector(`#board-items .board-item[data-eid="${CSS.escape(row.item.id)}"]`);if(node){node.style.left=row.item.x+'px';node.style.top=row.item.y+'px'}}
  for(const row of originalStrokes)row.stroke.points=row.points.map(p=>({x:p.x+ox,y:p.y+oy}));
  if(originalStrokes.length)m113DrawStrokes();
 };
 const done=()=>{if(started){changed();m113Recenter()}};
 m1132TrackPointer(event,{move,end:done,cancel:done});
}

// Arrastrar una nota/imagen deja de mover sólo el elemento pulsado si forma
// parte de un grupo; ahora traslada TODAS sus notas, imágenes y trazos.
const m1132PreviousStartItemDrag=startItemDrag;
startItemDrag=function(e,item,node,kind){
 if(!m113IsFreeBoard())return m1132PreviousStartItemDrag(e,item,node,kind);
 if(boardTool!=='select'||item?.locked)return;
 e.preventDefault();e.stopPropagation();m113BlurBoardEditor();
 if(kind!=='move'){
  m113PushUndo();setSelected(item.id);const start={x:e.clientX,y:e.clientY,w:Number(item.w)||100,h:Number(item.h)||80},z=activeBoard()?.zoom||1;
  const move=ev=>{item.w=Math.max(80,Math.min(3200,start.w+(ev.clientX-start.x)/z));item.h=Math.max(60,Math.min(2600,start.h+(ev.clientY-start.y)/z));node.style.width=item.w+'px';node.style.height=item.h+'px'};
  const done=()=>changed();
  m1132TrackPointer(e,{move,end:done,cancel:done});return;
 }
 const current=m1132Selected(),keep=current.elements.has(item.id)&&(current.elements.size+current.strokes.size>1);
 if(!keep)setSelected(item.id);
 const choice=m1132Selected();m1132MoveSelection(e,choice.elements,choice.strokes);
};

m113BindStrokeHits=function(){
 if(!m113IsFreeBoard())return;
 const svg=document.getElementById('m162-vector-strokes');if(!svg)return;
 svg.querySelectorAll('[data-m113-stroke]').forEach(hit=>hit.onpointerdown=e=>{
  if(boardTool!=='select'||m113SpaceDown||e.button!==0)return;
  e.preventDefault();e.stopPropagation();m113BlurBoardEditor();
  const id=hit.dataset.m113Stroke,members=m1132Expand(new Set(),new Set([id])),current=m1132Selected(),additive=e.ctrlKey||e.metaKey||e.shiftKey;
  if(additive){m1132ToggleSelection(members,true);return}
  const all=MARGEN_BOARD_MODEL.allSelected(members,current);
  if(!all)m1132Select(members.elements,members.strokes);
  const choice=m1132Selected();m1132MoveSelection(e,choice.elements,choice.strokes);
 });
};

// Agrupar puede contener cualquier mezcla de notas, textos, imágenes y trazos.
// Se guarda sobre cada miembro: compatible con SQLite/JSON existentes sin migración.
groupBoardItems=function(){
 if(!m113IsFreeBoard())return;
 const current=m1132Selected(),expanded=m1132Expand(current.elements,current.strokes);
 if(expanded.elements.size+expanded.strokes.size<2)return;
 const ids=MARGEN_BOARD_MODEL.members(m1132Elements(),m1132Strokes(),expanded);
 if(ids.every(x=>x.groupId&&x.groupId===ids[0].groupId))return;
 m113PushUndo();const groupId=uid();for(const obj of ids)obj.groupId=groupId;
 m1132Select(expanded.elements,expanded.strokes);changed();m113UpdateHistoryButtons();
 showToast(m1132T('Grupo creado: todos los elementos se moverán juntos.','Group created: all objects will move together.'));
};
ungroupBoardItems=function(){
 if(!m113IsFreeBoard())return;
 const b=activeBoard(),current=m1132Selected(),groups=new Set(MARGEN_BOARD_MODEL.members(m1132Elements(),m1132Strokes(),current).map(x=>x.groupId).filter(Boolean));
 if(!groups.size)return;
 m113PushUndo();for(const obj of [...b.elements,...b.strokes])if(groups.has(obj.groupId))delete obj.groupId;
 m1132Select(current.elements,current.strokes);changed();m113UpdateHistoryButtons();showToast(m1132T('Grupo deshecho.','Group dissolved.'));
};
// La selección múltiple de un grupo también funciona con copiar, pegar, Supr y deshacer.
const m1132OriginalDelete=m113DeleteSelection;
m113DeleteSelection=function(){
 const c=m1132Selected(),x=m1132Expand(c.elements,c.strokes);m1132Select(x.elements,x.strokes);m1132OriginalDelete();
};
deleteSelected=m113DeleteSelection;
m113Paste=function(){
 const b=activeBoard();if(!b||!m113Clipboard)return;
 const pasted=MARGEN_BOARD_MODEL.copyForPaste(m113Clipboard,uid);
 m113PushUndo();b.elements.push(...pasted.elements);b.strokes.push(...pasted.strokes);
 // Los nuevos grupos y sellos no comparten IDs con los originales.
 renderBoardElements();m1132Select(pasted.elementIds,pasted.strokeIds);changed();m113UpdateHistoryButtons();
};

const m1132OldRender=render;
render=function(){
 const result=m1132OldRender();const v=document.querySelector('.brand .m11-version');if(v)v.textContent='1.13.2 · Beta';
 requestAnimationFrame(()=>{if(!m113IsFreeBoard())return;const hint=document.querySelector('.board-hint');if(hint)hint.textContent=m1132T('V seleccionar · Clic en el fondo: deseleccionar · Arrastra el fondo: selección múltiple · Ctrl+G: agrupar · Ctrl+Mayús+G: desagrupar · Ctrl+Z: deshacer', 'V select · Background click: deselect · Drag background: marquee · Ctrl+G: group · Ctrl+Shift+G: ungroup · Ctrl+Z: undo')});
 return result;
};
