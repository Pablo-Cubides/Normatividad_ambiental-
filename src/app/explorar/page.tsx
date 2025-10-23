"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Filter, Download, AlertTriangle, ExternalLink, Droplet, Wind, Trash2, Waves, Home } from 'lucide-react';
import { LoadingSkeleton, TableSkeleton } from '@/components/LoadingSkeleton';
import { useExplorarState } from '@/lib/hooks';
import { DOMINIOS, REGULATORY_SOURCES } from '@/lib/constants';

type AnyRecord = Record<string, unknown>;

// ========================================
// ICONOS DE SECTORES - TODO EN UN SOLO LUGAR
// ========================================
const SECTOR_ICON_PATTERNS = [
  {
    keywords: ['agua_potable', 'agua_consumo_humano', 'produccion_agua_potable'],
    icon: <Droplet className="w-full h-full" />,
  },
  {
    keywords: ['ganado', 'uso_pecuario', 'bebida_animales', 'pecuario'],
    icon: <span className="text-2xl">🐄</span>,
  },
  {
    keywords: ['industrial', 'torres_enfriamiento'],
    icon: <span className="text-2xl">🏭</span>,
  },
  {
    keywords: ['recreacion', 'actividades_recreativas', 'reco1', 'reco2', 'kayak'],
    icon: <span className="text-2xl">🏊</span>,
  },
  {
    keywords: ['reuso', 'reutilizacion'],
    icon: <span className="text-2xl">♻️</span>,
  },
  {
    keywords: ['riego', 'uso_agricola', 'agricola'],
    icon: <span className="text-2xl">🌾</span>,
  },
  {
    keywords: ['vida_acuatica', 'proteccion_vida_acuatica', 'conservacion_ambiente_acuatico'],
    icon: <span className="text-2xl">🐟</span>,
  },
  {
    keywords: ['aguas_superficiales', 'aguas_doces', 'classe'],
    icon: <span className="text-2xl">💧</span>,
  },
  {
    keywords: ['aguas_salinas', 'aguas_salobras'],
    icon: <span className="text-2xl">🌊</span>,
  },
  {
    keywords: ['descarga', 'vertimientos', 'aguas_residuales'],
    icon: <Waves className="w-full h-full" />,
  },
  {
    keywords: ['calidad_ambiental'],
    icon: <span className="text-2xl">🌿</span>,
  },
  {
    keywords: ['calidad_aire'],
    icon: <Wind className="w-full h-full" />,
  },
  {
    keywords: ['residuos_solidos'],
    icon: <Trash2 className="w-full h-full" />,
  },
];

function getSectorIcon(sectorKey: string, fallbackIcon: React.ReactNode): React.ReactNode {
  const normalized = sectorKey.toLowerCase().replace(/-/g, '_');
  
  for (const pattern of SECTOR_ICON_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        return pattern.icon;
      }
    }
  }
  
  return fallbackIcon;
}

function ExplorarContent() {
  // Use the custom hook for all state management
  const {
    selectedDomain,
    selectedCountry,
    selectedSector,
    availableCountries,
    availableSectors,
    data,
    loading,
    error,
    searchQuery,
    debouncedSearchQuery,
    currentDominio,
    countryInfo,
    records,
    filteredRecords,
    sectionsToDisplay,
    handleDomainChange,
    handleCountryChange,
    handleSectorChange,
    setSearchQuery,
  } = useExplorarState();

  // ========================================
  // LÓGICA DE URLS - SIMPLIFICADA Y CONSOLIDADA
  // ========================================
  
  /**
   * Obtiene la URL oficial de la normativa
   * ESTRATEGIA SIMPLIFICADA:
   * 1. Si el JSON tiene URL directa (normativeReference_url) → usarla
   * 2. Si data.sources tiene la fuente → usarla
   * 3. Fallback: REGULATORY_SOURCES de constants.ts (primera fuente del país/dominio)
   */
  const getNormativeUrl = (normativeRef: string, dataContext?: AnyRecord): string | null => {
    if (!normativeRef) return null;
    
    const dataToUse = dataContext || data;
    
    // 1. Buscar URL directa en el JSON del sector
    const allSectors = (dataToUse as AnyRecord)?._sectors || (dataToUse as AnyRecord)?.sectors;
    if (allSectors && typeof allSectors === 'object') {
      for (const sectorKey in allSectors) {
        const sectorObj = (allSectors as Record<string, AnyRecord>)[sectorKey];
        if (sectorObj) {
          const sectorNormRef = sectorObj.normativeReference ?? sectorObj.normativeReference_es;
          if (sectorNormRef === normativeRef) {
            const directUrl = sectorObj.normativeUrl ?? sectorObj.normativeReference_url;
            if (directUrl) {
              return String(directUrl);
            }
          }
        }
      }
    }

    // 2. Buscar en data.sources (si existe en el JSON)
    if (dataToUse?.sources && Array.isArray(dataToUse.sources)) {
      const normalize = (str: string) => str.toLowerCase().trim()
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
        .replace(/\s+/g, ' ');
      
      const normalizedRef = normalize(normativeRef);
      
      for (const source of dataToUse.sources) {
        const sourceName = String(source.name ?? '');
        if (normalize(sourceName) === normalizedRef || 
            normalize(sourceName).includes(normalizedRef) ||
            normalizedRef.includes(normalize(sourceName))) {
          return String(source.url ?? '');
        }
      }
    }

    // 3. Fallback: REGULATORY_SOURCES (primera fuente del país/dominio)
    if (selectedCountry && selectedDomain) {
      const countrySources = REGULATORY_SOURCES[selectedCountry]?.[selectedDomain];
      if (countrySources && Array.isArray(countrySources) && countrySources.length > 0) {
        return countrySources[0].url;
      }
    }

    return null;
  };

  // Renderiza una referencia normativa con su enlace
  const renderNormativeReference = (normRef: string, data?: AnyRecord): React.ReactNode => {
    if (!normRef) return null;
    const url = getNormativeUrl(normRef, data);
    
    return (
      <span>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline transition-all text-amber-700 hover:text-amber-900 hover:no-underline"
            title="Ir a fuente oficial"
          >
            {normRef}
          </a>
        ) : (
          <span>{normRef}</span>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header - Modern gradient */}
      <div className="relative overflow-hidden border-b shadow-lg border-slate-200/50 bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 bg-blue-400 rounded-full w-96 h-96 mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 rounded-full w-96 h-96 bg-emerald-400 mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="container relative px-4 py-6 mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Link>
            </Button>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Explorador de Normas</h1>
          <p className="text-lg text-blue-100">Consulta estándares ambientales internacionales</p>
        </div>
      </div>

      <div className="container px-4 py-10 mx-auto">
        <div className="mx-auto max-w-7xl">
          
          {/* Controls Card - Modern Design */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Domain Selector - Grid of buttons */}
              <div className="mb-8">
                <label className="block mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">Dominio Ambiental</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {DOMINIOS.map(dominio => (
                    <button
                      key={dominio.id}
                      onClick={() => handleDomainChange(dominio.id)}
                      className={`group relative p-4 rounded-lg transition-all duration-200 overflow-hidden ${
                        selectedDomain === dominio.id
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-900 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-3xl mb-2 transition-transform group-hover:scale-110`}>
                        {dominio.icon}
                      </div>
                      <div className={`text-sm font-semibold line-clamp-2 ${selectedDomain === dominio.id ? 'text-white' : 'text-gray-900'}`}>
                        {dominio.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Country and Sector Grid */}
              <div className={`grid gap-6 ${((availableSectors?.length) || 0) > 1 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {/* Country Selector - Dropdown */}
                <div>
                  <label className="block mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">País</label>
                  <select 
                    value={selectedCountry}
                    onChange={(e) => {
                      handleCountryChange(e.target.value);
                    }}
                    className="w-full px-4 py-3 text-sm font-medium text-gray-900 transition-all bg-white border-2 border-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">-- Selecciona un país --</option>
                    {availableCountries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sector Selector - show if sectors exist (even if just 1) */}
                {availableSectors && availableSectors.length >= 1 && (
                  <div>
                    <label className="block mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">Sector</label>
                    {availableSectors && availableSectors.length === 1 ? (
                      // If only 1 sector, show as read-only display
                      <div className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-lg">
                        {String(availableSectors[0]).replace(/_/g, ' ').replace(/-/g, ' ')}
                      </div>
                    ) : (
                      // If multiple sectors, show dropdown
                      <select 
                        value={selectedSector}
                        onChange={(e) => handleSectorChange(e.target.value)}
                        className="w-full px-4 py-3 pr-10 text-sm font-medium text-gray-900 transition-all bg-white bg-right bg-no-repeat border border-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="">-- Seleccionar Sector --</option>
                        {availableSectors.map(sector => {
                          const sectorLabel = String(sector).replace(/_/g, ' ').replace(/-/g, ' ');
                          return (
                            <option key={sector} value={sector}>
                              {sectorLabel}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                )}

                {/* Search */}
                <div>
                  <label className="block mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">Buscar</label>
                  <div className="relative">
                    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      type="text"
                      placeholder="Parámetro, límite..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-3 pl-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              <LoadingSkeleton type="card" rows={3} />
              <TableSkeleton rows={5} columns={4} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {data && countryInfo && !loading && (
            <>
              {/* Country Info Header - Modern Design */}
              <div className="p-6 mb-8 text-white shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center flex-1 gap-4">
                    <div className="text-5xl">{countryInfo.flag}</div>
                    <div className="flex-1">
                      <h2 className="mb-1 text-3xl font-bold">{countryInfo.name}</h2>
                      <div className="flex items-center gap-3 text-blue-100">
                        <span className="text-lg">{currentDominio.icon}</span>
                        <span className="font-semibold">{currentDominio.label}</span>
                        {filteredRecords.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{filteredRecords.length} parámetro{filteredRecords.length !== 1 ? 's' : ''}</span>
                            {searchQuery && <span>• Búsqueda: &quot;{searchQuery}&quot;</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="text-blue-600 bg-white no-print hover:bg-blue-50" 
                    size="lg" 
                    onClick={() => window.print()}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>

              {/* Sections Display - Modern Cards */}
              <div className="space-y-6">
                {Object.entries(sectionsToDisplay).length > 0 ? (
                  Object.entries(sectionsToDisplay).map(([sectionKey, records], index) => {
                    // Use smart icon matching instead of direct lookup
                    const sectionIcon = getSectorIcon(sectionKey, currentDominio.icon);
                    const sectionLabel = sectionKey === 'general' 
                      ? currentDominio.label 
                      : sectionKey.replace(/_/g, ' ').replace('-', ' ');
                    
                    return (
                      <Card key={index} className="overflow-hidden border-0 shadow-lg print-friendly">
                        <CardHeader className="pb-4 border-b bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 text-blue-600 bg-blue-100 rounded-lg">
                                {sectionIcon}
                              </div>
                              <div>
                                <CardTitle className="text-xl text-gray-900 capitalize">
                                  {sectionLabel}
                                </CardTitle>
                                <p className="mt-1 text-sm text-gray-600">
                                  {records.length} {records.length === 1 ? 'parámetro' : 'parámetros'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                          {/* Normativa Info */}
                          <div className="p-4 border-b bg-amber-50 border-amber-200">
                            <div className="flex items-start gap-3">
                              <ExternalLink className="flex-shrink-0 w-4 h-4 mt-1 text-amber-600" />
                              <div>
                                <div className="text-sm font-semibold text-amber-900">
                                    {(() => {
                                    // Prefer sector-specific normative URL/name when provided by the API
                                    // Accept either internal `_sectors` (API normalized) or original `sectors`
                                    const allSectors = (data as AnyRecord)?._sectors || (data as AnyRecord)?.sectors;
                                    const sectorObj = allSectors ? (allSectors as Record<string, AnyRecord>)[sectionKey] as AnyRecord | undefined : undefined;

                                    // 1. If the sector has normativeSources, render them
                                    if (Array.isArray(sectorObj?.normativeSources) && sectorObj?.normativeSources.length > 0) {
                                      return (
                                        <div className="flex flex-col gap-1">
                                          {sectorObj.normativeSources.map((s: AnyRecord, idx: number) => (
                                            <a
                                              key={idx}
                                              href={String(s.url ?? '')}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm font-semibold underline transition-all text-amber-700 hover:text-amber-900 hover:no-underline"
                                              title={String(s.description ?? s.name ?? '')}
                                            >
                                              {String(s.name ?? '')}
                                            </a>
                                          ))}
                                        </div>
                                      );
                                    }

                                    // 2. If data has general normativeSources (not per sector), use those
                                    const generalSources = (data as AnyRecord)?.normativeSources;
                                    if (Array.isArray(generalSources) && generalSources.length > 0) {
                                      return (
                                        <div className="flex flex-col gap-1">
                                          {generalSources.map((s: AnyRecord, idx: number) => (
                                            <a
                                              key={idx}
                                              href={String(s.url ?? '')}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm font-semibold underline transition-all text-amber-700 hover:text-amber-900 hover:no-underline"
                                              title={String(s.description ?? s.name ?? '')}
                                            >
                                              {String(s.name ?? '')}
                                            </a>
                                          ))}
                                        </div>
                                      );
                                    }

                                    // 3. If API provided a direct URL and source name, render that
                                    const directUrl = sectorObj?.normativeUrl ?? sectorObj?.normativeReference_url;
                                    if (directUrl) {
                                      const label = String(sectorObj?.normativeSourceName ?? sectorObj?.normativeReference ?? sectorObj?.normativeReference_es ?? sectorObj?.name ?? 'Fuente normativa');
                                      return (
                                        <a
                                          href={String(directUrl)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-semibold underline transition-all text-amber-700 hover:text-amber-900 hover:no-underline"
                                          title="Ir a fuente oficial"
                                        >
                                          {label}
                                        </a>
                                      );
                                    }

                                    // 4. Fallback: try to resolve link via REGULATORY_SOURCES or data.sources
                                    const sectorNorm = sectorObj?.normativeReference ?? sectorObj?.normativeReference_es;
                                    const fallback = (data as AnyRecord)?.normativeReference ?? (data as AnyRecord)?.normativeReference_es;

                                    // If API didn't provide per-sector normativeSources, split combined references
                                    // (like "GB 5749-2022, GB 3838-2002") into separate links using the same matching helper.
                                    const textToUse = sectorNorm ?? fallback;
                                    if (!sectorObj?.normativeSources && typeof textToUse === 'string' && /,|;| y | and /i.test(textToUse)) {
                                      const parts = String(textToUse).split(/,|;| y | and /i).map(p => p.trim()).filter(Boolean);
                                      return (
                                        <div className="flex flex-col gap-1">
                                          {parts.map((part, idx) => (
                                            <span key={idx} className="text-sm">
                                              {renderNormativeReference(part, data)}
                                            </span>
                                          ))}
                                        </div>
                                      );
                                    }

                                    return renderNormativeReference(textToUse as string, data);
                                  })()}
                                </div>
                                {data.lastUpdate && (
                                  <p className="mt-1 text-xs text-amber-700">
                                    Actualizado: {data.lastUpdate}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Parameters Table - Modern styling */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="border-b bg-slate-50 border-slate-200">
                                <tr>
                                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-900 uppercase">Parámetro</th>
                                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-900 uppercase">Valor Límite</th>
                                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-900 uppercase">Unidad</th>
                                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-900 uppercase">Notas</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {records.map((record: AnyRecord, paramIndex: number) => (
                                  <tr key={paramIndex} className="transition-colors hover:bg-blue-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                      {String(record.parameter ?? record.parametro ?? '-')}
                                    </td>
                                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                                      {String(record.limit ?? record.limite ?? '-')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                      {String(record.unit ?? record.unidad ?? '-')}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                      {Array.isArray(record.notes) ? record.notes.join('; ') : (Array.isArray(record.notas) ? record.notas.join('; ') : '')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
                    <CardContent className="p-12 text-center">
                      <Filter className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                        No se encontraron parámetros
                      </h3>
                      <p className="max-w-md mx-auto text-gray-600">
                        Intenta cambiar los filtros, dominio o el término de búsqueda para encontrar los estándares que buscas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Footer Info - Warning Card */}
              <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-amber-900">
                        ⚠️ Importante: Verifica la Vigencia
                      </h3>
                      <p className="text-sm text-amber-800">
                        Esta información se basa en normatividad disponible. Siempre verifica la vigencia actual consultando los diarios oficiales o autoridades competentes de cada país, ya que las regulaciones pueden cambiar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* No Country Selected - Modern Empty State */}
          {!selectedCountry && !loading && (
            <div className="py-12">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <CardContent className="p-12 text-center">
                  <div className="text-7xl animate-bounce">🌍</div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    Comienza tu búsqueda de normas ambientales
                  </h3>
                    <p className="max-w-md mx-auto mb-6 text-gray-600">
                    Selecciona un dominio ambiental, elige un país{((availableSectors?.length) || 0) > 1 ? ' y un sector ' : ' '}y explora los estándares vigentes.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="text-blue-900 bg-blue-100">💧 Agua</Badge>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-900">💨 Aire</Badge>
                    <Badge variant="outline" className="text-orange-900 bg-orange-100">♻️ Residuos</Badge>
                    <Badge variant="outline" className="bg-cyan-100 text-cyan-900">🌊 Vertimientos</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <ExplorarContent />
    </Suspense>
  );
}
