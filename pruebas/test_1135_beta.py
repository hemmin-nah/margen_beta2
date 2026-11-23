"""Pruebas de interfaz 1.13.5 con puente de escritorio simulado.
No sustituyen las pruebas Rust/SQLite/WebView2 en Windows.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'frontend/index.html').read_text('utf8')
styles=re.findall(r'<link rel="stylesheet" href="\./assets/([^\"]+\.css)">',html)
scripts=re.findall(r'<script src="\./assets/([^\"]+\.js)" defer></script>',html)
css='\n'.join((ROOT/'frontend/assets'/p).read_text('utf8') for p in styles)
js='\n'.join((ROOT/'frontend/assets'/p).read_text('utf8') for p in scripts)
html=re.sub(r'<link rel="stylesheet" href="\./assets/[^\"]+">','',html)
html=re.sub(r'<script src="\./assets/[^\"]+" defer></script>','',html)
html=html.replace('</head>',f'<style>{css}</style></head>').replace('</body>',f'<script>{js}</script></body>')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1670,'height':950});page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load');page.wait_for_timeout(750)
 page.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop,.m172-dialog-backdrop').forEach(x=>x.remove())")
 page.evaluate('''() => {
    state=initial(); const p=state.projects[0];
    p.chapters=[{id:'chap1',title:'Capítulo 1',documentTitle:'Capítulo 1',html:'<h2>Encabezado</h2><p>Texto original.</p>',layout:{font:'Georgia',size:18,leading:1.9,margin:60},mode:'prose'}];
    p.characterFolders=[{id:'f1',title:'Gente de Elche',collapsed:false},{id:'f2',title:'Nueva York',collapsed:false}];
    p.settingFolders=[{id:'sf1',title:'Imprenta',collapsed:false}];
    p.characters=[{id:'c1',title:'Asher',folderId:'f1',tags:['Principal','Amigo','Imprenta','Nueva York','Extra'],gallery:[]},{id:'c2',title:'Vera',folderId:'f2',tags:['Amiga'],gallery:[]}];
    p.settings=[{id:'s1',title:'Taller',folderId:'sf1',tags:['Trabajo'],gallery:[]},{id:'s2',title:'Parque',tags:[],gallery:[]}];
    p.boards=[{id:'b1',title:'Prueba',boardType:'free',diagramMode:'free',m113Infinite:true,background:'ruled',zoom:1,panX:-8000,panY:-5600,elements:[],strokes:[]}];
    state.activeProjectId=p.id;state.activeChapterId='chap1';state.activeBoardId='b1';state.activeCharacterId='c1';state.activeSettingId='s1';state.view='book';render();
 }''')
 page.evaluate("document.querySelectorAll('.m172-dialog-backdrop,.modal-backdrop').forEach(x=>x.remove())")
 # Vista general de personajes y filtrado por carpeta.
 page.evaluate("state.view='characters';m1134Overview='characters';render()")
 assert page.locator('.m1134-folder-chip').count()==4
 assert page.locator('.m1134-card').count()==2
 assert page.locator('.m1134-card').first.locator('.m1134-pill').count()==4
 page.locator('.m1134-folder-chip',has_text='Gente de Elche').click()
 assert page.locator('.m1134-card').count()==1
 assert 'Asher' in page.locator('.m1134-card').inner_text()
 page.locator('.m1134-folder-chip',has_text='Nueva York').click()
 assert page.locator('.m1134-card').count()==1
 assert 'Vera' in page.locator('.m1134-card').inner_text()
 page.locator('.m1134-folder-chip',has_text='Todas las fichas').click()
 page.locator('.m1134-card').first.locator('[data-action="m1134-open"]').click()
 page.locator('[data-m1134-field="tags"]').fill('Uno, Dos, Tres, Cuatro, Cinco')
 page.locator('[data-m1134-field="tags"]').blur()
 assert len(page.evaluate("activeCharacter().tags"))==4
 # También escenarios usan los filtros; sin carpeta muestra fichas sueltas.
 page.evaluate("state.view='settings';m1134Overview='settings';render()")
 assert page.locator('.m1134-card').count()==2
 page.locator('.m1134-folder-chip',has_text='Imprenta').click()
 assert page.locator('.m1134-card').count()==1
 page.locator('.m1134-folder-chip',has_text='Sin carpeta').click()
 assert 'Parque' in page.locator('.m1134-card').inner_text()
 # Papel reglado: verificar CSS efectivo, no un SVG oculto.
 page.evaluate("state.view='boards';render()")
 world=page.locator('#board-world')
 for kind in ['ruled','wide','notebook']:
    page.evaluate('''kind=>{const b=activeBoard();b.background=kind;const w=document.getElementById('board-world');w.className='board-world bg-'+kind;m1134DrawPaper()}''',kind)
    bg=world.evaluate('el=>getComputedStyle(el).backgroundImage')
    assert 'gradient' in bg and bg!='none',(kind,bg)
    assert world.locator('.m162-ruled-paper').count()==0
 # Los elementos nuevos se colocan en el área que está viendo el escritor.
 page.locator('[data-action="board-add-note"]').click()
 pos=page.evaluate('''() => {const b=activeBoard(),it=b.elements.at(-1),vp=document.getElementById('board-viewport');return {x:(it.x*b.zoom+b.panX),y:(it.y*b.zoom+b.panY),w:vp.clientWidth,h:vp.clientHeight}}''')
 assert 0<=pos['x']<pos['w'] and 0<=pos['y']<pos['h'],pos
 # Cuentagotas: primer trazo usa el valor ya escogido.
 page.evaluate('''() => {m113SelectTool('pen');document.getElementById('pen-color').value='#ff3366';document.getElementById('pen-color').dispatchEvent(new Event('input',{bubbles:true}))}''')
 canvas=page.locator('#drawing-layer');vp=page.locator('#board-viewport');r=vp.bounding_box()
 # Interacción física. Canvas ocupa todo el mundo transformado, no un píxel.
 px=r['x']+r['width']*.65;py=r['y']+r['height']*.55
 page.mouse.move(px,py);page.mouse.down();page.mouse.move(px+60,py+35,steps=5);page.mouse.up()
 page.wait_for_timeout(150)
 strokes=page.evaluate('activeBoard().strokes')
 assert strokes and strokes[-1]['color'].lower()=='#ff3366',strokes
 page.keyboard.press('Control+z');page.wait_for_timeout(100)
 assert len(page.evaluate('activeBoard().strokes'))==0
 page.keyboard.press('Control+y');page.wait_for_timeout(100)
 assert len(page.evaluate('activeBoard().strokes'))==1
 # Editor: cambio puntual de encabezado y jerarquía visual.
 page.evaluate("state.view='manuscript';render()")
 assert page.locator('[data-m1135-font-size]').count()==1
 page.evaluate('''() => {const el=document.querySelector('#chapter-editor h2');const range=document.createRange();range.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(range)}''')
 page.locator('[data-m1135-font-size]').select_option('32')
 assert 'font-size: 32px' in page.locator('#chapter-editor').inner_html()
 assert '32px' in page.evaluate("getComputedStyle(document.querySelector('#chapter-editor h2 span')).fontSize")
 # Tamaño independiente del título del capítulo (no cambia los párrafos).
 page.locator('#chapter-title').focus()
 page.locator('[data-m1135-font-size]').select_option('40')
 assert page.evaluate('activeChapter().titleLayout.fontSize')==40
 assert page.locator('#chapter-title').evaluate('e=>getComputedStyle(e).fontSize')=='40px'
 # Niveles anidados y alineación a la derecha.
 page.evaluate('''() => {const ed=document.getElementById('chapter-editor');ed.innerHTML='<ol><li>Uno<ol><li>Uno uno<ol><li style="text-align:right">Uno uno uno</li></ol></li></ol></li></ol>';}''')
 assert page.locator('#chapter-editor ol').count()==3
 assert 'counters' in page.evaluate("getComputedStyle(document.querySelector('#chapter-editor ol li'),'::before').content")
 assert page.locator('#chapter-editor ol ol ol>li').evaluate("e=>getComputedStyle(e).textAlign")=='right'
 page.evaluate('''() => {const ed=document.getElementById('chapter-editor');ed.innerHTML='<div style="text-align:right"><ul><li>Viñeta a derecha</li></ul></div>';ed.dispatchEvent(new Event('input',{bubbles:true}))}''')
 assert 'm1135-right-list' in page.locator('#chapter-editor ul li').get_attribute('class')
 # Biblioteca: un solo clic abre el libro.
 page.evaluate("state.view='library';render()")
 page.evaluate('''() => {state.projects[0]._margenLazy=true;state.projects[0]._margenSummary={words:0,hasCover:false};m110LoadBook=async id=>{await new Promise(r=>setTimeout(r,50));const b=state.projects.find(p=>p.id===id);delete b._margenLazy;delete b._margenSummary;return b};render()}''')
 page.locator('.projects-grid [data-action="open-project"]').first.click()
 page.wait_for_function("state.view==='book'",timeout=4000)
 assert not page.evaluate('state.projects[0]._margenLazy')
 assert not errors,errors
 browser.close()
print('PASS 1.13.5: filtros, etiquetas, fondos visibles, objeto visible, pincel+undo/redo, editor y libro a un clic')
