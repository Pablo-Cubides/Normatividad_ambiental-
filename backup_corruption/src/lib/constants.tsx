import React from 'react';
import { Droplet, Wind, Trash2, Waves } from 'lucide-react';
import type { Dominio, RegulatorySource } from '@/lib/types';

// Domain definitions
export const DOMINIOS: Dominio[] = [
  {
    id: 'agua',
    label: 'Agua',
    icon: <Droplet className="w-full h-full" />
  },
  {
    id: 'calidad-aire',
    label: 'Calidad del Aire',
    icon: <Wind className="w-full h-full" />
  },
  {
    id: 'residuos-solidos',
    label: 'Residuos Sólidos',
    icon: <Trash2 className="w-full h-full" />
  },
  {
    id: 'vertimientos',
    label: 'Vertimientos',
    icon: <Waves className="w-full h-full" />
  }
];

// Regulatory sources by country and domain
export const REGULATORY_SOURCES: Record<string, Record<string, RegulatorySource[]>> = {
  'argentina': {
    'agua': [
      { name: 'Código Alimentario Argentino', url: 'https://www.argentina.gob.ar/anmat/codigoalimentario', type: 'official' }
    ],
    'calidad-aire': [
      { name: 'Ley 20.284', url: 'https://www.argentina.gob.ar/normativa', type: 'official' }
    ],
    'residuos-solidos': [
      { name: 'Ley 25.916', url: 'https://www.argentina.gob.ar/normativa', type: 'official' }
    ],
    'vertimientos': [
      { name: 'Ley 24.051', url: 'https://www.argentina.gob.ar/normativa', type: 'official' }
    ]
  },
  'colombia': {
    'agua': [
      { name: 'Resolución 2115 de 2007', url: 'https://www.minambiente.gov.co', type: 'official' }
    ],
    'calidad-aire': [
      { name: 'Resolución 2254 de 2017', url: 'https://www.minambiente.gov.co', type: 'official' }
    ],
    'residuos-solidos': [
      { name: 'Decreto 1077 de 2015', url: 'https://www.minambiente.gov.co', type: 'official' }
    ],
    'vertimientos': [
      { name: 'Resolución 0631 de 2015', url: 'https://www.minambiente.gov.co', type: 'official' }
    ]
  },
  // Add more countries as needed
};

// Helper function to get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  const flagMap: Record<string, string> = {
    'argentina': '🇦🇷',
    'brasil': '🇧🇷',
    'chile': '🇨🇱',
    'china': '🇨🇳',
    'colombia': '🇨🇴',
    'el-salvador': '🇸🇻',
    'estados-unidos': '🇺🇸',
    'mexico': '🇲🇽',
    'peru': '🇵🇪',
    'union-europea': '🇪🇺'
  };
  return flagMap[countryCode] || '🌍';
}
