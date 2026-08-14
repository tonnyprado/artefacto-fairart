'use client';

import { useEffect, useState } from 'react';
import { useOpinionesStore } from '@/stores/opinionesStore';

/**
 * CardTestimonio - Tarjeta de testimonio dinámico
 *
 * Muestra una opinión aleatoria de los visitantes.
 * Si no hay opiniones, muestra el testimonio por defecto.
 * Incluye animación de fade-in al cargar.
 *
 * DESKTOP VERSION
 *
 * @param {Object} style - Estilos inline (para grid positioning)
 * @param {string} className - Clases CSS adicionales
 */
export default function CardTestimonio({ style, className = '' }) {
  const { opinion, fetchRandomOpinion, isLoading } = useOpinionesStore();
  const [isVisible, setIsVisible] = useState(false);

  // Opinión por defecto
  const defaultOpinion = {
    opinion: 'Para mí, el arte es la forma que toma lo que no cabe en palabras.',
    nombre: 'Fulanito',
    isDefault: true
  };

  useEffect(() => {
    fetchRandomOpinion().then(() => {
      // Trigger fade-in animation
      setTimeout(() => setIsVisible(true), 100);
    });
  }, [fetchRandomOpinion]);

  const displayOpinion = opinion || defaultOpinion;

  return (
    <div
      style={style}
      className={`flex rounded-[2.72cqw] bg-rojo p-[3.6cqw] ${className}`}
    >
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-[3cqw] rounded-[1.36cqw] bg-white/[.31] px-[2cqw] py-[2.5cqw] text-center text-white transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isLoading ? (
          <p className="font-serif italic text-[2cqw]">Cargando...</p>
        ) : (
          <>
            <p className="max-w-[22ch] font-serif italic text-[2.55cqw] leading-[1.25]">
              "{displayOpinion.opinion}"
            </p>
            <p className="text-[2.18cqw] font-bold">{displayOpinion.nombre}</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * CardTestimonioMobile - Versión móvil del testimonio
 *
 * Mismo comportamiento pero con estilos adaptados para móvil.
 *
 * @param {string} className - Clases CSS adicionales
 */
export function CardTestimonioMobile({ className = '' }) {
  const { opinion, fetchRandomOpinion, isLoading } = useOpinionesStore();
  const [isVisible, setIsVisible] = useState(false);

  const defaultOpinion = {
    opinion: 'Para mí, el arte es la forma que toma lo que no cabe en palabras.',
    nombre: 'Fulanito',
    isDefault: true
  };

  useEffect(() => {
    fetchRandomOpinion().then(() => {
      setTimeout(() => setIsVisible(true), 100);
    });
  }, [fetchRandomOpinion]);

  const displayOpinion = opinion || defaultOpinion;

  return (
    <div
      className={`flex aspect-[1235/1401] rounded-[6.7cqw] bg-rojo p-[9.5cqw] ${className}`}
    >
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-[8cqw] rounded-[3.4cqw] bg-white/[.31] px-[5cqw] py-[6cqw] text-center text-white transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isLoading ? (
          <p className="font-serif italic text-[5cqw]">Cargando...</p>
        ) : (
          <>
            <p className="max-w-[22ch] font-serif italic text-[6.3cqw] leading-[1.3]">
              "{displayOpinion.opinion}"
            </p>
            <p className="text-[4.6cqw] font-bold">{displayOpinion.nombre}</p>
          </>
        )}
      </div>
    </div>
  );
}
