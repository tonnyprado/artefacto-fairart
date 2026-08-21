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
    <div>
      <h3 style={{
        fontWeight: 600,
        color: COLORS.black,
        marginBottom: '12px',
        fontFamily: FONTS.body,
        fontSize: '13px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Siguientes pasos
      </h3>

      <ol style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
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
    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{
        flexShrink: 0,
        width: '24px',
        height: '24px',
        background: COLORS.red,
        color: COLORS.white,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: FONTS.body,
      }}>
        {number}
      </span>
      <span style={{
        fontSize: '13px',
        color: COLORS.black,
        fontFamily: FONTS.body,
        lineHeight: 1.4,
        paddingTop: '3px',
      }}>
        {text}
      </span>
    </li>
  )
}
