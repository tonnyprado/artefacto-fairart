'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta de paquetes para artistas
 */
export default function PaquetesCard() {
  return (
    <BentoCard
      backgroundColor={COLORS.cream}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '140px',
      }}
    >
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: 900,
        fontSize: 'clamp(14px, 1.6vw, 18px)',
        color: '#D43030',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        Paquetes
        <br />
        para artistas
        <br />
        desde:
      </div>
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: 900,
        fontSize: 'clamp(24px, 3vw, 40px)',
        color: COLORS.black,
      }}>
        5,200
        <span style={{ fontSize: 'clamp(14px, 1.8vw, 20px)', verticalAlign: 'super' }}>MXN</span>
      </div>
    </BentoCard>
  );
}
