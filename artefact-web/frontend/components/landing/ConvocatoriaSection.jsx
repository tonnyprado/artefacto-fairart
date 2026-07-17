'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

/**
 * Convocatoria Section
 *
 * DATOS HARDCODEADOS (por ahora):
 * - Información de la convocatoria
 * - Fases y fechas
 * - Requisitos
 * - URL del PDF de convocatoria
 * - Estado de inscripciones (abiertas/cerradas)
 *
 * BASE DE DATOS FUTURA:
 * - Tabla: fases
 *   - id SERIAL PRIMARY KEY
 *   - nombre VARCHAR(100) -- 'Fase 1', 'Fase 2', 'Fase 3', 'Concurso'
 *   - descripcion TEXT
 *   - fecha_inicio_inscripciones TIMESTAMP
 *   - fecha_fin_inscripciones TIMESTAMP
 *   - inscripciones_abiertas BOOLEAN
 *
 * - Tabla: contenido
 *   WHERE tipo = 'convocatoria'
 *   - titulo VARCHAR(255)
 *   - descripcion TEXT
 *   - requisitos JSONB -- Array de requisitos
 *   - pdf_url VARCHAR(500) -- URL del PDF en Cloudinary
 *   - beneficios JSONB -- Array de beneficios
 */

export default function ConvocatoriaSection() {
  // HARDCODED: En producción, estos datos vendrán de la BDD
  const convocatoriaData = {
    isOpen: true, // Estado de inscripciones (vendrá de tabla fases)
    title: 'Convocatoria Abierta',
    description: 'Invitamos a artistas emergentes a formar parte de ARTEFACT 2027. Participa en nuestro proceso de selección por fases y comparte tu talento con coleccionistas y amantes del arte.',
    pdfUrl: '/pdfs/Convocatoria_ARTEFACTO.pdf', // En producción: URL de Cloudinary
    phases: [
      {
        name: 'Fase 1',
        period: 'Agosto - Octubre 2026',
        description: 'Primera ronda de selección',
        inscriptionsOpen: true
      },
      {
        name: 'Fase 2',
        period: 'Octubre - Diciembre 2026',
        description: 'Segunda ronda de selección',
        inscriptionsOpen: false
      },
      {
        name: 'Fase 3',
        period: 'Diciembre 2026 - Enero 2027',
        description: 'Tercera ronda de selección',
        inscriptionsOpen: false
      },
      {
        name: 'Concurso',
        period: 'Enero 2027',
        description: 'Concurso especial por invitación',
        inscriptionsOpen: false
      }
    ],
    requirements: [
      'Ser mayor de 18 años',
      'Obra original y de autoría propia',
      'CV artístico actualizado',
      'Portfolio digital (mínimo 5 obras)',
      'Fotografía de identificación oficial',
      'Disponibilidad para exponer en Febrero 2027'
    ],
    benefits: [
      'Espacio de exhibición profesional',
      'Difusión en redes sociales y medios',
      'Networking con coleccionistas y galeristas',
      'Posibilidad de venta de obras',
      'Certificado de participación',
      'Acceso a eventos exclusivos'
    ]
  }

  return (
    <section id="convocatoria" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-200 rounded-full mb-4">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse" />
            <span className="text-red-700 text-sm font-semibold uppercase">
              {convocatoriaData.isOpen ? 'Inscripciones Abiertas' : 'Próximamente'}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {convocatoriaData.title}
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {convocatoriaData.description}
          </p>
        </div>

        {/* Phases */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Fases de Selección
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {convocatoriaData.phases.map((phase, index) => (
              <Card
                key={index}
                className={
                  phase.inscriptionsOpen
                    ? 'border-2 border-red-600 shadow-lg'
                    : ''
                }
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {index + 1}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{phase.name}</CardTitle>
                    <p className="text-sm text-gray-500">{phase.period}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {phase.description}
                    </p>
                    {phase.inscriptionsOpen && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Abierta
                      </span>
                    )}
                    {!phase.inscriptionsOpen && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        Próximamente
                      </span>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Requirements & Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Requirements */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">📋</span>
              Requisitos
            </h3>
            <ul className="space-y-3">
              {convocatoriaData.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-red-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">⭐</span>
              Beneficios
            </h3>
            <ul className="space-y-3">
              {convocatoriaData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h3 className="text-3xl font-bold mb-4">¿Listo para participar?</h3>
            <p className="text-red-100 mb-8 text-lg">
              Descarga la convocatoria completa y regístrate para formar parte de ARTEFACT 2027
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Download PDF Button */}
              <a
                href={convocatoriaData.pdfUrl}
                download="Convocatoria_ARTEFACTO.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-red-600 hover:bg-red-50 border-none"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Descargar Convocatoria
                </Button>
              </a>

              {/* Register Button */}
              <Link href="/registro">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-red-800 hover:bg-red-900"
                  disabled={!convocatoriaData.isOpen}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  {convocatoriaData.isOpen ? 'Registrarse Ahora' : 'Inscripciones Cerradas'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Selection Process Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Proceso de Selección
            </h4>
            <p className="text-blue-800 text-sm">
              Las inscripciones se revisan por un equipo de curadores profesionales.
              Aproximadamente el <strong>20% de los artistas inscritos</strong> en cada fase
              serán seleccionados para participar en la feria. Los resultados se notifican
              por correo electrónico al finalizar el periodo de votación de cada fase.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
