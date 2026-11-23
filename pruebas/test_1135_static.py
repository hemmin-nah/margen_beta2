"""Comprobación estática, portable a GitHub Actions Windows (sin Chromium)."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
package=json.loads((root/'package.json').read_text('utf8'))
conf=json.loads((root/'src-tauri/tauri.conf.json').read_text('utf8'))
cargo=(root/'src-tauri/Cargo.toml').read_text('utf8')
assert package['version']==conf['version']=='1.13.5'
assert 'version = "1.13.5"' in cargo
html=(root/'frontend/index.html').read_text('utf8')
assert html.index('margen-1134.js')<html.index('margen-1135.js')
assert 'margen-1135.css' in html and '1.13.5' in html
js=(root/'frontend/assets/margen-1135.js').read_text('utf8')
for token in ['centerNewPosition=function','m1135BoardCapture','m1135SetTextSize','m1135BookCardClick','m1134DrawPaper=function']:
    assert token in js,token
for name in ('margen-1134.js','margen-1135.js','margen-1135.css'):
    assert (root/'frontend/assets'/name).exists()
card=(root/'frontend/assets/margen-1134.js').read_text('utf8')
for token in ['m1134-folder','m1134ActiveFolder','m1134-folder-chip','slice(0,4)']:
    assert token in card,token
css=(root/'frontend/assets/margen-1135.css').read_text('utf8')
for token in ['.board-world.bg-ruled','.board-world.bg-wide','.board-world.bg-notebook','counter-reset:m1135-list','m1135-text-size']:
    assert token in css,token
workflow=(root/'.github/workflows/build-windows.yml').read_text('utf8')
for token in ['MARGEN-1.13.5-Windows-x64','test_1135_static.py','herramientas_frontend.py']:
    assert token in workflow,token
print('PASS MARGEN 1.13.5 - versión, fuentes, controles, estilos y workflow')
