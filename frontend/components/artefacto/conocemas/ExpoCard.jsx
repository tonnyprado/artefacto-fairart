'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta de exposición con curaduría
 */
export default function ExpoCard() {
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
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: FONTS.displayWeight,
        fontStyle: FONTS.displayStyle,
        fontSize: 'clamp(16px, 2vw, 24px)',
        lineHeight: 1.3,
        color: COLORS.cream,
        textTransform: 'uppercase',
      }}>
        Exposición con curaduría &
        <br />
        museografía
        <br />
        rigurosa
      </div>
      <p style={{
        margin: '12px 0 0',
        fontFamily: FONTS.highlight,
        fontStyle: 'italic',
        fontSize: 'clamp(12px, 1.5vw, 16px)',
        color: COLORS.cream,
        lineHeight: 1.4,
      }}>
        Generada por un comité curatorial,
        e.g., la largo de una convocatoria
        abierta de 3 fases, extendiéndose
        desde agosto a noviembre de 2026.
      </p>
    </BentoCard>
  );
}
