# Normativa Hídrica — Architecture Overview

Este documento describe la arquitectura, el flujo de datos y los componentes clave de la aplicación "Normativa Hídrica" desde la perspectiva de ingeniería.

Resumen rápido
--------------
- Objetivo: ofrecer una UI educativa en español para explorar estándares ambientales por dominio y país.
- Diseño: "data-first" — artefactos JSON normalizados en el repo (carpeta `data/json`) y una capa mínima de API para agregación/normalización en tiempo de ejecución.
- Restricción operativa: desplegable en plataformas serverless (Vercel) con mínimo tiempo de ejecución y sin base de datos inicial.

1) Componentes principales
---------------------------
- Frontend: Next.js (App Router) + TypeScript
  - Rutas principales: `/` (Home), `/fundamentos`, `/explorar` (selección por dominio + país)
  - Componentes UI: `DomainSelector`, `CountrySelector`, `SectorSelector`, `ResultsDisplay`.
- Datos: `data/json/{dominio}/{pais}.json` (canonical) y `data/json-candidates/{dominio}/` (no destructivo, para revisión)
- Scripts de ingest: `scripts/extract-pdf-to-json.ts`, `scripts/promote-candidates.js`, `scripts/validate-json.js`, `scripts/move-invalid-json.js`
- API ligera: rutas Next (`/api/normas`, `/api/paises`) que leen y normalizan JSON, aplican normalizaciones legadas y fusionan candidatos para respuestas "best-effort". La lógica de normalización y fusión de candidatos ha sido refactorizada en funciones de utilidad en `src/lib/utils.ts`.

2) Contratos de datos (forma preferida)
---------------------------------------
Forma normalizada (recomendado para nueva ingestión):

```ts
type NormaReferencia = {
  norma?: string
  entidad?: string
  anio?: number | string
  url?: string
}

type NormaRegistro = {
  parametro: string
  limite?: string
  unidad?: string | null
  notas?: string[]
  referencia?: NormaReferencia
  categoria?: string
}

type PaisNorma = {
  pais: string
  paisCodigo?: string
  dominio: string
  version?: string
  registros?: NormaRegistro[]
  sectores?: Record<string, { parametros?: string[] }>
  _meta?: { _candidateSource?: string, _publishedAt?: string }
}
```

Notas:
- El repositorio mantiene compatibilidad con la forma "legacy" (ej. `sectors` para agua) mientras se migra a `registros`.

3) Flujo de ingestión y promoción no destructiva
------------------------------------------------
1. Ejecutar extractor local (`scripts/extract-pdf-to-json.ts`) que escribe candidatos en `data/json-candidates/{dominio}/`.
2. Revisar manualmente los candidatos.
3. Promover candidatos limpios con `scripts/promote-candidates.js` — el script hace backups en `data/json/_backups/` y preserva metadatos (_candidateSource/_publishedAt).
4. Ejecutar `scripts/validate-json.js` para comprobar integridad (el proceso actual ignora `_invalid/`).

Reglas operativas importantes:
- Nunca sobrescribir canonical sin backup.
- Quarantinar (_invalid) cualquier JSON que no parsea antes de promover.
- Agregar `_validation` in-band cuando la API devuelve respuestas "best-effort" tras fallas de Zod.

4) API y normalización
-----------------------
- Las rutas (`/api/normas`, `/api/paises`) realizan:
  - lectura de archivo canonical
  - normalización de claves heredadas (p. ej. `pais`/`nombre`/`paisCodigo`)
  - fusión de sectores detectados en `data/json-candidates` cuando los nombres de archivo usan el prefijo del país
  - validación con Zod y, si falla, respuesta "best-effort" con `_validation` que incluye resumen del error

5) Construcción y despliegue
---------------------------
- Desarrollo local: `npm install` + `npm run dev`
- Producción: `npm run build` (Next.js hace SSG/SSR según la configuración) y despliegue en Vercel.
- Dado que los JSON están en el repo, el build incluye los artefactos de datos y la app es reproducible.

6) Seguridad y operaciones
-------------------------
- Protege cualquier endpoint que permita escritura (si se añade admin): autenticación (env vars, OAuth o tokens) y validación Zod.
- Sanitiza nombres de archivo y desinfecta entradas antes de escribir al FS para evitar traversal.
- Procesamiento de PDFs grandes fuera del entorno serverless (CI o worker) para evitar timeouts.

7) Extensibilidad y mejoras recomendadas
---------------------------------------
- Modularizar el parser: soporte para `pdf-parse`, Tabula/Camelot (Python) y OCR (Tesseract) con una capa de reconciliación.
- Workflow de revisión: CI job que genera candidatos en una rama y abre PR automático para revisión humana (evita escrituras directas en `main`).
- UI de revisión admin: mostrar diffs entre candidato y canonical, y botón de promover con comentarios.

8) Checklist rápido (accionable)
--------------------------------
- [ ] Añadir validación Zod al extractor y al endpoint admin.
- [ ] Añadir `--dry-run` al extractor para inspeccionar antes de escribir.
- [ ] Crear job CI que ejecuta validación y abre PR con candidatos.

9) Contacto y mantenimiento
---------------------------
Asignar un data steward responsable de aprobar candidatos antes de publicarlos. Mantener los backups en `data/json/_backups` y la carpeta `_invalid` para archivos problemáticos.
