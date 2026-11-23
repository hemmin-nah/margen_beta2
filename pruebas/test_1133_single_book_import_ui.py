"""Prueba de importación real de archivos JSON en Chromium, con puente Tauri simulado.
No prueba el binario ni SQLite: prueba el controlador de importación y sus datos.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
root=Path(__file__).resolve().parents[1]
html=(root/'frontend/index.html').read_text('utf8')
cssfiles=re.findall(r'<link rel="stylesheet" href="\./assets/([^\"]+\.css)">',html)
jsfiles=re.findall(r'<script src="\./assets/([^\"]+\.js)" defer></script>',html)
css='\n'.join((root/'frontend/assets'/n).read_text('utf8') for n in cssfiles)
js='\n'.join((root/'frontend/assets'/n).read_text('utf8') for n in jsfiles)
old={'id':'old-id','name':'Libro actual','chapters':[{'id':'a1','title':'Viejo','html':'<p>Sin cambios.</p>'}],'boards':[],'notes':[],'characters':[],'settings':[],'outlines':[],'chronologies':[]}
book={'id':'new-id','name':'Libro importado','chapters':[{'id':'c1','title':'Inicio','html':'<p>Personaje p1.</p>','characterId':'p1'}],'boards':[{'id':'b1','title':'Mapa','elements':[{'id':'x1','type':'note','title':'Nota','text':'Hola','groupId':'g1'}],'strokes':[]}],'notes':[], 'characters':[{'id':'p1','title':'Ana'}], 'settings':[], 'outlines':[], 'chronologies':[]}
workspace={'version':1,'theme':'light','view':'library','activeProjectId':'old-id','activeChapterId':'a1','projects':[old],'m145':{'language':'es','theme':'light','accent':'sage','workspace':'complete','onboarded':True}}
health={'ok':True,'appVersion':'1.13.3','dbSchema':1123,'previousUnclean':False,'recoveryAvailable':False,'backupCount':0,'latestBackup':'','resources':[],'issues':[]}
support={'appVersion':'1.13.3','dataDirectory':'C:/MARGEN','databaseSize':100,'dbSchema':1123,'backupCount':0,'latestBackup':'','legalText':'Licencias'}
mock=f'''window.__calls=[];window.__disk={json.dumps(workspace)};window.__trash=[];window.__fail=false;window.__readbackFail=false;window.__saveCount=0;
window.__TAURI__={{core:{{invoke:async(cmd,args={{}})=>{{
 if(cmd==='desktop_load_index'||cmd==='desktop_load_records')return {{workspace:structuredClone(window.__disk),'workspace-meta':{{token:window.__token||'t0'}}}};
 if(cmd==='desktop_load_book'){{window.__calls.push({{cmd,args}});return window.__readbackFail?null:structuredClone(window.__disk.projects.find(p=>p.id===args.bookId)||null)}};
 if(cmd==='desktop_save_incremental'){{
   if(window.__fail)throw Error('MARGEN_CONFLICT: otra ventana modificó la biblioteca');
   window.__calls.push({{cmd,args:structuredClone(args)}});
   const byId=new Map(window.__disk.projects.map(p=>[p.id,p]));
   for(const project of args.projects)byId.set(project.id,structuredClone(project));
   window.__disk={{...window.__disk,...args.root,projects:args.projectIds.map(id=>byId.get(id)).filter(Boolean)}};
   window.__saveCount++;window.__token='t'+window.__saveCount;
   return {{token:window.__token,recoveryAvailable:true}};
 }}
 if(cmd==='desktop_list_book_trash')return structuredClone(window.__trash);
 if(cmd==='desktop_load_cover')return null;
 if(cmd==='desktop_startup_health')return {json.dumps(health)};
 if(cmd==='desktop_support_info')return {json.dumps(support)};
 if(cmd==='desktop_library_info')return {{currentPath:'C:/MARGEN',defaultPath:'C:/MARGEN',custom:false,previousPath:null,previousCopyAvailable:false,trashCount:0}};
 if(cmd==='lexical_lookup')return {{query:args.term,definitions:[],synonymGroups:[]}};
 return null;
}}}}}};'''
html=re.sub(r'<link rel="stylesheet" href="\./assets/[^\"]+">','',html)
html=re.sub(r'<script src="\./assets/[^\"]+" defer></script>','',html)
html=html.replace('</head>','<style>'+css+'</style></head>').replace('</body>','<script>'+mock+'</script><script>'+js+'</script></body>')
def payload(b):return {'format':'MARGEN_BOOK','formatVersion':1,'appVersion':'1.13.1','book':b}
def submit_file(page,object_):
    page.locator('#file-book-import').set_input_files({'name':'libro.json','mimeType':'application/json','buffer':json.dumps(object_,ensure_ascii=False).encode('utf-8')})
    page.wait_for_timeout(100)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1300,'height':900});page.set_default_timeout(10000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='load');page.wait_for_timeout(900)
    page.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop').forEach(x=>x.remove())")
    assert page.evaluate("document.querySelector('.brand .m11-version')?.textContent")=='1.13.4 · Beta'
    assert page.locator('.m1133-library-import').count()==1
    # Separación explícita entre importación aditiva y restauración destructiva.
    page.locator('[data-action="restore"]').click();page.wait_for_timeout(50)
    assert page.locator('[data-m1133-book]').count()==1
    assert page.locator('[data-m1133-library]').count()==1
    page.locator('[data-m1133-book]').click();submit_file(page,payload(book))
    assert page.locator('[data-m1133-confirm]').count()==1
    assert 'Libro importado' in page.locator('.m1133-booktitle').inner_text()
    assert page.evaluate('window.__disk.projects.length')==1,'Review must not modify storage'
    page.locator('[data-m1133-confirm]').click();page.wait_for_timeout(150)
    saved=page.evaluate('window.__disk');assert len(saved['projects'])==2,saved
    assert saved['projects'][0]==old
    assert saved['projects'][1]['id']=='new-id'
    assert saved['projects'][1]['chapters']==book['chapters']
    assert saved['projects'][1]['boards']==book['boards']
    assert saved['projects'][1]['characters']==book['characters']
    assert any(call['cmd']=='desktop_load_book' for call in page.evaluate('window.__calls'))
    # Reimportar exactamente el mismo JSON: no reemplaza original, crea copia.
    submit_file(page,payload(book));assert page.locator('.m1133-warning').count()>0
    page.locator('[data-m1133-confirm]').click();page.wait_for_timeout(150)
    saved=page.evaluate('window.__disk');assert len(saved['projects'])==3,saved
    assert saved['projects'][1]['id']=='new-id'
    assert saved['projects'][2]['id'] not in ('old-id','new-id')
    assert saved['projects'][2]['name']=='Libro importado · importado'
    assert saved['projects'][2]['chapters'][0]['characterId']=='p1'
    assert saved['projects'][2]['characters'][0]['id']=='p1'
    # Una copia de biblioteca completa no puede entrar por el importador individual.
    submit_file(page,workspace);page.wait_for_timeout(50)
    assert page.locator('[data-m1133-confirm]').count()==0
    assert len(page.evaluate('window.__disk.projects'))==3
    # Colisión con un ID de un libro en papelera (no se ha de anular su restauración).
    page.evaluate('window.__trash=[{bookId:"trash-id"}]')
    trash_book={**book,'id':'trash-id','name':'Otro libro'}
    page.evaluate("document.querySelector('[data-m172-dialog]')?.remove()")
    submit_file(page,payload(trash_book));page.locator('[data-m1133-confirm]').click();page.wait_for_timeout(150)
    saved=page.evaluate('window.__disk');assert len(saved['projects'])==4
    assert saved['projects'][-1]['id']!='trash-id'
    assert not errors,errors
    # Si falla la escritura, la biblioteca anterior no se toca y la UI no confirma éxito.
    failing=browser.new_page(viewport={'width':1300,'height':900});failing.set_default_timeout(10000)
    failing.set_content(html,wait_until='load');failing.wait_for_timeout(900)
    failing.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop').forEach(x=>x.remove())")
    failing.evaluate('window.__fail=true')
    submit_file(failing,payload(book));failing.locator('[data-m1133-confirm]').click();failing.wait_for_timeout(120)
    assert len(failing.evaluate('window.__disk.projects'))==1
    assert failing.evaluate('state.projects.length')==1
    assert failing.locator('.m1133-feedback').count()==1
    assert 'No se pudo completar' in failing.locator('.m1133-feedback').inner_text()
    # Si SQLite hubiera guardado el libro pero la lectura de verificación fallara,
    # no ofrecer un reintento inmediato que crearía otro libro.
    uncertain=browser.new_page(viewport={'width':1300,'height':900});uncertain.set_default_timeout(10000)
    uncertain.set_content(html,wait_until='load');uncertain.wait_for_timeout(900)
    uncertain.evaluate("document.querySelectorAll('.m171-splash,.m170-intro-backdrop,.m171-guide-backdrop,.m111-backdrop').forEach(x=>x.remove())")
    uncertain.evaluate('window.__readbackFail=true')
    submit_file(uncertain,payload(book));uncertain.locator('[data-m1133-confirm]').click();uncertain.wait_for_timeout(150)
    assert len(uncertain.evaluate('window.__disk.projects'))==2
    assert uncertain.locator('[data-m1133-confirm]').is_disabled()
    assert 'no se pudo verificar' in uncertain.locator('.m1133-feedback').inner_text()
    browser.close()
print('PASS MARGEN 1.13.3 UI — add, duplicate, trash collision, reject library JSON')
