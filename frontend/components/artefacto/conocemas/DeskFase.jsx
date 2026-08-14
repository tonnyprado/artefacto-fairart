import { g } from './gridHelper';

/**
 * DeskFase - Tarjeta de fase para la versión desktop
 *
 * Muestra información de cada fase de la convocatoria.
 * Cuando está abierta, se muestra en rojo con enlace de registro.
 * Cuando está cerrada, se muestra en azul con "Apertura próximamente".
 *
 * @param {number} col - Número de columna en el grid (1-5)
 * @param {string} numero - Número de fase (I, II, III)
 * @param {string} fechas - Texto con las fechas de la fase
 * @param {boolean} abierta - Si la fase está abierta para registro
 */
export default function DeskFase({ col, numero, fechas, abierta = false }) {
  return (
    <div
      style={g(col, col + 1, 7, 8)}
      className={`flex flex-col justify-center rounded-[2.72cqw] p-[1.5cqw] text-white ${
        abierta ? 'bg-rojo' : 'bg-azul'
      }`}
    >
      <p className="flex justify-between text-[2.4cqw] font-bold">
        <span>Fase</span>
        <span>{numero}</span>
      </p>
      <p className="mt-[.15em] text-justify font-serif italic text-[1.9cqw]">
        {fechas}
      </p>
      <p className="mt-[.35em] text-[1.65cqw] font-bold leading-[1.2]">
        {abierta ? (
          <>
            ¡Abierta ahora! regístrate{' '}
            <a
              className="underline underline-offset-2 hover:opacity-75"
              href="#registro"
            >
              AQUÍ
            </a>
          </>
        ) : (
          'Apertura próximamente'
        )}
      </p>
    </div>
  );
}
