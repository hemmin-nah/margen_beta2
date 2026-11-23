# MARGEN 1.13.3 Beta — Importación individual de libros

## Qué cambia para quien escribe

- En **Biblioteca**, nuevo botón «Importar libro». También se puede acceder al mismo proceso desde el icono de importación de la cabecera, que ahora distingue **«Añadir un libro»** de **«Restaurar biblioteca completa»**.
- Importa archivos JSON individuales **MARGEN_BOOK v1** exportados desde MARGEN 1.13.1 o posterior, sin sustituir la biblioteca actual.
- Antes de realizar cambios se muestra una vista previa con título, capítulos, pizarras, personajes, escenarios y avisos de integridad.
- Se preservan todos los datos del libro: capítulos, HTML de manuscritos, notas, fichas, galerías, pizarras, trazos, grupos, escaletas, cronologías, portadas y vínculos internos que el JSON contenga.
- Si el identificador ya existe en la biblioteca **o en la papelera**, MARGEN importa una copia con un nuevo ID de libro. Los IDs de capítulos, fichas y relaciones internas no se modifican.
- Si coincide el título con uno ya existente, se añade un sufijo «· importado» para distinguirlo visualmente.
- Un JSON de **biblioteca completa** se rechaza en esta función, mostrando que debe utilizarse «Restaurar biblioteca completa».

## Seguridad del guardado

- Comprueba la estructura básica y reutiliza el validador de copias de MARGEN 1.5.4, sin alterar la copia original.
- Antes de añadir un libro, guarda las ediciones pendientes de la biblioteca actual.
- Bloquea la importación ante conflictos de escritura entre ventanas o estados de guardado dañados.
- Utiliza el guardado incremental existente de Tauri/SQLite: no reescribe los libros no modificados.
- Comprueba que el libro nuevo se pueda cargar desde el disco. Si esa lectura falla, no informa de éxito y desactiva el reintento directo hasta que el usuario inspeccione la biblioteca.
- Límite de entrada: 180 MB, el mismo que el importador de copias completas.

## Compatibilidad y límites

- No se cambia el esquema de la base SQLite ni el identificador de aplicación `com.margen.escritorio`.
- La restauración completa, los diccionarios, la pizarra y el exportador individual anterior permanecen disponibles.
- Si el libro contenía enlaces a imágenes EXTERNAS (en lugar de datos embebidos), la transferencia del JSON no garantiza disponer de esos archivos en otro PC. MARGEN muestra avisos.
- El formato MARGEN_BOOK v1 incluye un único libro: no importa opciones globales de la biblioteca ni libros que no estén dentro del JSON.
- No incluye sincronización entre PCs, que queda para una versión posterior.

## Archivos nuevos

- `frontend/assets/margen-book-import-model.js`: validación básica, colisiones, creación de copia y unión de biblioteca, testeable sin interfaz.
- `frontend/assets/margen-1133.js` y `.css`: selector, revisión, importación y guardado.
- `pruebas/test_1133_book_import_model.cjs` y `pruebas/test_1133_single_book_import_static.py`: pruebas incluidas en GitHub Actions.
- `pruebas/test_1133_single_book_import_ui.py`: prueba de navegador con Tauri simulado (local; no instalada en el workflow de Windows).

## Validación efectuada

- Sintaxis de los 19 scripts y paridad de `frontend/`/`dist/` verificadas.
- Prueba de importación en Chromium: libro nuevo, reimportación duplicada, colisión con papelera, rechazo del JSON completo y fallo del guardado simulado.
- Pruebas de exportación de un solo libro, agrupación, pizarra, atajos y funciones de las versiones anteriores que se han ejecutado.

**Pendiente:** `cargo test` y compilación del instalador NSIS en GitHub Actions/Windows. Las pruebas de navegador usan un puente Tauri simulado y no certifican la escritura física en SQLite.
