'use strict';
/* MARGEN 1.13.3 — reglas puras para importar un MARGEN_BOOK.
   No reescribe identificadores internos: pertenecen al propio libro y mantienen sus vínculos.
   Cuando colisiona el identificador del libro, solo se cambia ese identificador raíz. */
const MARGEN_BOOK_IMPORT=(()=>{
  const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const clone=v=>JSON.parse(JSON.stringify(v));
  function inspect(payload){
    if(!object(payload)||payload.format!=='MARGEN_BOOK'||payload.formatVersion!==1)
      throw new Error('El archivo no es un libro individual MARGEN_BOOK v1. Las copias de biblioteca completa deben restaurarse desde la otra opción.');
    const book=payload.book;
    if(!object(book)||typeof book.id!=='string'||!book.id.trim()||book.id.length>200||
       typeof book.name!=='string'||!book.name.trim()||book.name.length>500||
       !['chapters','boards','notes'].every(key=>Array.isArray(book[key]))||
       book._margenLazy||own(book,'_margenSummary'))
      throw new Error('El libro no tiene una estructura compatible o está incompleto.');
    return clone(book);
  }
  // Conservar el ID original facilita traspasos entre PCs. Si coincide con un libro
  // activo o en la papelera se crea una copia independiente, sin sobrescribir nada.
  function prepare(book,existingIds,reservedIds,existingNames,makeId){
    const copy=clone(book);
    const ids=new Set([...existingIds,...reservedIds]);
    let duplicated=ids.has(copy.id);
    if(duplicated){
      let fresh=null;
      for(let i=0;i<100;i++){
        const value=makeId();
        if(typeof value==='string'&&value.trim()&&value.length<=200&&!ids.has(value)){
          fresh=value;break;
        }
      }
      if(!fresh)throw new Error('No se ha podido crear un identificador independiente.');
      copy.id=fresh;
    }
    const names=new Set(existingNames);
    if(names.has(copy.name)){
      let candidate=copy.name+' · importado',index=2;
      while(names.has(candidate))candidate=copy.name+' · importado '+index++;
      copy.name=candidate;
    }
    return {book:copy,duplicated,renamed:copy.name!==book.name};
  }
  function append(workspace,book){
    if(!object(workspace)||workspace.version!==1||!Array.isArray(workspace.projects))throw new Error('Biblioteca actual incompatible.');
    if(workspace.projects.some(p=>p.id===book.id))throw new Error('Ya hay un libro con ese identificador.');
    return {...workspace,projects:[...workspace.projects,book]};
  }
  return Object.freeze({inspect,prepare,append});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=MARGEN_BOOK_IMPORT;
