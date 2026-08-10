'use client'

import { useEffect } from 'react'
import { useFasesStore } from '@/stores/fasesStore'

/**
 * Banner que muestra la fase/concurso activo
 * Se muestra cuando hay inscripciones o votaciones abiertas
 */
export default function ActivePhaseBanner() {
  const { fases, fetchFases } = useFasesStore()

  useEffect(() => {
    // Fetch fases al montar el componente
    fetchFases()
  }, [fetchFases])

  // Buscar fase con inscripciones o votaciones abiertas
  const faseConInscripcionesAbiertas = fases.find(
    f => f.inscripciones_abiertas && !f.finalizada
  )
  const faseConVotacionesAbiertas = fases.find(
    f => f.votaciones_abiertas && !f.finalizada
  )

  // Determinar qué mostrar (prioridad a inscripciones)
  const faseActiva = faseConInscripcionesAbiertas || faseConVotacionesAbiertas
  if (!faseActiva) return null

  // Determinar el texto del banner
  const esInscripcion = faseConInscripcionesAbiertas !== undefined
  const esConcurso = faseActiva.tipo === 'concurso'

  let bannerText = ''
  if (esInscripcion) {
    if (esConcurso) {
      bannerText = 'INSCRIPCIONES CONCURSO FINAL ABIERTAS'
    } else {
      bannerText = `INSCRIPCIONES FASE ${faseActiva.numero_fase} ABIERTAS`
    }
  } else {
    if (esConcurso) {
      bannerText = 'VOTACIONES CONCURSO FINAL EN MARCHA'
    } else {
      bannerText = `VOTACIONES FASE ${faseActiva.numero_fase} EN MARCHA`
    }
  }

  return (
    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-full mb-6 shadow-lg animate-pulse">
      <svg
        className="w-5 h-5 mr-2 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-white text-sm md:text-base font-bold tracking-wider">
        {bannerText}
      </span>
    </div>
  )
}
