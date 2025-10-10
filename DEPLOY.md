# Desplegar en Vercel

## Pasos para deployment

### 1. Conectar tu repositorio
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub: `Pablo-Cubides/Normatividad_ambiental-`

### 2. Configuración del proyecto
Vercel detectará automáticamente Next.js. Configura:

**Framework Preset:** Next.js

**Root Directory:** `Norms_app`

**Build Command:** (dejar por defecto) `npm run build` o `next build`

**Output Directory:** (dejar por defecto) `.next`

**Install Command:** (dejar por defecto) `npm install`

### 3. Variables de entorno (si las necesitas)
Si tienes archivos `.env.local` con variables de entorno, agrégalas en:
- Settings → Environment Variables

### 4. Deploy
Haz clic en **Deploy** y espera unos minutos.

## Estructura del proyecto
```
Normas_ambientales/
├── .github/workflows/ci.yml  ← CI que ejecuta tests y build
├── vercel.json                ← Configuración de Vercel
├── tsconfig.base.json         ← Config TS compartida
└── Norms_app/                 ← Tu aplicación Next.js
    ├── src/
    ├── data/                  ← JSON con normativas
    ├── package.json
    └── tsconfig.json
```

## CI/CD
El workflow de GitHub Actions (`.github/workflows/ci.yml`) ejecuta automáticamente en cada push/PR:
1. ✓ Instala dependencias
2. ✓ Ejecuta build (`npm run build`)
3. ✓ Ejecuta tests (`npm test`)

## Comandos locales
```bash
# Desarrollo
cd Norms_app
npm run dev

# Build producción
npm run build

# Tests
npm test

# Lint
npm run lint
```

## Notas técnicas
- **Next.js 15.5.4** con App Router
- **TypeScript 5.2** con `ignoreDeprecations: "5.0"` para silenciar warnings de baseUrl
- **Tailwind CSS 3.4** para estilos
- **Zod** para validación de datos JSON
- Los archivos JSON con normativas están en `Norms_app/data/json/`

## Deploy automático
Vercel desplegará automáticamente:
- **Producción:** cada push a `main`
- **Preview:** cada pull request

## Troubleshooting

### Error: "Multiple lockfiles detected"
Esto es una advertencia (warning), no un error. El build sigue funcionando. Para silenciarla, puedes agregar en `Norms_app/next.config.js`:
```js
module.exports = {
  outputFileTracingRoot: path.join(__dirname, '../'),
}
```

### Editor muestra warnings de TypeScript
Los warnings de `baseUrl deprecated` son normales en el editor. El build funciona correctamente con `ignoreDeprecations: "5.0"` configurado. Para refrescar el editor:
1. Recarga la ventana de VS Code (Ctrl+Shift+P → "Reload Window")
2. O reinicia el TypeScript language server (Ctrl+Shift+P → "TypeScript: Restart TS Server")
