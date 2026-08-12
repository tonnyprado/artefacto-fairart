'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta del logo ARTEFACTO
 */
export default function LogoCard() {
  return (
    <BentoCard
      backgroundColor="#D43030"
      className="logo-card"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '180px',
      }}
    >
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: 900,
        fontSize: 'clamp(40px, 5vw, 80px)',
        color: COLORS.black,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        lineHeight: 0.9,
      }}>
        ARTE
        <br />
        FACTO
      </div>
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '24px',
        fontFamily: FONTS.body,
        fontSize: 'clamp(10px, 1vw, 14px)',
        color: COLORS.black,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        ÉTICAS CREATIVAS
      </div>
    </BentoCard>
  );
}
