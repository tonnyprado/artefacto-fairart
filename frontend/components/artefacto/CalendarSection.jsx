'use client'

import { useState, useEffect } from 'react'

/**
 * Calendar Section - Calendario Visual Interactivo
 *
 * DATOS HARDCODEADOS (por ahora):
 * - Fechas importantes de las fases
 * - Eventos especiales
 * - Fechas de votación
 * - Fecha de la feria
 *
 * BASE DE DATOS FUTURA:
 * - Tabla: eventos_calendario
 *   - dia INT
 *   - mes VARCHAR(20)
 *   - anio INT
 *   - hora VARCHAR(10)
 *   - titulo VARCHAR(255)
 *   - descripcion TEXT
 *   - tipo VARCHAR(50)
 */

export default function CalendarSection({ isActive = true }) {
  // HARDCODED: Eventos del calendario con fechas específicas
  const calendarEvents = [
    {
      day: 1,
      month: 'Agosto',
      year: 2026,
      time: '10:00',
      title: 'Apertura de convocatoria',
      description: 'Lanzamiento oficial de la convocatoria ARTEFACT 2027',
      type: 'milestone'
    },
    {
      day: 15,
      month: 'Enero',
      year: 2026,
      time: '09:00',
      title: 'Inicio Inscripciones Fase 1',
      description: 'Comienza el periodo de inscripción - Primera fase',
      type: 'phase'
    },
    {
      day: 31,
      month: 'Marzo',
      year: 2026,
      time: '23:59',
      title: 'Cierre Inscripciones Fase 1',
      description: 'Fin del periodo de inscripción - Primera fase',
      type: 'phase'
    },
    {
      day: 15,
      month: 'Abril',
      year: 2026,
      time: '18:00',
      title: 'Publicación de resultados (Fase 1)',
      description: 'Curadores votan por artistas de la Fase 1',
      type: 'voting'
    },
    {
      day: 1,
      month: 'Mayo',
      year: 2026,
      time: '09:00',
      title: 'Inicio Inscripciones Fase 2',
      description: 'Comienza el periodo de inscripción - Segunda fase',
      type: 'phase'
    },
    {
      day: 31,
      month: 'Julio',
      year: 2026,
      time: '23:59',
      title: 'Cierre Inscripciones Fase 2',
      description: 'Fin del periodo de inscripción - Segunda fase',
      type: 'phase'
    },
    {
      day: 15,
      month: 'Agosto',
      year: 2026,
      time: '18:00',
      title: 'Publicación de resultados (Fase 2)',
      description: 'Curadores votan por artistas de la Fase 2',
      type: 'voting'
    },
    {
      day: 1,
      month: 'Septiembre',
      year: 2026,
      time: '09:00',
      title: 'Inicio Inscripciones Fase 3',
      description: 'Comienza el periodo de inscripción - Tercera fase',
      type: 'phase'
    },
    {
      day: 30,
      month: 'Noviembre',
      year: 2026,
      time: '23:59',
      title: 'Cierre Inscripciones Fase 3',
      description: 'Fin del periodo de inscripción - Tercera fase',
      type: 'phase'
    },
    {
      day: 15,
      month: 'Diciembre',
      year: 2026,
      time: '18:00',
      title: 'Publicación de resultados (Fase 3)',
      description: 'Curadores votan por artistas de la Fase 3',
      type: 'voting'
    },
    {
      day: 20,
      month: 'Diciembre',
      year: 2026,
      time: '12:00',
      title: 'Bootcamp Cerámica',
      description: 'Taller especial de cerámica para artistas seleccionados',
      type: 'special'
    },
    {
      day: 1,
      month: 'Febrero',
      year: 2027,
      time: '10:00',
      title: 'Recepción de obra',
      description: 'Entrega de obras por parte de artistas seleccionados',
      type: 'important'
    },
    {
      day: 4,
      month: 'Febrero',
      year: 2027,
      time: '10:00',
      title: 'ARTEFACT 2027 - La Feria',
      description: 'Feria de Arte - Exhibición de obras seleccionadas',
      type: 'main-event'
    },
    {
      day: 8,
      month: 'Febrero',
      year: 2027,
      time: '09:00',
      title: 'Desmontaje y devolución de obra',
      description: 'Proceso de desmontaje y devolución de obras',
      type: 'important'
    },
    {
      day: 10,
      month: 'Febrero',
      year: 2027,
      time: '00:00',
      title: 'Periodo de pagos a artistas',
      description: 'Inicio del periodo de pagos y venta post-evento',
      type: 'important'
    }
  ]

  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(0) // 0 = Enero 2026

  // Meses disponibles
  const months = [
    { name: 'Enero', year: 2026 },
    { name: 'Febrero', year: 2026 },
    { name: 'Marzo', year: 2026 },
    { name: 'Abril', year: 2026 },
    { name: 'Mayo', year: 2026 },
    { name: 'Junio', year: 2026 },
    { name: 'Julio', year: 2026 },
    { name: 'Agosto', year: 2026 },
    { name: 'Septiembre', year: 2026 },
    { name: 'Octubre', year: 2026 },
    { name: 'Noviembre', year: 2026 },
    { name: 'Diciembre', year: 2026 },
    { name: 'Enero', year: 2027 },
    { name: 'Febrero', year: 2027 }
  ]

  // Auto-play cada 5 segundos
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % calendarEvents.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, calendarEvents.length])

  // Generar días del mes
  const getDaysInMonth = (monthName, year) => {
    const monthIndex = new Date(Date.parse(monthName + " 1, 2026")).getMonth()
    return new Date(year, monthIndex + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (monthName, year) => {
    const monthIndex = new Date(Date.parse(monthName + " 1, 2026")).getMonth()
    return new Date(year, monthIndex, 1).getDay()
  }

  const currentMonth = months[selectedMonth]
  const daysInMonth = getDaysInMonth(currentMonth.name, currentMonth.year)
  const firstDay = getFirstDayOfMonth(currentMonth.name, currentMonth.year)

  // Crear array de días
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Verificar si un día tiene evento
  const hasEvent = (day) => {
    return calendarEvents.some(
      event =>
        event.day === day &&
        event.month === currentMonth.name &&
        event.year === currentMonth.year
    )
  }

  // Manejar click en día
  const handleDayClick = (day) => {
    if (!day) return
    const eventIndex = calendarEvents.findIndex(
      event =>
        event.day === day &&
        event.month === currentMonth.name &&
        event.year === currentMonth.year
    )
    if (eventIndex !== -1) {
      setCurrentEventIndex(eventIndex)
      setIsPlaying(false)
    }
  }

  const handlePrevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + calendarEvents.length) % calendarEvents.length)
    setIsPlaying(false)
  }

  const handleNextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % calendarEvents.length)
    setIsPlaying(false)
  }

  const currentEvent = calendarEvents[currentEventIndex]

  return (
    <section id="calendario" className="py-20 bg-[#E8DED0] min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calendario
          </h2>
          <div className="w-20 h-1 bg-[#2B5F9E] mx-auto"></div>
        </div>

        {/* Main Content: Calendar + Event Display */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* LEFT: Calendar */}
          <div>
            {/* Month Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                disabled={selectedMonth === 0}
                className="p-2 hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <h3 className="text-4xl font-bold text-[#2B5F9E] uppercase tracking-wider">
                  {currentMonth.name}
                </h3>
                <p className="text-6xl font-bold text-[#2B5F9E] mt-2">
                  {currentMonth.year}
                </p>
              </div>

              <button
                onClick={() => setSelectedMonth(Math.min(months.length - 1, selectedMonth + 1))}
                disabled={selectedMonth === months.length - 1}
                className="p-2 hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#2B5F9E] rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-bold text-lg">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid - Full Month */}
            <div className="grid grid-cols-7 gap-3">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                  className={`
                    aspect-square rounded-full flex items-center justify-center text-xl font-bold
                    transition-all duration-300
                    ${!day ? 'invisible' : ''}
                    ${hasEvent(day)
                      ? 'bg-[#2B5F9E] text-white hover:bg-[#1e4570] cursor-pointer scale-105'
                      : 'bg-[#E8DED0] text-gray-700 hover:bg-white/80 cursor-pointer'
                    }
                    ${currentEvent.day === day && currentEvent.month === currentMonth.name && currentEvent.year === currentMonth.year
                      ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-[#E8DED0]'
                      : ''
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Event Display */}
          <div className="relative min-h-[600px] flex flex-col">
            {/* Event Card */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="border-t-4 border-black pt-6 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-9xl font-bold text-red-600 leading-none">
                    {String(currentEvent.day).padStart(2, '0')}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{currentEvent.time}</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mt-1">
                      {currentEvent.month} {currentEvent.year}
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentEvent.title}
                </h3>

                <p className="text-gray-600 text-xl leading-relaxed mb-6">
                  {currentEvent.description}
                </p>

                {/* Type Badge */}
                <div className="inline-block px-5 py-2 bg-gray-900 text-white text-sm font-semibold uppercase tracking-wider">
                  {currentEvent.type === 'milestone' && 'Hito Importante'}
                  {currentEvent.type === 'phase' && 'Fase de Inscripción'}
                  {currentEvent.type === 'voting' && 'Votación'}
                  {currentEvent.type === 'special' && 'Evento Especial'}
                  {currentEvent.type === 'important' && 'Importante'}
                  {currentEvent.type === 'main-event' && 'Evento Principal'}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-1 mb-8">
                {calendarEvents.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 transition-all ${
                      index === currentEventIndex ? 'bg-[#2B5F9E]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 pt-6 border-t-2 border-gray-900">
              <button
                onClick={handlePrevEvent}
                className="p-3 hover:bg-white/50 transition-colors"
                aria-label="Evento anterior"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-[#2B5F9E] hover:bg-[#1e4570] text-white transition-colors"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNextEvent}
                className="p-3 hover:bg-white/50 transition-colors"
                aria-label="Evento siguiente"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-center mt-6 text-sm text-gray-600 font-semibold">
              Evento {currentEventIndex + 1} de {calendarEvents.length}
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="border-l-4 border-[#2B5F9E] p-6">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center text-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Nota Importante
            </h4>
            <p className="text-sm text-gray-700">
              Las fechas están sujetas a cambios. Te notificaremos por email sobre cualquier
              actualización en el calendario. Haz clic en los días marcados para ver más detalles.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
