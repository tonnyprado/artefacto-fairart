'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useFasesStore } from '@/stores/fasesStore'
import { COLORS } from '../artefacto/theme'

/**
 * FloatingRegistrationButton - Botón flotante de registro
 *
 * - Aparece en toda la plataforma excepto en admin y registro
 * - Solo se muestra cuando hay una fase con inscripciones abiertas
 * - Diseño similar a botones de chatbot
 * - Fixed position en la esquina inferior derecha
 */
export default function FloatingRegistrationButton() {
  const pathname = usePathname()
  const { fases, fetchFases, getFaseConInscripcionesAbiertas } = useFasesStore()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Fetch fases on mount
  useEffect(() => {
    fetchFases()
  }, [fetchFases])

  // Determinar si mostrar el botón
  useEffect(() => {
    // No mostrar en admin ni en registro
    const isAdminPage = pathname?.startsWith('/admin')
    const isRegistroPage = pathname?.startsWith('/registro')
    const isCuradorPage = pathname?.startsWith('/curador')

    // Verificar si hay fase activa con inscripciones abiertas
    const faseActiva = getFaseConInscripcionesAbiertas()

    setIsVisible(!isAdminPage && !isRegistroPage && !isCuradorPage && !!faseActiva)
  }, [pathname, fases, getFaseConInscripcionesAbiertas])

  if (!isVisible) return null

  const faseActiva = getFaseConInscripcionesAbiertas()

  return (
    <div
      className="fixed z-50 transition-all duration-300 ease-out"
      style={{
        bottom: isHovered ? '28px' : '24px',
        right: isHovered ? '28px' : '24px',
      }}
    >
      <a
        href="/registro"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center gap-3 shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: COLORS.red,
          borderRadius: '50px',
          padding: isHovered ? '16px 24px' : '16px',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Icono de registro */}
        <div
          className="flex items-center justify-center transition-all duration-300"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'white',
            borderRadius: '50%',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.red}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300"
            style={{
              transform: isHovered ? 'rotate(0deg)' : 'rotate(-10deg)',
            }}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        {/* Texto expandible en hover */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxWidth: isHovered ? '200px' : '0px',
            opacity: isHovered ? 1 : 0,
          }}
        >
          <div className="whitespace-nowrap" style={{ color: COLORS.cream }}>
            <p className="font-bold text-lg leading-tight">¡Regístrate!</p>
            <p className="text-xs font-medium opacity-90">
              {faseActiva?.nombre || 'Inscripciones abiertas'}
            </p>
          </div>
        </div>

        {/* Indicador de pulso */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            backgroundColor: COLORS.red,
            opacity: 0.3,
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      </a>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.15;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
