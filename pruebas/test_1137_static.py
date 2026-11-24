"""MARGEN 1.13.7: guardarraíles de presentación, sin dependencias externas."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
html=(root/'frontend/index.html').read_text('utf8')
pkg=json.loads((root/'package.json').read_text('utf8'))
conf=json.loads((root/'src-tauri/tauri.conf.json').read_text('utf8'))
cargo=(root/'src-tauri/Cargo.toml').read_text('utf8')
css=(root/'frontend/assets/margen-1137.css').read_text('utf8')
assert pkg['version']==conf['version']=='1.13.7'
assert 'version = "1.13.7"' in cargo
assert html.count('margen-1137.css')==1
assert html.index('margen-1135.css')<html.index('margen-1137.css')
assert '1.13.7' in html
for token in ('var(--surface)','var(--line)','var(--ink)','--m137-shadow-card','prefers-reduced-motion','html[data-theme="dark"]','project-card','m165-library-search','m1134-card'):
    assert token in css,token
assert 'font-face' not in css and '@import' not in css
assert 'chapter-editor' not in css and 'screenplay-editor' not in css  # no interferir con los documentos
assert 'MARGEN-1.13.7-Windows-x64' in (root/'.github/workflows/build-windows.yml').read_text('utf8')
print('PASS 1.13.7: versión, hojas de estilo, temas y build Windows')
