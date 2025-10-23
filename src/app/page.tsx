'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Zap } from 'lucide-react';
import { WATER_USE_SECTORS, WaterUseSector } from '@/lib/types';
import { getSectorEmoji } from '@/lib/sectorIcons';
import { useState } from 'react';
import { DOMINIOS, getFlagEmoji } from '@/lib/constants';

// Data types
interface ApiCountry { code: string; name: string; normativeReference?: string; }
interface Country extends ApiCountry { flag: string; }

// Components for dynamic cards
function SectorCard({ sector, domain = 'agua', country }: { sector: WaterUseSector; domain?: string; country?: string }) {
  const href = country 
    ? `/explorar?dominio=${domain}&pais=${country}&sector=${sector.id}`
    : `/explorar?dominio=${domain}&sector=${sector.id}`;
  
  return (
    <Link href={href}>
      <Card className="hover:shadow-xl transition-all duration-200 cursor-pointer border-0 bg-white hover:bg-blue-50 group h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">{sector.icon}</span>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base line-clamp-2 group-hover:text-blue-700">{sector.nombre}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{sector.descripcion}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  // Interactive quick-start flow state
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [domainCountries, setDomainCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(false);

  // Select a domain and fetch the list of available countries for it
  async function selectDomain(domain: string) {
    setSelectedDomain(domain);
    setSelectedCountry('');
    setAvailableSectors([]);
    setIsLoadingCountries(true);
    try {
      const res = await fetch(`/api/paises?dominio=${domain}`);
      if (!res.ok) throw new Error('No se pudieron cargar los países del dominio');
      const data = await res.json();
      const countries = (data.countries || []).map((c: ApiCountry) => ({ 
        ...c, 
        flag: getFlagEmoji(c.code, c.name)
      }));
      setDomainCountries(countries);
    } catch (e) { 
      console.error(e); 
      setDomainCountries([]); 
    }
    finally { 
      setIsLoadingCountries(false); 
    }
  }

  // Select a country and fetch available sectors for that country
  async function selectCountry(countryCode: string) {
    setSelectedCountry(countryCode);
    if (!countryCode || !selectedDomain) return;
    
    setIsLoadingSectors(true);
    try {
      const res = await fetch(`/api/sectores?dominio=${selectedDomain}&pais=${countryCode}`);
      if (!res.ok) throw new Error('No se pudieron cargar los sectores');
      const data = await res.json();
      setAvailableSectors(data.sectors || []);
    } catch (e) { 
      console.error(e); 
      setAvailableSectors([]); 
    }
    finally { 
      setIsLoadingSectors(false); 
    }
  }

  const currentDominio = DOMINIOS.find(d => d.id === selectedDomain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Hero Section - Modern gradient background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 flex justify-center gap-2">
              <span className="text-4xl">🌍</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Normatividad Ambiental Internacional
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Explora y compara estándares ambientales de múltiples países para agua, aire, residuos y vertimientos
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-blue-500 text-white border-0">💧 Agua</Badge>
              <Badge className="bg-emerald-500 text-white border-0">💨 Aire</Badge>
              <Badge className="bg-orange-500 text-white border-0">♻️ Residuos</Badge>
              <Badge className="bg-cyan-500 text-white border-0">🌊 Vertimientos</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Step 1: Select Domain */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Paso 1
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Elige un Dominio Ambiental
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Selecciona el área temática que deseas explorar y descubre los estándares disponibles
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {DOMINIOS.map(dominio => (
                  <button
                    key={dominio.id}
                    onClick={() => selectDomain(dominio.id)}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                      selectedDomain === dominio.id
                        ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                        : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`text-4xl transition-transform group-hover:scale-110 ${selectedDomain === dominio.id ? 'scale-110' : ''}`}>
                        {dominio.icon}
                      </div>
                      <div className={`font-bold text-sm text-center ${selectedDomain === dominio.id ? 'text-white' : 'text-gray-900'}`}>
                        {dominio.label}
                      </div>
                      <div className={`text-xs text-center line-clamp-2 ${selectedDomain === dominio.id ? 'text-blue-100' : 'text-gray-600'}`}>
                        {dominio.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Country (shown only after domain selected) */}
            {selectedDomain && (
              <div className="mb-16 animate-in fade-in slide-in-from-top-4">
                <div className="text-center mb-10">
                  <div className="inline-block bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    Paso 2
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Elige un País
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Selecciona el país para ver los estándares disponibles en el dominio de {currentDominio?.label.toLowerCase()}
                  </p>
                </div>
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">País:</label>
                  <div className="relative">
                    <select 
                      value={selectedCountry} 
                      onChange={(e) => selectCountry(e.target.value)}
                      disabled={isLoadingCountries}
                      className="w-full border-2 border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900 text-base hover:border-blue-400 transition-colors appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">-- Selecciona un país --</option>
                      {domainCountries.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isLoadingCountries && (
                    <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Cargando países...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Show Sectors (shown only after country selected and for agua or vertimientos domains) */}
            {selectedCountry && (selectedDomain === 'agua' || selectedDomain === 'vertimientos') && (
              <div className="mb-16 animate-in fade-in slide-in-from-top-4">
                <div className="text-center mb-10">
                  <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    Paso 3
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {selectedDomain === 'agua' ? 'Elige un Sector de Uso' : 'Elige un Sector Industrial'}
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {currentDominio?.label} • {domainCountries.find(c => c.code === selectedCountry)?.name}
                  </p>
                </div>
                {isLoadingSectors ? (
                  <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-3 inline-block">⏳</div>
                    <p className="text-gray-600 font-medium">Cargando sectores...</p>
                  </div>
                ) : availableSectors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {availableSectors.map(sectorId => {
                      // Use smart icon matching instead of static WATER_USE_SECTORS
                      const sectorInfo = WATER_USE_SECTORS.find(s => s.id === sectorId) || {
                        id: sectorId,
                        nombre: sectorId.replace(/_/g, ' ').replace(/-/g, ' '),
                        descripcion: `Datos para ${sectorId}`,
                        icon: getSectorEmoji(sectorId) // ← Smart matching!
                      };
                      return (
                        <SectorCard
                          key={sectorInfo.id}
                          sector={sectorInfo}
                          domain={selectedDomain}
                          country={selectedCountry}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-0 bg-yellow-50 shadow-md">
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-gray-700 font-medium">No hay sectores disponibles para este país en este dominio.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* For non-water and non-vertimientos domains: show direct link to explorer */}
            {selectedCountry && selectedDomain !== 'agua' && selectedDomain !== 'vertimientos' && (
              <div className="mb-16 animate-in fade-in slide-in-from-top-4">
                <div className="text-center mb-10">
                  <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    Paso 3
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Ver Estándares
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {currentDominio?.label} • {domainCountries.find(c => c.code === selectedCountry)?.name}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Link href={`/explorar?dominio=${selectedDomain}&pais=${selectedCountry}`}>
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg text-lg px-8 py-6">
                      <Zap className="w-5 h-5 mr-2" />
                      Explorar Estándares Completos
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Footer */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Info className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">¿Necesitas ayuda para entender la normativa?</h3>
                    <p className="text-gray-700 mb-4">Aprende los conceptos básicos sobre normatividad ambiental internacional y cómo interpretar correctamente los estándares de calidad.</p>
                    <Button variant="outline" asChild className="border-2 border-blue-300 hover:bg-blue-50">
                      <Link href="/fundamentos" className="font-semibold">
                        Ver Fundamentos
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
