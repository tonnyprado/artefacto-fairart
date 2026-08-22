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
      }}>
        <div style={{
          maxWidth: 340,
          textAlign: 'center',
        }}>
          {/* Título con línea blanca */}
          <h1 style={{
            margin: '0 0 12px',
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 22,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            lineHeight: 1.3,
            paddingBottom: 16,
            borderBottom: `1px solid ${COLORS.cream}`,
          }}>
            Registro solo desde computadora
          </h1>

          {/* Descripción simplificada */}
          <p style={{
            margin: '20px 0 28px',
            fontSize: 14,
            lineHeight: 1.6,
            color: COLORS.cream,
            fontFamily: FONTS.body,
            opacity: 0.9
          }}>
            Para crear tu lienzo y subir tu portafolio, accede desde una computadora.
          </p>

          {/* Botón volver */}
          <button
            onClick={() => transition.navigateTo('/#convocatoria', { color: COLORS.red })}
            style={{
              display: 'inline-block',
              background: COLORS.cream,
              color: COLORS.black,
              padding: '14px 28px',
              border: 'none',
              borderRadius: '12px',
              fontFamily: FONTS.body,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // Si NO es móvil, mostrar el contenido normal (formulario)
  return <>{children}</>
}
