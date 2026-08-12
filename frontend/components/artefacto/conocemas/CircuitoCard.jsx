'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta de cercanía en el circuito
 */
export default function CircuitoCard() {
  return (
    <BentoCard
      backgroundColor="#4169E1"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '180px',
      }}
    >
      <p style={{
        margin: 0,
        fontFamily: FONTS.body,
        fontSize: 'clamp(13px, 1.5vw, 16px)',
        lineHeight: 1.4,
        color: COLORS.cream,
      }}>
        Gran cercanía en el circuito.
        <br />
        <strong style={{ fontWeight: 700 }}>Estación Indianilla,</strong>
        <br />
        <span style={{ fontFamily: FONTS.highlight, fontStyle: 'italic' }}>
          A 15 minutos caminando de
          <br />
          otras eventos y galerías.
        </span>
      </p>
    </BentoCard>
  );
}
