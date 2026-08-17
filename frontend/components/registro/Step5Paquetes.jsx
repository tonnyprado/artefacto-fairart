'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePaquetesStore } from '@/stores/paquetesStore'
import PaquetesSidebar from './PaquetesSidebar'
import ObrasSidebar from './ObrasSidebar'

// Importación dinámica del canvas para evitar SSR (Konva solo funciona en cliente)
const LayoutCanvas = dynamic(() => import('./LayoutCanvasWithMural'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '500px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
        <p style={{ color: '#6B6B6B', marginTop: '16px', fontFamily: 'acumin-pro, sans-serif' }}>
          Cargando lienzo...
        </p>
      </div>
    </div>
  )
})

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  body: 'acumin-pro, sans-serif',
}

/**
 * Step5Paquetes - Tu Lienzo (ahora Etapa 2)
 *
 * Nuevo diseño estilo Photoshop:
 * - Canvas centrado SIN limitantes inicialmente
 * - Sidebar izquierdo: Lista de obras con chevron
 * - Sidebar derecho: Lista de paquetes con chevron
 * - Al confirmar paquete → se dibujan las limitantes
 */
export default function Step5Paquetes({ formData, updateFormData, errors, onContinue }) {
  const [selectedPaquete, setSelectedPaquete] = useState(null)
  const [confirmedPaquete, setConfirmedPaquete] = useState(
    formData.paquete_id ? { id: formData.paquete_id } : null
  )

  const { paquetes, fetchPaquetes, isLoading } = usePaquetesStore()

  useEffect(() => {
    fetchPaquetes()
  }, [])

  // Actualizar paquete confirmado cuando se cargan los paquetes
  useEffect(() => {
    if (formData.paquete_id && paquetes.length > 0 && !confirmedPaquete?.nombre) {
      const paquete = paquetes.find(p => p.id === formData.paquete_id)
      if (paquete) {
        setConfirmedPaquete(paquete)
      }
    }
  }, [paquetes, formData.paquete_id])

  // Determinar si es artista 3D
  const esArtista3D = formData.categoria === 'escultura'

  const handleSelectPaquete = (paquete) => {
    setSelectedPaquete(paquete)
  }

  const handleConfirmPaquete = (paquete) => {
    setConfirmedPaquete(paquete)
    updateFormData({ paquete_id: paquete.id })
  }

  const handleSaveLayout = (layoutData, layoutUrl) => {
    updateFormData({
      layout_canvas_data: layoutData,
      layout_canvas_url: layoutUrl
    })
  }

  const handleSaveAndContinue = (layoutData, layoutUrl, obrasCompletas) => {
    updateFormData({
      layout_canvas_data: layoutData,
      layout_canvas_url: layoutUrl,
      layout_canvas_blob: layoutData.canvas_image_blob,
      layout_canvas_pdf_blob: layoutData.canvas_pdf_blob,
      layout_canvas_preview_url: layoutData.canvas_preview_url,
      obras_lienzo: obrasCompletas || []
    })

    if (onContinue) {
      setTimeout(() => {
        onContinue(true)
      }, 150)
    }
  }

  // Hook para gestión de obras (simplificado - el canvas maneja la lógica completa)
  const [todasLasObras, setTodasLasObras] = useState([])
  const [editingObra, setEditingObra] = useState(null)

  const handleAddNewObra = (files) => {
    const newObras = Array.from(files).map((file, index) => ({
      id: `obra-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      titulo: '',
      ancho_cm: '',
      alto_cm: '',
      tecnica: '',
      anio: new Date().getFullYear(),
      precio_mxn: '',
      notas_montaje: ''
    }))
    setTodasLasObras(prev => [...prev, ...newObras])
    // Abrir modal de edición para la primera obra nueva
    if (newObras.length > 0) {
      setEditingObra(newObras[0])
    }
  }

  const hasCompleteMetadata = (obra) => {
    return obra.titulo && obra.ancho_cm && obra.alto_cm && obra.tecnica && obra.precio_mxn
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '70vh',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 42px)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: COLORS.cream,
          marginBottom: '8px',
        }}>
          TU LIENZO
        </h2>
        <p style={{
          color: COLORS.cream,
          opacity: 0.9,
          fontFamily: FONTS.body,
          fontSize: '16px',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {confirmedPaquete
            ? `Arrastra tus obras al espacio de ${confirmedPaquete.nombre}`
            : 'Selecciona un paquete del panel derecho para comenzar a diseñar tu mural'}
        </p>
      </div>

      {/* Layout principal: Sidebars + Canvas */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: '0',
        minHeight: '600px',
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Sidebar Izquierdo - Obras */}
        <ObrasSidebar
          obras={todasLasObras}
          obrasEnCanvas={formData.obras_lienzo || []}
          obrasMaximas={confirmedPaquete?.obras_maximas || 5}
          onAddObra={handleAddNewObra}
          onEditObra={setEditingObra}
          onDeleteObra={(id) => setTodasLasObras(prev => prev.filter(o => o.id !== id))}
          onDragStart={(e, obra) => {
            e.dataTransfer.setData('text/plain', obra.id)
            e.dataTransfer.effectAllowed = 'move'
          }}
          hasCompleteMetadata={hasCompleteMetadata}
          paqueteConfirmado={!!confirmedPaquete}
        />

        {/* Canvas Central */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: COLORS.cream,
          minWidth: 0,
        }}>
          {confirmedPaquete ? (
            <LayoutCanvas
              paquete={confirmedPaquete}
              portfolioImages={todasLasObras}
              initialLayout={formData.layout_canvas_data}
              onSave={handleSaveLayout}
              onSaveAndContinue={handleSaveAndContinue}
              errors={errors}
            />
          ) : (
            /* Canvas vacío - sin paquete seleccionado */
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '100%',
                maxWidth: '800px',
                aspectRatio: '4/3',
                background: 'white',
                borderRadius: '16px',
                border: `2px dashed ${COLORS.creamDark}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
              }}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.creamDark}
                  strokeWidth="1.5"
                  style={{ marginBottom: '20px' }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 3v18" />
                </svg>
                <h3 style={{
                  fontFamily: FONTS.display,
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '24px',
                  color: COLORS.gray,
                  marginBottom: '12px',
                }}>
                  Selecciona un Paquete
                </h3>
                <p style={{
                  fontFamily: FONTS.body,
                  fontSize: '15px',
                  color: COLORS.gray,
                  maxWidth: '400px',
                  lineHeight: 1.6,
                }}>
                  Abre el panel de paquetes a la derecha y selecciona el espacio
                  que mejor se adapte a tu propuesta artística.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Derecho - Paquetes */}
        <PaquetesSidebar
          paquetes={paquetes}
          es3D={esArtista3D}
          selectedPaquete={selectedPaquete}
          confirmedPaquete={confirmedPaquete}
          onSelectPaquete={handleSelectPaquete}
          onConfirmPaquete={handleConfirmPaquete}
          isLoading={isLoading}
        />
      </div>

      {/* Error de paquete */}
      {errors?.paquete_id && (
        <p style={{
          color: COLORS.cream,
          fontFamily: FONTS.body,
          fontSize: '14px',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          {errors.paquete_id}
        </p>
      )}

      {/* Modal de edición de obra - Se mostraría aquí o usar el del canvas */}
      {editingObra && (
        <ObraMetadataModalSimple
          obra={editingObra}
          onSave={(updatedObra) => {
            setTodasLasObras(prev =>
              prev.map(o => o.id === updatedObra.id ? updatedObra : o)
            )
            setEditingObra(null)
          }}
          onClose={() => setEditingObra(null)}
        />
      )}
    </div>
  )
}

/**
 * Modal simplificado para editar metadata de obra
 */
function ObraMetadataModalSimple({ obra, onSave, onClose }) {
  const [formData, setFormData] = useState({
    titulo: obra.titulo || '',
    ancho_cm: obra.ancho_cm || '',
    alto_cm: obra.alto_cm || '',
    tecnica: obra.tecnica || '',
    anio: obra.anio || new Date().getFullYear(),
    precio_mxn: obra.precio_mxn || '',
    notas_montaje: obra.notas_montaje || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...obra, ...formData })
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: COLORS.cream,
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${COLORS.creamDark}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '22px',
            color: COLORS.black,
            margin: 0,
          }}>
            Datos de la Obra
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: COLORS.gray,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Preview */}
          {obra.preview && (
            <div style={{
              width: '100%',
              height: '150px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}>
              <img
                src={obra.preview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InputField
              label="Título de la obra *"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Atardecer en la ciudad"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField
                label="Ancho (cm) *"
                name="ancho_cm"
                type="number"
                value={formData.ancho_cm}
                onChange={handleChange}
                placeholder="80"
                required
              />
              <InputField
                label="Alto (cm) *"
                name="alto_cm"
                type="number"
                value={formData.alto_cm}
                onChange={handleChange}
                placeholder="60"
                required
              />
            </div>

            <InputField
              label="Técnica *"
              name="tecnica"
              value={formData.tecnica}
              onChange={handleChange}
              placeholder="Ej: Óleo sobre lienzo"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField
                label="Año"
                name="anio"
                type="number"
                value={formData.anio}
                onChange={handleChange}
              />
              <InputField
                label="Precio (MXN) *"
                name="precio_mxn"
                type="number"
                value={formData.precio_mxn}
                onChange={handleChange}
                placeholder="15000"
                required
              />
            </div>

            <InputField
              label="Notas de montaje"
              name="notas_montaje"
              value={formData.notas_montaje}
              onChange={handleChange}
              placeholder="Instrucciones especiales para instalar la obra"
              multiline
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'transparent',
                border: `2px solid ${COLORS.gray}`,
                borderRadius: '12px',
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: '14px',
                color: COLORS.gray,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                background: COLORS.red,
                border: 'none',
                borderRadius: '12px',
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: '14px',
                color: COLORS.cream,
                cursor: 'pointer',
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Campo de input reutilizable
 */
function InputField({ label, name, value, onChange, placeholder, type = 'text', required, multiline }) {
  const inputStyles = {
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${COLORS.creamDark}`,
    borderRadius: '10px',
    fontFamily: FONTS.body,
    fontSize: '14px',
    background: 'white',
    color: COLORS.black,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: FONTS.body,
        fontSize: '13px',
        fontWeight: 600,
        color: COLORS.black,
        marginBottom: '6px',
      }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          style={{ ...inputStyles, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={inputStyles}
        />
      )}
    </div>
  )
}
