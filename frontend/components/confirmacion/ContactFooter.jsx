'use client'

import { COLORS, FONTS } from './constants'

/**
 * Footer con información de contacto
 */
export default function ContactFooter() {
  return (
    <p style={{
      color: COLORS.gray,
      fontSize: '12px',
      fontFamily: FONTS.body,
      margin: 0,
    }}>
      ¿Dudas? Contáctanos:{' '}
      <a
        href="mailto:curatorial@arte-facto.mx"
        style={{
          color: COLORS.red,
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        curatorial@arte-facto.mx
      </a>
    </p>
  )
}
