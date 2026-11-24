"""Regresión visual de MARGEN 1.13.7. Chromium simulado; no prueba Rust/SQLite."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'frontend/index.html').read_text('utf8')
styles=re.findall(r'<link rel="stylesheet" href="\./assets/([^"]+\.css)">',html)
scripts=re.findall(r'<script src="\./assets/([^"]+\.js)" defer></script>',html)
css='\n'.join((ROOT/'frontend/assets'/n).read_text('utf8') for n in styles)
js='\n'.join((ROOT/'frontend/assets'/n).read_text('utf8') for n in scripts)
html=re.sub(r'<link rel="stylesheet" href="\./assets/[^"]+">','',html)
html=re.sub(r'<script src="\./assets/[^"]+" defer></script>','',html)
html=html.replace('</head>',f'<style>{css}</style></head>').replace('</body>',f'<script>{js}</script></body>')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1600,'height':960},device_scale_factor=1)
    page.set_default_timeout(10000)
    errors=[]
    page.on('pageerror',lambda exc: errors.append(str(exc)))
    page.set_content(html,wait_until='load')
    page.wait_for_timeout(650)
    page.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop,.m172-dialog-backdrop').forEach(x=>x.remove())")
    page.evaluate('''() => {
     state=initial(); const base=state.projects[0];
     state.projects=[
       ['Años oscuros en Connecticut','Novela contemporánea',3],
       ['La casa junto al río','Borrador en curso',7],
       ['Los días que quedaron','Una historia por contar',4],
       ['Cuaderno de invierno','Ideas y escenas',2]
     ].map(([name,description,n],i)=>({...base,id:'demo-'+i,name,description,createdAt:new Date(2026,10,i+1).toISOString(),
        chapters:Array.from({length:n},(_,j)=>({id:'c'+i+j,title:'Capítulo '+(j+1),html:'<p>Un día distinto empezó a escribir.</p>'})),boards:[],notes:[],characters:[],settings:[],outlines:[]}));
     state.view='library'; state.activeProjectId='demo-0'; state.theme='light'; render();
    }''')
    page.wait_for_timeout(100)
    assert page.locator('.project-card:not(.new)').count()==4
    assert page.locator('.m165-library-search').count()==1
    assert page.locator('.m165-library-sort').count()==1
    assert page.locator('.m165-library-review').count()==1
    assert page.locator('.project-card.new').count()==1
    assert page.evaluate("getComputedStyle(document.querySelector('.project-card')).borderRadius")=='15px'
    assert page.evaluate("getComputedStyle(document.querySelector('.workspace-head h1')).fontFamily.includes('Georgia')")
    assert page.evaluate("document.querySelector('.main-scroll').scrollWidth<=document.querySelector('.main-scroll').clientWidth+2")
    page.screenshot(path='/mnt/data/MARGEN_1.13.7_vista_biblioteca.png',full_page=True)
    # Filtro y orden existentes siguen funcionando con el nuevo CSS.
    page.locator('#m165-search').fill('invierno')
    assert page.locator('.project-card:not(.new):visible').count()==1
    page.locator('#m165-search').fill('')
    assert page.locator('.project-card:not(.new):visible').count()==4
    page.locator('#m165-sort').select_option('chapters')
    assert 'La casa junto al río' in page.locator('.project-card:not(.new)').first.inner_text()
    # El modo noche usa las variables del tema, sin textos sobre fondos ilegibles.
    page.evaluate("state.theme='dark';render()")
    assert page.evaluate("document.documentElement.dataset.theme")=='dark'
    assert page.locator('.project-card:not(.new)').count()==4
    assert page.evaluate("getComputedStyle(document.querySelector('.project-card')).backgroundColor") != 'rgba(0, 0, 0, 0)'
    page.screenshot(path='/mnt/data/MARGEN_1.13.7_vista_biblioteca_noche.png',full_page=True)
    # Control con un ancho habitual de portátil: no desbordar horizontalmente.
    page.set_viewport_size({'width':1170,'height':750});page.wait_for_timeout(100)
    assert page.evaluate("document.querySelector('.main-scroll').scrollWidth <= document.querySelector('.main-scroll').clientWidth+2")
    assert not errors,errors
    browser.close()
print('PASS MARGEN 1.13.7 visual: biblioteca, filtros, ordenación, tema noche y diseño adaptable')
