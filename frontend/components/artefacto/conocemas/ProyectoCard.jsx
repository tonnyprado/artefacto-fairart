'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta de descripción del proyecto cultural
 */
export default function ProyectoCard() {
  return (
    <BentoCard
      backgroundColor={COLORS.cream}
      borderRadius="20px"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '200px',
      }}
    >
      <p style={{
        margin: 0,
        fontFamily: FONTS.body,
        fontSize: 'clamp(13px, 1.5vw, 16px)',
        lineHeight: 1.5,
        color: COLORS.black,
      }}>
        Es un proyecto cultural que fomenta las
        disciplinas creativas, dónde nos alejamos
        del elitismo y planteamientos superficiales
        de las artes universales.
        <br /><br />
        Aquí nos planteamos:
        <br />
        ¿Qué significa hacer en el
        contexto cultural de hoy?
      </p>
    </BentoCard>
  );
}
