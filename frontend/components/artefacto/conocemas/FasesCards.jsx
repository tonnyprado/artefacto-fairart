'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjetas de fases individuales
 */
function FaseCard({ fase, fecha, apertura }) {
  return (
    <BentoCard
      backgroundColor={fase === 'I' ? '#D43030' : '#4169E1'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '140px',
        padding: '20px',
      }}
    >
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: 900,
        fontSize: 'clamp(24px, 3vw, 36px)',
        color: COLORS.cream,
        marginBottom: '8px',
      }}>
        Fase
        <br />
        {fase}
      </div>
      <div style={{
        fontFamily: FONTS.body,
        fontSize: 'clamp(11px, 1.2vw, 13px)',
        color: COLORS.cream,
        lineHeight: 1.3,
      }}>
        Del {fecha}
        <br />
        Apertura
        <br />
        {apertura}
      </div>
    </BentoCard>
  );
}

export function FaseOneCard() {
  return <FaseCard fase="I" fecha="15-31" apertura="próximamente" />;
}

export function FaseTwoCard() {
  return <FaseCard fase="II" fecha="1 oct al 15" apertura="próximamente" />;
}

export function FaseThreeCard() {
  return <FaseCard fase="III" fecha="1 oct al 15" apertura="próximamente" />;
}
