'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta con botón de convocatoria
 */
export default function ConvocatoriaButtonCard() {
  return (
    <BentoCard
      backgroundColor={COLORS.cream}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '140px',
        border: '3px solid #D43030',
      }}
    >
      <a
        href="#convocatoria"
        style={{
          display: 'block',
          textDecoration: 'none',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: 'clamp(16px, 2vw, 22px)',
          color: COLORS.black,
          textTransform: 'uppercase',
          lineHeight: 1.3,
        }}>
          Consulta la
          <br />
          convocatoria
          <br />
          <span style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            color: '#D43030',
          }}>
            AQUÍ
          </span>
        </div>
      </a>
    </BentoCard>
  );
}
