'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { RegulatorySource } from '@/lib/constants';

interface RegulatorySourcesAdminProps {
  onAddSource?: (source: RegulatorySource) => void;
  onUpdateSource?: (country: string, domain: string, oldUrl: string, newSource: RegulatorySource) => void;
}

export function RegulatorySourcesAdmin({
  onAddSource,
  onUpdateSource
}: RegulatorySourcesAdminProps) {
  const [editingSource, setEditingSource] = useState<{
    country: string;
    domain: string;
    source: Partial<RegulatorySource>;
  } | null>(null);

  const [formData, setFormData] = useState<Partial<RegulatorySource>>({
    name: '',
    url: '',
    description: '',
    type: 'official'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url || !formData.description || !formData.type) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newSource: RegulatorySource = {
      name: formData.name,
      url: formData.url,
      description: formData.description,
      type: formData.type as 'official' | 'government' | 'secondary' | 'restricted',
      lastValidated: new Date().toISOString().split('T')[0]
    };

    if (editingSource) {
      onUpdateSource?.(editingSource.country, editingSource.domain, editingSource.source.url!, newSource);
    } else {
      onAddSource?.(newSource);
    }

    setFormData({ name: '', url: '', description: '', type: 'official' });
    setEditingSource(null);
  };

  // getTypeIcon removed — kept UI simple for admin listings

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingSource ? 'Editar Fuente' : 'Agregar Nueva Fuente'}
          </CardTitle>
          <CardDescription>
            {editingSource
              ? 'Modifica los detalles de la fuente regulatoria'
              : 'Agrega una nueva fuente regulatoria oficial'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Norma
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Resolución 2115 de 2007"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Fuente
                </label>
                <select
                  value={formData.type || 'official'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'official' | 'government' | 'secondary' | 'restricted' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="official">Oficial</option>
                  <option value="government">Gobierno</option>
                  <option value="secondary">Secundaria</option>
                  <option value="restricted">Restringido</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <Input
                type="url"
                placeholder="https://..."
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <Input
                type="text"
                placeholder="Breve descripción de la norma"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingSource ? 'Actualizar' : 'Agregar'} Fuente
              </Button>
              {editingSource && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSource(null);
                    setFormData({ name: '', url: '', description: '', type: 'official' });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fuentes Registradas</CardTitle>
          <CardDescription>
            Gestiona todas las fuentes regulatorias disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p>
              <strong>Nota:</strong> Este es un panel de administración. En una aplicación real,
              estas fuentes se guardarían en una base de datos y se sincronizarían con el archivo
              de constantes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
