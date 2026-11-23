# Cambios · MARGEN 1.13.4 Beta

## Fichas de personajes y escenarios

- Vista de tarjetas con rejilla de hasta tres columnas según el espacio disponible.
- Diseño heredado de los temas de MARGEN: Georgia en nombres y Segoe UI en la interfaz.
- Imagen principal seleccionada previamente en la galería, sin duplicar imágenes.
- Rol/tipo, descripción breve opcional (hasta 250 caracteres) y hasta ocho etiquetas únicas.
- Clic en una tarjeta para abrir la ficha completa, conservando todos los campos anteriores.
- Botón «Ver todas las fichas» y acceso desde la barra lateral a «Ver tarjetas».
- Botón X: confirmación y papelera recuperable (sin borrado definitivo).
- Las etiquetas de la imagen de referencia se alimentan de datos reales; no se repiten chips decorativos.

## Pizarra

- Fondos de papel «Líneas normales», «Líneas espaciadas» y «Libreta con margen» trazados con líneas horizontales SVG.
- Separaciones constantes en coordenadas de pizarra; se repinta al cambiar de fondo y al usar el historial.
- Los trazos dibujados por el usuario, grupos y sus datos no cambian.

## Compatibilidad, pruebas y build

- Se parte del ZIP completo de 1.13.3: no se cambian importación/exportación ni SQLite.
- Añadidos margen-1134.js y margen-1134.css al frontend.
- Nuevos campos opcionales summary y tags dentro de cada ficha; las fichas antiguas se leen sin migración.
- Test Chromium local de tarjetas y fondos; test estático sin dependencias nuevas incorporado a GitHub Actions.
- Versiones de Tauri, Cargo, package.json y artefactos de GitHub actualizadas a 1.13.4.
- No se ha compilado ni validado el instalador Windows en este entorno.
