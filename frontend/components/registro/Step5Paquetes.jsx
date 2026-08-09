'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePaquetesStore } from '@/stores/paquetesStore'

// Importación dinámica de LayoutCanvasWithMural para evitar SSR (Konva solo funciona en cliente)
const LayoutCanvas = dynamic(() => import('./LayoutCanvasWithMural'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p className="text-gray-600 mt-4">Cargando lienzo...</p>
    </div>
  )
})

/**
 * Paso 5: Tu Lienzo - Selección de Paquete y Diseño de Layout
 *
 * FLUJO:
 * 1. Sub-paso A: Mostrar paquetes disponibles → usuario selecciona
 * 2. Sub-paso B: Cargar obras y diseñar layout en el canvas
 * 3. Guardar: layout_canvas_data (JSON) + layout_canvas_url (PNG en Cloudinary)
 */

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  displayWeight: 600,
  displayStyle: 'italic',
  body: 'acumin-pro, sans-serif',
  bodyWeight: 400,
}

export default function Step5Paquetes({ formData, updateFormData, errors, onContinue }) {
  const [subStep, setSubStep] = useState(formData.paquete_id ? 'layout' : 'seleccion')
  const [selectedPaquetePreview, setSelectedPaquetePreview] = useState(null)
  const { paquetes, fetchPaquetes, isLoading } = usePaquetesStore()

  useEffect(() => {
    fetchPaquetes()
  }, [])

  // Filtrar paquetes según el tipo de artista
  // Si es escultura → solo paquetes 3D
  // Si NO es escultura → solo paquetes 2D
  const esArtista3D = formData.categoria === 'escultura'
  const paquetesFiltrados = paquetes.filter(paquete => {
    if (esArtista3D) {
      return paquete.tipo === '3D'
    } else {
      return paquete.tipo === '2D'
    }
  })

  const handleSelectPaquete = (paqueteId) => {
    updateFormData({ paquete_id: paqueteId })
    setSubStep('layout')
    setSelectedPaquetePreview(null)
  }

  const handleBackToSelection = () => {
    setSubStep('seleccion')
    setSelectedPaquetePreview(null)
  }

  const handleSaveLayout = (layoutData, layoutUrl) => {
    updateFormData({
      layout_canvas_data: layoutData,
      layout_canvas_url: layoutUrl
    })
  }

  const handleSaveAndContinue = (layoutData, layoutUrl, obrasCompletas) => {
    console.log('Step5Paquetes: handleSaveAndContinue llamado con:', {
      layoutUrl: layoutUrl ? 'presente' : 'ausente',
      obrasCount: obrasCompletas?.length || 0
    })

    // Guardar layout
    updateFormData({
      layout_canvas_data: layoutData,
      layout_canvas_url: layoutUrl,
      layout_canvas_blob: layoutData.canvas_image_blob,
      obras_lienzo: obrasCompletas || [] // Obras con archivos completos
    })

    console.log('Step5Paquetes: formData actualizado, esperando antes de continuar...')

    if (onContinue) {
      // Skip validation porque sabemos que los datos están presentes
      // (aunque el estado de React aún no se haya actualizado)
      setTimeout(() => {
        console.log('Step5Paquetes: llamando a onContinue(true) para saltar validación')
        onContinue(true) // true = skipValidation
      }, 150)
    } else {
      console.warn('Step5Paquetes: onContinue no está definido')
    }
  }

  const handlePaqueteClick = (paquete) => {
    setSelectedPaquetePreview(paquete)
  }

  // ============================================================
  // SUB-PASO A: Selección de Paquete
  // ============================================================
  if (subStep === 'seleccion') {
    return (
      <div className="space-y-6">
        <div>
          <h2 style={{
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(28px, 4vw, 42px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            ELIGE TU PAQUETE
          </h2>
          <p style={{
            textAlign: 'center',
            color: COLORS.cream,
            opacity: 0.9,
            fontFamily: FONTS.body,
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            Selecciona el paquete que mejor se adapte a tu propuesta artística
          </p>
          <div style={{
            background: 'rgba(244, 237, 228, 0.15)',
            borderLeft: `4px solid ${COLORS.cream}`,
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <p style={{
              color: COLORS.cream,
              fontFamily: FONTS.body,
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {esArtista3D
                ? '📦 Como artista de Escultura, solo puedes seleccionar paquetes 3D (espacio de base/piso para obras tridimensionales).'
                : '🎨 Solo puedes seleccionar paquetes 2D (espacio de pared para obras bidimensionales).'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p style={{ color: COLORS.cream, marginTop: '16px', fontFamily: FONTS.body }}>
              Cargando paquetes...
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedPaquetePreview ? '1fr 1fr' : '1fr',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* Lado Izquierdo: Instrucciones */}
            <div style={{
              background: COLORS.cream,
              padding: '32px',
              borderRadius: '16px',
              color: COLORS.black
            }}>
              <h3 style={{
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: '24px',
                marginBottom: '16px',
                color: COLORS.red
              }}>
                Instrucciones
              </h3>
              <ol style={{
                fontFamily: FONTS.body,
                fontSize: '15px',
                lineHeight: '1.7',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li style={{ marginBottom: '12px' }}>
                  Abre este documento en un programa de edición (ej. Photoshop) para colocar tu obra propuesta para <strong>ARTE FACTO</strong>.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  Utiliza la regla al costado izquierdo de este documento para escalar debidamente las dimensiones de tu obra.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  No olvides contemplar las medidas del enmarcado, si es que la pieza tiene.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  Guarda tu archivo como: <br />
                  <code style={{
                    background: 'rgba(0,0,0,0.05)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}>
                    Plantilla_XmetroslineaIes_NombreArtistaColectivo
                  </code>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  Adjunta tu archivo en el campo correspondiente en tu registro en{' '}
                  <strong style={{ color: COLORS.red }}>arte-facto.com/convocatoria</strong>
                </li>
                <li>
                  Dudas y aclaraciones a través de{' '}
                  <strong style={{ color: COLORS.red }}>curatoria1@artefacto.com</strong>
                </li>
              </ol>
            </div>

            {/* Lado Derecho: Botones de Paquetes */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {paquetesFiltrados.map((paquete) => (
                <button
                  key={paquete.id}
                  onClick={() => handlePaqueteClick(paquete)}
                  type="button"
                  style={{
                    background: selectedPaquetePreview?.id === paquete.id ? COLORS.black : COLORS.cream,
                    color: selectedPaquetePreview?.id === paquete.id ? COLORS.cream : COLORS.black,
                    border: 'none',
                    padding: '24px 32px',
                    fontFamily: FONTS.display,
                    fontWeight: FONTS.displayWeight,
                    fontStyle: FONTS.displayStyle,
                    fontSize: '28px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: '16px',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPaquetePreview?.id !== paquete.id) {
                      e.target.style.background = COLORS.creamDark
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPaquetePreview?.id !== paquete.id) {
                      e.target.style.background = COLORS.cream
                    }
                  }}
                >
                  {paquete.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descripción del Paquete Seleccionado */}
        {selectedPaquetePreview && (
          <div style={{
            background: COLORS.cream,
            padding: '32px',
            borderRadius: '16px',
            marginTop: '24px'
          }}>
            <h3 style={{
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: '28px',
              marginBottom: '16px',
              color: COLORS.red,
              textTransform: 'uppercase'
            }}>
              {selectedPaquetePreview.nombre}
            </h3>
            <p style={{
              fontFamily: FONTS.body,
              fontSize: '16px',
              lineHeight: '1.7',
              color: COLORS.black,
              marginBottom: '24px'
            }}>
              {selectedPaquetePreview.descripcion}
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(184, 48, 48, 0.1)',
                padding: '12px 16px',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  color: COLORS.gray
                }}>
                  {selectedPaquetePreview.tipo === '3D' ? 'Metros cuadrados:' : 'Metros lineales:'}
                </span>
                <span style={{
                  fontFamily: FONTS.display,
                  fontWeight: FONTS.displayWeight,
                  fontSize: '18px',
                  color: COLORS.red,
                  marginLeft: '8px'
                }}>
                  {selectedPaquetePreview.tipo === '3D'
                    ? `${selectedPaquetePreview.metros_cuadrados}m²`
                    : `${selectedPaquetePreview.metros_lineales}m`}
                </span>
              </div>
              <div style={{
                background: 'rgba(184, 48, 48, 0.1)',
                padding: '12px 16px',
                borderRadius: '8px'
              }}>
                <span style={{
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  color: COLORS.gray
                }}>
                  Precio:
                </span>
                <span style={{
                  fontFamily: FONTS.display,
                  fontWeight: FONTS.displayWeight,
                  fontSize: '18px',
                  color: COLORS.red,
                  marginLeft: '8px'
                }}>
                  ${selectedPaquetePreview.precio} MXN
                </span>
              </div>
            </div>
            <button
              onClick={() => handleSelectPaquete(selectedPaquetePreview.id)}
              type="button"
              style={{
                background: COLORS.black,
                color: COLORS.cream,
                border: 'none',
                padding: '16px 40px',
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '16px',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = COLORS.red
              }}
              onMouseLeave={(e) => {
                e.target.style.background = COLORS.black
              }}
            >
              ELEGIR
            </button>
          </div>
        )}

        {errors?.paquete_id && (
          <p style={{
            color: COLORS.cream,
            fontFamily: FONTS.body,
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {errors.paquete_id}
          </p>
        )}
      </div>
    )
  }

  // ============================================================
  // SUB-PASO B: Canvas Layout con Carga de Obras
  // ============================================================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(24px, 4vw, 36px)',
            color: COLORS.cream,
            marginBottom: '8px'
          }}>
            Diseña tu Lienzo
          </h2>
          <p style={{
            color: COLORS.cream,
            opacity: 0.9,
            fontFamily: FONTS.body,
            fontSize: '16px'
          }}>
            Arrastra tus obras al espacio y organízalas
          </p>
        </div>
        <button
          type="button"
          onClick={handleBackToSelection}
          style={{
            color: COLORS.cream,
            textDecoration: 'underline',
            fontFamily: FONTS.body,
            fontSize: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ← Cambiar paquete
        </button>
      </div>

      <LayoutCanvas
        paquete={paquetes.find((p) => p.id === formData.paquete_id)}
        portfolioImages={formData.portfolio_images || []}
        initialLayout={formData.layout_canvas_data}
        onSave={handleSaveLayout}
        onSaveAndContinue={handleSaveAndContinue}
        errors={errors}
      />
    </div>
  )
}
