'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta con cita
 */
export default function QuoteCard() {
  return (
    <BentoCard
      backgroundColor="rgba(216, 112, 112, 0.5)"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '200px',
      }}
    >
      <p style={{
        margin: '0 0 16px',
        fontFamily: FONTS.highlight,
        fontStyle: 'italic',
        fontSize: 'clamp(16px, 2vw, 24px)',
        lineHeight: 1.4,
        color: COLORS.cream,
      }}>
        "Para mí, el arte es la
        <br />
        forma que toma lo que
        <br />
        no cabe en palabras."
      </p>
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: 'clamp(18px, 2.2vw, 28px)',
        color: COLORS.cream,
        textTransform: 'uppercase',
      }}>
        Fulanito
      </div>
    </BentoCard>
  );
}
