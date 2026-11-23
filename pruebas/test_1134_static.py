"""Regresión estática sin dependencias externas para el workflow Windows 1.13.4."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
pkg=json.loads((root/'package.json').read_text('utf8'))
conf=json.loads((root/'src-tauri/tauri.conf.json').read_text('utf8'))
assert pkg['version']==conf['version']=='1.13.4'
index=(root/'frontend/index.html').read_text('utf8')
assert index.index('margen-1133.js')<index.index('margen-1134.js')
for f in ['margen-1134.js','margen-1134.css']:
    assert f in index and (root/'frontend/assets'/f).exists(),f
src=(root/'frontend/assets/margen-1134.js').read_text('utf8')
for token in ['m1134GridCard','m1134Grid','m1134Photo','m1134MetadataFields','m1134ShortDescription','m1134DrawPaper','m1134PreviousRestore','data-m1134-field','m1134PreviousSheet','m1134PreviousAction','m1134PreviousWire']:
    assert token in src,token
assert 'm1211MainPhoto' in src
assert 'm172Confirm' in src and 'p.trash.push' in src
assert 'm1134PreviousCrisp=m162CrispLines' in src
css=(root/'frontend/assets/margen-1134.css').read_text('utf8')
assert '.m1134-grid' in css and '.board-world.bg-wide' in css and '.board-world.bg-notebook' in css
wf=(root/'.github/workflows/build-windows.yml').read_text('utf8')
assert 'MARGEN-1.13.4-Windows-x64' in wf and 'test_1134_static.py' in wf
print('PASS MARGEN 1.13.4: módulos, HTML, versión, estilos, flujo Windows')
