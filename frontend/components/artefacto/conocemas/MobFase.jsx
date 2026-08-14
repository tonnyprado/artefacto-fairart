/**
 * MobFase - Tarjeta de fase para la versión móvil
 *
 * Versión compacta de la tarjeta de fase para dispositivos móviles.
 * Acepta children para contenido personalizado (fechas, estado).
 *
 * @param {string} numero - Número de fase (I, II, III)
 * @param {string} color - Clase de color de fondo (bg-rojo, bg-azul)
 * @param {ReactNode} children - Contenido adicional de la tarjeta
 */
export default function MobFase({ numero, color, children }) {
  return (
    <div
      className={`flex flex-1 flex-col justify-center rounded-[3.5cqw] px-[3cqw] py-[2.6cqw] text-white ${color}`}
    >
      <p className="flex justify-between text-[4.4cqw] font-bold">
        <span>Fase</span>
        <span>{numero}</span>
      </p>
      {children}
    </div>
  );
}
