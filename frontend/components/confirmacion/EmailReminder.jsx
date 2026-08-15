'use client'

import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el recordatorio de revisar email
 */
export default function EmailReminder({ email }) {
  return (
    <div style={{
      marginTop: '24px',
      padding: '16px 20px',
      background: COLORS.creamDark,
      borderRadius: '12px',
      borderLeft: `4px solid ${COLORS.red}`,
    }}>
      <p style={{
        fontSize: '13px',
        color: COLORS.black,
        margin: 0,
        fontFamily: FONTS.body,
        lineHeight: 1.6,
      }}>
        <strong>Importante:</strong> Revisa tu correo electrónico (incluyendo spam) en los próximos días.
        Te contactaremos al email: <strong>{email || 'tu email'}</strong>
      </p>
    </div>
  )
}
