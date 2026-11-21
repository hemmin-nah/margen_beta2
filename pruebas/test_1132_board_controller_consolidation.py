"""Guardas estáticas para evitar reinstalar controladores desactivados en la pizarra."""
from pathlib import Path

root=Path(__file__).resolve().parents[1]
old121=(root/'frontend/assets/margen-121.js').read_text('utf8')
old113=(root/'frontend/assets/margen-113.js').read_text('utf8')
current=(root/'frontend/assets/margen-1132.js').read_text('utf8')

# Las entradas históricas siguen declaradas para los renders, pero sus handlers
# anteriores ya no deben registrarse ni seguir ejecutando lógica contradictoria.
assert 'let m1211BindBoardSelection;' in old121
assert 'function m1211BindBoardSelection(' not in old121
assert 'm1211Marquee' not in old121
assert 'm1211PrevDrawStrokes' not in old121
assert 'let m113BindStrokeHits;' in old113
assert 'function m113BindStrokeHits(' not in old113
assert 'let m113Paste;' in old113
assert 'function m113Paste(' not in old113
assert 'startItemDrag=function' not in old113
# Un único ciclo de instalación/limpieza para tres interacciones activas.
assert current.count('function m1132TrackPointer(')==1
assert current.count('m1132TrackPointer(')==4
for name in ['pointermove','pointerup','pointercancel']:
    assert current.count("window.addEventListener('"+name+"'")==1
    assert current.count("window.removeEventListener('"+name+"'")==1
assert 'm1132PreviousStartItemDrag' in current
print('PASS pizarra: controladores anteriores retirados y sesiones de puntero consolidadas')
