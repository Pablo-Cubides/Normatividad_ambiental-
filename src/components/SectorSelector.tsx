'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WATER_USE_SECTORS, WaterUseSector } from '@/lib/types';

interface SectorSelectorProps {
  selectedSector: string;
  onSectorChange: (sectorId: string) => void;
  availableSectorIds: string[];
  disabled: boolean;
}

export function SectorSelector({ selectedSector, onSectorChange, availableSectorIds, disabled }: SectorSelectorProps) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">Sector de Uso:</label>
      <Select value={selectedSector} onValueChange={onSectorChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={availableSectorIds.length === 0 ? "No hay sectores con datos" : "Todos los sectores"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los sectores</SelectItem>
          {WATER_USE_SECTORS.filter((sector: WaterUseSector) => availableSectorIds.includes(sector.id)).map((sector: WaterUseSector) => (
            <SelectItem key={sector.id} value={sector.id}>
              <span className="flex items-center gap-2">
                <span>{sector.icon}</span>
                <span>{sector.nombre}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
