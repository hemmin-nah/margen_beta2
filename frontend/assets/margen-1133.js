'use strict';
/* MARGEN 1.13.3 — importación aditiva de libros MARGEN_BOOK v1.
   No usa el restaurador destructivo de bibliotecas. Evita modificar el estado
   de la aplicación hasta que el usuario confirme el contenido del libro. */
const m1133T=(es,en)=>m145Prefs?.().language==='en'?en:es;
let m1133Busy=false;
function m1133Close(){document.querySelector('[data-m1133-modal]')?.remove()}
function m1133OpenPicker(){
  m1133Close();
  const input=document.getElementById('file-book-import');
  if(!input){m172Notice(m1133T('No se encuentra el selector de archivos.','File picker is unavailable.'));return}
  input.value='';input.click();
}
function m1133ChooseDialog(){
  m1133Close();
  const shell=document.createElement('div');shell.className='modal-backdrop m1133-backdrop';shell.dataset.m1133Modal='';
  shell.innerHTML=`<section class="modal m1133-modal" role="dialog" aria-modal="true" aria-labelledby="m1133-choose-title">
    <header class="m1133-head"><div><span class="eyebrow">JSON</span><h2 id="m1133-choose-title">${m1133T('Importar datos','Import data')}</h2></div><button type="button" class="iconbtn" data-m1133-close title="${m1133T('Cerrar','Close')}">${ic('close')}</button></header>
    <div class="m1133-options">
      <section class="m1133-choice"><div><strong>${m1133T('Añadir un libro','Add one book')}</strong><small>${m1133T('Importa un archivo MARGEN_BOOK y conserva todos los libros que ya tienes.','Import a MARGEN_BOOK file without replacing any existing book.')}</small></div><button class="btn primary" type="button" data-m1133-book>${ic('book')} ${m1133T('Elegir libro JSON','Choose book JSON')}</button></section>
      <section class="m1133-choice"><div><strong>${m1133T('Restaurar biblioteca completa','Restore complete library')}</strong><small>${m1133T('Sustituye todos los libros por una copia de seguridad completa, previa revisión y confirmación.','Replaces every book with a full backup, after review and confirmation.')}</small></div><button class="btn" type="button" data-m1133-library>${ic('upload')} ${m1133T('Elegir copia completa','Choose full backup')}</button></section>
    </div></section>`;
  document.body.appendChild(shell);
  shell.addEventListener('pointerdown',e=>{if(e.target===shell)m1133Close()});
  shell.querySelector('[data-m1133-close]').onclick=m1133Close;
  shell.querySelector('[data-m1133-book]').onclick=m1133OpenPicker;
  shell.querySelector('[data-m1133-library]').onclick=()=>{m1133Close();document.getElementById('file-backup')?.click()};
  shell.querySelector('[data-m1133-book]').focus();
}
async function m1133ReservedIds(){
  // No reutilizar el ID de un libro que sigue en la papelera: debe poder restaurarse.
  const invoke=window.__TAURI__?.core?.invoke;
  if(!invoke)throw new Error(m1133T('La importación individual requiere MARGEN Desktop.','Single-book import requires MARGEN Desktop.'));
  const rows=await invoke('desktop_list_book_trash');
  if(!Array.isArray(rows))throw new Error(m1133T('No se pudo comprobar la papelera de libros.','Cannot inspect the book trash.'));
  return rows.map(x=>x.bookId).filter(x=>typeof x==='string');
}
function m1133InspectPayload(payload){
  const candidate=MARGEN_BOOK_IMPORT.inspect(payload);
  // Reutilizamos las comprobaciones de integridad de la restauración completa,
  // pero aislando EL libro en un espacio temporal para no alterar la biblioteca.
  const normalized=m154Prepare({version:1,projects:[candidate]});
  const book=normalized.data.projects[0];
  if(!book||!validateBackup(normalized.data))throw new Error(m1133T('Libro no válido.','Invalid book.'));
  return {book,stats:normalized.stats,warnings:normalized.warnings,changes:normalized.changes};
}
function m1133Review(prepared,filename,reserved){
  m1133Close();
  const current=state?.projects||[];
  const collision=current.some(x=>x.id===prepared.book.id)||reserved.includes(prepared.book.id);
  const sameName=current.some(x=>x.name===prepared.book.name);
  const counts=[
    [prepared.book.chapters?.length||0,m1133T('Capítulos','Chapters')],
    [prepared.book.boards?.length||0,m1133T('Pizarras','Boards')],
    [prepared.book.characters?.length||0,m1133T('Personajes','Characters')],
    [prepared.book.settings?.length||0,m1133T('Escenarios','Settings')],
  ];
  const shell=document.createElement('div');shell.className='modal-backdrop m1133-backdrop';shell.dataset.m1133Modal='';
  shell.innerHTML=`<section class="modal m1133-modal" role="dialog" aria-modal="true" aria-labelledby="m1133-review-title">
    <header class="m1133-head"><div><span class="eyebrow">MARGEN_BOOK v1</span><h2 id="m1133-review-title">${m1133T('Revisar libro antes de importar','Review book before importing')}</h2></div><button type="button" class="iconbtn" data-m1133-close title="${m1133T('Cerrar','Close')}">${ic('close')}</button></header>
    <p class="m1133-file">${m1133T('Archivo:','File:')} ${esc(filename)}</p><h3 class="m1133-booktitle">${esc(prepared.book.name)}</h3>
    <div class="m1133-stats">${counts.map(([count,label])=>`<div><strong>${count}</strong><span>${label}</span></div>`).join('')}</div>
    <p class="m1133-help">${m1133T('Se conservarán los capítulos, fichas, pizarras, escaletas, cronologías, imágenes incluidas y referencias internas del libro. No se eliminará ninguno de tus libros actuales.','Chapters, records, boards, outlines, timelines, embedded images and internal references are preserved. No existing books will be deleted.')}</p>
    ${collision?`<p class="m1133-warning">${m1133T('Ya existe un libro con este identificador (en biblioteca o papelera). Se importará como una copia independiente.','This book ID already exists in the library or trash. It will be added as a separate copy.')}</p>`:''}
    ${sameName?`<p class="m1133-warning">${m1133T('Ya hay un libro con ese título: el importado llevará el sufijo «importado».','A book with this name exists: the imported one will have an “importado” suffix.')}</p>`:''}
    ${prepared.warnings.map(w=>`<p class="m1133-warning">${esc(w)}</p>`).join('')}
    <div class="m1133-actions"><button type="button" class="btn" data-m1133-cancel>${m1133T('Cancelar','Cancel')}</button><button type="button" class="btn primary" data-m1133-confirm>${ic('book')} ${m1133T('Añadir a mi biblioteca','Add to library')}</button></div>
    <p class="m1133-feedback" data-m1133-feedback aria-live="polite"></p></section>`;
  document.body.appendChild(shell);
  const close=()=>{if(!m1133Busy)m1133Close()};
  shell.addEventListener('pointerdown',e=>{if(e.target===shell)close()});
  shell.querySelector('[data-m1133-close]').onclick=close;
  shell.querySelector('[data-m1133-cancel]').onclick=close;
  const confirm=shell.querySelector('[data-m1133-confirm]');
  confirm.onclick=async()=>{
    if(m1133Busy)return;
    m1133Busy=true;
    const feedback=shell.querySelector('[data-m1133-feedback]');
    for(const button of shell.querySelectorAll('button'))button.disabled=true;
    feedback.textContent=m1133T('Comprobando y guardando…','Validating and saving…');
    try{
      const saved=await m1133Commit(prepared.book);
      m1133Close();render();
      showToast(m1133T('Libro añadido y guardado: ','Book added and saved: ')+saved.name);
    }catch(error){
      console.error('MARGEN_BOOK import:',error);
      feedback.textContent=m1133T('No se pudo completar la importación: ','Could not complete import: ')+String(error?.message||error);
      if(error?.margenMayHaveSaved){
        // Nunca se ofrece reintentar a ciegas una operación posiblemente persistida.
        confirm.dataset.m1133DoNotRetry='1';
      }
    }finally{
      m1133Busy=false;
      for(const button of shell.querySelectorAll('button'))button.disabled=false;
      if(confirm.dataset.m1133DoNotRetry)confirm.disabled=true;
    }
  };
  confirm.focus();
}
async function m1133Commit(sourceBook){
  if(m15Blocked||m151Conflict)throw new Error(m1133T('El guardado está bloqueado o hay conflicto entre ventanas. Exporta tus datos antes de continuar.','Saving is blocked or another window is writing. Export your data first.'));
  if(!window.__TAURI__?.core?.invoke)throw new Error(m1133T('Esta función requiere la aplicación de escritorio.','This feature requires the desktop app.'));
  if(m15Saving)await m15Saving;
  // Antes de cambiar el estado, proteger todo lo editado en la sesión actual.
  if(dirty && !await save())throw new Error(m1133T('No se pudo guardar la biblioteca actual. No se ha importado nada.','Could not save current library. Nothing was imported.'));
  if(m15Blocked||m151Conflict||dirty)throw new Error(m1133T('La biblioteca tiene cambios sin guardar o conflictos.','The library has unsaved changes or a conflict.'));
  const reserved=await m1133ReservedIds();
  const before=state;
  const planned=MARGEN_BOOK_IMPORT.prepare(sourceBook,before.projects.map(p=>p.id),reserved,before.projects.map(p=>p.name),uid);
  const incoming=planned.book;
  // El objeto de la biblioteca solo se amplía; los libros existentes mantienen
  // sus referencias originales, incluso cuando todavía están cargados bajo demanda.
  const target=MARGEN_BOOK_IMPORT.append(before,incoming);
  if(!validateBackup(target))throw new Error(m1133T('La biblioteca resultante no supera la validación.','The resulting library failed validation.'));
  target.activeProjectId=incoming.id;
  target.activeChapterId=incoming.chapters?.[0]?.id||null;
  target.activeBoardId=incoming.boards?.[0]?.id||null;
  target.activeNoteId=incoming.notes?.[0]?.id||null;
  target.activeCharacterId=incoming.characters?.[0]?.id||null;
  target.activeSettingId=incoming.settings?.[0]?.id||null;
  target.activeOutlineId=incoming.outlines?.[0]?.id||null;
  target.view='library';
  state=target;
  try{
    changed();
    const ok=await save();
    if(!ok)throw new Error(m1133T('Fallo de escritura en el disco.','Disk save failed.'));
  }catch(error){
    // La escritura de la biblioteca es atómica en el backend. Ante un error
    // recuperamos la sesión en memoria, sin destruir la biblioteca anterior.
    state=before;
    m191ProjectRevision?.delete(incoming.id);
    clearTimeout(saveTimer);
    dirty=false;
    m15Status(m151Conflict?'locked':'saved');
    throw error;
  }
  // Confirmación independiente leyendo el libro desde el almacenamiento real.
  let stored,readbackError=null;
  try{stored=await window.__TAURI__.core.invoke('desktop_load_book',{bookId:incoming.id})}
  catch(error){readbackError=error}
  if(readbackError||!stored||stored.id!==incoming.id||
    JSON.stringify(stored.chapters)!==JSON.stringify(incoming.chapters)||
    JSON.stringify(stored.boards)!==JSON.stringify(incoming.boards)||
    JSON.stringify(stored.notes)!==JSON.stringify(incoming.notes)||
    JSON.stringify(stored.characters)!==JSON.stringify(incoming.characters)||
    JSON.stringify(stored.settings)!==JSON.stringify(incoming.settings)){
    const error=new Error(m1133T('El libro puede haberse guardado, pero no se pudo verificar su lectura. Revisa la biblioteca y NO repitas la importación hasta comprobarlo.','The book may have been saved but the readback could not be verified. Inspect the library and DO NOT repeat the import until checked.'));
    error.margenMayHaveSaved=true;
    throw error;
  }
  return incoming;
}
const m1133PrevOnAction=onAction;
onAction=async function(event){
  const target=event?.currentTarget?.dataset?.action?event.currentTarget:event?.target?.closest?.('[data-action]');
  if(target?.dataset?.action==='restore'){
    event?.preventDefault?.();event?.stopPropagation?.();m1133ChooseDialog();return;
  }
  return m1133PrevOnAction.call(this,event);
};
const m1133PrevRender=render;
render=function(){
  const result=m1133PrevRender();
  const version=document.querySelector('.brand .m11-version');if(version)version.textContent='1.13.3 · Beta';
  const restoreButton=document.querySelector('[data-action="restore"]');
  if(restoreButton)restoreButton.title=m1133T('Importar libro o restaurar biblioteca','Import book or restore library');
  if(state.view==='library'){
    const header=document.querySelector('.workspace-head');
    if(header){
      const button=document.createElement('button');button.type='button';button.className='btn m1133-library-import';
      button.innerHTML=ic('upload')+' '+m1133T('Importar libro','Import book');
      button.addEventListener('click',m1133OpenPicker);
      header.appendChild(button);
    }
  }
  return result;
};
document.getElementById('file-book-import')?.addEventListener('change',async event=>{
  const input=event.currentTarget,file=input.files?.[0];
  if(!file||m1133Busy)return;
  try{
    if(file.size>m154MaxImportBytes)throw new Error(m1133T('El archivo supera el límite de 180 MB.','File is larger than 180 MB.'));
    const payload=JSON.parse(await m154ReadFile(file));
    const prepared=m1133InspectPayload(payload);
    const reserved=await m1133ReservedIds();
    m1133Review(prepared,file.name,reserved);
  }catch(error){console.error('MARGEN_BOOK inspection:',error);m172Notice(m1133T('No se pudo abrir el libro: ','Could not open book: ')+String(error?.message||error))}
  finally{input.value=''}
});
