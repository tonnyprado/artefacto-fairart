'use client';

import { PHOTOS } from './content';

/**
 * PhotoRail - Columna derecha de fotos
 * Fija en el viewport, su track se traslada más rápido que el scroll
 */
export default function PhotoRail({ trackRef, navbarHeight = 80 }) {
  return (
    <div
      data-rail
      className="fixed right-0 bottom-0 z-[1] w-[39.5vw] overflow-hidden"
      style={{ top: `${navbarHeight}px` }}
    >
      <div
        ref={trackRef}
        className="flex flex-col pt-[88vh] will-change-transform"
      >
        {PHOTOS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="block w-full"
            loading={i < 3 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  );
}
