'use client'

import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el folio de registro
 * Diseño destacado con gradiente y tipografía monospace
 */
export default function FolioDisplay({ folio }) {
  return (
    <div style={{
      background: COLORS.black,
      borderRadius: '16px',
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      <p style={{
        color: COLORS.grayLight,
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '12px',
        fontFamily: FONTS.body,
      }}>
        Tu folio de registro
      </p>

      <p style={{
        color: COLORS.cream,
        fontSize: 'clamp(32px, 6vw, 48px)',
        fontWeight: 700,
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
        margin: 0,
        lineHeight: 1.2,
      }}>
        {folio || 'ART-2027-XXX'}
      </p>

      <p style={{
        color: COLORS.gray,
        fontSize: '13px',
        marginTop: '16px',
        fontFamily: FONTS.body,
      }}>
        Guarda este folio para dar seguimiento a tu solicitud
      </p>
    </div>
  )
}
