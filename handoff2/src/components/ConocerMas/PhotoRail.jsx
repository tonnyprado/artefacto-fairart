import { PHOTOS } from '../../data/content';

// Columna derecha de fotos: fija, su track se traslada más rápido que el scroll
export default function PhotoRail({ trackRef }) {
  return (
    <div data-rail className="fixed top-0 right-0 bottom-0 z-[1] w-[39.5vw] overflow-hidden">
      <div ref={trackRef} className="flex flex-col pt-[88vh] will-change-transform">
        {PHOTOS.map((src, i) => (
          <img key={i} src={src} alt="" className="block w-full" />
        ))}
      </div>
    </div>
  );
}
