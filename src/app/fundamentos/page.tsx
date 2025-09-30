import Link from 'next/link'

export default function FundamentalsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Fundamentos de la Normatividad del Agua Potable
        </h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            ¿Qué es la normatividad del agua potable?
          </h2>
          <p className="text-blue-800 leading-relaxed">
            La normatividad del agua potable establece los <strong>límites máximos permisibles</strong> 
            de diversos parámetros físicos, químicos y microbiológicos que debe cumplir el agua 
            destinada al consumo humano, garantizando su inocuidad y calidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              🦠 Parámetros Microbiológicos
            </h3>
            <p className="text-gray-600 mb-3">
              Evalúan la presencia de microorganismos patógenos que pueden causar enfermedades.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Coliformes totales y fecales</li>
              <li>• Escherichia coli</li>
              <li>• Enterococos</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              ⚗️ Parámetros Fisicoquímicos
            </h3>
            <p className="text-gray-600 mb-3">
              Características físicas y químicas que afectan la calidad organoléptica y la seguridad.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• pH, turbiedad, color</li>
              <li>• Cloro residual</li>
              <li>• Sólidos disueltos totales</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              🏭 Metales Pesados
            </h3>
            <p className="text-gray-600 mb-3">
              Elementos metálicos tóxicos que pueden acumularse en el organismo.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Plomo, mercurio, cadmio</li>
              <li>• Arsénico, cobre</li>
              <li>• Cromo, níquel</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              🌱 Compuestos Orgánicos
            </h3>
            <p className="text-gray-600 mb-3">
              Sustancias orgánicas potencialmente perjudiciales para la salud humana.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Pesticidas y herbicidas</li>
              <li>• Hidrocarburos</li>
              <li>• Compuestos organoclorados</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-green-900 mb-4">
            ¿Cómo leer las tablas de estándares?
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Parámetro</h4>
                <p className="text-green-800">Nombre del elemento o compuesto que se está midiendo (ej: 'Coliformes totales', 'pH', 'Plomo')</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Límite Máximo Permisible (VMP)</h4>
                <p className="text-green-800">Valor máximo aceptable del parámetro (ej: '≤ 0.01 mg/L', '6.5 - 8.5', 'Ausentes')</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Unidad de Medida</h4>
                <p className="text-green-800">Unidades en que se expresa el valor (ej: "mg/L", "NMP/100 mL", "UNT")</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Notas y Observaciones</h4>
                <p className="text-green-800">Condiciones especiales, excepciones o requisitos de monitoreo</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                5
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Referencia Legal</h4>
                <p className="text-green-800">Norma, decreto o resolución que establece el estándar, junto con la entidad emisora y año</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-yellow-900 mb-4">
            ⚠️ Importante: Verificación de Vigencia
          </h2>
          <p className="text-yellow-800 leading-relaxed">
            Los estándares mostrados en esta aplicación son referenciales y pueden no reflejar 
            las últimas modificaciones normativas. <strong>Siempre consulta las fuentes oficiales</strong> 
            (diarios oficiales, páginas web gubernamentales) para obtener la información más actualizada 
            antes de tomar decisiones técnicas o regulatorias.
          </p>
        </div>

        <div className="text-center">
          <a 
            href="/explorar"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Explorar Normas por País →
          </a>
        </div>
      </div>
    </div>
  )
}
