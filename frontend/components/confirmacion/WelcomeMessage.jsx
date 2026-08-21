'use client'

import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el mensaje de bienvenida personalizado
 */
export default function WelcomeMessage({ nombre }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontSize: '20px',
        color: COLORS.black,
        fontFamily: FONTS.body,
        marginBottom: '8px',
      }}>
        Hola <strong>{nombre || 'artista'}</strong>,
      </p>
      <p style={{
        fontSize: '16px',
        color: COLORS.gray,
        fontFamily: FONTS.body,
        lineHeight: 1.6,
      }}>
        Tu solicitud ha sido recibida y está siendo revisada por nuestro equipo de curadores.
      </p>
    </div>
  )
}
