# MARGEN 1.13.2 — Refactorización interna de la pizarra (fase 2)

**Base:** `MARGEN_1.13.2_Beta_Codigo_Depurado_Windows_Tauri.zip`.
**Alcance:** ordenación del código; no se añaden funciones, no se cambia la interfaz ni el formato de datos.

## Cambios

- **Nuevo `frontend/assets/margen-board-model.js`:** reglas independientes de la interfaz para expandir selecciones que unen notas, imágenes y trazos; conexiones de sellos (`stampInstanceId`); alternar selecciones; calcular intersecciones de la marquesina; limitar movimientos de grupos; preparar copias de selección con nuevos identificadores de grupo y sello.
- **`frontend/assets/margen-1132.js`:** los manejadores de eventos delegan los cálculos anteriores en el modelo. Mantiene el funcionamiento de selección, Ctrl+clic, arrastre, agrupación/desagrupación, Supr, Ctrl+Z y pegado. Se eliminan cálculos duplicados y una variable local sin uso.
- **`frontend/index.html`:** incorpora el modelo antes del controlador, manteniendo el orden de los demás módulos. No se eliminan `margen.js`, `margen-113.js`, `margen-121.js` ni otros archivos activos.
- **`pruebas/test_1132_board_model.cjs`:** prueba directamente el modelo con Node, sin navegador ni red: grupos mixtos, agrupaciones transitivas, sellos, selección rectangular, bordes de lienzo, selección aditiva y clonación sin modificar originales.
- **`pruebas/test_1132_release_static.py`:** valida el orden de carga y la identidad con `dist/`.
- **`.github/workflows/build-windows.yml`:** ejecuta el nuevo test con Node antes de compilar el frontend.

## Formatos y compatibilidad

Se siguen almacenando `groupId` en cada elemento/trazo y `stampInstanceId` en trazos de sellos. Son propiedades opcionales: las pizarras anteriores siguen teniendo un formato válido. No hay migraciones de SQLite, cambios de `com.margen.escritorio` ni alteración de las exportaciones. `dist/` es generado por el script de build, no debe copiarse manualmente a GitHub.

## Pruebas locales

```bash
node pruebas/test_1132_board_model.cjs
python herramientas_frontend.py
npm run check:frontend
npm run verify:frontend
python pruebas/test_1132_board_groups.py
python pruebas/test_113_board_shortcuts.py
python pruebas/test_1132_release_static.py
python pruebas/test_1131_single_book_export.py
python pruebas/test_1131_single_book_export_ui.py
python pruebas/test_1121_release_static.py
python pruebas/test_1132_frontend_maintenance.py
python pruebas/test_1132_lexicon_download.py
python herramientas_lexicas.py --test
```

**Limitación:** estas pruebas incluyen Chromium automatizado con un puente Tauri simulado, no un Windows real con SQLite y el instalador NSIS. La compilación de GitHub Actions y una prueba sobre una biblioteca de ejemplo siguen siendo necesarias antes de dar por validada la distribución.

## No modificado

Editor, biblioteca, fichas, cronología, genealogía, recursos léxicos y licencias, backend Rust, SQLite, flujo de exportación/importación, temas y diseño visual.

## Fuera de este alcance

No se han retirado anulaciones de funciones de módulos antiguos sin disponer de pruebas de todos sus caminos de ejecución; parte del código histórico sigue activo. Tampoco se ha dividido el backend Rust. Recomendamos continuar con otro módulo sólo cuando el tester confirme el funcionamiento de esta fase.
