# MARGEN 1.13.7 Beta · Revisión visual editorial

## Alcance
- Encabezados, cabecera y botones: jerarquía tipográfica y espaciado mejorados.
- Biblioteca: presentación más pulida de cubiertas, ficha inferior de cada libro, nuevo libro, búsqueda, orden y sección de revisión.
- Fichas: tarjetas, etiquetas y bandas de carpetas con la misma gramática visual.
- Navegación y áreas de trabajo: bordes y sombras más discretos, foco visible y adaptación a ventanas medianas.
- Temas: reutiliza variables CSS existentes, sin forzar una paleta ni cambiar la prosa del manuscrito; contraste corregido en portadas vacías de modo oscuro.
- Respeta la opción de movimiento reducido del sistema.

## Qué NO se ha cambiado
- No se han añadido botones ni funcionalidades nuevas.
- No se ha alterado el guardado, la exportación/importación JSON, los contenidos de libros ni el backend Rust/SQLite.
- No se han añadido fuentes externas ni recursos de internet.

## Comprobación
- `python herramientas_frontend.py` y `python herramientas_frontend.py --verify-dist`.
- `python pruebas/test_1137_static.py` comprueba versión, recursos y paleta adaptativa.
- `python pruebas/test_1137_visual.py` comprueba con Chromium la vista de biblioteca, modo oscuro, filtros, ordenación y anchuras.
- Las pruebas de Chromium no sustituyen la verificación final en Windows/WebView2 ni la compilación NSIS de GitHub Actions.
