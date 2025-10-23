# Normativa Ambiental

Una aplicación web interactiva para explorar y comparar estándares ambientales por dominio y país.

## 🌍 Dominios y Países Disponibles

La aplicación cubre **4 dominios ambientales** en **10 países**:

### 💧 Agua Potable
Estándares de calidad para consumo humano con sectores específicos (uso doméstico, industrial, recreación, etc.)
- **Países:** Argentina, Brasil, Chile, China, Colombia, El Salvador, Estados Unidos, México, Perú, Unión Europea

### 🌊 Vertimientos
Límites de descarga de efluentes líquidos por sector industrial
- **Países:** Argentina, Brasil, Chile, China, Colombia, El Salvador, Estados Unidos, México, Perú, Unión Europea

### 🗑️ Residuos Sólidos
Normativas de gestión de residuos
- **Países:** Argentina, Brasil, Chile, Colombia, Estados Unidos, México, Unión Europea

### 💨 Calidad del Aire
Estándares de contaminantes atmosféricos
- **Países:** Argentina, Brasil, Chile, Colombia, El Salvador, Estados Unidos, México, Perú, Unión Europea

## 🚀 Cómo Empezar

### Prerequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Pablo-Cubides/Normatividad_ambiental-.git
    cd Norms_app
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```

4.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador

### Otros comandos

```bash
npm run build      # Construir para producción
npm run start      # Ejecutar build de producción
npm run lint       # Revisar código con ESLint
npm test           # Ejecutar suite de tests (79 tests)
```

## 🔌 API Endpoints

La aplicación expone tres endpoints REST que devuelven datos en formato JSON:

### GET `/api/normas`

Obtiene normas ambientales por dominio y país.

**Parámetros Query**:
- `dominio` (opcional): Dominio ambiental. Default: `'agua'`
  - Valores: `agua`, `calidad-aire`, `residuos-solidos`, `vertimientos`
- `pais` (requerido): Código del país en minúsculas con guiones
  - Ejemplo: `argentina`, `estados-unidos`, `union-europea`
- `sector` (opcional): Filtrar por sector específico
  - Ejemplo: `agua_potable`, `uso_agricola`

**Ejemplo**:
```bash
GET /api/normas?dominio=agua&pais=colombia&sector=agua_potable
```

**Respuesta**:
```json
{
  "domain": "agua",
  "country": "Colombia",
  "pais": "Colombia",
  "registros": [...],
  "sectors": {...},
  "sources": [...]
}
```

### GET `/api/paises`

Obtiene lista de países disponibles para un dominio.

**Parámetros Query**:
- `dominio` (opcional): Filtrar países por dominio. Sin dominio retorna todos los países.

**Ejemplo**:
```bash
GET /api/paises?dominio=agua
```

**Respuesta**:
```json
{
  "countries": [
    { "code": "argentina", "name": "Argentina" },
    { "code": "brasil", "name": "Brasil" },
    ...
  ],
  "domain": "agua",
  "count": 10
}
```

### GET `/api/sectores`

Obtiene sectores disponibles para un dominio y país específicos.

**Parámetros Query**:
- `dominio` (opcional): Dominio ambiental. Default: `'agua'`
- `pais` (opcional): Código del país. Sin país retorna mensaje informativo.

**Ejemplo**:
```bash
GET /api/sectores?dominio=agua&pais=argentina
```

**Respuesta**:
```json
{
  "sectors": ["agua_potable", "uso_agricola", "proteccion_vida_acuatica"],
  "domain": "agua",
  "country": "argentina",
  "count": 3
}
```

**Características de las APIs**:
- ✅ **Cache en memoria**: 15 minutos TTL, headers `X-Cache-Status: HIT/MISS`
- ✅ **Validación de entrada**: Parámetros sanitizados y validados
- ✅ **Seguridad**: Path traversal prevention, input sanitization
- ✅ **Headers optimizados**: `Cache-Control`, `stale-while-revalidate`

## 🏗️ Tech Stack

*   **Framework:** Next.js 15.5+ (App Router)
*   **Lenguaje:** TypeScript 5.2+ (strict mode)
*   **UI:** React 18, Tailwind CSS 3.3+
*   **Componentes:** Radix UI, Lucide React
*   **Validación:** Zod 3.22+
*   **Testing:** Jest 30+ (79 tests, 100% passing)
*   **Cache:** In-memory LRU (15min TTL)
*   **SEO:** Sitemap dinámico, robots.txt, metadata optimizada

## 📁 Estructura del Proyecto

```
Norms_app/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # Endpoints de API
│   │   │   ├── normas/        # GET normas por dominio/país/sector
│   │   │   ├── paises/        # GET países disponibles por dominio
│   │   │   └── sectores/      # GET sectores por dominio/país
│   │   ├── explorar/          # Página de exploración de datos
│   │   ├── fundamentos/       # Página de fundamentos (educativa)
│   │   ├── admin/             # Panel de administración
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes React reutilizables
│   │   ├── SectorCard.tsx     # Tarjeta de sector
│   │   ├── SectorSelector.tsx # Selector de sectores
│   │   ├── ResultsDisplay.tsx # Visualización de resultados
│   │   └── ui/                # Componentes UI base (Button, Card, etc.)
│   ├── lib/                   # Lógica y utilidades
│   │   ├── constants.ts       # Constantes (dominios, países, URLs)
│   │   ├── hooks.ts           # Custom React hooks
│   │   ├── logger.ts          # Sistema de logging
│   │   ├── sectorIcons.tsx    # Sistema de iconos por sector
│   │   ├── types.ts           # Tipos y esquemas TypeScript/Zod
│   │   └── utils.ts           # Funciones auxiliares
│   └── types/                 # Definiciones de tipos globales
├── data/
│   └── json/                  # Datos de normas ambientales
│       ├── agua/              # Agua potable por país (JSON)
│       ├── vertimientos/      # Vertimientos por país (JSON)
│       ├── calidad-aire/      # Calidad del aire por país (JSON)
│       └── residuos-solidos/  # Residuos sólidos por país (JSON)
├── __tests__/                 # Tests unitarios
├── scripts/                   # Scripts de utilidad
│   ├── validate-json.js       # Validación de JSONs
│   ├── validate-regulatory-urls.ts  # Validación de URLs
│   └── normalize-*.ts         # Scripts de normalización
├── tools/                     # Herramientas de desarrollo
├── docs/                      # Documentación técnica
│   ├── ARCHITECTURE.md        # Arquitectura detallada
│   └── OPERATION_AND_PARSER.md # Operación y parsers
└── public/                    # Archivos estáticos
```

## ✨ Características Principales

### 🎯 Navegación Intuitiva por Sectores
- **Agua Potable:** Selección por uso (doméstico, industrial, recreación, agricultura, etc.)
- **Vertimientos:** Selección por sector industrial (municipal, refinación, minería, etc.)
- Iconos contextuales automáticos según palabras clave

### � Rendimiento Optimizado
- **Cache inteligente**: 90% más rápido en requests repetidos
- **Headers HTTP**: `Cache-Control`, `stale-while-revalidate`, `ETag`
- **Generación estática**: Páginas pre-renderizadas
- **Code splitting**: Carga optimizada de componentes

### 🔒 Seguridad
- **Validación de entrada**: Sanitización de parámetros
- **Path traversal prevention**: Protección contra ataques de directorio
- **Security headers**: CSP, X-Frame-Options, HSTS
- **TypeScript strict mode**: Type safety completo

### �🔗 Enlaces Normativos Verificados
- Cada estándar incluye enlaces directos a fuentes oficiales
- Sistema de 4 niveles de detección de URLs:
  1. `normativeSources` por sector
  2. `normativeSources` a nivel documento
  3. `normativeReference_url` directo
  4. Fallback a `REGULATORY_SOURCES` en constants.ts

### 📊 Visualización de Datos
- Tablas responsivas con parámetros y límites
- Comparación entre países
- Filtros y búsqueda
- Export de datos (próximamente)

### 🎨 Sistema de Iconos Inteligente
- Matching automático basado en keywords
- 50+ patrones de iconos para diferentes sectores
- Iconos específicos por dominio y categoría

### 🔍 SEO Optimizado
- **Sitemap dinámico**: 520+ URLs generadas automáticamente
- **Robots.txt**: Configuración para crawlers
- **Metadata**: Open Graph, Twitter Cards
- **Structured data**: Schema.org (próximamente)

## 🧪 Testing

El proyecto cuenta con una suite completa de tests unitarios y de integración:

- **79 tests** cubriendo todas las funcionalidades críticas
- **9 suites de tests**: API endpoints, cache, SEO, integración, utilidades
- **100% de tests pasando**

### Ejecutar tests

```bash
npm test                    # Ejecutar todos los tests
npm test -- api-normas      # Ejecutar tests específicos
npm test -- --coverage      # Ver cobertura de código
```

### Cobertura de tests

- ✅ **API Endpoints**: `/api/normas`, `/api/paises`, `/api/sectores` (24 tests)
- ✅ **Sistema de Cache**: Cache hits/misses, TTL, invalidación (20 tests)
- ✅ **SEO**: Sitemap, robots.txt, metadata (10 tests)
- ✅ **Integración**: Flujos end-to-end, validación, seguridad (12 tests)
- ✅ **Utilidades**: Validadores, helpers, normalización (13 tests)

## 📚 Documentación Adicional

- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Guía completa de desarrollo
- **[MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md)** - Guía de mantenimiento y actualizaciones
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - Diagrama de arquitectura del sistema
- **[FEATURES_README.md](FEATURES_README.md)** - Descripción detallada de características
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura técnica profunda
- **[docs/OPERATION_AND_PARSER.md](docs/OPERATION_AND_PARSER.md)** - Operación y parsers

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👤 Autor

**Pablo Cubides**

---

## 🗺️ Roadmap

- [ ] Agregar más países (India, Japón, Australia)
- [ ] Implementar comparación multi-país
- [ ] Dashboard de estadísticas
- [ ] Exportación de datos (PDF, Excel)
- [ ] API pública documentada
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
