'use strict';
/* MARGEN 1.13.4 — Vista de tarjetas para personajes y escenarios.
 * La ficha detallada y sus datos anteriores siguen intactos.
 * La vista de tarjetas es solo presentación; resumen y etiquetas son optativos.
 * Fondos de líneas: una única geometría vectorial en el espacio de la pizarra.
 */
let m1134Overview = null;
const m1134T = (es,en) => typeof m146T==='function' ? m146T(es,en) : es;
const m1134Kinds = {characters:{array:'characters',key:'activeCharacterId',title:'Fichas de personaje',titleEn:'Character sheets',singular:'personaje',newLabel:'Nuevo personaje',icon:'users'},settings:{array:'settings',key:'activeSettingId',title:'Fichas de escenario',titleEn:'Setting sheets',singular:'escenario',newLabel:'Nuevo escenario',icon:'map'}};
function m1134Labels(record){
 const source=Array.isArray(record?.tags)?record.tags:typeof record?.tags==='string'?record.tags.split(','):[];
 return [...new Set(source.map(x=>String(x||'').trim()).filter(Boolean))].slice(0,8);
}
function m1134Photo(record){
 const photo=typeof m1211MainPhoto==='function'?m1211MainPhoto(record):record?.gallery?.find(x=>x.id===record.mainPhotoId)||record?.gallery?.[0];
 return typeof photo?.src==='string' && /^(data:image\/(?:png|jpeg|webp|gif);base64,|blob:|https?:\/\/)/i.test(photo.src) ? photo.src : '';
}
function m1134ShortDescription(record,isChar){
 const raw=record.summary||record.content||(isChar?record.background:record.atmosphere)||'';
 return String(raw).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,250);
}
function m1134GridCard(record,type){
 const isChar=type==='characters',photo=m1134Photo(record),labels=m1134Labels(record);
 const subtitle=isChar?(record.role||record.subtitle||''):(record.subtitle||'');
 const description=m1134ShortDescription(record,isChar);
 const cover=photo?`<img src="${esc(photo)}" alt="${esc(record.title||'')}" loading="lazy">`:`<span class="m1134-placeholder">${ic(isChar?'users':'map')}</span>`;
 const chips=labels.length?labels.map(tag=>`<span class="m1134-pill">${esc(tag)}</span>`).join(''):(subtitle?`<span class="m1134-pill">${esc(subtitle)}</span>`:'');
 return `<article class="m1134-card" data-m1134-card="${esc(record.id)}">
 <button type="button" class="m1134-card-open" data-action="m1134-open" data-m1134-type="${type}" data-id="${esc(record.id)}" aria-label="${esc(m1134T('Abrir ficha de ','Open sheet for ')+record.title)}">
 <span class="m1134-card-main"><span class="m1134-photo">${cover}</span><span class="m1134-card-copy"><strong class="m1134-card-title">${esc(record.title||m1134T('Sin nombre','Untitled'))}</strong><span class="m1134-card-subtitle">${esc(subtitle||m1134T(isChar?'Personaje':'Escenario',isChar?'Character':'Setting'))}</span><span class="m1134-card-desc">${esc(description||m1134T('Añade una descripción breve desde la ficha.','Add a short description in the sheet.'))}</span></span></span>
 ${chips?`<span class="m1134-card-tags">${chips}</span>`:'<span class="m1134-card-tags m1134-tags-empty" aria-hidden="true"></span>'}
 </button><button type="button" class="m1134-card-remove" data-action="m1134-archive" data-m1134-type="${type}" data-id="${esc(record.id)}" title="${esc(m1134T('Mover a la papelera','Move to trash'))}" aria-label="${esc(m1134T('Mover a la papelera: ','Move to trash: ')+record.title)}">×</button></article>`;
}
function m1134Grid(p,type){
 const cfg=m1134Kinds[type];if(!cfg)return '';
 const data=p[cfg.array]||[],isChar=type==='characters';
 const heading=`<div class="workspace-head m1134-head"><div><div class="eyebrow">${esc(p.name)} · ${m1134T(isChar?'Personajes':'Escenarios',isChar?'Characters':'Settings')}</div><h1>${m1134T(cfg.title,cfg.titleEn)}</h1></div><div class="head-actions"><button class="btn ghost m1134-trash" type="button" data-action="m1134-trash" title="${m1134T('Archivo y papelera','Archive and trash')}">${ic('trash')}</button><button class="btn primary" data-action="add-${isChar?'character':'setting'}">${ic('plus')} ${m1134T(cfg.newLabel,isChar?'New character':'New setting')}</button></div></div>`;
 // Los formularios invisibles conservan los enlaces de versiones anteriores que
 // se inicializan incluso cuando no estamos editando una ficha concreta.
 const compatibility=`<div class="m1134-compat-fields" hidden><input id="fiche-title" value=""><input id="fiche-subtitle" value=""><div id="fiche-body" contenteditable="false"></div></div>`;
 if(!data.length)return heading+compatibility+`<div class="empty-state">${ic(cfg.icon)}<h2>${m1134T('Aún no hay fichas','No sheets yet')}</h2><p>${m1134T('Crea tu primera ficha y aparecerá aquí.','Create your first sheet and it will appear here.')}</p><button class="btn primary" data-action="add-${isChar?'character':'setting'}">${ic('plus')} ${m1134T(cfg.newLabel,isChar?'New character':'New setting')}</button></div>`;
 return heading+compatibility+`<div class="main-scroll m1134-scroll"><div class="m1134-grid" aria-label="${m1134T(cfg.title,cfg.titleEn)}">${data.map(item=>m1134GridCard(item,type)).join('')}</div></div>`;
}
function m1134MetadataFields(record,type){
 const desc=m1134T('Descripción breve','Short description'),placeholder=m1134T('Una o dos líneas para la vista de tarjetas…','One or two lines for the card view…');
 const labels=m1134Labels(record).join(', ');
 return `<section class="m1134-card-fields" aria-label="${m1134T('Información de la tarjeta','Card information')}"><label>${desc}<textarea rows="2" maxlength="250" data-m1134-field="summary" placeholder="${placeholder}">${esc(record.summary||'')}</textarea></label><label>${m1134T('Etiquetas de la tarjeta','Card labels')}<input type="text" maxlength="300" data-m1134-field="tags" value="${esc(labels)}" placeholder="${m1134T('Principal, Familia, Nueva York…','Main, Family, New York…')}"><small>${m1134T('Sepáralas con comas; cada una aparecerá como una etiqueta.','Separate with commas; each will appear as a label.')}</small></label></section>`;
}
const m1134PreviousSheet=sheetHtml;
sheetHtml=function(p,type){
 if(!m1134Kinds[type])return m1134PreviousSheet(p,type);
 if(m1134Overview===type)return m1134Grid(p,type);
 let html=m1134PreviousSheet(p,type);
 const record=type==='characters'?activeCharacter():activeSetting();
 if(!record)return html;
 const back=`<button type="button" class="btn ghost m1134-back" data-action="m1134-overview" data-m1134-type="${type}">${ic('grid')} ${m1134T('Ver todas las fichas','All sheets')}</button>`;
 html=html.replace('<div class="head-actions">','<div class="head-actions">'+back);
 const fields=m1134MetadataFields(record,type);
 const anchor=type==='characters'?'<div class="char-grid">':'<div class="m12-setting-layout">';
 if(html.includes(anchor))html=html.replace(anchor,fields+anchor);
 return html;
};
function m1134OpenOverview(type){
 if(!m1134Kinds[type])return;
 m1134Overview=type;state.view=type;selectedElement=null;changed();render();
}
const m1134PreviousAction=onAction;
onAction=async function(event){
 const node=event.currentTarget,action=node?.dataset?.action,type=node?.dataset?.m1134Type;
 if(action==='m1134-overview'||action==='m1134-sidebar-grid'){m1134OpenOverview(type);return;}
 if(action==='m1134-trash'){state.view='notes';changed();render();return;}
 if(action==='m1134-open'&&m1134Kinds[type]){
  const cfg=m1134Kinds[type],record=activeProject()?.[cfg.array]?.find(x=>x.id===node.dataset.id);
  if(!record)return;
  m1134Overview=null;state[cfg.key]=record.id;state.view=type;changed();render();return;
 }
 if(action==='m1134-archive'&&m1134Kinds[type]){
  const p=activeProject(),cfg=m1134Kinds[type],record=p?.[cfg.array]?.find(x=>x.id===node.dataset.id);
  if(!record||!await m172Confirm(m1134T(`¿Mover «${record.title}» a la papelera? Podrás recuperarlo.`,`Move “${record.title}” to the trash? You can restore it.`)))return;
  p.trash=p.trash||[];p.trash.push({id:uid(),type,item:JSON.parse(JSON.stringify(record)),at:now()});
  p[cfg.array]=p[cfg.array].filter(x=>x.id!==record.id);
  if(state[cfg.key]===record.id)state[cfg.key]=p[cfg.array][0]?.id||null;
  m1134Overview=type;changed();render();showToast(m1134T('Ficha movida a la papelera','Sheet moved to trash'));return;
 }
 if(action==='show-category'&&m1134Kinds[node.dataset.view]){m1134OpenOverview(node.dataset.view);return;}
 if(action==='open-entry'&&m1134Kinds[node.dataset.type])m1134Overview=null;
 if(action==='add-character'||action==='add-setting')m1134Overview=null;
 return m1134PreviousAction.call(this,event);
};
function m1134SidebarLinks(){
 for(const type of Object.keys(m1134Kinds)){
  const head=document.querySelector(`.sidebar [data-section="${type}"] .tree-heading`);
  if(!head||head.querySelector('.m1134-grid-link'))continue;
  const link=document.createElement('button');link.type='button';link.className='mini-add m1134-grid-link';link.dataset.action='m1134-sidebar-grid';link.dataset.m1134Type=type;link.title=m1134T('Ver todas las fichas en tarjetas','View all sheets as cards');link.setAttribute('aria-label',link.title);link.innerHTML=ic('grid');
  link.addEventListener('click',onAction);head.insertBefore(link,head.querySelector('.mini-add'));
 }
}
const m1134PreviousSidebar=renderSidebarOnly;
renderSidebarOnly=function(...args){const result=m1134PreviousSidebar(...args);m1134SidebarLinks();return result;};
const m1134PreviousWire=wire;
wire=function(...args){
 const result=m1134PreviousWire(...args);
 document.querySelectorAll('[data-m1134-field]').forEach(node=>{
  const record=state.view==='characters'?activeCharacter():activeSetting();if(!record)return;
  node.addEventListener('input',()=>{
   if(node.dataset.m1134Field==='summary')record.summary=node.value;
   else if(node.dataset.m1134Field==='tags')record.tags=[...new Set(node.value.split(',').map(x=>x.trim()).filter(Boolean))].slice(0,8);
   changed();
  });
 });
 if(state.view==='boards')document.getElementById('board-background')?.addEventListener('change',()=>requestAnimationFrame(m1134DrawPaper));
 m1134SidebarLinks();return result;
};
// La geometría se define en coordenadas del propio mundo, no del viewport.
// Al desplazar o ampliar la pizarra no cambia la separación entre líneas.
function m1134DrawPaper(){
 if(state.view!=='boards'||activeBoard()?.boardType!=='free')return;
 const world=document.getElementById('board-world');if(!world)return;
 const type=activeBoard().background;
 let paper=world.querySelector('.m162-ruled-paper');if(!paper){paper=document.createElementNS('http://www.w3.org/2000/svg','svg');paper.classList.add('m162-ruled-paper');world.prepend(paper);}
 if(!['ruled','wide','notebook'].includes(type)){paper.replaceChildren();return;}
 const w=Number.parseFloat(world.style.width)||20000,h=Number.parseFloat(world.style.height)||14000;
 paper.setAttribute('width',String(w));paper.setAttribute('height',String(h));paper.setAttribute('viewBox',`0 0 ${w} ${h}`);
 paper.setAttribute('preserveAspectRatio','none');paper.style.width=w+'px';paper.style.height=h+'px';
 const step=type==='ruled'?41:type==='wide'?74:33,offset=type==='ruled'?54:type==='wide'?73:32;
 const horizontal=[];for(let y=offset;y<h;y+=step)horizontal.push(`M 0 ${y+.5} H ${w}`);
 const base=`<path d="${horizontal.join(' ')}" fill="none" stroke="currentColor" stroke-width="1" shape-rendering="crispEdges" vector-effect="non-scaling-stroke"/>`;
 const margin=type==='notebook'?`<path d="M 110.5 0 V ${h}" fill="none" stroke="rgba(182,112,105,.38)" stroke-width="2" vector-effect="non-scaling-stroke"/>`:'';
 // No es necesario conservar cientos de SVG individuales: un único path.
 paper.innerHTML=base+margin;
}
const m1134PreviousCrisp=m162CrispLines;
m162CrispLines=function(){m1134DrawPaper();};
// Mantener el fondo en concordancia también al restaurar Ctrl+Z/Ctrl+Y.
const m1134PreviousRestore=m113Restore;
m113Restore=function(raw){
 const result=m1134PreviousRestore(raw);
 const board=activeBoard(),world=document.getElementById('board-world');
 if(board&&world){world.className='board-world bg-'+(board.background||'dots');const picker=document.getElementById('board-background');if(picker)picker.value=board.background||'dots';m1134DrawPaper();}
 return result;
};
const m1134PreviousRender=render;
render=function(...args){if(m1134Overview && state.view!==m1134Overview)m1134Overview=null;const result=m1134PreviousRender(...args);const version=document.querySelector('.brand .m11-version');if(version)version.textContent='1.13.4 · Beta';m1134SidebarLinks();if(state.view==='boards')m1134DrawPaper();return result;};
