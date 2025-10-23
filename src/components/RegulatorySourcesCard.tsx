'use client';

import { ExternalLink, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RegulatorySource } from '@/lib/constants';

interface RegulatorySourcesCardProps {
  sources: RegulatorySource[];
  country: string;
  domain?: string;
}

export function RegulatorySourcesCard({ sources, country }: RegulatorySourcesCardProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'official':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'government':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'secondary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'restricted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'official':
        return 'Oficial';
      case 'government':
        return 'Gobierno';
      case 'secondary':
        return 'Secundaria';
      case 'restricted':
        return 'Restringido';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'official':
      case 'government':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'restricted':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-amber-600 rounded-full">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Fuentes Regulatorias Oficiales</CardTitle>
            <CardDescription>
              Enlaces a documentos y normativas oficiales de {country}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sources.map((source, idx) => (
            <div
              key={`${source.url}-${idx}`}
              className="p-4 bg-white rounded-lg border-2 border-amber-100 hover:border-amber-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-900 hover:text-amber-700 underline decoration-2 decoration-amber-400 break-words flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      {source.name}
                      <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <Badge
                      variant="outline"
                      className={`${getTypeColor(source.type)} flex items-center gap-1 text-xs flex-shrink-0`}
                    >
                      {getTypeIcon(source.type)}
                      {getTypeLabel(source.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{source.description}</p>
                  {source.lastValidated && (
                    <p className="text-xs text-gray-500">
                      Validado: {new Date(source.lastValidated).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-amber-100 border-l-4 border-amber-600 rounded">
          <p className="text-sm text-amber-900">
            <strong>Nota:</strong> Estos enlaces apuntan a fuentes oficiales. Si alguno no funciona, puede reportarlo para que actualicemos la información.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
