# MARGEN 1.13.5 Beta — Proyecto Windows / Tauri

**Base: MARGEN 1.13.4 con fichas en tarjetas e importación individual.** La 1.13.5 corrige el fondo de líneas y añade ajustes del editor, filtro de carpetas y apertura a un clic. No incluye instalador `.exe`.

## Novedad de la versión 1.13.5

- **Editor:** control independiente de tamaño en píxeles de la selección, del bloque de texto o del título editorial del capítulo, sin modificar la tipografía general de todos los párrafos; listas numeradas con niveles jerárquicos y ajuste de viñetas cuando el contenido se alinea a la derecha.
- **Pizarra:** los tres fondos de líneas se dibujan con gradientes CSS sobre el lienzo (se retira el enorme SVG oculto de 1.13.4). Crear notas, textos e imágenes utiliza el centro visible del lienzo grande. Los trazos de pincel guardan su estado anterior y desdibujan el foco de notas al comenzar, para que Ctrl+Z actúe sobre el dibujo; el cuentagotas actualiza el color del primer trazo.
- **Fichas de personaje y escenario:** máximo cuatro etiquetas por tarjeta; encima de la cuadrícula aparecen pestañas de las carpetas existentes, «Todas las fichas» y «Sin carpeta», que filtran la vista sin alterar la organización. Botones de la barra izquierda con posiciones estables.
- **Biblioteca:** clic único sobre la portada/tarjeta, incluso para libros de carga diferida.

El proyecto mantiene el identificador y formato de datos de la 1.13.4. No hay migración de SQLite. Ver `CAMBIOS_1135.md` y `GUIA_BETA_TESTER_1135.md`.

## Novedad de la versión 1.13.4

**Personajes y escenarios:** nueva vista en tarjetas según el diseño de referencia, con imagen principal, nombre, rol/tipo, descripción breve y etiquetas. Se abre desde «Ver tarjetas» (icono de cuadrícula de las secciones de la barra lateral) o desde las secciones de la vista general del libro. Clic en la tarjeta → ficha completa (no se pierden sus campos). «Ver todas las fichas» permite regresar. En cada ficha hay dos campos opcionales nuevos: descripción breve y etiquetas separadas por comas. La X sobre la tarjeta **pide confirmación y envía a la papelera recuperable**, no elimina definitivamente.

**Pizarra:** fondos de «Líneas normales», «Líneas espaciadas» y «Libreta con margen» trazados como una geometría SVG única, con líneas uniformes y rectas, incluso con zoom. No modifica los dibujos del usuario ni sus datos.

**Compatibilidad:** sin migración de SQLite, mismos IDs y estructura JSON; los nuevos campos en las fichas son opcionales. La importación individual `MARGEN_BOOK` de 1.13.3 se conserva. Ver `CAMBIOS_1134.md` y `GUIA_BETA_TESTER_1134.md`.

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

El HTML debe cargar `margen-board-model.js` **antes** de `margen-1132.js`. El workflow de GitHub lo comprueba con pruebas Node, y `herramientas_frontend.py` valida los 20 scripts activos. Consulta `INFORME_PIZARRA_REFACTORIZACION_1132.md`.

## Revisión interna del código

Se ha aplicado una **primera limpieza conservadora del código** sobre la versión 1.13.2, centrada en una duplicación de la pizarra y en automatizar la detección y validación de scripts/estilos. No es una reescritura del editor ni de SQLite. Lee `INFORME_REFACTORIZACION_CODIGO_1132.md` para los detalles, pruebas realizadas y límites.

## Consolidación de controladores de pizarra (mantenimiento adicional)

Se han retirado las versiones sobrescritas de selección rectangular, controles sobre trazos y pegado; las sesiones de puntero de la pizarra comparten ahora un único ciclo de registro y limpieza. No se alteran las herramientas ni el formato de guardado. Consulta `INFORME_CONSOLIDACION_PIZARRA_1132.md` y ejecuta `python pruebas/test_1132_board_controller_consolidation.py` antes de compilar.

## Cómo compilar (GitHub Actions)

1. Exporta una copia **JSON completa** de tus libros desde la versión que ya funciona y guárdala fuera de MARGEN.
2. Extrae el ZIP y sube **el contenido interior de la carpeta** a GitHub, incluidas `.github`, `frontend`, `src-tauri`, `pruebas`, `herramientas_frontend.py`, `herramientas_lexicas.py` y `package.json`.
3. **Muy importante:** si reutilizas un repositorio con archivos antiguos, al subir nuevos ficheros GitHub NO borra los anteriores. Elimina del repositorio los archivos obsoletos antes de dar la limpieza por terminada. Consulta `INFORME_LIMPIEZA_1132.md`.
4. En GitHub, abre **Actions → Compilar MARGEN para Windows → Run workflow**. No pulses "Re-run" de una ejecución antigua, porque usa el commit original.
5. Si todo acaba en verde, descarga **MARGEN-1.13.4-Windows-x64** y utiliza el instalador `.exe` dentro del artefacto.

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
python pruebas/test_1134_static.py
python pruebas/test_1134_cards_and_lines.py  # solo en local con Playwright y Chromium
python pruebas/test_1135_static.py
python pruebas/test_1135_beta.py  # solo en local con Playwright y Chromium
```

El paso `python herramientas_lexicas.py --build` requiere acceso a las fuentes oficiales de los diccionarios y la verificación de licencias sigue activa.

La actualización **cambia la versión a 1.13.5**, pero conserva el identificador `com.margen.escritorio`, el modelo SQLite y los documentos de los usuarios. Los diccionarios se generan en la build y no estaban incluidos en el ZIP original. No se ha compilado un instalador Windows aquí; hay que verificarlo en GitHub Actions.
