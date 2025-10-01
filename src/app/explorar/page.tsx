'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Filter, AlertTriangle } from 'lucide-react';
import { flagMap } from '@/lib/constants';
import { DomainSelector } from '@/components/DomainSelector';
import { CountrySelector } from '@/components/CountrySelector';
import { SectorSelector } from '@/components/SectorSelector';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { WATER_USE_SECTORS, WaterUseSector } from '@/lib/types';

// Type definitions for the component
interface ApiCountry { code: string; name: string; }
interface Country extends ApiCountry { flag: string; }

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Component State
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [domain, setDomain] = useState<'agua' | 'calidad-aire' | 'residuos-solidos' | ''>( '');

  useEffect(() => {
    const domainParam = searchParams.get('dominio');
    if (domainParam && ['agua', 'calidad-aire', 'residuos-solidos'].includes(domainParam)) {
      setDomain(domainParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const sectorParam = searchParams.get('sector');
    if (sectorParam && WATER_USE_SECTORS.find((s: WaterUseSector) => s.id === sectorParam)) {
      setSelectedSector(sectorParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!data || !selectedSector || selectedSector === 'todos') return;
    const tableId = `sector-table-${selectedSector}`;
    const t = setTimeout(() => {
      const el = document.getElementById(tableId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [data, selectedSector]);

  useEffect(() => {
    if (!domain) return;

    async function fetchCountries() {
      setIsLoadingCountries(true);
      setCountries([]);
      try {
        const response = await fetch(`/api/paises?dominio=${domain}`);
        if (!response.ok) throw new Error('No se pudieron cargar los países');
        const data: { countries: ApiCountry[] } = await response.json();
        const enhancedCountries = data.countries.map((c: ApiCountry) => ({ ...c, flag: flagMap[c.code] || '🏳️' }));
        setCountries(enhancedCountries);
      } catch (error) { console.error(error); }
      finally { setIsLoadingCountries(false); }
    }
    fetchCountries();
  }, [domain]);

  const loadCountryData = useCallback(async (countryCode: string) => {
    if (!countryCode) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/normas?pais=${countryCode}&dominio=${domain}`);
      if (!response.ok) throw new Error('No se pudieron cargar los datos del país seleccionado');
      const countryData = await response.json();
      setData(countryData);
      localStorage.setItem(`selected-country-${domain}`, countryCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    if (countries.length > 0) {
      const countryParam = searchParams.get('pais');
      const sectorParam = searchParams.get('sector');
      const domainParam = searchParams.get('dominio');

      if (domainParam && ['agua', 'calidad-aire', 'residuos-solidos'].includes(domainParam)) {
        setDomain(domainParam as any);
      }

      const countryToLoad = (countryParam || (domain ? localStorage.getItem(`selected-country-${domain}`) : null));

      if (domain && countryToLoad && countries.find(c => c.code === countryToLoad)) {
        setSelectedCountry(countryToLoad);
        loadCountryData(countryToLoad);
      }

      if (sectorParam && WATER_USE_SECTORS.find((s: WaterUseSector) => s.id === sectorParam)) {
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

  const filteredSectors: [string, any][] = data?.sectors ? Object.entries(data.sectors).filter(([sectorId, sectorData]: [string, any]) => {
    if (selectedSector !== 'todos' && sectorId !== selectedSector) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSector = sectorData.name.toLowerCase().includes(query) || sectorData.description.toLowerCase().includes(query);
      const matchesParam = sectorData.parameters.some((p: any) => p.parameter.toLowerCase().includes(query));
      return matchesSector || matchesParam;
    }
    return true;
  }) : [];

  const availableSectorIds: string[] = useMemo(() => {
    if (!data?.sectors) return [];
    return Object.entries(data.sectors)
      .filter(([_id, sd]: [string, any]) => Array.isArray(sd?.parameters) && sd.parameters.length > 0)
      .map(([id]) => id);
  }, [data?.sectors]);

  useEffect(() => {
    if (!data) return;
    if (selectedSector && selectedSector !== 'todos' && !availableSectorIds.includes(selectedSector)) {
      setSelectedSector('todos');
      try { router.replace(`/explorar?dominio=${domain}&pais=${selectedCountry}`); } catch (e) { /* ignore */ }
    }
  }, [data, availableSectorIds, selectedSector, domain, selectedCountry, router]);

  const countryInfo = countries.find(c => c.code === selectedCountry);

  return (
    <div className="min-h-screen bg-white">
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
          <Card className="mb-8">
            <CardHeader><CardTitle>Paso 1: Seleccionar Dominio y País</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <DomainSelector domain={domain} onDomainChange={handleDomainChange} />
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">País:</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    disabled={isLoadingCountries}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">{isLoadingCountries ? "Cargando..." : "Selecciona un país"}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>



          {loading && <Card><CardContent className="p-8 text-center"><div className="w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div><p className="text-gray-600">Cargando datos...</p></CardContent></Card>}
          {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-6"><div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-red-600" /><p className="text-red-800">{error}</p></div></CardContent></Card>}
          {!selectedCountry && !loading && <Card><CardContent className="p-8 text-center"><div className="mb-4 text-6xl">🌍</div><h3 className="mb-2 text-xl font-semibold text-gray-900">Selecciona un país para comenzar</h3><p className="text-gray-600">Elige un país para consultar sus estándares.</p></CardContent></Card>}

          {data && countryInfo && !loading && (
            <div className="mt-8">
              {domain === 'agua' && data.sectors ? (
                <>
                  {selectedSector === 'todos' ? (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Sectores de Uso del Agua</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(data.sectors).map(([sectorId, sectorData]) => {
                          const sectorInfo = WATER_USE_SECTORS.find(s => s.id === sectorId) || { id: sectorId, nombre: sectorId, descripcion: `Datos para ${sectorId}`, icon: '📊' };
                          return (
                            <Card key={sectorId} onClick={() => setSelectedSector(sectorId)} className="cursor-pointer hover:shadow-md">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{sectorInfo.icon}</span>
                                  <div>
                                    <CardTitle className="text-md">{sectorInfo.nombre}</CardTitle>
                                    <p className="text-sm text-gray-600">{(sectorData as any).description || sectorInfo.descripcion}</p>
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Button onClick={() => setSelectedSector('todos')} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a todos los sectores
                      </Button>
                      <ResultsDisplay data={data} countryInfo={countryInfo} filteredSectors={filteredSectors} />
                    </div>
                  )}
                </>
              ) : (
                <ResultsDisplay data={data} countryInfo={countryInfo} filteredSectors={filteredSectors} />
              )}
              <Card className="mt-8 border-yellow-200 bg-yellow-50"><CardContent className="p-6"><div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" /><div><h3 className="mb-2 font-semibold text-yellow-900">Aviso de Vigencia</h3><p className="text-sm text-yellow-800">Esta información es referencial. Siempre verifica la vigencia de las normas consultando las autoridades competentes.</p></div>
              </div></CardContent></Card>
            </div>
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
