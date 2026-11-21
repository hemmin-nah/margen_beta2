# MARGEN 1.13.2 — Consolidación de controladores de pizarra

**Origen exacto:** MARGEN_1.13.2_Beta_Pizarra_Refactorizada_Windows_Tauri.zip  
**Tipo de cambio:** mantenimiento de código, sin funciones nuevas ni migración de datos.

## Qué se ha eliminado o reorganizado

1. `margen-121.js`: retirado el controlador antiguo de selección rectangular y la variable de sesión `m1211Marquee`. Las llamadas de renders antiguos siguen resolviendo `m1211BindBoardSelection`, pero ahora apuntan exclusivamente a la implementación vigente de `margen-1132.js`.
2. `margen-121.js`: retirada la capa histórica de movimiento de sellos por rectángulos SVG, reemplazada ya en la versión 1.13 por los trazos seleccionables y las relaciones `stampInstanceId`. No se eliminan las utilidades y referencias históricas que siguen siendo necesarias para otras operaciones.
3. `margen-113.js`: retirado el arrastre de elementos de 1.13.0, reemplazado por el arrastre agrupado de 1.13.2. Se conserva el comportamiento de otros tipos de pizarra delegando al controlador previo.
4. `margen-113.js`: retirado el enlazador antiguo de eventos sobre trazos, que se encontraba sobrescrito por `margen-1132.js`. El render SVG sigue llamando al enlace vigente.
5. `margen-113.js`: retirada la implementación antigua de Pegar, que eliminaba la asociación de grupos. Queda una sola implementación que remapea IDs de grupos y sellos.
6. `margen-1132.js`: unificada la creación, filtrado por `pointerId` y limpieza de los eventos `pointermove`, `pointerup`, `pointercancel` para **selección rectangular, movimiento y redimensionado**. Los eventos de cancelación limpian las sesiones, y otros punteros no interfieren.
7. `margen-121.css`: retiradas las reglas de estilo usadas exclusivamente por las interfaces antiguas eliminadas.
8. `pruebas/` y `.github/workflows/build-windows.yml`: añadidas guardas de regresión para impedir que se introduzcan de nuevo controladores duplicados. La comprobación histórica de marquesina se actualiza para validar el controlador actual.

En total se han retirado aproximadamente **7,5 KB de lógica JavaScript histórica**, manteniendo el total de módulos JavaScript activos y sin eliminar ningún archivo necesario de la aplicación.

## Pruebas ejecutadas localmente y superadas

- `python herramientas_frontend.py` (reconstrucción exacta de `dist/`)
- `npm run check:frontend` y `npm run verify:frontend`
- `node pruebas/test_1132_board_model.cjs`
- `python pruebas/test_1132_board_controller_consolidation.py`
- `python pruebas/test_1132_board_groups.py` (Chromium: grupos, movimiento, fondo, deselección, Ctrl+Z, copiado, y cancelación de punteros)
- `python pruebas/test_113_board_shortcuts.py` (Chromium: lienzo, dibujo, trazos, historial, atajos)
- `python pruebas/test_1132_release_static.py`
- `python pruebas/test_1121_release_static.py`
- `python pruebas/test_1132_frontend_maintenance.py`
- `python pruebas/test_1131_single_book_export.py` y `python pruebas/test_1131_single_book_export_ui.py`
- `python pruebas/test_1132_lexicon_download.py` (fallos HTTP simulados, sin descargas reales)
- `python herramientas_lexicas.py --test`

## Lo que NO se ha tocado

- `frontend/assets/margen.js` (núcleo general)
- `frontend/assets/margen-board-model.js` (modelo puro de selección y grupos)
- Backend Rust, identificador de app, configuración de SQLite y formato JSON
- Editor, fichas, biblioteca, cronología, genealogía, exportación, temas, archivos de licencias y recursos léxicos

## Límites y próxima comprobación

No se ha compilado el instalador NSIS en este entorno ni se ha probado el guardado contra la base SQLite real. El ZIP contiene **código fuente y workflow de GitHub Actions**, NO un `.exe`. Se recomienda conservar un JSON de respaldo y probar la instalación en un perfil de prueba antes de sustituir un entorno de trabajo con manuscritos reales.

Aún existen envoltorios antiguos del núcleo (`margen.js`) que forman parte de la secuencia activa de ejecución. Se han preservado deliberadamente; no se recomienda eliminarlos en masa sin pruebas funcionales específicas.
