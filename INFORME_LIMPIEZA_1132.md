# Informe de limpieza de MARGEN 1.13.2

**Origen:** ZIP beta 1.13.2, revisión de descarga léxica HTTP 503.

## Eliminaciones del paquete principal

| Categoría | Qué se ha hecho | Motivo |
|---|---|---|
| Documentación de betas anteriores | Trasladada al archivo histórico separado | Evitar 20+ guías y listas de cambios dispersas |
| Carpeta `cambios/` | Trasladada al archivo histórico separado | Parches de versiones antiguas ya integrados en `frontend/assets` |
| Capturas de prueba y exportaciones | Trasladadas al archivo histórico separado | Son resultados generados por pruebas, no ficheros de la aplicación |
| Carpeta `dist/` | Eliminada, se reconstruye en la build | Duplicaba byte a byte el código del frontend |

**Ficheros trasladados al archivo histórico:** 86; volumen sin comprimir 6,810,593 bytes. El archivo histórico es opcional para trabajar y compilar.

## Protegido por necesidad técnica

- `frontend/index.html` y los archivos CSS/JS que enlaza, **incluidos módulos con números de versiones antiguas**. Eliminarlos rompería funciones que siguen activas.
- `.github/workflows/build-windows.yml`: compilación en Windows con verificación léxica y licencias.
- `src-tauri/` completo: backend Rust, SQLite, permisos e iconos.
- `herramientas_lexicas.py`: diccionarios y descargas oficiales con reintentos tras errores 503.
- Scripts Python de `pruebas/`: pruebas de regresión, aunque algunas tengan nombres de versiones anteriores.
- Auditoría legal y licencias en `src-tauri/resources/`.

## Ajustes de infraestructura

- `herramientas_frontend.py` ahora copia de forma completa `frontend/` a `dist/`, limpiando resultados obsoletos antes de reconstruirlos.
- `src-tauri/tauri.conf.json` ejecuta automáticamente el generador antes de cada build Tauri.
- `.gitignore` excluye `dist/`, capturas de pruebas y productos temporales.

## Advertencia para GitHub

El **ZIP limpio no elimina automáticamente el historial de archivos que ya exista en GitHub**. Si subes el contenido a una rama con `dist/`, `cambios/`, capturas o notas antiguas ya versionadas, seguirán allí hasta que hagas un commit que los elimine. Además, `.gitignore` no elimina archivos ya rastreados; solo evita añadirlos a partir de entonces.

Para mantener una copia segura, puedes conservar el repositorio antiguo como respaldo o hacer una rama de seguridad antes de retirar archivos. No elimines tus libros ni los datos de usuario.

## Límites de la comprobación

Esta limpieza es estructural: no reescribe lógica de la pizarra, del editor ni del sistema de almacenamiento. La compilación NSIS en Windows y el uso con libros reales deben validarse en GitHub Actions y en Windows.
