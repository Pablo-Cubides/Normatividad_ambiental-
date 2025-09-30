'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { flagMap } from '../lib/constants';

// Define the type for the country object we expect from the API
interface ApiCountry {
  code: string;
  name: string;
}

// Enhanced type with a flag
interface Country extends ApiCountry {
  flag: string;
}

interface CountrySelectorProps {
  domain?: string; // optional domain to scope country list (e.g. 'agua')
}

export function CountrySelector({ domain }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCountries() {
      try {
        const url = domain ? `/api/paises?dominio=${encodeURIComponent(domain)}` : '/api/paises';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data: { countries: ApiCountry[] } = await response.json();
        
        const enhancedCountries = data.countries.map(country => ({
          ...country,
          flag: flagMap[country.code] || '🏳️' // Default flag
        }));

        setCountries(enhancedCountries);

        // Load saved country from localStorage after countries are fetched
        const storageKey = `selected-country-${domain || 'default'}`;
        const saved = localStorage.getItem(storageKey);
        if (saved && enhancedCountries.find(c => c.code === saved)) {
          setSelectedCountry(saved);
        }
      } catch (error) {
        console.error(error);
        // Handle error appropriately in a real app
      } finally {
        setIsLoading(false);
      }
    }

    fetchCountries();
  }, [domain]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const storageKey = `selected-country-${domain || 'default'}`;
    localStorage.setItem(storageKey, countryCode);

    // Auto-navigate to explore page with domain if provided
    const url = domain ? `/explorar?dominio=${encodeURIComponent(domain)}&pais=${countryCode}` : `/explorar?pais=${countryCode}`;
    router.push(url);
  };

  return (
    <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={isLoading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Cargando países..." : "Selecciona un país para explorar sus estándares"} />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}