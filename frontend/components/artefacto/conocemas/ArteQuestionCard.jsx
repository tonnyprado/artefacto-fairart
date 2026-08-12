'use client';
import { useState } from 'react';
import BentoCard from './BentoCard';
import { COLORS, FONTS } from '../theme';

/**
 * Tarjeta interactiva "Para ti, ¿qué es arte?"
 */
export default function ArteQuestionCard() {
  const [nombre, setNombre] = useState('');

  return (
    <BentoCard
      backgroundColor="#4169E1"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        minHeight: '160px',
      }}
    >
      <div style={{
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: 'clamp(16px, 2vw, 22px)',
        color: COLORS.cream,
        textAlign: 'center',
        textTransform: 'uppercase',
      }}>
        Para ti, ¿qué es arte?
      </div>
      <div style={{
        fontFamily: FONTS.highlight,
        fontStyle: 'italic',
        fontSize: 'clamp(13px, 1.5vw, 16px)',
        color: COLORS.cream,
        textAlign: 'center',
      }}>
        Compártenos tu opinión
      </div>
      <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Para mí el arte..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '25px',
            border: 'none',
            fontFamily: FONTS.body,
            fontSize: 'clamp(12px, 1.3vw, 14px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: COLORS.black,
          }}
        />
        <input
          type="text"
          placeholder="Tu nombre"
          style={{
            width: '120px',
            padding: '10px 16px',
            borderRadius: '25px',
            border: 'none',
            fontFamily: FONTS.body,
            fontSize: 'clamp(12px, 1.3vw, 14px)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            color: COLORS.cream,
            '::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />
      </div>
    </BentoCard>
  );
}
