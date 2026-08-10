'use client'

import { useState, useEffect } from 'react'
import { usePageTransition } from '@/components/artefacto/TransitionLink'

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  displayWeight: 600,
  displayStyle: 'italic',
  body: 'acumin-pro, sans-serif',
  bodyWeight: 400,
}

/**
 * Componente que bloquea el acceso desde dispositivos móviles
 * Solo permite acceso desde pantallas mayores a 1024px (tablets/desktop)
 */
export default function MobileBlocker({ children }) {
  const transition = usePageTransition()
  const [isMobile, setIsMobile] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkScreenSize = () => {
      // Consideramos móvil cualquier pantalla menor a 1024px
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setIsChecking(false)
    }

    // Check inicial
    checkScreenSize()

    // Listener para cambios de tamaño
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Mientras está verificando, mostrar loading
  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `4px solid ${COLORS.red}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Si es móvil, mostrar pantalla de bloqueo
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.red,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decoración de fondo */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 80,
          height: 80,
          opacity: 0.1,
        }}>
          <img src="/assets/glyph-x-white.svg" alt="" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 100,
          height: 100,
          opacity: 0.1,
        }}>
          <img src="/assets/glyph-e-white.svg" alt="" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Contenido */}
        <div style={{
          maxWidth: 500,
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Icono de computadora */}
          <div style={{
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <svg
              style={{
                width: 80,
                height: 80,
                color: COLORS.cream
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Título */}
          <h1 style={{
            margin: '0 0 24px',
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(32px, 8vw, 48px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            lineHeight: 1.2
          }}>
            Registro solo desde Computadora
          </h1>

          {/* Descripción */}
          <p style={{
            margin: '0 0 32px',
            fontSize: 'clamp(16px, 4vw, 18px)',
            lineHeight: 1.7,
            color: COLORS.cream,
            fontFamily: FONTS.body,
            fontWeight: 400,
            opacity: 0.95
          }}>
            Para garantizar la mejor experiencia al crear tu lienzo y subir tu portafolio,
            el registro de artistas debe realizarse desde una <strong>computadora de escritorio o laptop</strong>.
          </p>

          {/* Info adicional */}
          <div style={{
            background: 'rgba(244, 237, 228, 0.1)',
            padding: '20px 24px',
            borderRadius: '16px',
            marginBottom: 32,
            border: `1px solid rgba(244, 237, 228, 0.2)`
          }}>
            <p style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
              color: COLORS.cream,
              fontFamily: FONTS.body,
              fontWeight: 400
            }}>
              💡 <strong>Consejo:</strong> Abre este enlace en tu computadora para continuar con tu registro.
              Puedes enviarte el link por correo o guardarlo en marcadores.
            </p>
          </div>

          {/* Botón volver */}
          <button
            onClick={() => transition.navigateTo('/#convocatoria', { color: COLORS.red })}
            style={{
              display: 'inline-block',
              background: COLORS.cream,
              color: COLORS.black,
              padding: '16px 32px',
              border: 'none',
              borderRadius: '16px',
              fontFamily: FONTS.body,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = COLORS.creamDark
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = COLORS.cream
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            Volver a Convocatoria
          </button>
        </div>
      </div>
    )
  }

  // Si NO es móvil, mostrar el contenido normal (formulario)
  return <>{children}</>
}
