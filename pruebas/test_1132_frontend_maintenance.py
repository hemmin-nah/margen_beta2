"""Regresión de la compilación limpia: dependencias reales y dist/ seguro."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / "herramientas_frontend.py"
assert TOOL.is_file()


def call(project, *args, success=True):
    result = subprocess.run([sys.executable, str(project / "herramientas_frontend.py"), *args],
                            cwd=project, text=True, capture_output=True)
    if success and result.returncode:
        raise AssertionError((args, result.stdout, result.stderr))
    if not success and not result.returncode:
        raise AssertionError((args, "Se aceptó un proyecto inválido"))
    return result.stdout + result.stderr


with tempfile.TemporaryDirectory(prefix="margen-maintenance-") as temp:
    base = Path(temp)
    shutil.copy2(TOOL, base / "herramientas_frontend.py")
    assets = base / "frontend/assets"
    assets.mkdir(parents=True)
    html = '<!doctype html><html><head><link rel="stylesheet" href="./assets/app.css"></head>' \
           '<body><script src="./assets/app.js" defer></script></body></html>'
    index = base / "frontend/index.html"
    index.write_text(html, encoding="utf-8")
    (assets / "app.css").write_text('body{color:#333}\n', encoding="utf-8")
    (assets / "app.js").write_text('const ok = true;\n', encoding="utf-8")
    (assets / "logo.svg").write_text('<svg/>', encoding="utf-8")

    assert '1 scripts y 1 hojas CSS' in call(base, '--check')
    call(base)
    assert (base/'dist/assets/logo.svg').read_text() == '<svg/>'
    call(base, '--verify-dist')

    # Un cambio inesperado en dist debe detectarse.
    (base/'dist/assets/app.js').write_text('alterado', encoding="utf-8")
    assert 'no coincide' in call(base,'--verify-dist',success=False)
    call(base)
    original_dist = (base/'dist/index.html').read_bytes()

    # Un JS inválido nunca debe dejar a MARGEN sin el dist anterior.
    (assets/'app.js').write_text('function ( {',encoding="utf-8")
    assert 'Error de sintaxis' in call(base,success=False)
    assert (base/'dist/index.html').read_bytes()==original_dist
    (assets/'app.js').write_text('const ok = true;\n',encoding="utf-8")

    (assets/'extra.js').write_text('const unreferenced = 1;',encoding="utf-8")
    assert 'sin referencia' in call(base,'--check',success=False)
    (assets/'extra.js').unlink()

    index.write_text(html.replace('app.js','missing.js'),encoding="utf-8")
    assert 'no encontrado' in call(base,'--check',success=False)
    index.write_text(html.replace('</body>','<script src="./assets/app.js" defer></script></body>'),encoding="utf-8")
    assert 'duplicada' in call(base,'--check',success=False)
    index.write_text(html,encoding="utf-8")
    call(base,'--check')

# Comprobar que la build real tiene exactamente los archivos de fuente.
sys.path.insert(0,str(ROOT))
import herramientas_frontend as frontend
styles,scripts = frontend.referenced_assets()
assert len(styles) == len(set(styles)) and len(scripts) == len(set(scripts))
assert (ROOT/'frontend/assets/margen-1132.js') in scripts
assert (ROOT/'frontend/assets/margen-1132.css') in styles
print('PASS mantenimiento frontend 1.13.2: referencias, sintaxis, build seguro y paridad')
