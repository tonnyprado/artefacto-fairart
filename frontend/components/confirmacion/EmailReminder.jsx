'use client'

import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el recordatorio de revisar email
 */
export default function EmailReminder({ email }) {
  return (
    <div style={{
      marginTop: '32px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '18px',
        color: COLORS.black,
        margin: 0,
        fontFamily: FONTS.body,
        fontWeight: 700,
        lineHeight: 1.7,
      }}>
        Importante: Revisa tu correo electrónico (incluyendo spam) en los próximos días.
      </p>
      <p style={{
        fontSize: '16px',
        color: COLORS.black,
        margin: '12px 0 0',
        fontFamily: FONTS.body,
        lineHeight: 1.6,
      }}>
        Te contactaremos al email: <strong style={{ color: COLORS.red }}>{email || 'tu email'}</strong>
      </p>
    </div>
  )
}
