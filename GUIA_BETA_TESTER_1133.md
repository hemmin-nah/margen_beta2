# Beta tester · MARGEN 1.13.3

**Antes:** exporta un JSON de tu biblioteca actual en una carpeta independiente de MARGEN. Trabaja preferentemente con un libro de prueba.

## Prueba rápida de importación individual

1. En una instalación de MARGEN que funcione, exporta un libro desde el icono de exportación → «Un solo libro».
2. Abre la 1.13.3, ve a Biblioteca y pulsa **«Importar libro»**. Selecciona el archivo `MARGEN-libro-...json`.
3. Comprueba la vista previa: título y conteos. Pulsa «Añadir a mi biblioteca».
4. Confirma que aparecen tanto tus libros antiguos como el nuevo. Abre capítulos, fichas, galerías, pizarras, escaletas y cronologías.
5. Cierra MARGEN, vuelve a abrirlo y confirma que el libro y sus contenidos siguen ahí.
6. Repite la importación del mismo JSON. Debe aparecer como copia nueva sin alterar el primero.
7. Comprueba que un libro que esté en la papelera sigue siendo recuperable después de importar una copia suya.
8. Selecciona por error un JSON de biblioteca completa: el importador individual debe rechazarlo y explicar cuál es la opción correcta.
9. Desde el icono de importación de la cabecera, verifica que «Restaurar biblioteca completa» sigue mostrando su proceso de revisión **antes** de reemplazar nada. No completes esa restauración con datos reales sin copia externa.
10. Comprueba la exportación de un libro, los grupos de la pizarra y Ctrl+Z, para verificar que no se han visto afectados.

## Importante

Si aparece un error «El libro puede haberse guardado, pero no se pudo verificar su lectura», **no vuelvas a importar inmediatamente**: comprueba primero si ya figura en Biblioteca. Si falla la compilación en GitHub, conserva el registro completo del primer paso en rojo.
