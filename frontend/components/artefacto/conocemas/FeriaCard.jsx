'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta de información de la feria
 */
export default function FeriaCard() {
  return (
    <BentoCard
      backgroundColor="#D43030"
      className="feria-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '220px',
      }}
    >
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: FONTS.displayWeight,
        fontStyle: FONTS.displayStyle,
        fontSize: 'clamp(16px, 2vw, 22px)',
        color: COLORS.cream,
        textTransform: 'uppercase',
        lineHeight: 1.2,
      }}>
        Feria de arte
        <br />
        <span style={{ fontStyle: 'normal', fontWeight: 600 }}>Edición II</span>
        <br />
        <span style={{ fontWeight: 700 }}>Semana</span>
        <br />
        del arte
        <br />
        <span style={{ fontFamily: FONTS.highlight, fontStyle: 'italic', fontSize: 'clamp(14px, 1.8vw, 20px)' }}>
          Ciudad de
          <br />
          México
        </span>
      </div>
      <div style={{
        marginTop: '16px',
        fontFamily: FONTS.display,
        fontWeight: 900,
        fontSize: 'clamp(20px, 2.5vw, 32px)',
        color: COLORS.cream,
      }}>
        4 - 7
        <br />
        febrero 2027
      </div>
    </BentoCard>
  );
}
