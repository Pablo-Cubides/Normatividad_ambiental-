'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { WATER_USE_SECTORS } from '@/lib/types';

interface ResultsDisplayProps {
  data: any;
  countryInfo: any;
  filteredSectors: [string, any][];
}

export function ResultsDisplay({ data, countryInfo, filteredSectors }: ResultsDisplayProps) {
  // Now returns a consistent object shape, using the Spanish properties
  const getSectorInfo = (sectorId: string) => 
    WATER_USE_SECTORS.find(s => s.id === sectorId) || 
    { id: sectorId, nombre: sectorId, descripcion: '', icon: '📊' };

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
                      <p className="text-sm text-gray-600">{sectorData.description || sectorInfo.descripcion}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{sectorData.parameters.length} parámetros</Badge>
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
                      {sectorData.parameters.map((param: any, paramIndex: number) => (
                        <tr key={paramIndex} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{param.parameter}</td>
                          <td className="p-4 font-mono text-blue-700">{param.value}</td>
                          <td className="p-4 text-gray-600">{param.unit}</td>
                          <td className="p-4 text-sm text-gray-600">{param.source}</td>
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
    const records = data.records ?? data.registros ?? [];
    const reference = data.reference ?? data.referencia;
    const version = data.version ?? data.lastUpdate ?? '';
    const sourceText = data.fuentePrincipal || reference?.norma || reference?.standard || 'N/A';

    return (
      <Card className="print-friendly">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">{countryInfo?.name} — {String((data.domain || '').replace?.('-', ' ') ?? '')}</CardTitle>
              <p className="text-sm text-gray-600">Tabla de parámetros normativos</p>
            </div>
            <Badge variant="outline" className="text-xs">{records.length} registros</Badge>
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
                {records.map((r: any, idx: number) => {
                  const param = r.parameter ?? r.parametro ?? '';
                  const lim = r.limit ?? r.limite ?? '';
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
