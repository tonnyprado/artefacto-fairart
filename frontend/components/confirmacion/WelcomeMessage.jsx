'use client'

import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el mensaje de bienvenida personalizado
 */
export default function WelcomeMessage({ nombre }) {
  return (
    <div>
      <p style={{
        fontSize: '18px',
        color: COLORS.black,
        fontFamily: FONTS.body,
        marginBottom: '6px',
      }}>
        Hola <strong>{nombre || 'artista'}</strong>,
      </p>
      <p style={{
        fontSize: '15px',
        color: COLORS.gray,
        fontFamily: FONTS.body,
        lineHeight: 1.5,
        margin: 0,
      }}>
        Tu solicitud ha sido recibida y está siendo revisada por nuestro equipo de curadores.
      </p>
    </div>
  )
}
