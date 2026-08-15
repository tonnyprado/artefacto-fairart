'use client'

import { COLORS, FONTS } from './constants'

const STEPS = [
  'Revisaremos tu portafolio y seleccionaremos a los artistas participantes',
  'Recibirás un correo electrónico con los resultados de la selección',
  'Si eres seleccionado, te enviaremos los detalles de pago y participación',
]

/**
 * Componente para mostrar los pasos siguientes del proceso
 */
export default function NextSteps() {
  return (
    <div style={{
      background: COLORS.cream,
      borderRadius: '16px',
      padding: '24px',
    }}>
      <h3 style={{
        fontWeight: 600,
        color: COLORS.black,
        marginBottom: '20px',
        fontFamily: FONTS.body,
        fontSize: '14px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Siguientes pasos
      </h3>

      <ol style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}>
        {STEPS.map((step, index) => (
          <StepItem key={index} number={index + 1} text={step} />
        ))}
      </ol>
    </div>
  )
}

function StepItem({ number, text }) {
  return (
    <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <span style={{
        flexShrink: 0,
        width: '28px',
        height: '28px',
        background: COLORS.red,
        color: COLORS.white,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        fontFamily: FONTS.body,
      }}>
        {number}
      </span>
      <span style={{
        fontSize: '14px',
        color: COLORS.black,
        fontFamily: FONTS.body,
        lineHeight: 1.5,
        paddingTop: '4px',
      }}>
        {text}
      </span>
    </li>
  )
}
