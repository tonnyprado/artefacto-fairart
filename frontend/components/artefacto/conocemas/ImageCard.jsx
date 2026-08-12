'use client';
import BentoCard from './BentoCard';

/**
 * Tarjeta con imagen de fondo
 */
export default function ImageCard({ src, alt = '', gridColumn, gridRow }) {
  return (
    <BentoCard
      backgroundColor="transparent"
      padding="0"
      gridColumn={gridColumn}
      gridRow={gridRow}
      style={{
        position: 'relative',
        minHeight: '250px',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '20px',
        }}
      />
    </BentoCard>
  );
}
