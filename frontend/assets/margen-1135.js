'use strict';
/* MARGEN 1.13.5 — correcciones focalizadas, compatibles con libros anteriores.
 * No modifica el esquema de SQLite ni cambia los IDs de fichas/capítulos.
 */
const m1135T=(es,en)=>typeof m146T==='function'?m146T(es,en):es;

/* El SVG de papel podía quedar oculto por reglas históricas (!important) y
 * obligaba a pintar un SVG de 20.000 × 14.000 unidades. El fondo CSS del
 * propio mundo es estable al hacer pan/zoom y no necesita elementos SVG. */
m1134DrawPaper=function(){document.querySelector('#board-world .m162-ruled-paper')?.remove()};

/* Ubicar nuevos objetos en la porción del mundo que se está viendo (1.13
 * amplió el mundo a 20.000 × 14.000 pero mantuvo el límite viejo de 3.750). */
const m1135PreviousCenter=centerNewPosition;
centerNewPosition=function(){
 if(!m113IsFreeBoard())return m1135PreviousCenter();
 const b=activeBoard(),vp=document.getElementById('board-viewport');
 if(!b||!vp)return {x:100,y:100};
 const z=Math.max(.1,Number(b.zoom)||1),width=Math.max(1,vp.clientWidth),height=Math.max(1,vp.clientHeight);
 const visibleX=(width/2-(Number(b.panX)||0))/z,visibleY=(height/2-(Number(b.panY)||0))/z;
 const left=(-(Number(b.panX)||0))/z,top=(-(Number(b.panY)||0))/z;
 const boxW=370,boxH=280;
 const x=Math.max(left+10,Math.min(visibleX-boxW/2,left+width/z-boxW-10));
 const y=Math.max(top+10,Math.min(visibleY-boxH/2,top+height/z-boxH-10));
 return {x:Math.round(Math.max(0,Math.min(M113_WORLD_W-boxW-10,x))),y:Math.round(Math.max(0,Math.min(M113_WORLD_H-boxH-10,y)))};
};
const m1135PreviousAddBoardElement=addBoardElement;
addBoardElement=function(type,data){
 if(m113IsFreeBoard())m113PushUndo();
 return m1135PreviousAddBoardElement(type,data);
};

/* Un evento de dibujo = un estado previo. Captura en el viewport ANTES del
 * canvas; el guardado antiguo en canvas es idempotente con m113PushUndo. */
function m1135BoardCapture(){
 const vp=document.getElementById('board-viewport');
 if(!m113IsFreeBoard()||!vp||vp.dataset.m1135Capture)return;
 vp.dataset.m1135Capture='1';
 vp.addEventListener('pointerdown',event=>{
  if(event.button!==0||!['pen','eraser'].includes(boardTool)||!event.target.closest('#drawing-layer'))return;
  m113BlurBoardEditor();
  if(document.activeElement?.matches?.('input[type="color"],input[type="number"]'))document.activeElement.blur();
  m113PushUndo();
  const picker=document.getElementById('pen-color');
  if(boardTool==='pen'&&/^#[0-9a-f]{6}$/i.test(picker?.value||''))penColor=picker.value;
 },true);
 const picker=document.getElementById('pen-color');
 if(picker&&!picker.dataset.m1135Color){
  picker.dataset.m1135Color='1';
  const apply=()=>{if(/^#[0-9a-f]{6}$/i.test(picker.value))penColor=picker.value};
  picker.addEventListener('input',apply);picker.addEventListener('change',apply);
 }
}

/* Tamaño del texto. Se reutiliza el botón ORIGINAL «Tamaño» (#chapter-size):
 * - texto seleccionado: solo cambia el fragmento, aunque sea un encabezado;
 * - título editorial enfocado: solo cambia el tamaño del título;
 * - sin selección: sigue cambiando la tipografía base del capítulo.
 * Nunca se añade otro selector a la barra. */
let m1135SizeRange=null,m1135SizeChapterId=null,m1135SizeTitle=false;
function m1135SelectionInsideEditor(range,editor){
 return !!(range&&editor&&editor.contains(range.commonAncestorContainer));
}
function m1135RememberSizeSelection(){
 const editor=document.getElementById('chapter-editor'),title=document.getElementById('chapter-title'),ch=activeChapter();
 if(!editor||!ch)return;
 if(document.activeElement===title){m1135SizeTitle=true;m1135SizeRange=null;m1135SizeChapterId=ch.id;return;}
 const sel=window.getSelection(),range=sel?.rangeCount?sel.getRangeAt(0):null;
 if(m1135SelectionInsideEditor(range,editor)){
  m1135SizeRange=range.collapsed?null:range.cloneRange();
  m1135SizeChapterId=ch.id;m1135SizeTitle=false;
 }
}
// Recordar la selección antes de que el input numérico robe el foco.
document.addEventListener('selectionchange',()=>{
 if(state.view==='manuscript')m1135RememberSizeSelection();
});
document.addEventListener('pointerdown',event=>{
 if(state.view!=='manuscript')return;
 if(event.target.closest('#chapter-size')){m1135RememberSizeSelection();return;}
 if(!event.target.closest('#chapter-editor,#chapter-title')){
  m1135SizeRange=null;m1135SizeTitle=false;m1135SizeChapterId=null;
 }
},true);
function m1135SetTextSize(px,forTitle=false,storedRange=null){
 const editor=document.getElementById('chapter-editor'),chapter=activeChapter(),title=document.getElementById('chapter-title');
 if(!chapter||!editor||!Number.isInteger(px)||px<11||px>32)return false;
 if(forTitle){
  chapter.titleLayout=chapter.titleLayout||{};
  chapter.titleLayout.fontSize=px;
  if(title)title.style.fontSize=px+'px';
  chapter.updatedAt=now();changed();return true;
 }
 const selection=window.getSelection();
 const range=storedRange||(selection?.rangeCount?selection.getRangeAt(0):null);
 if(!m1135SelectionInsideEditor(range,editor)||range.collapsed)return false;
 editor.focus();
 selection.removeAllRanges();selection.addRange(range);
 // execCommand mantiene las etiquetas, los bloques y el historial nativo de edición.
 if(!document.execCommand('fontSize',false,'7'))return false;
 // Reemplazar la etiqueta temporal por un span de tamaño CSS; no tocar el resto.
 editor.querySelectorAll('font[size="7"]').forEach(node=>{
  const span=document.createElement('span');span.style.fontSize=px+'px';
  while(node.firstChild)span.append(node.firstChild);
  node.replaceWith(span);
 });
 editor.dispatchEvent(new Event('input',{bubbles:true}));
 return true;
}
function m1135EditorControls(){
 const editor=document.getElementById('chapter-editor'),title=document.getElementById('chapter-title');
 const size=document.getElementById('chapter-size'),chapter=activeChapter();
 if(!editor||!chapter||!size||editor.closest('.screenplay-area'))return;
 // Si el usuario enfoca de nuevo el texto, no aplicar después una selección vieja.
 editor.addEventListener('focusin',()=>{m1135SizeTitle=false;});
 if(title&&Number.isFinite(Number(chapter.titleLayout?.fontSize)))
  title.style.fontSize=Math.max(11,Math.min(72,Number(chapter.titleLayout.fontSize)))+'px';
 size.title=m1135T('Selecciona texto para cambiar SOLO su tamaño. Sin selección, cambia el tamaño general del capítulo.',
  'Select text to change ONLY its size. Without a selection, change the entire chapter size.');
 size.setAttribute('aria-label',m1135T('Tamaño de letra: selección o capítulo','Font size: selection or chapter'));
 // El controlador original, registrado por wire(), cambia el tamaño global.
 // Lo sustituimos SOLO aquí para aprovechar el mismo campo existente.
 size.onchange=()=>{
  const px=Number(size.value),ch=activeChapter();
  if(!ch||!Number.isInteger(px)||px<11||px>32){size.value=String(ch?.layout?.size||18);return;}
  const stored=m1135SizeChapterId===ch.id?m1135SizeRange:null;
  const titleChosen=m1135SizeChapterId===ch.id&&m1135SizeTitle;
  const applied=titleChosen?m1135SetTextSize(px,true):stored?m1135SetTextSize(px,false,stored):false;
  if(!applied){
   ch.layout=ch.layout||{font:'Georgia',size:18,leading:1.9,margin:60};
   ch.layout.size=px;
   document.querySelector('.editor-area')?.style.setProperty('--chapter-size',px+'px');
   changed();
  }
  // Tras una edición puntual, el control vuelve a mostrar el valor general.
  // Así nunca aparenta haber cambiado el tamaño de TODO el manuscrito.
  if(applied)size.value=String(ch.layout?.size||18);
  m1135SizeRange=null;m1135SizeTitle=false;m1135SizeChapterId=null;
 };
}
/* Los marcadores de listas sin numeración propia deben acompañar el texto
 * también si el párrafo padre es el que está alineado a la derecha. */
function m1135BindListAlignment(){
 const editor=document.getElementById('chapter-editor');if(!editor||editor.dataset.m1135Lists)return;
 editor.dataset.m1135Lists='1';
 const sync=()=>editor.querySelectorAll('li').forEach(li=>li.classList.toggle('m1135-right-list',getComputedStyle(li).textAlign==='right'));
 editor.addEventListener('input',sync);
 document.querySelectorAll('[data-format^="justify"]').forEach(btn=>btn.addEventListener('click',()=>requestAnimationFrame(sync)));
 sync();
}


/* Biblioteca: un único clic sobre cualquier zona libre de la tarjeta abre
 * el libro; cargar el stub diferido antes de cambiar de vista evita carreras. */
const m1135Opening=new Set();
function m1135BookCardClick(event){
 if(state.view!=='library')return;
 const btn=event.target.closest('[data-action="open-project"]');
 if(!btn||!btn.closest('.projects-grid'))return;
 const id=btn.dataset.id,book=state.projects.find(p=>p.id===id);
 if(!book)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(m1135Opening.has(id))return;
 m1135Opening.add(id);
 void (async()=>{
  try{
   if(typeof m110Lazy==='function'&&m110Lazy(book))await m110LoadBook(id);
   const found=state.projects.find(p=>p.id===id);if(!found)throw new Error('Libro no encontrado');
   found.lastOpened=now();state.activeProjectId=id;state.view='book';changed();render();
  }catch(error){console.error('MARGEN open book:',error);showToast(m1135T('No se pudo abrir el libro.','Could not open book.'));}
  finally{m1135Opening.delete(id)}
 })();
}
document.addEventListener('click',m1135BookCardClick,true);
function m1135WireBookCards(){
 if(state.view!=='library')return;
 document.querySelectorAll('.projects-grid>.project-card:not(.new)').forEach(card=>{
  if(card.dataset.m1135CardClick)return;card.dataset.m1135CardClick='1';
  card.addEventListener('click',event=>{if(event.target.closest('button,a,input,select'))return;card.querySelector('[data-action="open-project"]')?.click();});
 });
}
const m1135PreviousRender=render;
render=function(...args){
 const result=m1135PreviousRender(...args);
 const version=document.querySelector('.brand .m11-version');if(version)version.textContent='1.13.7 · Beta';
 if(state.view==='boards')m1135BoardCapture();
 if(state.view==='manuscript'){m1135EditorControls();m1135BindListAlignment();}
 m1135WireBookCards();return result;
};
