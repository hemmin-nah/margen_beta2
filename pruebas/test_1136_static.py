"""1.13.7: verificación portable del control único y fichas compactas."""
from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
assert json.loads((r/'package.json').read_text('utf8'))['version']=='1.13.7'
assert json.loads((r/'src-tauri/tauri.conf.json').read_text('utf8'))['version']=='1.13.7'
js=(r/'frontend/assets/margen-1135.js').read_text('utf8')
assert '#chapter-size' in js and 'm1135SetTextSize' in js
assert 'data-m1135-font-size' not in js
assert 'ch.layout.size=px' in js and 'm1135SizeRange' in js
card=(r/'frontend/assets/margen-1134.js').read_text('utf8')
css=(r/'frontend/assets/margen-1134.css').read_text('utf8')
assert 'm1134-card-fields' in card and 'data-m1134-field="summary"' in card and 'data-m1134-field="tags"' in card
assert 'padding:9px 12px' in css and 'margin-bottom:10px' in css
assert 'MARGEN-1.13.7-Windows-x64' in (r/'.github/workflows/build-windows.yml').read_text('utf8')
print('PASS MARGEN 1.13.7 static - único tamaño, fichas compactas, build')
