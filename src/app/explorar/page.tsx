'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { SECTORES_USO, WaterUseType } from '@/lib/types';
import { getFlagEmoji } from '@/lib/constants';
import type { UnifiedNorm, SectorNorm, RecordNorm } from '@/lib/schemas';
import { logger } from '@/lib/logger';

// Type definitions for the component
interface ApiCountry { code: string; name: string; }
interface Country extends ApiCountry { flag: string; }

// Minimal shapes for the API responses used by this UI.
interface SectorData { name?: string; description?: string; parameters?: RecordNorm[] }
interface CountryData { sectors?: Record<string, SectorData>; records?: RecordNorm[]; registros?: RecordNorm[]; normativeReference?: string; reference?: unknown; lastUpdate?: string }

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Component State
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<UnifiedNorm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  // Start with no domain selected so user chooses which dataset to explore first
  const [domain, setDomain] = useState<'agua' | 'calidad-aire' | 'residuos-solidos' | ''>( '');

  // Initialize domain from URL params immediately so selections persist when
  // navigating from the homepage (e.g. /explorar?dominio=agua&pais=CO)
  useEffect(() => {
    const domainParam = searchParams.get('dominio');
    if (domainParam && ['agua', 'calidad-aire', 'residuos-solidos'].includes(domainParam)) {
      setDomain(domainParam as 'agua' | 'calidad-aire' | 'residuos-solidos' | '');
    }
  }, [searchParams]);

  // Initialize sector selection from URL if present (so links like
  // /explorar?dominio=agua&pais=CO&sector=industria pre-select the sector)
  useEffect(() => {
    const sectorParam = searchParams.get('sector');
    if (sectorParam && SECTORES_USO.find((s: WaterUseType) => s.id === sectorParam)) {
      setSelectedSector(sectorParam);
    }
  }, [searchParams]);

  // When data is loaded and a sector is selected from the URL, scroll to and highlight it
  useEffect(() => {
    if (!data || !selectedSector || selectedSector === 'todos') return;
    const tableId = `sector-table-${selectedSector}`;
    // Small delay to ensure DOM rendered, then scroll to the table
    const t = setTimeout(() => {
      const el = document.getElementById(tableId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [data, selectedSector]);

  // Fetch countries when the component mounts or the domain changes
  useEffect(() => {
    // Only fetch countries after the user has selected a domain
    if (!domain) return;

    async function fetchCountries() {
      setIsLoadingCountries(true);
      setCountries([]);
      try {
        const response = await fetch(`/api/paises?dominio=${domain}`);
        if (!response.ok) throw new Error('No se pudieron cargar los países');
        const data: { countries: ApiCountry[] } = await response.json();
  const enhancedCountries = data.countries.map((c: ApiCountry) => ({ ...c, flag: getFlagEmoji(c.code, c.name) }));
        setCountries(enhancedCountries);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        logger.warn('explore:fetchCountries:failed', { domain, message: msg });
        setError('No fue posible cargar la lista de países. Intenta recargar la página.');
      } finally { setIsLoadingCountries(false); }
    }
    fetchCountries();
  }, [domain]);

  // Function to load data for a specific country
  const loadCountryData = useCallback(async (countryCode: string) => {
    if (!countryCode) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/normas?pais=${countryCode}&dominio=${domain}`);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Servidor respondió con ${response.status}: ${text}`);
      }
  const countryData: UnifiedNorm = await response.json();
  setData(countryData);
      try { localStorage.setItem(`selected-country-${domain}`, countryCode); } catch { /* ignore */ }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido cargando datos del país';
      logger.error('explore:loadCountryData:failed', { domain, countryCode, message: msg });
      setError('No fue posible cargar los datos del país seleccionado. Intenta nuevamente.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  // Effect to initialize component state from URL parameters
  useEffect(() => {
    if (countries.length > 0) {
      const countryParam = searchParams.get('pais');
      const sectorParam = searchParams.get('sector');
      const domainParam = searchParams.get('dominio');

      // Do not auto-apply domain from URL unless it's present and non-empty
        if (domainParam && ['agua', 'calidad-aire', 'residuos-solidos'].includes(domainParam)) {
          setDomain(domainParam as 'agua' | 'calidad-aire' | 'residuos-solidos' | '');
        }      // Only consider auto-loading a country if a domain is set and the countries list is populated
      const countryToLoad = (countryParam || (domain ? localStorage.getItem(`selected-country-${domain}`) : null));

      if (domain && countryToLoad && countries.find(c => c.code === countryToLoad)) {
        setSelectedCountry(countryToLoad);
        loadCountryData(countryToLoad);
      }

      if (sectorParam && SECTORES_USO.find((s: WaterUseType) => s.id === sectorParam)) {
        setSelectedSector(sectorParam);
      }
    }
  }, [searchParams, countries, loadCountryData, domain]);

  const handleDomainChange = (d: typeof domain) => {
    setDomain(d);
    setSelectedCountry('');
    setData(null);
    router.push(`/explorar?dominio=${d}`);
  }

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedSector('todos');
    setSearchQuery('');
    router.push(`/explorar?dominio=${domain}&pais=${countryCode}`);
    loadCountryData(countryCode);
  };

  // Logic to filter data for the water sector
  const sectors = data?.sectors as Record<string, SectorNorm> | undefined;
  const filteredSectors: [string, SectorNorm][] = sectors ? Object.entries(sectors).filter(([sectorId, sectorData]) => {
    if (selectedSector !== 'todos' && sectorId !== selectedSector) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSector = (sectorData.name || '').toLowerCase().includes(query) || (sectorData.description || '').toLowerCase().includes(query);
      const matchesParam = Array.isArray(sectorData.parameters) && sectorData.parameters.some((p: RecordNorm) => ((p.parameter ?? p.parametro) || '').toLowerCase().includes(query));
      return matchesSector || matchesParam;
    }
    return true;
  }) : [];

  // Compute which sectors actually have data (non-empty parameters) so we only
  // show those in the sector selector. This prevents showing a sector that
  // would render an empty table.
  const availableSectorIds: string[] = useMemo(() => {
    const s = data?.sectors as Record<string, SectorNorm> | undefined;
    if (!s) return [];
    return Object.entries(s)
      .filter(([, sd]) => Array.isArray(sd?.parameters) && sd.parameters.length > 0)
      .map(([id]) => id);
  }, [data?.sectors]);

  // If the currently selected sector is no longer available (e.g. user changed
  // country) reset it to 'todos' to avoid selecting an empty sector.
  useEffect(() => {
    if (!data) return;
    if (selectedSector && selectedSector !== 'todos' && !availableSectorIds.includes(selectedSector)) {
      setSelectedSector('todos');
      // also remove sector param from URL
      try { router.replace(`/explorar?dominio=${domain}&pais=${selectedCountry}`); } catch (_) { /* ignore */ }
    }
  }, [data, availableSectorIds, selectedSector, domain, selectedCountry, router]);

  const getSectorInfo = (sectorId: string) => SECTORES_USO.find(s => s.id === sectorId) || { id: sectorId, nombre: sectorId, descripcion: '', icon: '📊' };
  const countryInfo = countries.find(c => c.code === selectedCountry);

  const getRefStandard = (ref?: unknown): string | undefined => {
    if (!ref || typeof ref !== 'object') return undefined;
    const r = ref as Record<string, unknown>;
    if (typeof r.standard === 'string') return r.standard;
    if (typeof r.norma === 'string') return r.norma;
    return undefined;
  };

  // Helpers to robustly extract limit/value fields from records that may
  // come in different shapes (value, valor, limit, limite, etc.)
  const asRecord = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null) ? (v as Record<string, unknown>) : {};
  const getParamLimit = (param: RecordNorm): string => {
    const p = asRecord(param);
    // Common variants we've seen in data
    const candidates = ['value', 'valor', 'valor_value', 'limit', 'limite', 'valor_limite', 'valor_string', 'val', 'valor_val'];
    for (const k of candidates) {
      const v = p[k];
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      // sometimes value is wrapped in an object like { text: '...' }
      if (v && typeof v === 'object') {
        const vv = (v as Record<string, unknown>)['text'] ?? (v as Record<string, unknown>)['value'];
        if (typeof vv === 'string' || typeof vv === 'number') return String(vv);
      }
    }
    return '';
  };
  const getRecordLimit = (r: RecordNorm): string => {
    const rec = asRecord(r);
    const candidates = ['limit', 'limite', 'valor', 'value', 'valor_limite', 'valor_string'];
    for (const k of candidates) {
      const v = rec[k];
      if (typeof v === 'string' || typeof v === 'number') return String(v);
    }
    return '';
  };
  const getRecordNotes = (r: RecordNorm): string[] => {
    const rec = asRecord(r);
    const notes = rec['notes'] ?? rec['notas'] ?? rec['observaciones'];
    return Array.isArray(notes) ? (notes as unknown[]).map(String) : [];
  };

  const renderWaterContent = () => (
    <>
      <Card className="mb-6"><CardContent className="p-6"><div className="flex items-center justify-between">
                  <div className="flex items-center gap-4"><span className="inline-flex w-10 h-10 text-3xl items-center justify-center leading-none flag-emoji">{countryInfo?.flag}</span><div><h2 className="text-2xl font-bold text-gray-900">{countryInfo?.name}</h2><p className="text-gray-600">{filteredSectors.length} sectores de agua encontrados</p></div></div>
        <Button variant="outline" className="no-print" onClick={() => window.print()}><Download className="w-4 h-4 mr-2" />Imprimir/PDF</Button>
      </div></CardContent></Card>

      <div className="space-y-6">
        {filteredSectors.map(([sectorId, sectorData]) => {
          const sectorInfo = getSectorInfo(sectorId);
          return (
            <Card id={`sector-${sectorId}`} key={sectorId} className="print-friendly">
              <CardHeader className="border-b bg-gray-50/50"><div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><span className="text-2xl">{sectorInfo.icon}</span><div><CardTitle className="text-xl text-gray-900">{sectorData.name}</CardTitle><p className="text-sm text-gray-600">{sectorData.description}</p></div></div>
                <Badge variant="outline" className="text-xs">{Array.isArray(sectorData.parameters) ? sectorData.parameters.length : 0} parámetros</Badge>
              </div></CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-blue-50/50"><div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4 text-blue-600" /><span className="font-semibold text-blue-900">{data?.normativeReference}</span><span className="text-gray-600"> - Actualizado: {data?.lastUpdate}</span>
                </div></div>
                <div id={`sector-table-${sectorId}`} className="overflow-x-auto"><table>
                  <thead className="bg-gray-50"><tr>
                    <th className="p-4 font-semibold text-left text-gray-900">Parámetro</th><th className="p-4 font-semibold text-left text-gray-900">Valor Límite</th>
                    <th className="p-4 font-semibold text-left text-gray-900">Unidad</th><th className="p-4 font-semibold text-left text-gray-900">Fuente</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(sectorData.parameters) ? sectorData.parameters.map((param: RecordNorm, paramIndex: number) => {
                      const limit = getParamLimit(param);
                      const refStd = getRefStandard(param.reference ?? (param as unknown && (asRecord(param)['reference'] ?? asRecord(param)['referencia'])));
                      return (
                        <tr key={paramIndex} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{param.parameter ?? param.parametro}</td>
                          <td className="p-4 font-mono text-blue-700">{limit}</td>
                          <td className="p-4 text-gray-600">{param.unit ?? param.unidad ?? '-'}</td>
                          <td className="p-4 text-sm text-gray-600">{refStd ?? ''}</td>
                        </tr>
                      );
                    }) : null}
                  </tbody>
                </table></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-4">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedSector('todos'); router.push(`/explorar?dominio=${domain}&pais=${selectedCountry}`); }}>Mostrar todos</Button>
      </div>
      {/* Only show the 'no sectors' warning when the country actually provides sectors
          and the applied filters/search produce zero results. If the country does not
          divide standards into sectors (no `data.sectors`) we should not display an
          error — the table or other content (records) will be shown elsewhere. */}
      {data?.sectors && filteredSectors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No se encontraron sectores</h3>
            <p className="text-gray-600">Intenta cambiar los filtros o el término de búsqueda.</p>
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderRecordsContent = () => {
  const records = (data?.records ?? data?.registros ?? []) as RecordNorm[];
  type MutableData = Partial<UnifiedNorm> & { reference?: unknown; referencia?: unknown; version?: string; lastUpdate?: string };
  const mutable = (data as MutableData | null) ?? null;
  const reference = mutable ? (mutable.reference ?? mutable.referencia) : undefined;
    const version = (mutable?.version ?? mutable?.lastUpdate ?? '') as string;

    return (
      <Card className="print-friendly">
        <CardHeader className="border-b bg-gray-50/50"><div className="flex items-center justify-between">
          <div><CardTitle className="text-xl text-gray-900">{countryInfo?.name} — {String((data.domain || '').replace?.('-', ' ') ?? '')}</CardTitle><p className="text-sm text-gray-600">Tabla de parámetros normativos</p></div>
          <Badge variant="outline" className="text-xs">{records.length} registros</Badge>
        </div></CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b bg-blue-50/50"><div className="flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-blue-600" /><span className="font-semibold text-blue-900">Fuente: {getRefStandard(reference) ?? 'N/A'}</span><span className="text-gray-600"> - Extraído: {version}</span>
          </div></div>
          <div className="overflow-x-auto"><table>
            <thead className="bg-gray-50"><tr>
              <th className="p-4 font-semibold text-left text-gray-900">Parámetro</th><th className="p-4 font-semibold text-left text-gray-900">Límite</th>
              <th className="p-4 font-semibold text-left text-gray-900">Unidad</th><th className="p-4 font-semibold text-left text-gray-900">Notas</th>
            </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((r: RecordNorm, idx: number) => {
                const param = r.parameter ?? r.parametro ?? '';
                const lim = getRecordLimit(r);
                const unit = r.unit ?? r.unidad ?? '-';
                const notes = getRecordNotes(r);
                return (
                  <tr key={idx} className="align-top hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{param}</td><td className="p-4 font-mono text-blue-700">{lim}</td>
                    <td className="p-4 text-gray-600">{unit || '-'}</td><td className="p-4 text-sm text-gray-700">{(notes || []).join('; ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="py-8 text-white bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container px-4 mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" size="sm" asChild><Link href="/" className="inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Inicio</Link></Button>
            <h1 className="text-3xl font-bold">Explorar Estándares</h1>
          </div>
          <p className="text-lg text-blue-100">Consulta y compara normativas ambientales por país y dominio.</p>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Control Panel */}
          <Card className="mb-8">
            <CardHeader><CardTitle>Seleccionar Dominio y País</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6 md:grid-cols-3">
                {/* Domain Selection Tabs: occupy two columns on md+ so country selector can sit beside them */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <button className={`px-3 py-1 rounded ${domain === 'agua' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => handleDomainChange('agua')}>💧 Agua</button>
                    <button className={`px-3 py-1 rounded ${domain === 'calidad-aire' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => handleDomainChange('calidad-aire')}>💨 Calidad del Aire</button>
                    <button className={`px-3 py-1 rounded ${domain === 'residuos-solidos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => handleDomainChange('residuos-solidos')}>🗑️ Residuos Sólidos</button>
                  </div>
                </div>

                {/* Country Selector Dropdown: placed in the 3rd column on md+ so it appears beside the domain buttons */}
                <div className="md:col-span-1 flex items-center">
                  <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-700 md:mb-0">País:</label>
                    <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={isLoadingCountries}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={isLoadingCountries ? "Cargando..." : "Selecciona un país"} /></SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span>{country.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditional Sector/Filter Controls */}
                {domain === 'agua' && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Sector de Uso:</label>
                      <Select value={selectedSector} onValueChange={setSelectedSector} disabled={!selectedCountry || availableSectorIds.length === 0}>
                        <SelectTrigger><SelectValue placeholder={availableSectorIds.length === 0 ? "No hay sectores con datos" : "Todos los sectores"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los sectores</SelectItem>
                          {SECTORES_USO.filter((sector: WaterUseType) => availableSectorIds.includes(sector.id)).map((sector: WaterUseType) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              <span className="flex items-center gap-2"><span>{sector.icon}</span><span>{sector.nombre}</span></span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Buscar parámetro:</label>
                      <div className="relative">
                        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <Input type="text" placeholder="Ej: coliformes, pH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" disabled={!selectedCountry} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* UI States: Loading, Error, No Selection */}
          {loading && <Card><CardContent className="p-8 text-center"><div className="w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div><p className="text-gray-600">Cargando datos...</p></CardContent></Card>}
          {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-6"><div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-red-600" /><p className="text-red-800">{error}</p></div></CardContent></Card>}
          {!selectedCountry && !loading && <Card><CardContent className="p-8 text-center"><div className="mb-4 text-6xl">🌍</div><h3 className="mb-2 text-xl font-semibold text-gray-900">Selecciona un país para comenzar</h3><p className="text-gray-600">Elige un país para consultar sus estándares.</p></CardContent></Card>}

          {/* Results Display */}
          {data && countryInfo && !loading && (
            <>
              {domain === 'agua' && data.sectors && renderWaterContent()}
              {(data.records || data.registros) && renderRecordsContent()}
              
              <Card className="mt-8 border-yellow-200 bg-yellow-50"><CardContent className="p-6"><div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" /><div><h3 className="mb-2 font-semibold text-yellow-900">Aviso de Vigencia</h3><p className="text-sm text-yellow-800">Esta información es referencial. Siempre verifica la vigencia de las normas consultando las autoridades competentes.</p></div>
              </div></CardContent></Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ExploreContent />
    </Suspense>
  );
}