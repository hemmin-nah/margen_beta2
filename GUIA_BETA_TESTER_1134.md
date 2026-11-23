# Guía de prueba · MARGEN 1.13.4

**Antes de actualizar:** haz una exportación JSON completa y guárdala fuera de MARGEN.

1. Entra en un libro con personajes y pulsa el icono **Ver tarjetas** junto a «Fichas de personaje». Comprueba que se ven las tarjetas y que abrir una lleva a su ficha detallada.
2. En la ficha, escribe una **descripción breve** y varias **etiquetas** separadas por comas. Vuelve a tarjetas y comprueba que aparecen sin repeticiones.
3. Cambia la **imagen principal** desde su galería y comprueba su miniatura en la tarjeta. Prueba una ficha sin fotos.
4. Repite todo con **Fichas de escenario**. Verifica también las vistas en tema claro y oscuro y una ventana estrecha.
5. Pulsa X en una tarjeta, cancela la confirmación; comprueba que no desaparece. Acepta sobre una ficha de prueba: verifica que queda en la papelera y que se puede recuperar.
6. Cierra y abre MARGEN: comprueba que descripción breve, etiquetas y las fichas siguen conservadas.
7. En una pizarra libre, cambia entre «Líneas normales», «Líneas espaciadas», «Libreta con margen», «Puntos» y «Cuadrícula». Haz zoom y desplaza: las líneas deben permanecer horizontales y con separación uniforme.
8. Usa Ctrl+Z tras cambiar el fondo y verifica que vuelve a dibujarse correctamente. Comprueba que los dibujos y grupos existentes permanecen intactos.
9. Exporta e importa un solo libro de prueba, y revisa que las tarjetas se mantienen.

**Pruebas locales:** `python pruebas/test_1134_static.py`, `python pruebas/test_1134_cards_and_lines.py` (requiere Playwright + Chromium). El workflow Windows ejecuta la primera sin instalar herramientas nuevas.
