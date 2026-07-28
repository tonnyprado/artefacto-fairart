'use client'

import { useState } from 'react'

/**
 * Paso 4: Confirmación y Términos
 *
 * Muestra resumen de la información capturada
 * y solicita aceptación de términos y condiciones
 */

export default function Step4Confirmacion({ formData, errors }) {
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirma tu Información
        </h2>
        <p className="text-gray-600">
          Revisa que toda tu información sea correcta antes de enviar
        </p>
      </div>

      {/* Resumen de Datos */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        {/* Datos Personales */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Datos Personales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Nombre:</span>{' '}
              <span className="font-medium">
                {formData.nombre} {formData.apellido}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Teléfono:</span>{' '}
              <span className="font-medium">{formData.telefono}</span>
            </div>
            <div>
              <span className="text-gray-500">Fecha de Nacimiento:</span>{' '}
              <span className="font-medium">{formData.fecha_nacimiento}</span>
            </div>
            <div>
              <span className="text-gray-500">Ciudad:</span>{' '}
              <span className="font-medium">
                {formData.ciudad}, {formData.pais}
              </span>
            </div>
          </div>
        </div>

        {/* Información Artística */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            Información Artística
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Categoría:</span>{' '}
              <span className="font-medium capitalize">
                {formData.categoria?.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Biografía:</span>{' '}
              <p className="text-gray-700 mt-1 line-clamp-3">{formData.bio}</p>
            </div>
            {formData.redes_sociales && Object.keys(formData.redes_sociales).some(key => formData.redes_sociales[key]) && (
              <div>
                <span className="text-gray-500">Redes Sociales:</span>{' '}
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(formData.redes_sociales).map(([key, value]) =>
                    value ? (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 bg-white rounded text-xs border"
                      >
                        {key}: {value}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documentos */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Documentos Adjuntos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              {formData.foto ? (
                <>
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Foto de perfil
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Foto de perfil (pendiente)
                </>
              )}
            </div>
            <div className="flex items-center">
              {formData.documentos?.cv ? (
                <>
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  CV Artístico
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  CV Artístico (pendiente)
                </>
              )}
            </div>
            <div className="flex items-center">
              {formData.documentos?.portfolio ? (
                <>
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Portfolio Digital
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Portfolio Digital (pendiente)
                </>
              )}
            </div>
            <div className="flex items-center">
              {formData.documentos?.identificacion ? (
                <>
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Identificación Oficial
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Identificación Oficial (pendiente)
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Términos y Condiciones */}
      <div className="space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terminos"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="terminos" className="ml-3 text-sm text-gray-700">
            Acepto los{' '}
            <a href="#" className="text-red-600 hover:underline">
              términos y condiciones
            </a>{' '}
            de la convocatoria de ARTEFACT 2027. Entiendo que mi inscripción no
            garantiza mi participación en la feria y que será evaluada por un
            equipo de curadores profesionales.
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="privacidad"
            checked={aceptaPrivacidad}
            onChange={(e) => setAceptaPrivacidad(e.target.checked)}
            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="privacidad" className="ml-3 text-sm text-gray-700">
            Acepto el{' '}
            <a href="#" className="text-red-600 hover:underline">
              aviso de privacidad
            </a>{' '}
            y autorizo el uso de mis datos personales y obras para fines de
            evaluación, difusión y promoción de la feria de arte.
          </label>
        </div>

        {errors?.terminos && (
          <p className="text-sm text-red-600">{errors.terminos}</p>
        )}
      </div>

      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
        <div className="flex">
          <svg
            className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">¿Qué sigue después de enviar?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Recibirás un email de confirmación de tu registro</li>
              <li>
                Tu información será revisada por el equipo de curaduría
              </li>
              <li>
                Los resultados de la votación se notificarán por email al cierre
                de cada fase
              </li>
              <li>
                Puedes consultar el estado de tu inscripción en cualquier momento
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
