'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePaquetesStore } from '@/stores/paquetesStore'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, Plus, Edit2, Trash2, GripVertical, AlertCircle, Palette, Box, Download, ArrowRight } from 'lucide-react'

const LayoutCanvas = dynamic(() => import('./LayoutCanvasWithMural'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '600px' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
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

export default function Step5Paquetes({ formData, updateFormData, errors, onContinue }) {
  const [confirmedPaquete, setConfirmedPaquete] = useState(
    formData.paquete_id ? { id: formData.paquete_id } : null
  )
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [expandedPaqueteId, setExpandedPaqueteId] = useState(null)

  // Referencia a funciones del canvas
  const canvasFunctionsRef = useRef(null)
  const [canvasState, setCanvasState] = useState({ obrasCount: 0, isSaving: false })

  const { paquetes, fetchPaquetes, isLoading } = usePaquetesStore()

  // Obras
  const [todasLasObras, setTodasLasObras] = useState([])
  const [editingObra, setEditingObra] = useState(null)

  useEffect(() => { fetchPaquetes() }, [])

  useEffect(() => {
    if (formData.paquete_id && paquetes.length > 0 && !confirmedPaquete?.nombre) {
      const paquete = paquetes.find(p => p.id === formData.paquete_id)
      if (paquete) setConfirmedPaquete(paquete)
    }
  }, [paquetes, formData.paquete_id])

  const esArtista3D = formData.categoria === 'escultura'
  const paquetesFiltrados = paquetes.filter(p => esArtista3D ? p.tipo === '3D' : p.tipo === '2D')

  const handleConfirmPaquete = (paquete) => {
    setConfirmedPaquete(paquete)
    updateFormData({ paquete_id: paquete.id })
    setExpandedPaqueteId(null)
    setRightPanelOpen(false)
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
    if (onContinue) setTimeout(() => onContinue(true), 150)
  }

  const handleCanvasReady = (functions) => {
    canvasFunctionsRef.current = functions
    setCanvasState({
      obrasCount: functions.getObrasEnCanvas?.()?.length || 0,
      isSaving: functions.isSaving
    })
  }

  const handleAddNewObra = (files) => {
    const newObras = Array.from(files).map((file, index) => ({
      id: `obra-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      titulo: '', ancho_cm: '', alto_cm: '', tecnica: '',
      anio: new Date().getFullYear(), precio_mxn: '', notas_montaje: ''
    }))
    setTodasLasObras(prev => [...prev, ...newObras])
    if (newObras.length > 0) setEditingObra(newObras[0])
  }

  const hasCompleteMetadata = (obra) => obra.titulo && obra.ancho_cm && obra.alto_cm && obra.tecnica && obra.precio_mxn

  return (
    <div style={{ position: 'relative', minHeight: '75vh' }}>

      {/* BOTONES DE ACCIÓN - Fuera del canvas, en la parte superior */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <button
          type="button"
          onClick={() => canvasFunctionsRef.current?.exportPDF?.()}
          disabled={canvasState.obrasCount === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px',
            background: 'transparent',
            border: `2px solid ${COLORS.cream}`,
            color: COLORS.cream,
            borderRadius: '12px',
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: '14px',
            cursor: canvasState.obrasCount === 0 ? 'not-allowed' : 'pointer',
            opacity: canvasState.obrasCount === 0 ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <Download size={18} />
          Exportar PDF
        </button>
        <button
          type="button"
          onClick={() => canvasFunctionsRef.current?.saveAndContinue?.()}
          disabled={canvasState.isSaving || canvasState.obrasCount === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px',
            background: COLORS.black,
            border: 'none',
            color: COLORS.cream,
            borderRadius: '12px',
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: '14px',
            cursor: (canvasState.isSaving || canvasState.obrasCount === 0) ? 'not-allowed' : 'pointer',
            opacity: (canvasState.isSaving || canvasState.obrasCount === 0) ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {canvasState.isSaving ? 'Guardando...' : 'Guardar y Continuar'}
          <ArrowRight size={18} />
        </button>
      </div>

      {/* CANVAS - Siempre visible al 100% */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '70vh',
        background: COLORS.cream,
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {confirmedPaquete ? (
          <LayoutCanvas
            paquete={confirmedPaquete}
            portfolioImages={todasLasObras}
            initialLayout={formData.layout_canvas_data}
            onSave={(data, url) => updateFormData({ layout_canvas_data: data, layout_canvas_url: url })}
            onSaveAndContinue={handleSaveAndContinue}
            errors={errors}
            hideGallery={true}
            hideActions={true}
            onCanvasReady={handleCanvasReady}
          />
        ) : (
          <CanvasPlaceholder />
        )}

        {/* SIDEBAR IZQUIERDO - MIS OBRAS (flota SOBRE el canvas) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          bottom: '16px',
          display: 'flex',
          zIndex: 100,
          pointerEvents: 'auto',
        }}>
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            style={{
              width: '44px',
              background: COLORS.black,
              border: 'none',
              borderRadius: leftPanelOpen ? '0 12px 12px 0' : '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 0 12px rgba(0,0,0,0.2)',
            }}
          >
            {leftPanelOpen ? <ChevronLeft size={22} color={COLORS.cream} /> : <ChevronRight size={22} color={COLORS.cream} />}
          </button>

          {leftPanelOpen && (
            <div style={{
              width: '300px',
              background: COLORS.cream,
              borderRadius: '12px 0 0 12px',
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px', borderBottom: `1px solid ${COLORS.creamDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '18px', color: COLORS.black }}>
                  Mis Obras
                </h3>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                  background: COLORS.black, color: COLORS.cream, borderRadius: '8px',
                  fontFamily: FONTS.body, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  <Plus size={14} /> Agregar
                  <input type="file" multiple accept="image/*" onChange={(e) => handleAddNewObra(e.target.files)} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                {!confirmedPaquete && todasLasObras.length > 0 && (
                  <div style={{ background: 'rgba(184,48,48,0.08)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertCircle size={16} color={COLORS.red} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.black, lineHeight: 1.4 }}>
                      Selecciona un paquete primero
                    </span>
                  </div>
                )}

                {todasLasObras.map((obra) => {
                  const isInCanvas = (formData.obras_lienzo || []).some(o => o.id === obra.id)
                  const hasMetadata = hasCompleteMetadata(obra)
                  const canDrag = confirmedPaquete && hasMetadata && !isInCanvas

                  return (
                    <div key={obra.id} draggable={canDrag} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                      background: isInCanvas ? 'rgba(184,48,48,0.08)' : 'white',
                      border: `1px solid ${isInCanvas ? COLORS.red : COLORS.creamDark}`,
                      borderRadius: '10px', marginBottom: '8px',
                      cursor: canDrag ? 'grab' : 'default', opacity: isInCanvas ? 0.6 : 1,
                    }}>
                      {canDrag && <GripVertical size={16} color={COLORS.gray} />}
                      <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', background: COLORS.creamDark, flexShrink: 0 }}>
                        {obra.preview && <img src={obra.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {obra.titulo || 'Sin título'}
                        </div>
                        <div style={{ fontFamily: FONTS.body, fontSize: '11px', color: COLORS.gray }}>
                          {obra.ancho_cm && obra.alto_cm ? `${obra.ancho_cm} × ${obra.alto_cm} cm` : 'Sin medidas'}
                        </div>
                      </div>
                      {isInCanvas && <Check size={16} color={COLORS.red} />}
                      {!hasMetadata && !isInCanvas && <AlertCircle size={16} color={COLORS.red} />}
                      <button onClick={() => setEditingObra(obra)} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Edit2 size={14} color={COLORS.gray} />
                      </button>
                      {!isInCanvas && (
                        <button onClick={() => setTodasLasObras(prev => prev.filter(o => o.id !== obra.id))} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={14} color={COLORS.red} />
                        </button>
                      )}
                    </div>
                  )
                })}

                {todasLasObras.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', background: 'white', borderRadius: '12px', border: `2px dashed ${COLORS.creamDark}` }}>
                    <p style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.gray, margin: 0 }}>
                      No has agregado obras.<br />Haz clic en "Agregar".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DERECHO - PAQUETES (flota SOBRE el canvas) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          bottom: '16px',
          display: 'flex',
          flexDirection: 'row-reverse',
          zIndex: 100,
          pointerEvents: 'auto',
        }}>
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            style={{
              width: '44px',
              background: COLORS.black,
              border: 'none',
              borderRadius: rightPanelOpen ? '12px 0 0 12px' : '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '-2px 0 12px rgba(0,0,0,0.2)',
            }}
          >
            {rightPanelOpen ? <ChevronRight size={22} color={COLORS.cream} /> : <ChevronLeft size={22} color={COLORS.cream} />}
          </button>

          {rightPanelOpen && (
            <div style={{
              width: '320px',
              background: COLORS.cream,
              borderRadius: '0 12px 12px 0',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px', borderBottom: `1px solid ${COLORS.creamDark}` }}>
                <h3 style={{ margin: 0, fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '18px', color: COLORS.black }}>
                  Paquetes
                </h3>
              </div>

              <div style={{ padding: '12px', background: 'rgba(184,48,48,0.05)', borderBottom: `1px solid ${COLORS.creamDark}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {esArtista3D ? <Box size={16} color={COLORS.red} /> : <Palette size={16} color={COLORS.red} />}
                <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.black }}>
                  {esArtista3D ? 'Paquetes 3D' : 'Paquetes 2D'}
                </span>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                  </div>
                ) : (
                  paquetesFiltrados.map((paquete) => {
                    const isExpanded = expandedPaqueteId === paquete.id
                    const isConfirmed = confirmedPaquete?.id === paquete.id

                    return (
                      <div key={paquete.id} style={{
                        background: isConfirmed ? 'rgba(184,48,48,0.1)' : 'white',
                        border: isConfirmed ? `2px solid ${COLORS.red}` : `1px solid ${COLORS.creamDark}`,
                        borderRadius: '12px', marginBottom: '10px', overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => setExpandedPaqueteId(isExpanded ? null : paquete.id)}
                          style={{
                            width: '100%', padding: '14px 16px', background: 'transparent', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isConfirmed && <Check size={18} color={COLORS.red} />}
                            <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '16px', color: COLORS.black }}>
                              {paquete.nombre}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp size={20} color={COLORS.gray} /> : <ChevronDown size={20} color={COLORS.gray} />}
                        </button>

                        {isExpanded && (
                          <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${COLORS.creamDark}` }}>
                            <p style={{ fontFamily: FONTS.body, fontSize: '13px', color: COLORS.gray, lineHeight: 1.5, margin: '12px 0' }}>
                              {paquete.descripcion}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                              <span style={{ background: 'rgba(184,48,48,0.1)', padding: '6px 10px', borderRadius: '8px', fontFamily: FONTS.body, fontSize: '12px', color: COLORS.black }}>
                                {esArtista3D ? `${paquete.metros_cuadrados}m²` : `${paquete.metros_lineales}m`}
                              </span>
                              <span style={{ background: 'rgba(184,48,48,0.1)', padding: '6px 10px', borderRadius: '8px', fontFamily: FONTS.body, fontSize: '12px', color: COLORS.black }}>
                                ${paquete.precio} MXN
                              </span>
                            </div>
                            {!isConfirmed ? (
                              <button
                                onClick={() => handleConfirmPaquete(paquete)}
                                style={{
                                  width: '100%', padding: '12px', background: COLORS.black, color: COLORS.cream,
                                  border: 'none', borderRadius: '10px', fontFamily: FONTS.body, fontWeight: 600,
                                  fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer',
                                }}
                              >
                                Seleccionar
                              </button>
                            ) : (
                              <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '12px', background: COLORS.red, color: COLORS.cream, borderRadius: '10px',
                                fontFamily: FONTS.body, fontWeight: 600, fontSize: '13px',
                              }}>
                                <Check size={16} /> Seleccionado
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Indicador de paquete (centro superior) */}
        {confirmedPaquete && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: COLORS.red,
            color: COLORS.cream,
            padding: '10px 20px',
            borderRadius: '30px',
            fontFamily: FONTS.body,
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Check size={16} />
            {confirmedPaquete.nombre}
            <button
              onClick={() => { setConfirmedPaquete(null); updateFormData({ paquete_id: null }); setRightPanelOpen(true) }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', color: COLORS.cream }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Modal edición obra */}
      {editingObra && (
        <ObraModal
          obra={editingObra}
          onSave={(updated) => { setTodasLasObras(prev => prev.map(o => o.id === updated.id ? updated : o)); setEditingObra(null) }}
          onClose={() => setEditingObra(null)}
        />
      )}

      {errors?.paquete_id && (
        <p style={{ color: COLORS.cream, fontFamily: FONTS.body, fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
          {errors.paquete_id}
        </p>
      )}
    </div>
  )
}

function CanvasPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/plantilla-mural.svg)',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '32px 48px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '24px', color: COLORS.black, marginBottom: '12px' }}>
          Selecciona un Paquete
        </h3>
        <p style={{ fontFamily: FONTS.body, fontSize: '15px', color: COLORS.gray, maxWidth: '300px', lineHeight: 1.6, margin: 0 }}>
          Abre el panel de la derecha y elige tu espacio
        </p>
      </div>
    </div>
  )
}

function ObraModal({ obra, onSave, onClose }) {
  const [form, setForm] = useState({
    titulo: obra.titulo || '',
    ancho_cm: obra.ancho_cm || '',
    alto_cm: obra.alto_cm || '',
    tecnica: obra.tecnica || '',
    anio: obra.anio || new Date().getFullYear(),
    precio_mxn: obra.precio_mxn || '',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: COLORS.cream, borderRadius: '20px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.creamDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '20px', color: COLORS.black, margin: 0 }}>Datos de la Obra</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: COLORS.gray }}>×</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...obra, ...form }) }} style={{ padding: '24px' }}>
          {obra.preview && (
            <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={obra.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Título *" value={form.titulo} onChange={(e) => setForm(p => ({ ...p, titulo: e.target.value }))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Ancho (cm) *" type="number" value={form.ancho_cm} onChange={(e) => setForm(p => ({ ...p, ancho_cm: e.target.value }))} required />
              <Field label="Alto (cm) *" type="number" value={form.alto_cm} onChange={(e) => setForm(p => ({ ...p, alto_cm: e.target.value }))} required />
            </div>
            <Field label="Técnica *" value={form.tecnica} onChange={(e) => setForm(p => ({ ...p, tecnica: e.target.value }))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Año" type="number" value={form.anio} onChange={(e) => setForm(p => ({ ...p, anio: e.target.value }))} />
              <Field label="Precio MXN *" type="number" value={form.precio_mxn} onChange={(e) => setForm(p => ({ ...p, precio_mxn: e.target.value }))} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', background: 'transparent', border: `2px solid ${COLORS.gray}`, borderRadius: '12px', fontFamily: FONTS.body, fontWeight: 600, color: COLORS.gray, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ flex: 1, padding: '14px', background: COLORS.red, border: 'none', borderRadius: '12px', fontFamily: FONTS.body, fontWeight: 600, color: COLORS.cream, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.black, marginBottom: '6px' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} required={required} style={{
        width: '100%', padding: '12px 14px', border: `1px solid ${COLORS.creamDark}`, borderRadius: '10px',
        fontFamily: FONTS.body, fontSize: '14px', background: 'white', color: COLORS.black, outline: 'none',
      }} />
    </div>
  )
}
