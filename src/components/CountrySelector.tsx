'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

import { getFlagEmoji } from '@/lib/constants';

interface ApiCountry {
  code: string;
  name: string;
}

interface Country extends ApiCountry {
  flag: string;
}

export function CountrySelector({ domain }: { domain: string }) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch(`/api/paises?dominio=${domain}`);
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data: { countries: ApiCountry[] } = await response.json();
        const enhanced = data.countries.map(c => ({ ...c, flag: getFlagEmoji(c.code, c.name) }));
        setAvailableCountries(enhanced);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCountries();
  }, [domain]);

  // Load saved country from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selected-country');
    if (saved && availableCountries.find(c => c.code === saved)) {
      setSelectedCountry(saved);
    }
  }, [availableCountries]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('selected-country', countryCode);
    
    // Auto-navigate to explore page with selected country and domain
    setTimeout(() => {
      router.push(`/explorar?pais=${countryCode}&dominio=${domain}`);
    }, 500);
  };

  return (
    <Select value={selectedCountry} onValueChange={handleCountryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona un país para explorar sus estándares" />
      </SelectTrigger>
      <SelectContent>
        {availableCountries.map((country) => (
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
