'use client'

/**
 * PaqueteCard - Tarjeta visual de un paquete de exhibición
 *
 * Muestra información del paquete:
 * - Nombre y descripción
 * - Precio
 * - Especificaciones (metros lineales, altura, obras máximas)
 * - Lista de beneficios
 * - Estado seleccionado con checkmark
 */

export default function PaqueteCard({ paquete, selected, onSelect }) {
  const {
    nombre,
    descripcion,
    precio,
    metros_lineales,
    altura_pared,
    obras_maximas,
    beneficios
  } = paquete

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-6 rounded-2xl border-2 cursor-pointer transition-all
        ${
          selected
            ? 'border-gray-900 bg-gray-50 shadow-lg scale-105'
            : 'border-gray-300 bg-white hover:border-gray-500 hover:shadow-md'
        }
      `}
    >
      {selected && (
        <div className="absolute top-4 right-4">
          <div className="bg-gray-900 text-white rounded-full p-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{nombre}</h3>
        <p className="text-gray-600 text-sm">{descripcion}</p>
      </div>

      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-3xl font-bold text-gray-900">
          ${precio.toLocaleString('es-MX')}
          <span className="text-sm font-normal text-gray-600 ml-1">MXN</span>
        </div>
      </div>

      {/* Especificaciones */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-700">
          <svg
            className="w-5 h-5 mr-2 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <span className="text-sm">
            <strong>{metros_lineales}m</strong> lineales de pared
          </span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg
            className="w-5 h-5 mr-2 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          <span className="text-sm">
            <strong>{altura_pared}m</strong> de altura
          </span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg
            className="w-5 h-5 mr-2 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">
            Hasta <strong>{obras_maximas}</strong> obras
          </span>
        </div>
      </div>

      {/* Beneficios */}
      {beneficios && beneficios.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Incluye:
          </p>
          <ul className="space-y-1">
            {beneficios.map((beneficio, index) => (
              <li
                key={index}
                className="flex items-start text-xs text-gray-700"
              >
                <svg
                  className="w-4 h-4 mr-1 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {beneficio}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
