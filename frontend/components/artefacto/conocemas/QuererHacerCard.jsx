'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta con las 4 preguntas filosóficas
 */
export default function QuererHacerCard() {
  return (
    <BentoCard
      backgroundColor={COLORS.cream}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '200px',
      }}
    >
      <div style={{
        fontFamily: FONTS.highlight,
        fontStyle: 'italic',
        fontSize: 'clamp(20px, 2.5vw, 36px)',
        lineHeight: 1.3,
        color: COLORS.black,
      }}>
        Querer hacer,
        <br />
        poder hacer,
        <br />
        elegir hacer,
        <br />
        saber hacer.
      </div>
    </BentoCard>
  );
}
