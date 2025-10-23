'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { WATER_USE_SECTORS } from '@/lib/types';
import { RegulatorySource } from '@/lib/constants';
import { RegulatorySourcesCard } from './RegulatorySourcesCard';

type AnyRecord = Record<string, unknown>;

interface ResultsDisplayProps {
  data: unknown;
  countryInfo?: AnyRecord | null;
  filteredSectors: [string, AnyRecord][];
}

export function ResultsDisplay({ data, countryInfo, filteredSectors }: ResultsDisplayProps) {
  const dataObj = (typeof data === 'object' && data !== null) ? (data as AnyRecord) : {} as AnyRecord;
  // Now returns a consistent object shape, using the Spanish properties
  const getSectorInfo = (sectorId: string) => 
    WATER_USE_SECTORS.find(s => s.id === sectorId) || 
    { id: sectorId, nombre: sectorId, descripcion: '', icon: '📊' };

  const renderWaterContent = () => (
    <>
  {Array.isArray(dataObj.sources) && (dataObj.sources as RegulatorySource[]).length > 0 && (
        <div className="mb-6">
          <RegulatorySourcesCard
            sources={dataObj.sources as RegulatorySource[]}
            country={String(countryInfo?.name ?? 'País')}
            domain="agua"
          />
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{String(countryInfo?.flag ?? '')}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{String(countryInfo?.name ?? 'País')}</h2>
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
          const sector = (sectorData || {}) as AnyRecord;
          const paramsArr = Array.isArray(sector.parameters) ? (sector.parameters as AnyRecord[]) : [];
          return (
            <Card id={`sector-${sectorId}`} key={sectorId} className="print-friendly">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sectorInfo.icon}</span>
                    <div>
                      {/* Use the name from the JSON data, but fall back to the name from the constant */}
                      <CardTitle className="text-xl text-gray-900">{String(sector.name ?? sectorInfo.nombre)}</CardTitle>
                      {/* Use the description from the JSON data, but fall back to the description from the constant */}
                      <p className="text-sm text-gray-600">{String(sector.description ?? sectorInfo.descripcion)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{paramsArr.length} parámetros</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-blue-50/50">
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">{String(dataObj.normativeReference ?? '')}</span>
                    <span className="text-gray-600"> - Actualizado: {String(dataObj.lastUpdate ?? '')}</span>
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
                      {paramsArr.map((param, paramIndex) => (
                        <tr key={paramIndex} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{String((param as AnyRecord).parameter ?? '')}</td>
                          <td className="p-4 font-mono text-blue-700">{String((param as AnyRecord).value ?? '')}</td>
                          <td className="p-4 text-gray-600">{String((param as AnyRecord).unit ?? '')}</td>
                          <td className="p-4 text-sm text-gray-600">{String((param as AnyRecord).source ?? '')}</td>
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
  const records = Array.isArray(dataObj.records) ? (dataObj.records as AnyRecord[]) : (Array.isArray(dataObj.registros) ? (dataObj.registros as AnyRecord[]) : [] as AnyRecord[]);
  const reference = (dataObj.reference ?? dataObj.referencia) as AnyRecord | undefined;
  const version = String(dataObj.version ?? dataObj.lastUpdate ?? '');
  const sourceText = String(dataObj.fuentePrincipal ?? reference?.norma ?? reference?.standard ?? 'N/A');
  const domainLabel = String(((dataObj.domain as string) || '').replace?.('-', ' ') ?? '');

    return (
      <>
        {Array.isArray(dataObj.sources) && (dataObj.sources as RegulatorySource[]).length > 0 && (
          <div className="mb-6">
            <RegulatorySourcesCard
              sources={dataObj.sources as RegulatorySource[]}
              country={String(countryInfo?.name ?? 'País')}
              domain={String(dataObj.domain ?? domainLabel)}
            />
          </div>
        )}

        <Card className="print-friendly">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">{String(countryInfo?.name ?? 'País')} — {String((dataObj.domain ?? '').toString().replace?.('-', ' ') ?? '')}</CardTitle>
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
                {Array.isArray(records) && records.map((r, idx) => {
                  const rec = (typeof r === 'object' && r !== null) ? (r as AnyRecord) : {} as AnyRecord;
                  const param = String(rec.parameter ?? rec.parametro ?? '');
                  const lim = String(rec.limit ?? rec.limite ?? '');
                  const unit = String(rec.unit ?? rec.unidad ?? '-');
                  const notes = Array.isArray(rec.notes) ? (rec.notes as unknown[]).map(String) : (Array.isArray(rec.notas) ? (rec.notas as unknown[]).map(String) : [] as string[]);
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
      </>
    );
  };

  return (
    <>
      {Array.isArray(dataObj._sectors || dataObj.sectors) ? renderWaterContent() : null}
      {(Array.isArray(dataObj.records) || Array.isArray(dataObj.registros)) ? renderRecordsContent() : null}
    </>
  );
}
