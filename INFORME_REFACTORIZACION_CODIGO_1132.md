# MARGEN 1.13.2 — Primera limpieza segura del código

Origen: `MARGEN_1.13.2_Beta_Proyecto_LIMPIO_Windows_Tauri.zip`.

**Objetivo:** mejorar el mantenimiento sin cambiar el formato de datos, el diseño, la versión ni las funcionalidades de la aplicación.

## Resultado de la auditoría

- El HTML carga **16 módulos JavaScript y 16 hojas CSS**; sus nombres de versiones antiguas **no significan que estén obsoletos**. Al revisar las referencias se ha confirmado que no hay archivos `.js` o `.css` huérfanos en `frontend/assets/`.
- `frontend/assets/margen.js` supera los 590 KB y `src-tauri/src/lib.rs` ronda los 78 KB. Repartir sus responsabilidades es recomendable a medio plazo, pero **no deben dividirse ni eliminarse funciones sin pruebas de guardado, restauración y migración**.
- Los módulos JS posteriores amplían y sustituyen funciones de los anteriores: se trata de una arquitectura acumulativa. Aunque sería mejor organizar por áreas (biblioteca, editor, fichas, pizarra...), trasladar esos parches exige conservar el orden de ejecución y probar cada flujo.
- No se ha encontrado un JS/CSS cargado por la aplicación que podamos retirar con seguridad. **Esta limpieza no promete una reducción espectacular de tamaño**: las fuentes son necesarias.

## Cambios realizados

1. `frontend/assets/margen-1132.js`: se extrae una comprobación de pertenencia a selección que estaba duplicada en dos flujos. Se mantiene exactamente la misma condición y se ha comprobado con pruebas reales de navegador.
2. `herramientas_frontend.py`: descubre los JS/CSS realmente usados desde `frontend/index.html`; comprueba archivos ausentes, rutas inesperadas, duplicados, fuentes huérfanas y sintaxis de **todos** los JavaScript mediante Node. Ya no se mantiene una segunda lista manual de módulos.
3. La regeneración de `dist/` se valida **antes** de reemplazar la versión anterior y se prepara en una carpeta temporal, con restauración de la carpeta antigua si falla el intercambio. También se verifica que las copias son idénticas.
4. `package.json`: `npm run check:frontend` se simplifica; se añade `npm run verify:frontend` para detectar diferencias entre los fuentes y `dist/`.
5. `.github/workflows/build-windows.yml`: se incorporan las pruebas del generador y la comprobación explícita de integridad de `dist/` durante la compilación Windows.
6. `pruebas/test_1132_frontend_maintenance.py`: nueva prueba automatizada para detectar errores de sintaxis, módulos no referenciados, duplicados, archivos ausentes, alteraciones de `dist/` y fallos de construcción que no deben destruir la carpeta anterior.

## Comprobaciones ejecutadas

Superadas localmente:

- `python pruebas/test_1132_frontend_maintenance.py`
- `python herramientas_frontend.py`
- `npm run check:frontend`
- `npm run verify:frontend`
- `python pruebas/test_1132_release_static.py`
- `python pruebas/test_1131_single_book_export.py`
- `python pruebas/test_1132_board_groups.py` (Chromium / Playwright)
- `python pruebas/test_113_board_shortcuts.py` (Chromium / Playwright)
- `python pruebas/test_1121_release_static.py`
- `python pruebas/test_1132_lexicon_download.py` (descargas simuladas; sin red)
- `python herramientas_lexicas.py --test`

**No se ha compilado ni ejecutado el instalador NSIS de Windows ni `cargo test`** en este entorno. La prueba real de la compilación, guardado SQLite, migraciones y funcionamiento con bibliotecas reales debe realizarse en Windows, sobre datos de prueba o con copia JSON de seguridad.

## Lo que no se ha tocado

- Backend Rust, estructura SQLite, identificador de aplicación, formatos de importación/exportación, diccionarios y licencias.
- CSS, interfaz visual, editor, fichas, cronología, genealogía y contenido del usuario.
- El contenido de los módulos históricos que aún se ejecutan (salvo la deduplicación interna de `margen-1132.js`).

## Próxima fase recomendada, no incluida

1. Caracterizar con pruebas de navegador los módulos de biblioteca, editor y pizarra en conjunto.
2. Extraer primero lógica **pura** (sin acceso directo al DOM ni SQLite) a módulos con pruebas unitarias.
3. Retirar poco a poco las redefiniciones de funciones de betas anteriores **solo cuando la nueva implementación pase los mismos casos**.
4. Dividir `src-tauri/src/lib.rs` por áreas (`storage`, `exports`, `media`, `diagnostics`) cuando haya acceso a compilación y pruebas Rust.
5. Medir tiempos de apertura y uso con bibliotecas grandes antes de introducir optimizaciones de rendimiento.

En resumen, esta es una **primera refactorización controlada**, no la reescritura profunda del código de MARGEN.
