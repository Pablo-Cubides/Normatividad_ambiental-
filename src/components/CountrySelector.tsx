'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
  isLoading: boolean;
}

export function CountrySelector({ countries, selectedCountry, onCountryChange, isLoading }: CountrySelectorProps) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">País:</label>
      <Select value={selectedCountry} onValueChange={onCountryChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un país"} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span>{country.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
