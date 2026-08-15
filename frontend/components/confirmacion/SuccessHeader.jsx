'use client'

import { COLORS, FONTS } from './constants'

/**
 * Header de la página de confirmación con icono de éxito y título
 */
export default function SuccessHeader() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <SuccessIcon />

      <h1 style={{
        margin: '0 0 12px',
        fontFamily: FONTS.display,
        fontWeight: 600,
        fontStyle: 'italic',
        fontSize: 'clamp(28px, 5vw, 40px)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: COLORS.black,
      }}>
        Registro Exitoso
      </h1>

      <p style={{
        margin: 0,
        fontSize: '16px',
        color: COLORS.gray,
        fontFamily: FONTS.body,
        fontWeight: 500,
      }}>
        Gracias por tu interés en ARTEFACTO 2027
      </p>
    </div>
  )
}

function SuccessIcon() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      background: COLORS.greenLight,
      borderRadius: '50%',
      marginBottom: '24px',
    }}>
      <svg
        style={{ width: '40px', height: '40px', color: COLORS.green }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  )
}
