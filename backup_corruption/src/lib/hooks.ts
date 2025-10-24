import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CountryStandards, Country } from '@/lib/types';
import { DOMINIOS } from '@/lib/constants';
import { getFlagEmoji } from '@/lib/constants';

type AnyRecord = Record<string, unknown>;

// Debounced search hook
export function useDebouncedSearch(initialValue: string, delay: number) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { value, debouncedValue, setValue };
}

// Memoization hook for expensive computations
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

// Hook for debounced callbacks
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      const timeoutId = setTimeout(() => callbackRef.current(...args), delay);
      return () => clearTimeout(timeoutId);
    }) as T,
    [delay]
  );
}

export function useExplorarState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [selectedDomain, setSelectedDomain] = useState<string>('agua');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[] | null>(null);
  const [data, setData] = useState<CountryStandards | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastFetchUrl, setLastFetchUrl] = useState<string>('');

  // Search with debouncing
  const { value: searchQuery, debouncedValue: debouncedSearchQuery, setValue: setSearchQuery } = useDebouncedSearch('', 300);

  // Initialize from URL params (sync with url changes)
  useEffect(() => {
    const dominio = searchParams.get('dominio') || 'agua';
    const pais = searchParams.get('pais');
    const rawSectorFromUrl = searchParams.get('sector');
    const sectorFromUrl = rawSectorFromUrl ? String(rawSectorFromUrl).replace(/_/g, '-') : null;

    setSelectedDomain(dominio);
    if (pais) {
      setSelectedCountry(pais);
    }
    if (sectorFromUrl) {
      setSelectedSector(sectorFromUrl);
    }
  }, [searchParams]);

  // Load countries when domain changes
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(`/api/paises?dominio=${selectedDomain}`);
        if (!res.ok) throw new Error('No se pudieron cargar países');
        const data = await res.json();
        const countries = (data.countries || []).map((c: AnyRecord) => {
          const code = String((c as AnyRecord).code ?? '');
          const name = String((c as AnyRecord).name ?? '');
          return { ...(c as AnyRecord), code, name, flag: getFlagEmoji(code, name) || '🏳️' } as Country;
        });
        setAvailableCountries(countries);
        setData(null); // Clear data when domain changes
      } catch (e) {
        console.error(e);
        setAvailableCountries([]);
      }
    }
    fetchCountries();
  }, [selectedDomain]);

  // Load sectors when country or domain changes (not when URL params change to avoid loops)
  useEffect(() => {
    if (!selectedCountry) {
      setAvailableSectors(null);
      setSelectedSector('');
      return;
    }

    async function fetchSectors() {
      try {
        const res = await fetch(`/api/sectores?dominio=${selectedDomain}&pais=${selectedCountry}`);
        if (!res.ok) throw new Error('No se pudieron cargar sectores');
        const data = await res.json();
        const sectors = data.sectors || [];

        // Normalize sectors to use hyphens (e.g. 'agua-potable') so they match URL slugs
        const normalizedSectors = sectors.map((s: string) => String(s).replace(/_/g, '-'));
        setAvailableSectors(normalizedSectors);

        // Auto-select sector: prefer sector from URL (if valid), otherwise first sector
        const sectorFromUrl = searchParams.get('sector');
        const normSectorFromUrl = sectorFromUrl ? String(sectorFromUrl).replace(/_/g, '-') : null;

        if (normalizedSectors.length > 0) {
          if (normSectorFromUrl && normalizedSectors.includes(normSectorFromUrl)) {
            setSelectedSector(normSectorFromUrl);
          } else {
            setSelectedSector(normalizedSectors[0]);
          }
        } else {
          setSelectedSector('');
        }
      } catch (e) {
        console.error('[explorar] fetchSectors ERROR:', e);
        setAvailableSectors([]);
        setSelectedSector('');
      }
    }
    fetchSectors();
  }, [selectedCountry, selectedDomain]);

  // Load data when country, domain, or sector changes
  useEffect(() => {
    if (!selectedCountry) {
      setData(null);
      setLoading(false);
      return;
    }

    if (!availableSectors) {
      // Don't load data until sectors are available
      return;
    }

    async function loadCountryData() {
      setLoading(true);
      setError('');
      try {
        let url: string;
        // If we have sectors available and a specific sector selected, filter by sector
        if (availableSectors && availableSectors.length > 0 && selectedSector) {
          url = `/api/normas?pais=${selectedCountry}&dominio=${selectedDomain}&sector=${selectedSector}`;
        } else {
          // If no sectors available yet (still loading) or no sector selected, load all data
          url = `/api/normas?pais=${selectedCountry}&dominio=${selectedDomain}`;
        }

        setLastFetchUrl(url);
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudieron cargar los datos');
        const countryData = await res.json();

        setData(countryData as CountryStandards);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadCountryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedDomain, selectedSector]);

  // Computed values with memoization
  const currentDominio = useMemo(() =>
    DOMINIOS.find(d => d.id === selectedDomain) || DOMINIOS[0],
    [selectedDomain]
  );

  const countryInfo = useMemo(() =>
    availableCountries.find(c => c.code === selectedCountry),
    [availableCountries, selectedCountry]
  );

  const records = useMemo(() =>
    (data?.records || data?.registros || []) as AnyRecord[],
    [data]
  );

  const filteredRecords = useMemo(() => {
    if (!debouncedSearchQuery) return records;

    const query = debouncedSearchQuery.toLowerCase();
    return records.filter((record) => {
      const param = String(record.parameter ?? record.parametro ?? '').toLowerCase();
      const limit = String(record.limit ?? record.limite ?? '').toLowerCase();
      const unit = String(record.unit ?? record.unidad ?? '').toLowerCase();
      const notes = String(((record.notes ?? record.notas) as unknown[] ?? []).map(String).join(' ')).toLowerCase();

      return param.includes(query) || limit.includes(query) || unit.includes(query) || notes.includes(query);
    });
  }, [records, debouncedSearchQuery]);

  const sectionsToDisplay = useMemo(() => {
    const sections: Record<string, AnyRecord[]> = {};
    filteredRecords.forEach((record) => {
      const sectionKey = String(record._sector ?? record.categoria ?? 'general');
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push(record);
    });
    return sections;
  }, [filteredRecords]);

  // Event handlers with useCallback
  const handleDomainChange = useCallback((domainId: string) => {
    setSelectedDomain(domainId);
    setSelectedCountry('');
    setData(null);
    
    // Update URL with new domain, clear country and sector
    const params = new URLSearchParams(searchParams.toString());
    params.set('dominio', domainId);
    params.delete('pais');
    params.delete('sector');
    
    const newUrl = `/explorar?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, router]);

  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
    setSearchQuery('');
    
    // Update URL with new country, clear sector
    const params = new URLSearchParams(searchParams.toString());
    params.set('pais', countryCode);
    params.delete('sector');
    
    const newUrl = `/explorar?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, router, setSearchQuery]);

  const handleSectorChange = useCallback((sector: string) => {
    setSelectedSector(sector);
    
    // Update URL with new sector
    const params = new URLSearchParams(searchParams.toString());
    if (sector) {
      params.set('sector', sector);
    } else {
      params.delete('sector');
    }
    
    const newUrl = `/explorar?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, router]);

  return {
    // State
    selectedDomain,
    selectedCountry,
    selectedSector,
    availableCountries,
    availableSectors,
    data,
    loading,
    error,
    lastFetchUrl,
    searchQuery,
    debouncedSearchQuery,

    // Computed values
    currentDominio,
    countryInfo,
    records,
    filteredRecords,
    sectionsToDisplay,

    // Handlers
    handleDomainChange,
    handleCountryChange,
    handleSectorChange,
    setSearchQuery,
  };
}