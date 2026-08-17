'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  body: 'acumin-pro, sans-serif',
}

/**
 * SidebarPanel - Panel lateral colapsable con chevron
 * Reutilizable para ambos lados del canvas (izquierda/derecha)
 *
 * @param {string} position - 'left' | 'right'
 * @param {string} title - Título del panel
 * @param {boolean} defaultOpen - Estado inicial
 * @param {ReactNode} children - Contenido del panel
 * @param {string} width - Ancho cuando está abierto (default: '320px')
 */
export default function SidebarPanel({
  position = 'right',
  title,
  defaultOpen = false,
  children,
  width = '320px'
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const isLeft = position === 'left'
  const ChevronIcon = isLeft
    ? (isOpen ? ChevronLeft : ChevronRight)
    : (isOpen ? ChevronRight : ChevronLeft)

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: isLeft ? 'row' : 'row-reverse',
      alignItems: 'stretch',
      height: '100%',
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '40px',
          minWidth: '40px',
          background: COLORS.black,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          borderRadius: isLeft ? '0 12px 12px 0' : '12px 0 0 12px',
          zIndex: 10,
        }}
        onMouseEnter={(e) => e.target.style.background = COLORS.red}
        onMouseLeave={(e) => e.target.style.background = COLORS.black}
        title={isOpen ? 'Cerrar panel' : 'Abrir panel'}
      >
        <ChevronIcon size={24} color={COLORS.cream} />
      </button>

      {/* Panel Content */}
      <div style={{
        width: isOpen ? width : '0px',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        background: COLORS.cream,
        borderRadius: isLeft ? '12px 0 0 12px' : '0 12px 12px 0',
      }}>
        <div style={{
          width: width,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${COLORS.creamDark}`,
            background: COLORS.cream,
          }}>
            <h3 style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '18px',
              color: COLORS.black,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {title}
            </h3>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
