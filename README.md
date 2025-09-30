# Normativa Ambiental

Una aplicación para explorar y comparar estándares ambientales por dominio y país.

## Dominios y Países Disponibles

Actualmente, la aplicación cubre los siguientes dominios y países:

- **Calidad del Agua:**
  - Argentina
  - Chile
  - Colombia
  - El Salvador
  - Estados Unidos
  - México
  - Perú
  - Unión Europea

- **Residuos Sólidos:**
  - Argentina
  - Brasil
  - Chile
  - Colombia
  - Estados Unidos
  - México
  - Unión Europea

- **Calidad del Aire:**
  - Argentina
  - Brasil
  - Chile
  - Colombia
  - El Salvador
  - Estados Unidos
  - México
  - Perú
  - Unión Europea

## Cómo Empezar

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Ejecutar la aplicación en modo de desarrollo:**
    ```bash
    npm run dev
    ```

3.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Tech Stack

*   Next.js
*   React
*   TypeScript
*   Tailwind CSS
*   Zod for data validation

## Estructura del Proyecto

*   `src/app/api`: Rutas de la API para obtener los datos.
*   `src/app/explorar`: La página principal para explorar los datos.
*   `src/components`: Componentes de React reutilizables.
*   `src/lib`: Lógica principal de la aplicación, incluyendo esquemas, tipos y utilidades.
*   `data/json`: Directorio que contiene los datos de las normas ambientales en formato JSON.
