// Re-export inferred types from Zod schemas.
// This makes schemas.ts the single source of truth for data shapes.
export type { SectorNorm as WaterSectorNorm, RecordNorm, UnifiedNorm } from './schemas';

// The WaterUseSector interface and constants are kept here because they define UI logic,
// not the structure of incoming data.

export interface WaterUseSector {
  id: string;
  nombre: string;
  descripcion: string;
  icon?: string;
}

// Definition of water use sectors (Spanish fields used by UI)
export const WATER_USE_SECTORS: WaterUseSector[] = [
  {
    id: "agua-potable",
    nombre: "Agua Potable",
    descripcion: "Agua para consumo humano directo",
    icon: "🚰"
  },
  {
    id: "industria-alimentos",
    nombre: "Industria Alimentaria",
    descripcion: "Agua para procesamiento de alimentos",
    icon: "🏭"
  },
  {
    id: "riego",
    nombre: "Agricultura/Riego",
    descripcion: "Agua para riego de cultivos agrícolas",
    icon: "🌾"
  },
  {
    id: "ganaderia",
    nombre: "Ganadería",
    descripcion: "Agua para bebida de animales",
    icon: "🐄"
  },
  {
    id: "industria-general",
    nombre: "Industria General",
    descripcion: "Agua para procesos industriales",
    icon: "⚙️"
  },
  {
    id: "acuicultura",
    nombre: "Acuicultura/Pesca",
    descripcion: "Agua para vida acuática y pesca",
    icon: "🐟"
  },
  {
    id: "recreacion",
    nombre: "Recreación (Contacto Primario)",
    descripcion: "Agua para natación y deportes acuáticos",
    icon: "🏊"
  },
  {
    id: "recreacion-sin-contacto",
    nombre: "Recreación (Sin Contacto)",
    descripcion: "Agua para deportes náuticos sin inmersión",
    icon: "🚤"
  },
  {
    id: "conservacion",
    nombre: "Conservación y Vida Acuática",
    descripcion: "Agua para protección de ecosistemas acuáticos",
    icon: "🌿"
  },
  {
    id: "reuso",
    nombre: "Reúso de Aguas Residuales",
    descripcion: "Agua residual tratada para diferentes usos",
    icon: "♻️"
  },
  {
    id: "vertimiento",
    nombre: "Vertimiento de Efluentes",
    descripcion: "Descargas de aguas residuales a cuerpos receptores",
    icon: "🏭"
  },
  {
    id: "energia",
    nombre: "Agua para Energía",
    descripcion: "Agua para hidroeléctricas y torres de enfriamiento",
    icon: "⚡"
  },
  {
    id: "transporte",
    nombre: "Transporte Marítimo",
    descripcion: "Agua para transporte y actividades portuarias",
    icon: "🚢"
  },
  {
    id: "estetico",
    nombre: "Uso Estético",
    descripcion: "Lagunas ornamentales y fuentes",
    icon: "⛲"
  }
];

export const PARAMETER_CATEGORIES = [
  "microbiological",
  "physicochemical", 
  "metals",
  "nutrients",
  "organics",
  "others"
] as const;

export type ParameterCategory = typeof PARAMETER_CATEGORIES[number];

// Spanish-friendly alias used by UI code
export const SECTORES_USO = WATER_USE_SECTORS;

export type WaterUseType = WaterUseSector;