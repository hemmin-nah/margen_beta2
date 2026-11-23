# MARGEN 1.13.3 Beta — Proyecto Windows / Tauri

**Base: MARGEN 1.13.2 con pizarra consolidada y corrección de HTTP 503.** Esta versión añade la importación individual de libros. No incluye instalador `.exe`.

## Novedad de la versión 1.13.3

Se puede **importar un solo libro MARGEN_BOOK v1 sin sustituir los demás**. Desde Biblioteca → «Importar libro» (o desde el icono de importación de la cabecera), elige el JSON individual, revisa el contenido y confirma. La opción de restaurar toda la biblioteca permanece separada. Ante un identificador duplicado se crea una copia distinta. Consulta `CAMBIOS_1133.md` y `GUIA_BETA_TESTER_1133.md`.

## Qué se había limpiado en la base 1.13.2

- Las capturas de pantalla y los documentos de resultados de pruebas, generados en versiones anteriores.
- `cambios/`, parches antiguos que ya se integraron en el frontend activo.
- `dist/`, que era una copia idéntica del frontend; **se regenera automáticamente antes de compilar**.
- Las notas y guías de versiones anteriores. El historial queda disponible en un ZIP separado.

**Importante:** los archivos `frontend/assets/margen-110.js`, `margen-121.js`, `margen-170.js`, etc. **no son restos inactivos**: el frontend los carga y por eso deben permanecer. Tampoco se han quitado las pruebas Python, los archivos de licencias, ni el workflow de GitHub.

## Segunda fase: refactorización del módulo de pizarra

La selección por grupos, geometría del rectángulo de selección, cálculo de límites al mover y clonación de grupos se han extraído a **`frontend/assets/margen-board-model.js`**, un módulo sin acceso al DOM, Rust o SQLite. El controlador `margen-1132.js` sigue gestionando punteros, elementos visuales e historial; no cambia el esquema de datos.

El HTML debe cargar `margen-board-model.js` **antes** de `margen-1132.js`. El workflow de GitHub lo comprueba con pruebas Node, y `herramientas_frontend.py` valida los 19 scripts activos. Consulta `INFORME_PIZARRA_REFACTORIZACION_1132.md`.

## Revisión interna del código

Se ha aplicado una **primera limpieza conservadora del código** sobre la versión 1.13.2, centrada en una duplicación de la pizarra y en automatizar la detección y validación de scripts/estilos. No es una reescritura del editor ni de SQLite. Lee `INFORME_REFACTORIZACION_CODIGO_1132.md` para los detalles, pruebas realizadas y límites.

## Consolidación de controladores de pizarra (mantenimiento adicional)

Se han retirado las versiones sobrescritas de selección rectangular, controles sobre trazos y pegado; las sesiones de puntero de la pizarra comparten ahora un único ciclo de registro y limpieza. No se alteran las herramientas ni el formato de guardado. Consulta `INFORME_CONSOLIDACION_PIZARRA_1132.md` y ejecuta `python pruebas/test_1132_board_controller_consolidation.py` antes de compilar.

## Cómo compilar (GitHub Actions)

1. Exporta una copia **JSON completa** de tus libros desde la versión que ya funciona y guárdala fuera de MARGEN.
2. Extrae el ZIP y sube **el contenido interior de la carpeta** a GitHub, incluidas `.github`, `frontend`, `src-tauri`, `pruebas`, `herramientas_frontend.py`, `herramientas_lexicas.py` y `package.json`.
3. **Muy importante:** si reutilizas un repositorio con archivos antiguos, al subir nuevos ficheros GitHub NO borra los anteriores. Elimina del repositorio los archivos obsoletos antes de dar la limpieza por terminada. Consulta `INFORME_LIMPIEZA_1132.md`.
4. En GitHub, abre **Actions → Compilar MARGEN para Windows → Run workflow**. No pulses "Re-run" de una ejecución antigua, porque usa el commit original.
5. Si todo acaba en verde, descarga **MARGEN-1.13.3-Windows-x64** y utiliza el instalador `.exe` dentro del artefacto.

El workflow reconstruye `dist/` antes de ejecutar las pruebas Rust. También se ha configurado `beforeBuildCommand` para que un build Tauri directo lo regenere.

## Comprobación local

```bash
python herramientas_frontend.py
npm run check:frontend
npm run verify:frontend
python pruebas/test_1132_frontend_maintenance.py
python herramientas_lexicas.py --test
python pruebas/test_1132_lexicon_download.py
python pruebas/test_1121_release_static.py
python pruebas/test_1131_single_book_export.py
python pruebas/test_1132_release_static.py
node pruebas/test_1132_board_model.cjs
python pruebas/test_1132_board_groups.py
node pruebas/test_1133_book_import_model.cjs
python pruebas/test_1133_single_book_import_static.py
python pruebas/test_1133_single_book_import_ui.py
```

El paso `python herramientas_lexicas.py --build` requiere acceso a las fuentes oficiales de los diccionarios y la verificación de licencias sigue activa.

La actualización **cambia la versión a 1.13.3**, pero conserva el identificador `com.margen.escritorio`, el modelo SQLite y los documentos de los usuarios. Los diccionarios se generan en la build y no estaban incluidos en el ZIP original. No se ha compilado un instalador Windows aquí; hay que verificarlo en GitHub Actions.
