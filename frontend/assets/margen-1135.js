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

/* Tamaño de letra individual de selección, bloque o título editorial.
 * Los atributos inline sobreviven al autoguardado / exportación HTML existente. */
function m1135SetTextSize(px,forTitle=false){
 const editor=document.getElementById('chapter-editor'),chapter=activeChapter(),title=document.getElementById('chapter-title');
 if(!chapter||!editor||!Number.isInteger(px)||px<10||px>72)return;
 const selection=window.getSelection(),range=selection?.rangeCount?selection.getRangeAt(0):null;
 const inEditor=range&&editor.contains(range.commonAncestorContainer);
 if(forTitle||(!inEditor&&document.activeElement===title)){
  chapter.titleLayout=chapter.titleLayout||{};
  chapter.titleLayout.fontSize=px;
  title.style.fontSize=px+'px';chapter.updatedAt=now();changed();return;
 }
 if(!inEditor){showToast(m1135T('Selecciona un texto o coloca el cursor en un párrafo.','Select text or place the caret in a paragraph.'));return;}
 if(range.collapsed){
  const parent=(range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement);
  const block=parent?.closest?.('h1,h2,h3,h4,h5,h6,p,li,blockquote,div');
  if(block&&editor.contains(block)){block.style.fontSize=px+'px';}
  else document.execCommand('fontSize',false,'7');
 }else{
  // Se usa la selección nativa para no extraer fragmentos entre varios bloques.
  document.execCommand('fontSize',false,'7');
  editor.querySelectorAll('font[size="7"]').forEach(node=>{
   const span=document.createElement('span');span.style.fontSize=px+'px';
   while(node.firstChild)span.append(node.firstChild);
   node.replaceWith(span);
  });
 }
 editor.dispatchEvent(new Event('input',{bubbles:true}));
}
function m1135EditorControls(){
 const editor=document.getElementById('chapter-editor'),title=document.getElementById('chapter-title');
 if(!editor||!activeChapter()||editor.closest('.screenplay-area'))return;
 if(title&&Number.isFinite(Number(activeChapter()?.titleLayout?.fontSize)))title.style.fontSize=Math.max(10,Math.min(72,Number(activeChapter().titleLayout.fontSize)))+'px';
 const head=document.querySelector('.m112-toolstack')||document.querySelector('.editor-toolbar');
 if(!head||head.querySelector('[data-m1135-font-size]'))return;
 const label=document.createElement('label');label.className='m1135-text-size';
 label.title=m1135T('Cambia el tamaño de la selección o del encabezado sin alterar todo el capítulo.','Change selection or heading size without changing the whole chapter.');
 label.innerHTML=`<span>${m1135T('Texto','Text')}</span><select data-m1135-font-size aria-label="${m1135T('Tamaño del texto seleccionado','Selected text size')}"><option value="">${m1135T('Tamaño…','Size…')}</option>${[10,11,12,14,16,18,20,22,24,26,28,30,32,36,40,48,60,72].map(n=>`<option value="${n}">${n} px</option>`).join('')}</select>`;
 const sel=label.querySelector('select');sel.addEventListener('mousedown',()=>{
  // Capturar la selección al abrir el selector, antes de que pierda el foco.
  m1135LastTitle=document.activeElement===title;const s=window.getSelection();if(!m1135LastTitle&&s?.rangeCount){m1135LastSelection=s.getRangeAt(0).cloneRange();}
 });
 sel.addEventListener('change',()=>{
  const n=Number(sel.value);if(!n)return;
  if(m1135LastSelection&&!m1135LastTitle){const s=window.getSelection();s.removeAllRanges();s.addRange(m1135LastSelection);}
  m1135SetTextSize(n,m1135LastTitle);sel.value='';m1135LastSelection=null;m1135LastTitle=false;
 });
 const row=head.querySelector('.m112-tool-row')||head.querySelector('.m112-second-row')||head;
 row.append(label);
}
let m1135LastSelection=null,m1135LastTitle=false;

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
 const version=document.querySelector('.brand .m11-version');if(version)version.textContent='1.13.5 · Beta';
 if(state.view==='boards')m1135BoardCapture();
 if(state.view==='manuscript'){m1135EditorControls();m1135BindListAlignment();}
 m1135WireBookCards();return result;
};
