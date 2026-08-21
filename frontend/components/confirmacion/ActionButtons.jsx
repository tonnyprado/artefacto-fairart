'use client'

import Link from 'next/link'
import { COLORS, FONTS } from './constants'

/**
 * Botones de acción para la página de confirmación
 */
export default function ActionButtons() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '24px',
      justifyContent: 'center',
    }}>
      <Link
        href="/"
        style={{
          padding: '16px 32px',
          background: COLORS.black,
          color: COLORS.cream,
          borderRadius: '16px',
          textDecoration: 'none',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '14px',
          fontFamily: FONTS.body,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'background 0.2s',
        }}
      >
        Volver al Inicio
      </Link>

      <button
        onClick={() => window.print()}
        style={{
          padding: '16px 32px',
          background: COLORS.cream,
          color: COLORS.black,
          border: 'none',
          borderRadius: '16px',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '14px',
          fontFamily: FONTS.body,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        Imprimir Folio
      </button>
    </div>
  )
}
