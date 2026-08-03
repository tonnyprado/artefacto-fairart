'use client'

import { useState, useEffect } from 'react'
import { usePaquetesStore } from '@/stores/paquetesStore'
import PaqueteCard from './PaqueteCard'
import LayoutCanvas from './LayoutCanvas'

/**
 * Paso 5: Selección de Paquete y Diseño de Layout
 *
 * FLUJO:
 * 1. Sub-paso A: Mostrar paquetes disponibles → usuario selecciona
 * 2. Sub-paso B: Abrir canvas para diseñar layout de obras
 * 3. Guardar: layout_canvas_data (JSON) + layout_canvas_url (PNG en Cloudinary)
 */

export default function Step5Paquetes({ formData, updateFormData, errors }) {
  const [subStep, setSubStep] = useState(formData.paquete_id ? 'layout' : 'seleccion')
  const { paquetes, fetchPaquetes, isLoading } = usePaquetesStore()

  useEffect(() => {
    fetchPaquetes()
  }, [])

  const handleSelectPaquete = (paqueteId) => {
    updateFormData({ paquete_id: paqueteId })
    setSubStep('layout')
  }

  const handleBackToSelection = () => {
    setSubStep('seleccion')
  }

  const handleSaveLayout = (layoutData, layoutUrl) => {
    updateFormData({
      layout_canvas_data: layoutData,
      layout_canvas_url: layoutUrl
    })
  }

  // ============================================================
  // SUB-PASO A: Selección de Paquete
  // ============================================================
  if (subStep === 'seleccion') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecciona tu Paquete
          </h2>
          <p className="text-gray-600">
            Elige el paquete que mejor se adapte a tu propuesta artística
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando paquetes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paquetes.map((paquete) => (
              <PaqueteCard
                key={paquete.id}
                paquete={paquete}
                selected={formData.paquete_id === paquete.id}
                onSelect={() => handleSelectPaquete(paquete.id)}
              />
            ))}
          </div>
        )}

        {errors?.paquete_id && (
          <p className="text-sm text-red-600">{errors.paquete_id}</p>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
          <div className="flex">
            <svg
              className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">¿Qué incluye cada paquete?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Espacio lineal de pared para colgar tus obras</li>
                <li>Iluminación profesional adaptada al tamaño</li>
                <li>Beneficios adicionales según el paquete elegido</li>
                <li>
                  En el siguiente paso diseñarás el layout de tus obras en el
                  espacio
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // SUB-PASO B: Canvas Layout
  // ============================================================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Diseña tu Layout
          </h2>
          <p className="text-gray-600">
            Arrastra tus obras al espacio y organízalas
          </p>
        </div>
        <button
          type="button"
          onClick={handleBackToSelection}
          className="text-gray-600 hover:text-gray-900 underline text-sm"
        >
          ← Cambiar paquete
        </button>
      </div>

      <LayoutCanvas
        paquete={paquetes.find((p) => p.id === formData.paquete_id)}
        portfolioImages={formData.portfolio_images || []}
        initialLayout={formData.layout_canvas_data}
        onSave={handleSaveLayout}
        errors={errors}
      />
    </div>
  )
}
