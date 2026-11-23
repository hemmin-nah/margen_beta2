"""Regresión estática de integración de importación aditiva MARGEN_BOOK 1.13.3."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
pkg=json.loads((root/'package.json').read_text('utf-8'))
conf=json.loads((root/'src-tauri/tauri.conf.json').read_text('utf-8'))
cargo=(root/'src-tauri/Cargo.toml').read_text('utf-8')
assert pkg['version']==conf['version']=='1.13.5'
assert 'version = "1.13.5"' in cargo
index=(root/'frontend/index.html').read_text('utf-8')
for path in ['margen-book-import-model.js','margen-1133.js','margen-1133.css']:
    assert path in index and (root/'frontend/assets'/path).is_file(),path
assert 'file-book-import' in index
js=(root/'frontend/assets/margen-1133.js').read_text('utf-8')
for token in ['m1133ChooseDialog','m1133InspectPayload','m1133Review','m1133Commit','m154Prepare','desktop_list_book_trash','desktop_load_book','m191ProjectRevision','save()','MARGEN_BOOK_IMPORT.append']:
    assert token in js,token
assert 'm1133PrevOnAction' in js and "==='restore'" in js
assert '1.13.3 · Beta' in js
assert (root/'src-tauri/src/lib.rs').read_text('utf-8').count('single_book_export_payload') >= 2
wf=(root/'.github/workflows/build-windows.yml').read_text('utf-8')
for val in ['test_1133_book_import_model.cjs','test_1133_single_book_import_static.py','MARGEN-1.13.5-Windows-x64']:
    assert val in wf,val
print('PASS MARGEN 1.13.3 static import and build checks')
