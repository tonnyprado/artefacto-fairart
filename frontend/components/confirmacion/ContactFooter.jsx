'use client'

import { COLORS, FONTS } from './constants'

/**
 * Footer con información de contacto
 */
export default function ContactFooter() {
  return (
    <p style={{
      textAlign: 'center',
      color: COLORS.gray,
      fontSize: '14px',
      fontFamily: FONTS.body,
      margin: 0,
    }}>
      ¿Tienes dudas? Contáctanos en{' '}
      <a
        href="mailto:contacto@artefact.mx"
        style={{
          color: COLORS.red,
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        contacto@artefact.mx
      </a>
    </p>
  )
}
