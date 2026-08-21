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

  // Mapeo inverso de índice a nombre de mes
  const monthIndexToName = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Fecha actual
  const today = new Date()
  const todayDay = today.getDate()
  const todayMonthName = monthIndexToName[today.getMonth()]
  const todayYear = today.getFullYear()

  // Encontrar el índice del mes actual en la lista
  const todayMonthIndex = months.findIndex(
    m => m.name === todayMonthName && m.year === todayYear
  )

  // Encontrar el índice del mes del primer evento
  const firstEvent = calendarEvents[0]
  const initialMonthIndex = months.findIndex(
    m => m.name === firstEvent.month && m.year === firstEvent.year
  )

  // Si la fecha actual está dentro del rango de meses, usar esa; sino, usar el primer evento
  const startMonthIndex = todayMonthIndex >= 0 ? todayMonthIndex : (initialMonthIndex >= 0 ? initialMonthIndex : 0)

  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(startMonthIndex)

  // Auto-play cada 5 segundos
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % calendarEvents.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, calendarEvents.length])

  // Sincronizar el calendario con el evento actual
  useEffect(() => {
    const currentEvent = calendarEvents[currentEventIndex]
    if (currentEvent) {
      // Encontrar el índice del mes del evento actual
      const monthIndex = months.findIndex(
        m => m.name === currentEvent.month && m.year === currentEvent.year
      )
      if (monthIndex !== -1 && monthIndex !== selectedMonth) {
        setSelectedMonth(monthIndex)
      }
    }
  }, [currentEventIndex, calendarEvents, months, selectedMonth])

  // Mapeo de nombres de meses a índices (0-11)
  const monthNameToIndex = {
    'Enero': 0,
    'Febrero': 1,
    'Marzo': 2,
    'Abril': 3,
    'Mayo': 4,
    'Junio': 5,
    'Julio': 6,
    'Agosto': 7,
    'Septiembre': 8,
    'Octubre': 9,
    'Noviembre': 10,
    'Diciembre': 11
  }

  // Generar días del mes
  const getDaysInMonth = (monthName, year) => {
    const monthIndex = monthNameToIndex[monthName]
    return new Date(year, monthIndex + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (monthName, year) => {
    const monthIndex = monthNameToIndex[monthName]
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

  // Verificar si un día es "hoy"
  const isToday = (day) => {
    return day === todayDay &&
           currentMonth.name === todayMonthName &&
           currentMonth.year === todayYear
  }

  // Ir a "Hoy"
  const goToToday = () => {
    if (todayMonthIndex >= 0) {
      setSelectedMonth(todayMonthIndex)
      setIsPlaying(false)

      // Buscar un evento en el mes actual, si existe
      const eventInCurrentMonth = calendarEvents.findIndex(
        event => event.month === todayMonthName && event.year === todayYear
      )
      if (eventInCurrentMonth !== -1) {
        setCurrentEventIndex(eventInCurrentMonth)
      }
    }
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

  // Verificar si el día está seleccionado (es el evento actual)
  const isSelected = (day) => {
    return currentEvent.day === day &&
           currentEvent.month === currentMonth.name &&
           currentEvent.year === currentMonth.year
  }

  return (
    <section id="calendario" className="pt-16 pb-8 bg-[#E8DED0] min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        {/* Main Content: Calendar + Event Display */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT: Calendar - Sin card, flotante - altura fija para evitar saltos */}
          <div className="p-4" style={{ minHeight: '420px' }}>
            {/* Month Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                disabled={selectedMonth === 0}
                className="p-2 hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#141210] uppercase tracking-wider">
                  {currentMonth.name}
                </h3>
                <p className="text-5xl font-bold text-[#141210] mt-1">
                  {currentMonth.year}
                </p>
              </div>

              <button
                onClick={() => setSelectedMonth(Math.min(months.length - 1, selectedMonth + 1))}
                disabled={selectedMonth === months.length - 1}
                className="p-2 hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Botón Hoy */}
            {todayMonthIndex >= 0 && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={goToToday}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                    selectedMonth === todayMonthIndex
                      ? 'bg-[#141210] text-white'
                      : 'bg-transparent border-2 border-[#141210] text-[#141210] hover:bg-[#141210] hover:text-white'
                  }`}
                >
                  Hoy
                </button>
              </div>
            )}

            {/* Days of Week Header - Card lineal */}
            <div className="bg-[#141210] rounded-full px-4 py-2 mb-4">
              <div className="grid grid-cols-7 gap-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center"
                  >
                    <span className="text-[#f4ede4] font-bold text-sm">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Grid - Números flotantes, solo círculo en seleccionado */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <button
                  key={`${currentMonth.name}-${currentMonth.year}-${index}`}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                  className={`
                    aspect-square flex items-center justify-center text-base font-bold
                    ${!day ? 'invisible' : ''}
                    ${isSelected(day)
                      ? 'bg-[#b83030] text-white rounded-full'
                      : isToday(day)
                        ? 'bg-[#2563EB] text-white rounded-full'
                        : hasEvent(day)
                          ? 'text-[#b83030] hover:bg-black/10 rounded-full cursor-pointer font-extrabold'
                          : 'text-[#141210] hover:bg-black/5 rounded-full cursor-pointer'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Event Display */}
          <div className="bg-white/80 backdrop-blur-sm p-6 shadow-lg relative flex flex-col" style={{ borderRadius: '20px' }}>
            {/* Event Card */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="border-t-4 border-[#141210] pt-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-6xl font-bold text-[#b83030] leading-none">
                    {String(currentEvent.day).padStart(2, '0')}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{currentEvent.time}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                      {currentEvent.month} {currentEvent.year}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {currentEvent.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {currentEvent.description}
                </p>

                {/* Type Badge */}
                <div className="inline-block px-3 py-1 bg-[#141210] text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                  {currentEvent.type === 'milestone' && 'Hito Importante'}
                  {currentEvent.type === 'phase' && 'Fase de Inscripción'}
                  {currentEvent.type === 'voting' && 'Votación'}
                  {currentEvent.type === 'special' && 'Evento Especial'}
                  {currentEvent.type === 'important' && 'Importante'}
                  {currentEvent.type === 'main-event' && 'Evento Principal'}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-1 mb-4">
                {calendarEvents.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      index === currentEventIndex ? 'bg-[#b83030]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={handlePrevEvent}
                className="p-2 hover:bg-gray-100 transition-colors rounded-full"
                aria-label="Evento anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-[#b83030] hover:bg-[#9a2828] text-white transition-colors rounded-full"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNextEvent}
                className="p-2 hover:bg-gray-100 transition-colors rounded-full"
                aria-label="Evento siguiente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-center mt-3 text-xs text-gray-500 font-medium">
              Evento {currentEventIndex + 1} de {calendarEvents.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
