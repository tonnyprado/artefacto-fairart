/**
 * Foto - Tarjeta de imagen con object-cover y esquinas redondeadas
 *
 * Componente reutilizable para mostrar imágenes en el grid de CONOCE MÁS.
 * Soporta posicionamiento via style prop para grid positioning.
 *
 * @param {string} src - Ruta de la imagen
 * @param {string} alt - Texto alternativo
 * @param {Object} style - Estilos inline (usado para grid positioning)
 * @param {string} className - Clases CSS adicionales
 */
export default function Foto({ src, alt, style, className = '' }) {
  return (
    <div style={style} className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
