"""Beta 1.13.7: único control de tamaño, selección parcial, estilo global y fichas compactas.
Prueba con Chromium y backend simulado; no valida instalación en Windows ni SQLite.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'frontend/index.html').read_text('utf8')
css='\n'.join((root/'frontend/assets'/x).read_text('utf8') for x in re.findall(r'<link rel="stylesheet" href="\./assets/([^"]+\.css)">',html))
js='\n'.join((root/'frontend/assets'/x).read_text('utf8') for x in re.findall(r'<script src="\./assets/([^"]+\.js)" defer></script>',html))
html=re.sub(r'<link rel="stylesheet" href="\./assets/[^"]+">','',html)
html=re.sub(r'<script src="\./assets/[^"]+" defer></script>','',html)
html=html.replace('</head>',f'<style>{css}</style></head>').replace('</body>',f'<script>{js}</script></body>')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1600,'height':950});page.set_default_timeout(7000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load')
 page.wait_for_timeout(600)
 page.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop,.m172-dialog-backdrop').forEach(x=>x.remove())")
 page.evaluate('''() => {
 state=initial();const p=state.projects[0];
 p.chapters=[{id:'c1136',title:'Capítulo',documentTitle:'Capítulo',html:'<p>El viento suave llegaba al puerto.</p><p>Otro párrafo sin cambios.</p>',layout:{font:'Georgia',size:18,leading:1.9,margin:60},mode:'prose'}];
 p.characters=[{id:'p1136',title:'Persona',summary:'Breve descripción de prueba.',tags:['Uno','Dos'],gallery:[]}];
 p.settings=[{id:'s1136',title:'Lugar',summary:'Otra descripción.',tags:['Tres'],gallery:[]}];
 state.activeProjectId=p.id;state.activeChapterId='c1136';state.activeCharacterId='p1136';state.activeSettingId='s1136';state.view='manuscript';render();
 }''')
 assert page.locator('#chapter-size').count()==1
 assert page.locator('[data-m1135-font-size]').count()==0
 # 1. Solo una palabra recibe el tamaño pedido desde el CONTROL EXISTENTE.
 page.evaluate('''() => {const text=document.querySelector('#chapter-editor p').firstChild;
  const r=document.createRange();r.setStart(text,3);r.setEnd(text,9);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}''')
 page.wait_for_timeout(80)
 page.locator('#chapter-size').fill('28')
 page.locator('#chapter-size').press('Tab')
 assert page.evaluate('activeChapter().layout.size')==18
 assert page.evaluate("document.querySelector('#chapter-editor p').innerText")=='El viento suave llegaba al puerto.'
 assert page.evaluate("document.querySelectorAll('#chapter-editor p')[1].textContent")=='Otro párrafo sin cambios.'
 assert page.evaluate("document.querySelector('#chapter-editor p span')?.style.fontSize")=='28px'
 assert page.evaluate("getComputedStyle(document.querySelectorAll('#chapter-editor p')[1]).fontSize")=='18px'
 assert page.locator('#chapter-size').input_value()=='18'
 assert 'font-size: 28px' in page.evaluate('activeChapter().html')
 # 2. Sin texto seleccionado, sigue siendo el control global original.
 page.evaluate('''() => {const ed=document.getElementById('chapter-editor');const text=ed.querySelectorAll('p')[1].firstChild;
  const r=document.createRange();r.setStart(text,2);r.collapse(true);const s=window.getSelection();s.removeAllRanges();s.addRange(r)}''')
 page.wait_for_timeout(80)
 page.locator('#chapter-size').fill('20')
 page.locator('#chapter-size').press('Tab')
 assert page.evaluate('activeChapter().layout.size')==20
 assert page.evaluate("getComputedStyle(document.querySelectorAll('#chapter-editor p')[1]).fontSize")=='20px'
 assert page.evaluate("document.querySelector('#chapter-editor p span')?.style.fontSize")=='28px'
 # 3. Título del capítulo: contextual, sin afectar al cuerpo.
 page.locator('#chapter-title').focus()
 page.locator('#chapter-size').fill('24')
 page.locator('#chapter-size').press('Tab')
 assert page.evaluate('activeChapter().titleLayout.fontSize')==24
 assert page.evaluate('activeChapter().layout.size')==20
 # 4. Formulario compacto en personajes y escenarios, sin pérdida de campos.
 for which,active in [('characters','p1136'),('settings','s1136')]:
  page.evaluate('''data=>{state.view=data[0];m1134Overview=null;if(data[0]==='characters')state.activeCharacterId=data[1];else state.activeSettingId=data[1];render()}''',[which,active])
  assert page.locator('.m1134-card-fields').count()==1
  assert page.locator('[data-m1134-field="summary"]').count()==1
  assert page.locator('[data-m1134-field="tags"]').count()==1
  h=page.locator('.m1134-card-fields').evaluate('node=>node.getBoundingClientRect().height')
  assert h<105,(which,h)
  page.locator('[data-m1134-field="summary"]').fill('Otra nota breve.')
  value=page.evaluate("(kind)=>kind==='characters'?activeCharacter().summary:activeSetting().summary",which)
  assert value=='Otra nota breve.'
 assert not errors,errors
 browser.close()
print('PASS MARGEN 1.13.7: selección parcial, tamaño general/título y fichas compactas')
