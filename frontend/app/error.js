'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { COLORS, FONTS } from '@/components/artefacto/theme'

/**
 * Error Boundary de Next.js
 *
 * Captura errores no manejados en la aplicación y los reporta al sistema de analytics
 * Este componente se muestra automáticamente cuando ocurre un error en la app
 */
export default function Error({ error, reset }) {
  const { trackError } = useAnalytics()

  useEffect(() => {
    // Track error en sistema de analytics
    trackError(error?.message || 'Unknown error', 'uncaught_exception', {
      stack: error?.stack,
      componentStack: error?.digest,
      error_name: error?.name
    })

    // Log en consola para debugging
    console.error('❌ Error capturado por Error Boundary:', error)
  }, [error, trackError])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          textAlign: 'center',
        }}
      >
        {/* Icono de error */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: `${COLORS.red}20`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.red}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Título */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 5vw, 32px)',
            color: COLORS.black,
            marginBottom: '16px',
            letterSpacing: '0.02em',
          }}
        >
          Algo salió mal
        </h1>

        {/* Mensaje */}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: '16px',
            color: COLORS.gray,
            lineHeight: '1.6',
            marginBottom: '32px',
          }}
        >
          Lo sentimos, ocurrió un error inesperado.
          Hemos registrado el problema y trabajaremos para solucionarlo.
        </p>

        {/* Detalles técnicos (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div
            style={{
              backgroundColor: `${COLORS.red}10`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '32px',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: COLORS.red,
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {error.message}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: COLORS.red,
              color: COLORS.cream,
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: FONTS.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(184, 48, 48, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Intentar de nuevo
          </button>

          <a
            href="/"
            style={{
              backgroundColor: 'transparent',
              color: COLORS.black,
              border: `2px solid ${COLORS.creamDark}`,
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: FONTS.body,
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = COLORS.black
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = COLORS.creamDark
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
