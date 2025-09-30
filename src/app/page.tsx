'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { WATER_USE_SECTORS, WaterUseSector } from '@/lib/types';
import { useEffect, useState } from 'react';
import { flagMap } from '@/lib/constants';

// Data types
interface ApiCountry { code: string; name: string; normativeReference: string; }
interface Country extends ApiCountry { flag: string; }

// Components for dynamic cards
function SectorCard({ sector }: { sector: WaterUseSector }) {
  return (
    <Link href={`/explorar?dominio=agua&sector=${sector.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 h-full">
        <CardHeader><div className="flex items-center gap-3">
          <span className="text-3xl">{sector.icon}</span>
          <div>
            <CardTitle className="text-lg">{sector.nombre}</CardTitle>
            <CardDescription className="text-sm">{sector.descripcion}</CardDescription>
          </div>
        </div></CardHeader>
      </Card>
    </Link>
  );
}

function CountryCard({ country }: { country: Country }) {
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">{country.flag} {country.name}</CardTitle>
        <CardDescription>{country.normativeReference.substring(0, 50)}...</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <Link href={`/explorar?dominio=agua&pais=${country.code}`} className="mt-auto">
          <Button className="w-full">Ver Estándares de Agua</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader><div className="h-6 bg-gray-200 rounded w-2/3"></div><div className="h-4 bg-gray-200 rounded w-full mt-2"></div></CardHeader>
      <CardContent><div className="h-10 bg-gray-200 rounded w-full"></div></CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive quick-start flow state
  const [selectedDomain, setSelectedDomain] = useState<'agua' | 'calidad-aire' | 'residuos-solidos' | ''>( '');
  const [domainCountries, setDomainCountries] = useState<ApiCountry[]>([]);
  const [isLoadingDomainCountries, setIsLoadingDomainCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryPreview, setCountryPreview] = useState<any | null>(null);

  // Select a domain and fetch the list of available countries for it
  async function selectDomain(domain: 'agua' | 'calidad-aire' | 'residuos-solidos') {
    setSelectedDomain(domain);
    setSelectedCountry('');
    setCountryPreview(null);
    setIsLoadingDomainCountries(true);
    try {
      const res = await fetch(`/api/paises?dominio=${domain}`);
      if (!res.ok) throw new Error('No se pudieron cargar los países del dominio');
      const data = await res.json();
      setDomainCountries(data.countries || []);
    } catch (e) { console.error(e); setDomainCountries([]); }
    finally { setIsLoadingDomainCountries(false); }
  }

  // Select a country: fetch a small preview (structure) so we can show sectors available
  async function selectCountry(countryCode: string) {
    setSelectedCountry(countryCode);
    if (!countryCode || !selectedDomain) return;
    try {
      const res = await fetch(`/api/normas?pais=${countryCode}&dominio=${selectedDomain}`);
      if (!res.ok) {
        setCountryPreview(null);
        return;
      }
      const data = await res.json();
      setCountryPreview(data);
    } catch (e) { console.error(e); setCountryPreview(null); }
  }

  useEffect(() => {
    async function fetchCountries() {
      try {
        // Fetch countries specifically for the 'agua' domain for the homepage display
        const response = await fetch('/api/paises?dominio=agua');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: { countries: ApiCountry[] } = await response.json();
        const enhanced = data.countries.map(c => ({ ...c, flag: flagMap[c.code] || '🏳️' }));
        setCountries(enhanced);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    }
    fetchCountries();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4"><div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Normativa Ambiental</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Explora y compara estándares ambientales por dominio y país: calidad del agua, calidad del aire y residuos sólidos.
          </p>
        </div></div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4"><div className="max-w-6xl mx-auto">
          <Card className="mb-12 border-2 border-blue-100 bg-blue-50/30">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900">Inicio Rápido</CardTitle>
              <CardDescription className="text-lg text-gray-600">Elige un dominio para empezar a explorar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 max-w-2xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <button onClick={() => selectDomain('agua')} className="px-4 py-2 bg-blue-600 text-white rounded">💧 Calidad del Agua</button>
                    <button onClick={() => selectDomain('calidad-aire')} className="px-4 py-2 bg-sky-600 text-white rounded">💨 Calidad del Aire</button>
                    <button onClick={() => selectDomain('residuos-solidos')} className="px-4 py-2 bg-amber-600 text-white rounded">🗑️ Residuos Sólidos</button>
                </div>
              </div>
            </CardContent>
          </Card>
            {/* Interactive flow: dominio -> país -> sectores/tabla */}
            <div className="mb-6 max-w-3xl mx-auto">
              {selectedDomain === '' && <div className="text-center text-sm text-gray-600">Primero selecciona un dominio.</div>}

              {selectedDomain !== '' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">País:</label>
                  <div className="flex gap-3 items-center">
                    <select value={selectedCountry} onChange={(e) => selectCountry(e.target.value)} className="border p-2 rounded">
                      <option value="">-- Selecciona un país --</option>
                      {domainCountries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    {isLoadingDomainCountries && <span className="text-sm text-gray-500">Cargando países...</span>}
                  </div>

                  {/* After country selected, show sectors or table button */}
                  {selectedCountry && countryPreview && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Explorar {selectedDomain.replace('-', ' ')} — {countryPreview.country || countryPreview.pais || selectedCountry}</h3>

                      {/* If water sectors exist, show sector cards (only those present in data) */}
                      {selectedDomain === 'agua' && countryPreview.sectors && Object.keys(countryPreview.sectors).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.keys(countryPreview.sectors).map(key => {
                            const sectorInfo = WATER_USE_SECTORS.find(s => s.id === key) || { id: key, nombre: key, descripcion: `Datos para ${key}`, icon: '📊' };
                            return (
                              <Link key={key} href={`/explorar?dominio=agua&pais=${selectedCountry}&sector=${key}`} className="block">
                                <Card className="h-full hover:shadow-md">
                                  <CardHeader><div className="flex items-center gap-3"><span className="text-2xl">{sectorInfo.icon}</span><div><CardTitle className="text-md">{sectorInfo.nombre}</CardTitle><p className="text-sm text-gray-600">{countryPreview.sectors[key].description || sectorInfo.descripcion}</p></div></div></CardHeader>
                                </Card>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* For non-water domains show a button to view the table of records */}
                      {(selectedDomain === 'calidad-aire' || selectedDomain === 'residuos-solidos') && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Ver tabla completa de parámetros normativos.</p>
                          <Link href={`/explorar?dominio=${selectedDomain}&pais=${selectedCountry}`} className="inline-block">
                            <Button>Ir a la tabla</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Removed legacy sectors/paises tabs — homepage now guides the user: select domain -> select country -> sector/table */}
        </div></div>
      </section>

      {/* Info Footer */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4"><div className="max-w-6xl mx-auto">
          <Card><CardContent className="p-6"><div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas ayuda para interpretar los estándares?</h3>
              <p className="text-gray-600 mb-4">Aprende los conceptos básicos sobre normatividad del agua y cómo interpretar las tablas de estándares.</p>
              <Button variant="outline" asChild><Link href="/fundamentos">Ver Fundamentos</Link></Button>
            </div>
          </div></CardContent></Card>
        </div></div>
      </section>
    </div>
  );
}
