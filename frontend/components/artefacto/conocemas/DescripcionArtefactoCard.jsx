'use client';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta con descripción de ARTEFACTO
 */
export default function DescripcionArtefactoCard() {
  return (
    <BentoCard
      backgroundColor="#D43030"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '220px',
      }}
    >
      <p style={{
        margin: 0,
        fontFamily: FONTS.body,
        fontSize: 'clamp(12px, 1.4vw, 15px)',
        lineHeight: 1.5,
        color: COLORS.cream,
      }}>
        <strong style={{ fontWeight: 700 }}>ARTEFACTO</strong> plantea un modelo híbrido de feria, en
        el que la selección de artistas es resultado de un
        proceso riguroso. El Comité Curatorial de ARTEFACTO
        seleccionará el artista, adquiere un paquete de
        "matrícula" para exponer en su cuerpo de obra personal.
        Cada artista selecto presentará al menos una obra que
        resuelva la muestra en todas las etapas.
      </p>
    </BentoCard>
  );
}
