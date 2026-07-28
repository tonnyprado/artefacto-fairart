'use client'

/**
 * Calendar Section - Timeline de Eventos
 *
 * DATOS HARDCODEADOS (por ahora):
 * - Fechas importantes de las fases
 * - Eventos especiales
 * - Fechas de votación
 * - Fecha de la feria
 *
 * BASE DE DATOS FUTURA:
 * - Tabla: fases
 *   - fecha_inicio_inscripciones TIMESTAMP
 *   - fecha_fin_inscripciones TIMESTAMP
 *   - fecha_inicio_votaciones TIMESTAMP
 *   - fecha_fin_votaciones TIMESTAMP
 *
 * - Tabla: eventos
 *   WHERE tipo = 'calendario'
 *   - nombre VARCHAR(255)
 *   - descripcion TEXT
 *   - fecha_inicio TIMESTAMP
 *   - fecha_fin TIMESTAMP
 *   - tipo_evento VARCHAR(50) -- 'inscripcion', 'votacion', 'feria', 'especial'
 */

export default function CalendarSection() {
  // HARDCODED: En producción, estos datos vendrán de la BDD
  const timelineEvents = [
    {
      date: 'Agosto 2026',
      title: 'Lanzamiento Convocatoria',
      description: 'Apertura oficial de la convocatoria y Fase 1',
      type: 'milestone',
      icon: '🚀'
    },
    {
      date: 'Ago - Oct 2026',
      title: 'Fase 1: Inscripciones',
      description: 'Periodo de inscripción para artistas - Primera fase',
      type: 'phase',
      phase: 1
    },
    {
      date: 'Octubre 2026',
      title: 'Votación Fase 1',
      description: 'Curadores votan por artistas de la Fase 1',
      type: 'voting',
      phase: 1
    },
    {
      date: 'Oct - Dic 2026',
      title: 'Fase 2: Inscripciones',
      description: 'Periodo de inscripción - Segunda fase',
      type: 'phase',
      phase: 2
    },
    {
      date: 'Diciembre 2026',
      title: 'Votación Fase 2',
      description: 'Curadores votan por artistas de la Fase 2',
      type: 'voting',
      phase: 2
    },
    {
      date: 'Dic 2026 - Ene 2027',
      title: 'Fase 3: Inscripciones',
      description: 'Periodo de inscripción - Tercera fase',
      type: 'phase',
      phase: 3
    },
    {
      date: 'Enero 2027',
      title: 'Votación Fase 3',
      description: 'Curadores votan por artistas de la Fase 3',
      type: 'voting',
      phase: 3
    },
    {
      date: 'Enero 2027',
      title: 'Concurso Especial',
      description: 'Inscripción y votación para el concurso',
      type: 'special',
      icon: '🏆'
    },
    {
      date: 'Febrero 2027',
      title: 'ARTEFACT 2027',
      description: '¡Feria de Arte! Exhibición de obras seleccionadas',
      type: 'main-event',
      icon: '🎨'
    }
  ]

  const getEventStyles = (type) => {
    switch (type) {
      case 'milestone':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'phase':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'voting':
        return 'bg-purple-100 border-purple-300 text-purple-800'
      case 'special':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'main-event':
        return 'bg-gradient-to-r from-red-500 to-red-600 border-red-700 text-white'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  return (
    <section id="calendario" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calendario de Eventos
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conoce las fechas importantes del proceso de selección y la feria
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-300 via-red-500 to-red-700 transform md:-translate-x-1/2"></div>

            {/* Events */}
            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2 z-10"></div>

                  {/* Content Card */}
                  <div
                    className={`w-full md:w-5/12 ml-20 md:ml-0 ${
                      index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                    }`}
                  >
                    <div
                      className={`p-6 rounded-xl border-2 shadow-md hover:shadow-lg transition-all ${getEventStyles(
                        event.type
                      )}`}
                    >
                      {/* Date Badge */}
                      <div className="inline-block px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-sm font-semibold mb-3">
                        {event.date}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 flex items-center">
                        {event.icon && <span className="mr-2 text-2xl">{event.icon}</span>}
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className={event.type === 'main-event' ? 'text-red-100' : 'opacity-90'}>
                        {event.description}
                      </p>

                      {/* Phase Badge */}
                      {event.phase && (
                        <div className="mt-3">
                          <span className="inline-block px-3 py-1 rounded-full bg-white/40 text-xs font-semibold">
                            Fase {event.phase}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="text-3xl mb-3">📅</div>
            <h4 className="font-bold text-gray-900 mb-2">Inscripciones</h4>
            <p className="text-sm text-gray-600">
              3 fases de inscripción durante 6 meses
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="text-3xl mb-3">🗳️</div>
            <h4 className="font-bold text-gray-900 mb-2">Votaciones</h4>
            <p className="text-sm text-gray-600">
              Curadores profesionales evalúan cada fase
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
            <div className="text-3xl mb-3">🎨</div>
            <h4 className="font-bold text-gray-900 mb-2">Feria</h4>
            <p className="text-sm text-gray-600">
              Evento final en Febrero 2027
            </p>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg">
            <h4 className="font-bold text-yellow-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Nota Importante
            </h4>
            <p className="text-sm text-yellow-800">
              Las fechas están sujetas a cambios. Te notificaremos por email sobre cualquier
              actualización en el calendario. Mantente atento a tu correo electrónico registrado.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
