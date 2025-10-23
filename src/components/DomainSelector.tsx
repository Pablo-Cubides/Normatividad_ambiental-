'use client';


type Domain = 'agua' | 'calidad-aire' | 'residuos-solidos' | '';

interface DomainSelectorProps {
  domain: Domain;
  onDomainChange: (domain: Domain) => void;
}

export function DomainSelector({ domain, onDomainChange }: DomainSelectorProps) {
  return (
    <div className="md:col-span-3">
      <div className="flex items-center gap-2 mb-3">
        <button
          className={`px-3 py-1 rounded ${domain === 'agua' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onDomainChange('agua')}
        >
          💧 Agua
        </button>
        <button
          className={`px-3 py-1 rounded ${domain === 'calidad-aire' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onDomainChange('calidad-aire')}
        >
          💨 Calidad del Aire
        </button>
        <button
          className={`px-3 py-1 rounded ${domain === 'residuos-solidos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onDomainChange('residuos-solidos')}
        >
          🗑️ Residuos Sólidos
        </button>
      </div>
    </div>
  );
}
