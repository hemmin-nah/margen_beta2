"""Valida el código frontend y reconstruye dist/ desde una única fuente.

Los recursos JS/CSS se descubren en frontend/index.html, en su orden real.
No mantener una segunda lista manual: los módulos con sufijo de beta siguen activos.
"""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "frontend"
DESTINATION = ROOT / "dist"


class FrontendAssets(HTMLParser):
    """Registra scripts y estilos locales sin reorganizar su orden."""

    def __init__(self) -> None:
        super().__init__()
        self.scripts: list[str] = []
        self.styles: list[str] = []

    def handle_starttag(self, tag: str, attributes: list[tuple[str, str | None]]) -> None:
        attrs = dict(attributes)
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        elif tag == "link" and "stylesheet" in (attrs.get("rel") or "").split():
            if attrs.get("href"):
                self.styles.append(attrs["href"])


def referenced_assets() -> tuple[list[Path], list[Path]]:
    """Comprueba las referencias, los ficheros y los recursos huérfanos."""
    index = SOURCE / "index.html"
    if not index.is_file():
        raise ValueError("Falta frontend/index.html")
    parser = FrontendAssets()
    parser.feed(index.read_text(encoding="utf-8"))
    if not parser.scripts or not parser.styles:
        raise ValueError("El HTML debe declarar scripts y hojas de estilo")

    assets: list[Path] = []
    seen: set[Path] = set()
    for references, suffix in ((parser.styles, ".css"), (parser.scripts, ".js")):
        for reference in references:
            # No se introducen rutas externas, parámetros de query ni rutas fuera de assets.
            if not reference.startswith("./assets/") or not reference.endswith(suffix):
                raise ValueError(f"Referencia de {suffix} no local o no compatible: {reference}")
            rel = Path(reference[2:])
            if len(rel.parts) != 2 or rel.parts[0] != "assets":
                raise ValueError(f"Ruta de asset inesperada: {reference}")
            path = SOURCE / rel
            if path in seen:
                raise ValueError(f"Referencia duplicada en index.html: {reference}")
            if not path.is_file():
                raise ValueError(f"Asset no encontrado: {reference}")
            seen.add(path)
            assets.append(path)

    # Evita que queden betas JS/CSS sin cargar que alguien confunda con fuentes activas.
    unreferenced = sorted(p.name for p in (SOURCE / "assets").iterdir()
                          if p.is_file() and p.suffix in {".js", ".css"} and p not in seen)
    if unreferenced:
        raise ValueError("JS/CSS sin referencia: " + ", ".join(unreferenced))
    return ([SOURCE / Path(p[2:]) for p in parser.styles],
            [SOURCE / Path(p[2:]) for p in parser.scripts])


def check_frontend() -> None:
    styles, scripts = referenced_assets()
    executable = shutil.which("node")
    if executable is None:
        raise ValueError("Node.js no está instalado; no se puede comprobar el JavaScript")
    for script in scripts:
        result = subprocess.run([executable, "--check", str(script)], capture_output=True,
                                text=True, check=False)
        if result.returncode:
            raise ValueError(f"Error de sintaxis en {script.name}:\n{result.stderr}")
    print(f"Frontend válido: {len(scripts)} scripts y {len(styles)} hojas CSS; sin huérfanos")


def verify_dist() -> None:
    if not DESTINATION.is_dir():
        raise ValueError("Falta dist/: ejecuta python herramientas_frontend.py")
    original = {p.relative_to(SOURCE): p.read_bytes() for p in SOURCE.rglob("*") if p.is_file()}
    built = {p.relative_to(DESTINATION): p.read_bytes() for p in DESTINATION.rglob("*") if p.is_file()}
    if original.keys() != built.keys():
        raise ValueError("dist/ y frontend/ tienen una lista de archivos diferente")
    mismatches = [str(rel) for rel in original if original[rel] != built[rel]]
    if mismatches:
        raise ValueError("dist/ no coincide con las fuentes: " + ", ".join(mismatches[:10]))
    print(f"dist/ coincide exactamente con frontend/: {len(original)} archivos")


def rebuild() -> None:
    # Validar antes de sustituir una compilación que quizá siga funcionando.
    check_frontend()
    with tempfile.TemporaryDirectory(prefix="margen-front-", dir=ROOT) as temp:
        staging = Path(temp) / "dist"
        backup = Path(temp) / "dist-anterior"
        shutil.copytree(SOURCE, staging)
        if DESTINATION.exists():
            DESTINATION.rename(backup)
        try:
            staging.rename(DESTINATION)
        except OSError:
            if backup.exists() and not DESTINATION.exists():
                backup.rename(DESTINATION)
            raise
    verify_dist()


def main() -> None:
    parser = argparse.ArgumentParser(description="Construcción y comprobación del frontend MARGEN")
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--check", action="store_true", help="Valida referencias y sintaxis JS sin modificar archivos")
    action.add_argument("--verify-dist", action="store_true", help="Compara dist/ con frontend/")
    args = parser.parse_args()
    try:
        if args.check:
            check_frontend()
        elif args.verify_dist:
            referenced_assets()
            verify_dist()
        else:
            rebuild()
    except (OSError, ValueError) as exc:
        parser.exit(1, f"ERROR: {exc}\n")


if __name__ == "__main__":
    main()
