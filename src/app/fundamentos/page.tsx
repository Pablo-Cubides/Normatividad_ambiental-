import Link from 'next/link'

export default function FundamentalsPage() {
  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Volver al inicio
        </Link>
        <h1 className="mb-6 text-4xl font-bold text-gray-900">
          Fundamentos de la Normatividad del Agua Potable
        </h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="p-6 mb-8 border border-blue-200 rounded-lg bg-blue-50">
          <h2 className="mb-4 text-2xl font-semibold text-blue-900">
            ¿Qué es la normatividad del agua potable?
          </h2>
          <p className="leading-relaxed text-blue-800">
            La normatividad del agua potable establece los <strong>límites máximos permisibles</strong> 
            de diversos parámetros físicos, químicos y microbiológicos que debe cumplir el agua 
            destinada al consumo humano, garantizando su inocuidad y calidad.
          </p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-900">
              🦠 Parámetros Microbiológicos
            </h3>
            <p className="mb-3 text-gray-600">
              Evalúan la presencia de microorganismos patógenos que pueden causar enfermedades.
            </p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>• Coliformes totales y fecales</li>
              <li>• Escherichia coli</li>
              <li>• Enterococos</li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-900">
              ⚗️ Parámetros Fisicoquímicos
            </h3>
            <p className="mb-3 text-gray-600">
              Características físicas y químicas que afectan la calidad organoléptica y la seguridad.
            </p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>• pH, turbiedad, color</li>
              <li>• Cloro residual</li>
              <li>• Sólidos disueltos totales</li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-900">
              🏭 Metales Pesados
            </h3>
            <p className="mb-3 text-gray-600">
              Elementos metálicos tóxicos que pueden acumularse en el organismo.
            </p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>• Plomo, mercurio, cadmio</li>
              <li>• Arsénico, cobre</li>
              <li>• Cromo, níquel</li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-900">
              🌱 Compuestos Orgánicos
            </h3>
            <p className="mb-3 text-gray-600">
              Sustancias orgánicas potencialmente perjudiciales para la salud humana.
            </p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>• Pesticidas y herbicidas</li>
              <li>• Hidrocarburos</li>
              <li>• Compuestos organoclorados</li>
            </ul>
          </div>
        </div>

        <div className="p-6 mb-8 border border-green-200 rounded-lg bg-green-50">
          <h2 className="mb-4 text-2xl font-semibold text-green-900">
            ¿Cómo leer las tablas de estándares?
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold text-white bg-green-600 rounded-full">
                1
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Parámetro</h4>
                <p className="text-green-800">Nombre del elemento o compuesto que se está midiendo (ej: &apos;Coliformes totales&apos;, &apos;pH&apos;, &apos;Plomo&apos;)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold text-white bg-green-600 rounded-full">
                2
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Límite Máximo Permisible (VMP)</h4>
                <p className="text-green-800">Valor máximo aceptable del parámetro (ej: &apos;≤ 0.01 mg/L&apos;, &apos;6.5 - 8.5&apos;, &apos;Ausentes&apos;)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold text-white bg-green-600 rounded-full">
                3
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Unidad de Medida</h4>
                <p className="text-green-800">Unidades en que se expresa el valor (ej: &quot;mg/L&quot;, &quot;NMP/100 mL&quot;, &quot;UNT&quot;)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold text-white bg-green-600 rounded-full">
                4
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Notas y Observaciones</h4>
                <p className="text-green-800">Condiciones especiales, excepciones o requisitos de monitoreo</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-semibold text-white bg-green-600 rounded-full">
                5
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Referencia Legal</h4>
                <p className="text-green-800">Norma, decreto o resolución que establece el estándar, junto con la entidad emisora y año</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 mb-8 border border-yellow-200 rounded-lg bg-yellow-50">
          <h2 className="mb-4 text-2xl font-semibold text-yellow-900">
            ⚠️ Importante: Verificación de Vigencia
          </h2>
          <p className="leading-relaxed text-yellow-800">
            Los estándares mostrados en esta aplicación son referenciales y pueden no reflejar 
            las últimas modificaciones normativas. <strong>Siempre consulta las fuentes oficiales</strong> 
            (diarios oficiales, páginas web gubernamentales) para obtener la información más actualizada 
            antes de tomar decisiones técnicas o regulatorias.
          </p>
        </div>

        <div className="text-center">
          <a 
            href="/explorar"
            className="inline-block px-6 py-3 text-lg font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Explorar Normas por País →
          </a>
        </div>
      </div>
    </div>
  )
}
