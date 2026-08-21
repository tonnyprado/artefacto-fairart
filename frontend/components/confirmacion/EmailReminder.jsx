'use client'

import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el recordatorio de revisar email
 */
export default function EmailReminder({ email }) {
  return (
    <div style={{ marginTop: '32px' }}>
      <p style={{
        fontSize: '16px',
        color: COLORS.black,
        margin: 0,
        fontFamily: FONTS.body,
        fontWeight: 700,
        lineHeight: 1.6,
      }}>
        Importante: Revisa tu correo electrónico (incluyendo spam) en los próximos días.
      </p>
      <p style={{
        fontSize: '15px',
        color: COLORS.black,
        margin: '8px 0 0',
        fontFamily: FONTS.body,
        lineHeight: 1.5,
      }}>
        Te contactaremos al email: <strong style={{ color: COLORS.red }}>{email || 'tu email'}</strong>
      </p>
    </div>
  )
}
