import React from 'react';
import { Droplet, Wind, Trash2, Waves, Home } from 'lucide-react';

// Sector icon mapping - SMART icon matching by keywords
export const SECTOR_ICON_PATTERNS = [
  // Agua Potable - Highest priority for drinking water
  {
    keywords: ['agua_potable', 'agua_consumo_humano', 'produccion_agua_potable'],
    icon: <Droplet className="w-full h-full" />,
    emoji: '💧',
    name: 'Agua Potable',
  },
  // Ganadería - Livestock and animal use
  {
    keywords: ['ganado', 'uso_pecuario', 'bebida_animales', 'pecuario'],
    icon: <span className="text-2xl">🐄</span>,
    emoji: '🐄',
    name: 'Ganadería',
  },
  // Industrial
  {
    keywords: ['industrial', 'torres_enfriamiento'],
    icon: <span className="text-2xl">🏭</span>,
    emoji: '🏭',
    name: 'Industrial',
  },
  // Recreación - All recreational activities
  {
    keywords: ['recreacion', 'actividades_recreativas', 'reco1', 'reco2', 'kayak'],
    icon: <span className="text-2xl">🏊</span>,
    emoji: '🏊',
    name: 'Recreación',
  },
  // Reúso - Reuse and recycling (check before riego)
  {
    keywords: ['reuso', 'reutilizacion'],
    icon: <span className="text-2xl">♻️</span>,
    emoji: '♻️',
    name: 'Reúso',
  },
  // Riego Agrícola - Agricultural irrigation (after reuso check)
  {
    keywords: ['riego', 'uso_agricola', 'agricola'],
    icon: <span className="text-2xl">🌾</span>,
    emoji: '🌾',
    name: 'Riego Agrícola',
  },
  // Vida Acuática - Aquatic life protection
  {
    keywords: ['vida_acuatica', 'proteccion_vida_acuatica', 'conservacion_ambiente_acuatico'],
    icon: <span className="text-2xl">🐟</span>,
    emoji: '🐟',
    name: 'Vida Acuática',
  },
  // Aguas Superficiales - Surface water classes
  {
    keywords: ['aguas_superficiales', 'aguas_doces', 'classe'],
    icon: <span className="text-2xl">💧</span>,
    emoji: '💧',
    name: 'Aguas Superficiales',
  },
  // Aguas Salinas/Salobras - Saline/Brackish waters
  {
    keywords: ['aguas_salinas', 'aguas_salobras'],
    icon: <span className="text-2xl">🌊</span>,
    emoji: '🌊',
    name: 'Aguas Salinas',
  },
  // Vertimientos - Wastewater discharge
  {
    keywords: ['descarga', 'vertimientos', 'aguas_residuales'],
    icon: <Waves className="w-full h-full" />,
    emoji: '🌊',
    name: 'Vertimientos',
  },
  // Calidad Ambiental - Environmental quality
  {
    keywords: ['calidad_ambiental'],
    icon: <span className="text-2xl">🌿</span>,
    emoji: '🌿',
    name: 'Calidad Ambiental',
  },
  // Calidad del Aire
  {
    keywords: ['calidad_aire'],
    icon: <Wind className="w-full h-full" />,
    emoji: '💨',
    name: 'Calidad del Aire',
  },
  // Residuos Sólidos
  {
    keywords: ['residuos_solidos'],
    icon: <Trash2 className="w-full h-full" />,
    emoji: '🗑️',
    name: 'Residuos Sólidos',
  },
  // Vertimientos - Municipal/PTAR
  {
    keywords: ['municipal', 'ptar', 'urbano', 'domestico', 'alcantarillado', 'potw', 'tratamiento_secundario'],
    icon: <span className="text-2xl">🏘️</span>,
    emoji: '🏘️',
    name: 'Municipal/Urbano',
  },
  // Vertimientos - Hidrocarburos - PRIORITY: before NOM to catch nom143_agua_congenita
  {
    keywords: ['hidrocarburos', 'exploracion', 'explotacion', 'petrolera', 'congenita'],
    icon: <span className="text-2xl">�️</span>,
    emoji: '�️',
    name: 'Hidrocarburos',
  },
  // Vertimientos - NOM (México)
  {
    keywords: ['nom001', 'nom143', 'nom_001', 'nom_143'],
    icon: <span className="text-2xl">📋</span>,
    emoji: '📋',
    name: 'Norma Mexicana',
  },
  // Vertimientos - Refinación de Petróleo
  {
    keywords: ['refinacion', 'refino', 'petroleo', 'cracking', 'refinerias'],
    icon: <span className="text-2xl">⛽</span>,
    emoji: '⛽',
    name: 'Refinación de Petróleo',
  },
  // Vertimientos - Minería
  {
    keywords: ['mineria', 'minero', 'metalurgico', 'metales', 'carbon'],
    icon: <span className="text-2xl">⛏️</span>,
    emoji: '⛏️',
    name: 'Minería',
  },
  // Vertimientos - CAFO/Ganadería Intensiva
  {
    keywords: ['cafo', 'patos', 'mataderos', 'agroindustrial'],
    icon: <span className="text-2xl">🦆</span>,
    emoji: '🦆',
    name: 'CAFO/Agroindustrial',
  },
  // Vertimientos - Manufactura/Industria
  {
    keywords: ['manufactura', 'seleccionada', 'produce'],
    icon: <span className="text-2xl">🏭</span>,
    emoji: '🏭',
    name: 'Manufactura',
  },
  // Vertimientos - CONAMA (Brasil)
  {
    keywords: ['conama', 'inorganicos'],
    icon: <span className="text-2xl">🇧🇷</span>,
    emoji: '🇧🇷',
    name: 'CONAMA',
  },
  // Vertimientos - Descarga a cuerpos de agua
  {
    keywords: ['rios', 'lagos', 'mar', 'litoral', 'superficial'],
    icon: <span className="text-2xl">💧</span>,
    emoji: '💧',
    name: 'Cuerpos de Agua',
  },
  // Vertimientos - RTS (El Salvador)
  {
    keywords: ['rts', 'ordinarias', 'especial'],
    icon: <span className="text-2xl">📄</span>,
    emoji: '📄',
    name: 'RTS',
  },
  // Vertimientos - Genérico GB (China)
  {
    keywords: ['gb8978', 'gb31570', 'gb_'],
    icon: <span className="text-2xl">🇨🇳</span>,
    emoji: '🇨🇳',
    name: 'Norma China',
  },
];

/**
 * Smart function to get sector icon based on keyword matching
 * Normalizes sector names and matches against patterns
 * @param sectorKey - The sector key to match
 * @param fallbackIcon - Icon to return if no match found (default: generic chart icon)
 * @returns React.ReactNode representing the icon
 */
export function getSectorIcon(sectorKey: string, fallbackIcon: React.ReactNode = <span className="text-2xl">📊</span>): React.ReactNode {
  // Normalize the sector key: lowercase and handle both _ and -
  const normalized = sectorKey.toLowerCase().replace(/-/g, '_');
  
  // Find the first pattern that matches any keyword
  for (const pattern of SECTOR_ICON_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        return pattern.icon;
      }
    }
  }
  
  // If no match found, return fallback icon
  return fallbackIcon;
}

/**
 * Get emoji-only version of the icon (for simple display)
 * @param sectorKey - The sector key to match
 * @param fallbackEmoji - Emoji to return if no match found (default: chart emoji)
 * @returns string representing the emoji
 */
export function getSectorEmoji(sectorKey: string, fallbackEmoji: string = '📊'): string {
  // Normalize the sector key: lowercase and handle both _ and -
  const normalized = sectorKey.toLowerCase().replace(/-/g, '_');
  
  // Find the first pattern that matches any keyword
  for (const pattern of SECTOR_ICON_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        return pattern.emoji;
      }
    }
  }
  
  // If no match found, return fallback emoji
  return fallbackEmoji;
}

/**
 * Get the category name for a sector
 * @param sectorKey - The sector key to match
 * @returns string representing the category name
 */
export function getSectorCategoryName(sectorKey: string): string {
  // Normalize the sector key: lowercase and handle both _ and -
  const normalized = sectorKey.toLowerCase().replace(/-/g, '_');
  
  // Find the first pattern that matches any keyword
  for (const pattern of SECTOR_ICON_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        return pattern.name;
      }
    }
  }
  
  // If no match found, return formatted sector key
  return sectorKey.replace(/_/g, ' ').replace(/-/g, ' ');
}
