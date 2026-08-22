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

export default function CalendarSection() {
  // HARDCODED: Eventos del calendario con fechas específicas
  const calendarEvents = [
    {
      day: 24,
      month: 'Agosto',
      year: 2026,
      time: '00:00',
      title: 'Apertura de convocatoria',
      description: 'Lanzamiento oficial de la convocatoria ARTEFACT 2027',
      type: 'milestone'
    },
    {
      day: 24,
      month: 'Agosto',
      year: 2026,
      time: '00:00',
      title: 'Fase 1 — Apertura',
      description: 'Comienza el periodo de inscripción - Primera fase',
      type: 'phase'
    },
    {
      day: 14,
      month: 'Septiembre',
      year: 2026,
      time: '23:59',
      title: 'Fase 1 — Cierre',
      description: 'Fin del periodo de inscripción - Primera fase',
      type: 'phase'
    },
    {
      day: 22,
      month: 'Septiembre',
      year: 2026,
      time: '12:00',
      title: 'Publicación de resultados (Fase 1)',
      description: 'Curadores votan por artistas de la Fase 1',
      type: 'voting'
    },
    {
      day: 23,
      month: 'Septiembre',
      year: 2026,
      time: '00:00',
      title: 'Fase 2 — Apertura',
      description: 'Comienza el periodo de inscripción - Segunda fase',
      type: 'phase'
    },
    {
      day: 14,
      month: 'Octubre',
      year: 2026,
      time: '23:59',
      title: 'Fase 2 — Cierre',
      description: 'Fin del periodo de inscripción - Segunda fase',
      type: 'phase'
    },
    {
      day: 22,
      month: 'Octubre',
      year: 2026,
      time: '12:00',
      title: 'Publicación de resultados (Fase 2)',
      description: 'Curadores votan por artistas de la Fase 2',
      type: 'voting'
    },
    {
      day: 23,
      month: 'Octubre',
      year: 2026,
      time: '00:00',
      title: 'Fase 3 — Apertura',
      description: 'Comienza el periodo de inscripción - Tercera fase',
      type: 'phase'
    },
    {
      day: 13,
      month: 'Noviembre',
      year: 2026,
      time: '23:59',
      title: 'Fase 3 — Cierre',
      description: 'Fin del periodo de inscripción - Tercera fase',
      type: 'phase'
    },
    {
      day: 20,
      month: 'Noviembre',
      year: 2026,
      time: '12:00',
      title: 'Publicación de resultados (Fase 3)',
      description: 'Curadores votan por artistas de la Fase 3',
      type: 'voting'
    },
    {
      day: 30,
      month: 'Enero',
      year: 2027,
      time: '10:00',
      title: 'Recepción de obra',
      description: 'Entrega de obras (30 ene – 2 feb)',
      type: 'important'
    },
    {
      day: 4,
      month: 'Febrero',
      year: 2027,
      time: '10:00',
      title: 'ARTEFACT 2027 - La Feria',
      description: 'Feria de Arte (4 – 7 feb)',
      type: 'main-event'
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
    <section id="calendario" className="py-20 bg-[#E8DED0]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calendario
          </h2>
          <div className="w-20 h-1 bg-[#2B5F9E] mx-auto"></div>
        </div>

        {/* Main Content: Calendar + Event Display */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* LEFT: Calendar */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            {/* Month Selector */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                disabled={selectedMonth === 0}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-right">
                <h3 className="text-3xl font-bold text-[#2B5F9E] uppercase">
                  {currentMonth.name}
                </h3>
                <p className="text-5xl font-bold text-[#2B5F9E]">
                  {currentMonth.year}
                </p>
              </div>

              <button
                onClick={() => setSelectedMonth(Math.min(months.length - 1, selectedMonth + 1))}
                disabled={selectedMonth === months.length - 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#2B5F9E] rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-bold text-sm">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                  className={`
                    aspect-square rounded-full flex items-center justify-center text-lg font-bold
                    transition-all duration-300
                    ${!day ? 'invisible' : ''}
                    ${hasEvent(day)
                      ? 'bg-[#2B5F9E] text-white hover:bg-[#1e4570] cursor-pointer shadow-md'
                      : 'bg-[#E8DED0] text-gray-700 hover:bg-[#d4c4b0] cursor-pointer'
                    }
                    ${currentEvent.day === day && currentEvent.month === currentMonth.name && currentEvent.year === currentMonth.year
                      ? 'ring-4 ring-red-500 ring-offset-2'
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
          <div className="bg-white rounded-3xl p-8 shadow-lg relative overflow-hidden min-h-[500px] flex flex-col">
            {/* Event Card */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="border-t-4 border-black pt-4 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-8xl font-bold text-red-600">
                    {String(currentEvent.day).padStart(2, '0')}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{currentEvent.time}</div>
                    <div className="text-sm text-gray-500 uppercase">
                      {currentEvent.month} {currentEvent.year}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentEvent.title}
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  {currentEvent.description}
                </p>

                {/* Type Badge */}
                <div className="inline-block px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold">
                  {currentEvent.type === 'milestone' && 'Hito Importante'}
                  {currentEvent.type === 'phase' && 'Fase de Inscripción'}
                  {currentEvent.type === 'voting' && 'Votación'}
                  {currentEvent.type === 'special' && 'Evento Especial'}
                  {currentEvent.type === 'main-event' && 'Evento Principal'}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-1 mb-6">
                {calendarEvents.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      index === currentEventIndex ? 'bg-[#2B5F9E]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handlePrevEvent}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Evento anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 rounded-full bg-[#2B5F9E] hover:bg-[#1e4570] text-white transition-colors"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNextEvent}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Evento siguiente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Evento {currentEventIndex + 1} de {calendarEvents.length}
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white border-l-4 border-[#2B5F9E] p-6 rounded-r-2xl shadow-md">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center">
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
