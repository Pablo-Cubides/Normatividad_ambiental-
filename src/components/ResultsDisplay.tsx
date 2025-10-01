 'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { WATER_USE_SECTORS } from '@/lib/types';
import type { UnifiedNorm, SectorNorm, RecordNorm } from '@/lib/schemas';

interface CountryInfo { code: string; name: string; flag?: string }

interface ResultsDisplayProps {
  data: Partial<UnifiedNorm>;
  countryInfo: CountryInfo;
  filteredSectors: [string, SectorNorm][];
}

export function ResultsDisplay({ data, countryInfo, filteredSectors }: ResultsDisplayProps) {
  type MutableData = Partial<UnifiedNorm> & { reference?: unknown; referencia?: unknown; registros?: unknown; version?: string; lastUpdate?: string; fuentePrincipal?: string };
  const mutable = data as MutableData;
  // Now returns a consistent object shape, using the Spanish properties
  const getSectorInfo = (sectorId: string) => 
    WATER_USE_SECTORS.find(s => s.id === sectorId) || 
    { id: sectorId, nombre: sectorId, descripcion: '', icon: '📊' };

  // Helpers to safely access possibly-unknown/legacy fields without using `any`
  const asRecord = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null) ? (v as Record<string, unknown>) : {};
  const getParamLimit = (param: RecordNorm) => {
    const p = asRecord(param);
    const value = p['value'];
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    const limit = p['limit'] ?? p['limite'];
    return typeof limit === 'string' || typeof limit === 'number' ? String(limit) : '';
  };
  const getReferenceStandard = (obj: unknown) => {
    const r = asRecord(obj);
    const std = r['standard'] ?? r['norma'];
    return typeof std === 'string' ? std : (typeof std === 'number' ? String(std) : '');
  };
  const getRecordLimit = (r: RecordNorm) => {
    const rec = asRecord(r);
    const lim = rec['limit'] ?? rec['limite'];
    return typeof lim === 'string' || typeof lim === 'number' ? String(lim) : '';
  };
  const getRecordNotes = (r: RecordNorm) => {
    const rec = asRecord(r);
    const notes = rec['notes'] ?? rec['notas'];
    return Array.isArray(notes) ? (notes as unknown[]).map(String) : [] as string[];
  };

  const renderWaterContent = () => (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{countryInfo?.flag}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{countryInfo?.name}</h2>
                <p className="text-gray-600">{filteredSectors.length} sectores de agua encontrados</p>
              </div>
            </div>
            <Button variant="outline" className="no-print" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Imprimir/PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {filteredSectors.map(([sectorId, sectorData]) => {
          const sectorInfo = getSectorInfo(sectorId);
          return (
            <Card id={`sector-${sectorId}`} key={sectorId} className="print-friendly">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sectorInfo.icon}</span>
                    <div>
                      {/* Use the name from the JSON data, but fall back to the name from the constant */}
                      <CardTitle className="text-xl text-gray-900">{sectorData.name || sectorInfo.nombre}</CardTitle>
                      {/* Use the description from the JSON data, but fall back to the description from the constant */}
                      <p className="text-sm text-gray-600">{(sectorData.description as string) || sectorInfo.descripcion}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{Array.isArray(sectorData.parameters) ? sectorData.parameters.length : 0} parámetros</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-blue-50/50">
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">{data.normativeReference}</span>
                    <span className="text-gray-600"> - Actualizado: {data.lastUpdate}</span>
                  </div>
                </div>
                <div id={`sector-table-${sectorId}`} className="overflow-x-auto">
                  <table>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 font-semibold text-left text-gray-900">Parámetro</th>
                        <th className="p-4 font-semibold text-left text-gray-900">Valor Límite</th>
                        <th className="p-4 font-semibold text-left text-gray-900">Unidad</th>
                        <th className="p-4 font-semibold text-left text-gray-900">Fuente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(Array.isArray(sectorData.parameters) ? sectorData.parameters : []).map((param: RecordNorm, paramIndex: number) => (
                        <tr key={paramIndex} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{param.parameter ?? param.parametro}</td>
                          <td className="p-4 font-mono text-blue-700">{getParamLimit(param)}</td>
                          <td className="p-4 text-gray-600">{param.unit ?? param.unidad ?? '-'}</td>
                          <td className="p-4 text-sm text-gray-600">{getReferenceStandard((param as unknown) && (asRecord(param)['reference'] ?? asRecord(param)['referencia']) )}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );

  const renderRecordsContent = () => {
  const records = (mutable.records ?? (mutable.registros as unknown)) as RecordNorm[] | undefined;
  const reference = (mutable.reference ?? mutable.referencia) as unknown;
  const version = (mutable.version ?? mutable.lastUpdate ?? '') as string;
  const sourceText = (mutable.fuentePrincipal as string) || ((reference && (reference as any).norma) ?? (reference && (reference as any).standard) ) || 'N/A';

    return (
      <Card className="print-friendly">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">{countryInfo?.name} — {String((data.domain || '').replace?.('-', ' ') ?? '')}</CardTitle>
              <p className="text-sm text-gray-600">Tabla de parámetros normativos</p>
            </div>
            <Badge variant="outline" className="text-xs">{Array.isArray(records) ? records.length : 0} registros</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b bg-blue-50/50">
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">Fuente: {sourceText}</span>
              <span className="text-gray-600"> - Extraído: {version}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 font-semibold text-left text-gray-900">Parámetro</th>
                  <th className="p-4 font-semibold text-left text-gray-900">Límite</th>
                  <th className="p-4 font-semibold text-left text-gray-900">Unidad</th>
                  <th className="p-4 font-semibold text-left text-gray-900">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(Array.isArray(records) ? records : []).map((r: RecordNorm, idx: number) => {
                  const param = r.parameter ?? r.parametro ?? '';
                  const lim = (r as any).limit ?? (r as any).limite ?? '';
                  const unit = r.unit ?? r.unidad ?? '-';
                  const notes = r.notes ?? r.notas ?? [];
                  return (
                    <tr key={idx} className="align-top hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{param}</td>
                      <td className="p-4 font-mono text-blue-700">{lim}</td>
                      <td className="p-4 text-gray-600">{unit || '-'}</td>
                      <td className="p-4 text-sm text-gray-700">{(notes || []).join('; ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {data.sectors && renderWaterContent()}
      {(data.records || data.registros) && renderRecordsContent()}
    </>
  );
}
