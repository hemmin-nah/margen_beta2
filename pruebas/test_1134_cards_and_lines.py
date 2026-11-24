"""MARGEN 1.13.4: tarjetas y papel de líneas en Chromium simulado.
Ejecutar desde la raíz: python pruebas/test_1134_cards_and_lines.py
No sustituye la compilación Tauri / prueba con biblioteca real en Windows.
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
html=html.replace('</head>',f'<style>{css}</style></head>')
html=html.replace('</body>',f'<script>{js}</script></body>')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1670,'height':900});page.set_default_timeout(9000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='load');page.wait_for_timeout(1000)
    page.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop').forEach(x=>x.remove())")
    page.evaluate("""() => {
       state=initial(); const p=state.projects[0]; p.characters=[
         {id:'c1',title:'Asher Seinfeld',role:'Protagonista · Nueva York',subtitle:'Protagonista · Nueva York',summary:'Una descripción muy breve de un personaje.',tags:['Principal','Nueva York','Amigo'],gallery:[],arc:[]},
         {id:'c2',title:'Vera',role:'Secundaria',subtitle:'Secundaria',summary:'Una amiga de la ciudad.',gallery:[],arc:[]}];
       p.settings=[{id:'s1',title:'Cafetería del barrio',subtitle:'Nueva York · Café',summary:'Un lugar de reunión.',tags:['Interior','Recurrente'],gallery:[]}];
       p.boards=[{id:'b1',title:'Prueba',boardType:'free',diagramMode:'free',m113Infinite:true,background:'ruled',zoom:1,panX:-8000,panY:-5600,elements:[],strokes:[]}];
       state.activeProjectId=p.id;state.activeCharacterId='c1';state.activeSettingId='s1';state.activeBoardId='b1';
       state.view='book';render();
    }""")
    page.evaluate("document.querySelectorAll('.m172-dialog-backdrop,.modal-backdrop').forEach(x=>x.remove())")
    page.locator('[data-action="show-category"][data-view="characters"]').first.click();
    assert page.locator('.m1134-card').count()==2
    assert 'Fichas de personaje' in page.locator('.m1134-head h1').inner_text()
    assert page.locator('.m1134-pill').count()==4
    assert page.locator('.m1134-card').first.locator('.m1134-pill').count()==3
    page.screenshot(path='/mnt/data/margen1134_cards_preview.png',full_page=True)
    page.locator('[data-action="m1134-open"][data-id="c1"]').click()
    assert page.locator('[data-m1134-field="summary"]').count()==1
    page.locator('[data-m1134-field="summary"]').fill('Nueva descripción breve')
    page.locator('[data-m1134-field="tags"]').fill('Amigo, Principal, Puerto')
    assert page.evaluate("state.projects[0].characters[0].tags") == ['Amigo','Principal','Puerto']
    page.locator('[data-action="m1134-overview"]').click()
    assert 'Nueva descripción breve' in page.locator('.m1134-card').first.inner_text()
    assert 'Puerto' in page.locator('.m1134-card').first.inner_text()
    # Un clic en X solicita confirmación, no borra a ciegas.
    page.evaluate("m172Confirm=async()=>true")
    page.locator('[data-action="m1134-archive"][data-id="c2"]').click()
    page.wait_for_timeout(120)
    assert page.locator('.m1134-card').count()==1
    assert len(page.evaluate("state.projects[0].trash"))==1
    page.evaluate("state.view='book';render()")
    page.locator('[data-action="show-category"][data-view="settings"]').first.click()
    assert page.locator('.m1134-card').count()==1
    assert 'Fichas de escenario' in page.locator('h1').first.inner_text()
    page.locator('[data-action="m1134-open"][data-id="s1"]').click()
    assert page.locator('[data-m1134-field="summary"]').count()==1
    page.locator('[data-action="m1134-overview"]').click()
    assert page.locator('.m1134-card').count()==1
    page.evaluate("state.view='boards';render()")
    # El fondo 1.13.7 se pinta en CSS, no con un SVG gigante oculto.
    for kind in ['ruled','wide','notebook']:
        page.evaluate("kind=>{activeBoard().background=kind;document.getElementById('board-world').className='board-world bg-'+kind;m1134DrawPaper()}",kind)
        assert 'gradient' in page.locator('#board-world').evaluate('e=>getComputedStyle(e).backgroundImage')
        assert page.locator('.m162-ruled-paper').count()==0
    page.evaluate("activeBoard().background='grid';document.getElementById('board-world').className='board-world bg-grid';m1134DrawPaper()")
    assert not errors,errors
    browser.close()
print('OK: tarjetas personajes/escenarios, edición, vista general y papel vectorial uniforme.')
