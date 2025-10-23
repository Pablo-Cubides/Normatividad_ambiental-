'use client';

import { RegulatorySourcesAdmin } from '@/components/RegulatorySourcesAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lock } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-700/50 shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative container px-4 py-6 mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Link>
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-200">Panel Admin (Requiere autenticación)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Panel de Administración</h1>
              <p className="text-blue-100 text-lg">Gestión de Fuentes Regulatorias</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Warning Banner */}
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Importante:</strong> Este panel es para demostración. En producción, requeriría
                autenticación y las fuentes se guardarían en una base de datos PostgreSQL o MongoDB con
                control de versiones y auditoría.
              </p>
            </CardContent>
          </Card>

          {/* Main Content */}
          <RegulatorySourcesAdmin
            onAddSource={(source) => {
              
              // En producción: enviaría a un API endpoint
            }}
            onUpdateSource={(country, domain, oldUrl, newSource) => {
              
            }}
          />

          {/* Info Section */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Información Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Validación de URLs</h4>
                <p className="text-gray-700">
                  Ejecuta <code className="bg-gray-200 px-2 py-1 rounded">npx tsx scripts/validate-regulatory-urls.ts</code> para validar
                  todas las URLs de fuentes regulatorias.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estructura de Datos</h4>
                <p className="text-gray-700">
                  Las fuentes se almacenan en <code className="bg-gray-200 px-2 py-1 rounded">src/lib/constants.ts</code> como
                  <code className="bg-gray-200 px-2 py-1 rounded">REGULATORY_SOURCES</code>. Cada entrada incluye nombre, URL,
                  descripción, tipo y fecha de validación.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tipos de Fuentes</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>official:</strong> Normas oficiales del gobierno</li>
                  <li><strong>government:</strong> Publicaciones del gobierno</li>
                  <li><strong>secondary:</strong> Fuentes secundarias confiables</li>
                  <li><strong>restricted:</strong> Acceso limitado o de pago</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Próximas Mejoras</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Autenticación y autorización</li>
                  <li>Persistencia en base de datos</li>
                  <li>Historial de cambios (audit log)</li>
                  <li>Validación automática periódica de URLs</li>
                  <li>Notificaciones de URLs rotas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
