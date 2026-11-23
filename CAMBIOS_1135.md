# Cambios · MARGEN 1.13.5 Beta

Base exacta: ZIP de MARGEN 1.13.4 con tarjetas y fondos de líneas. Se conserva toda la lógica de libros, importación, exportación y SQLite.

## Editor
- Selector `Texto · Tamaño…` para cambiar individualmente el tamaño de una selección, párrafo/encabezado o título editorial. Se guarda en HTML de capítulo, o `titleLayout.fontSize` para el título editorial.
- Contadores CSS jerárquicos en listas `<ol>` anidadas; los subniveles aparecen como 1.1 / 1.1.1.
- Los marcadores de listas se alinean con el texto cuando los párrafos se alinean a la derecha.

## Pizarra
- Corregido el fondo de Líneas, Líneas espaciadas y Libreta con margen: 1.13.4 creaba un SVG enorme, pero la capa tenía `display:none!important`. Se vuelve a un fondo CSS eficiente en la capa del mundo.
- Se calcula la posición inicial de los objetos desde el viewport actual, en lugar de limitar la posición a las coordenadas antiguas (3750 × 2550).
- Se captura el historial antes del trazo de pincel o goma. Se libera el foco de notas/campos de color al empezar, para que Ctrl+Z deshaga el trazo.
- El pincel lee el color efectivo del selector antes del primer trazo, también después del cuentagotas.

## Personajes y escenarios
- Hasta cuatro etiquetas de tarjeta (deduplicadas) y normalización del campo al perder el foco.
- Filtro por carpetas ya existentes encima de la cuadrícula: Todas, cada carpeta y Sin carpeta. No duplica datos ni crea carpetas especiales.
- Posiciones estables para los botones de carpeta, cuadrícula y crear en la barra izquierda.

## Biblioteca
- Clic único sobre la tarjeta de libro; si está cargado de forma diferida, se espera la lectura antes de abrir la vista.

## Pruebas
- Chromium: tarjetas, filtros de personajes y escenarios, marcadores, pincel + Ctrl+Z/Y, creación visible, encabezado con tamaño propio, carga diferida y apertura a un clic.
- Regresión Chromium: pizarra 1.13.2 e importación 1.13.3.
- Pruebas estáticas y Node de importación/exportación, front, agrupación y comprobación de diccionarios.
- Pendiente: verificación del .exe y persistencia real en Windows/WebView2 y SQLite de instalación.

## Instalación
El ZIP contiene fuentes, pruebas y `.github/workflows/build-windows.yml`. No incluye un instalador compilado; se construye mediante GitHub Actions.
