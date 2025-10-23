// Re-export inferred types from Zod schemas.
// This makes schemas.ts the single source of truth for data shapes.
import type { SectorNorm, RecordNorm, UnifiedNorm } from './schemas';
import type { RegulatorySource } from './constants';

export type { SectorNorm as WaterSectorNorm, RecordNorm, UnifiedNorm };

// UI-facing aliases used by components
export type CountryStandards = UnifiedNorm & {
  normativeReference?: string;
  lastUpdate?: string;
  sectors?: Record<string, SectorNorm> | undefined;
  sources?: RegulatorySource[];
};

export type SectorStandards = SectorNorm;

export type WaterQualityParameter = RecordNorm & {
  parameter?: string;
  value?: string | number;
  unit?: string | null;
  source?: string;
};

// Country type for UI components
export interface Country {
  code: string;
  name: string;
  flag: string;
}

// The WaterUseSector interface and constants are kept here because they define UI logic,
// not the structure of incoming data.

export interface WaterUseSector {
  id: string;
  nombre: string;
  descripcion: string;
  icon?: string;
}

// Mapeo normalizado de todos los sectores únicos encontrados en los datos
// Maps raw JSON keys (with underscores) to normalized frontend IDs (with hyphens)
// IMPORTANT: First match wins! Order matters for denormalization
export const SECTOR_NORMALIZATION_MAP: Record<string, string> = {
  // === SHARED SECTORS (agua_potable, uso_agricola) ===
  "agua_potable": "agua-potable",
  "agua-potable": "agua-potable",
  "uso_agricola": "uso-agricola",
  "uso-agricola": "uso-agricola",
  
  // === ARGENTINA ===
  "actividades_recreativas": "actividades-recreativas",
  "actividades-recreativas": "actividades-recreativas",
  "proteccion_vida_acuatica": "proteccion-vida-acuatica",
  "proteccion-vida-acuatica": "proteccion-vida-acuatica",
  
  // === BRASIL ===
  "aguas_doces_classe_especial": "aguas-doces-classe-especial",
  "aguas-doces-classe-especial": "aguas-doces-classe-especial",
  "aguas_doces_classe_1": "aguas-doces-classe-1",
  "aguas-doces-classe-1": "aguas-doces-classe-1",
  "aguas_doces_classe_2": "aguas-doces-classe-2",
  "aguas-doces-classe-2": "aguas-doces-classe-2",
  "aguas_doces_classe_3": "aguas-doces-classe-3",
  "aguas-doces-classe-3": "aguas-doces-classe-3",
  "aguas_doces_classe_4": "aguas-doces-classe-4",
  "aguas-doces-classe-4": "aguas-doces-classe-4",
  "aguas_salinas_classe_1": "aguas-salinas-classe-1",
  "aguas-salinas-classe-1": "aguas-salinas-classe-1",
  "aguas_salobras_classe_1": "aguas-salobras-classe-1",
  "aguas-salobras-classe-1": "aguas-salobras-classe-1",
  
  // === CHILE ===
  "riego": "riego",
  "bebida_animales": "bebida-animales",
  "bebida-animales": "bebida-animales",
  "recreacion": "recreacion",  // Chile uses "recreacion" directly
  "vida_acuatica": "vida-acuatica",  // Chile uses "vida_acuatica"
  "vida-acuatica": "vida-acuatica",
  "reutilizacion_aguas_grises": "reutilizacion-aguas-grises",
  "reutilizacion-aguas-grises": "reutilizacion-aguas-grises",
  
  // === CHINA ===
  "aguas_superficiales_clase_I": "aguas-superficiales-clase-i",
  "aguas-superficiales-clase-i": "aguas-superficiales-clase-i",
  "aguas_superficiales_clase_II": "aguas-superficiales-clase-ii",
  "aguas-superficiales-clase-ii": "aguas-superficiales-clase-ii",
  
  // === COLOMBIA ===
  "uso_pecuario": "uso-pecuario",
  "uso-pecuario": "uso-pecuario",
  "reuso_agricola": "reuso-agricola",
  "reuso-agricola": "reuso-agricola",
  
  // === EL SALVADOR ===
  "descarga_aguas_residuales_ordinario": "descarga-aguas-residuales-ordinario",
  "descarga-aguas-residuales-ordinario": "descarga-aguas-residuales-ordinario",
  "descarga_aguas_residuales_especial": "descarga-aguas-residuales-especial",
  "descarga-aguas-residuales-especial": "descarga-aguas-residuales-especial",
  
  // === ESTADOS UNIDOS ===
  "agua_potable_primarios": "agua-potable-primarios",
  "agua-potable-primarios": "agua-potable-primarios",
  "agua_potable_secundarios": "agua-potable-secundarios",
  "agua-potable-secundarios": "agua-potable-secundarios",
  
  // === MEXICO ===
  "agua_consumo_humano": "agua-consumo-humano",
  "agua-consumo-humano": "agua-consumo-humano",
  "reuso_servicios_publicos": "reuso-servicios-publicos",
  "reuso-servicios-publicos": "reuso-servicios-publicos",
  
  // === PERU ===
  "produccion_agua_potable_A1": "produccion-agua-potable-a1",
  "produccion-agua-potable-a1": "produccion-agua-potable-a1",
  "riego_vegetales_bebida_animales_D1": "riego-vegetales-bebida-animales-d1",
  "riego-vegetales-bebida-animales-d1": "riego-vegetales-bebida-animales-d1",
  "conservacion_ambiente_acuatico_E1": "conservacion-ambiente-acuatico-e1",
  "conservacion-ambiente-acuatico-e1": "conservacion-ambiente-acuatico-e1",
  
  // === UNION EUROPEA ===
  "calidad_ambiental_superficiales": "calidad-ambiental-superficiales",
  "calidad-ambiental-superficiales": "calidad-ambiental-superficiales",
  "reutilizacion_riego_agricola": "reutilizacion-riego-agricola",
  "reutilizacion-riego-agricola": "reutilizacion-riego-agricola",
};

export const WATER_USE_SECTORS: WaterUseSector[] = [
  { id: "agua-potable", nombre: "Agua Potable", descripcion: "Agua para consumo humano directo", icon: "🚰" },
  { id: "riego", nombre: "Agricultura/Riego", descripcion: "Agua para riego de cultivos agrícolas", icon: "🌾" },
  { id: "ganaderia", nombre: "Ganadería", descripcion: "Agua para bebida de animales", icon: "🐮" },
  { id: "vida-acuatica", nombre: "Vida Acuática", descripcion: "Agua para protección de ecosistemas acuáticos", icon: "🐟" },
  { id: "recreacion", nombre: "Recreación", descripcion: "Agua para actividades recreativas", icon: "🏊" },
  { id: "reuso", nombre: "Reúso / Reutilización", descripcion: "Agua residual tratada para reutilización", icon: "♻️" },
  { id: "vertimiento", nombre: "Vertimientos", descripcion: "Descargas de aguas residuales", icon: "🌊" }
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

export const SECTORES_USO = WATER_USE_SECTORS;

export type WaterUseType = WaterUseSector;
