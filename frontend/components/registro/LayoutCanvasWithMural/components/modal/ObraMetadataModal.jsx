'use client'

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import styles from '../../styles/LayoutCanvas.module.css'

// Configuración de precios (no hardcodeada)
const CONFIG_PRECIO = {
  porcentajeArtista: 0.75,
  multiploRedondeo: 500,
}

/**
 * Calcula los precios basados en la ganancia deseada del artista
 * @param {number} input - Ganancia deseada (MXN, > 0)
 * @returns {Object} - { ganancia, comision, precioPublico, precioSugerido }
 */
function calcularPrecio(input, config = CONFIG_PRECIO) {
  if (typeof input !== 'number' || !isFinite(input) || input <= 0) {
    return null
  }
  const precioPublico = input / config.porcentajeArtista
  const comision = precioPublico - input
  const m = config.multiploRedondeo
  const precioSugerido = Math.ceil(precioPublico / m) * m

  // Redondear a centavos
  const centavos = (n) => Math.round(n * 100) / 100

  return {
    ganancia: centavos(input),
    comision: centavos(comision),
    precioPublico: centavos(precioPublico),
    precioSugerido: centavos(precioSugerido),
  }
}

/**
 * Modal para editar metadata de una obra
 * @param {Object} obra - Obra que se está editando
 * @param {boolean} es3D - Si es paquete 3D
 * @param {Function} onUpdateMetadata - Callback para actualizar metadata
 * @param {Function} onClose - Callback al cerrar
 */
export function ObraMetadataModal({ obra, es3D, onUpdateMetadata, onClose }) {
  const modalContentRef = useRef(null)
  const tooltipTriggerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Animación de entrada del modal
  useEffect(() => {
    if (modalContentRef.current && mounted) {
      gsap.fromTo(
        modalContentRef.current,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      )
    }
  }, [mounted])

  const handleClose = () => {
    if (modalContentRef.current) {
      gsap.to(modalContentRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          document.body.style.overflow = ''
          onClose()
        }
      })
    } else {
      document.body.style.overflow = ''
      onClose()
    }
  }

  const handleUpdate = (field, value) => {
    onUpdateMetadata(obra.id, field, value)
  }

  // Calcular posición del tooltip cuando se muestra
  const updateTooltipPosition = () => {
    if (tooltipTriggerRef.current) {
      const rect = tooltipTriggerRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top - 10, // Arriba del trigger
        left: rect.left + rect.width / 2 // Centrado
      })
    }
  }

  const handleShowTooltip = () => {
    updateTooltipPosition()
    setShowTooltip(true)
  }

  if (!mounted) return null

  const modalContent = (
    <>
      {/* Overlay fijo que cubre toda la pantalla */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 18, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99998,
        }}
      />
      {/* Contenedor del modal que puede scrollear */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px',
          overflowY: 'auto',
        }}
        onClick={handleClose}
      >
        <div
          ref={modalContentRef}
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Ficha técnica</h3>
            <button
              type="button"
              onClick={handleClose}
              className={styles.btnCerrarModal}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* Preview de la imagen */}
            <img
              src={obra.preview}
              alt="Preview"
              className={styles.modalPreviewImage}
            />

            {/* Campos del formulario */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Título *</label>
              <input
                type="text"
                value={obra.titulo || ''}
                onChange={(e) => handleUpdate('titulo', e.target.value)}
                placeholder="Título de la obra"
                className={styles.formInput}
              />
            </div>

            {/* Dimensiones - diferentes para 2D y 3D */}
            {es3D ? (
              <>
                <p style={{
                  fontSize: '12px',
                  color: '#6B6B6B',
                  margin: '0 0 8px 0',
                  fontStyle: 'italic'
                }}>
                  Dimensiones de la base (vista aérea del canvas)
                </p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Largo (cm) *</label>
                    <input
                      type="number"
                      value={obra.largo_cm || ''}
                      onChange={(e) => handleUpdate('largo_cm', e.target.value)}
                      placeholder="Largo de la base"
                      min="1"
                      step="0.1"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ancho (cm) *</label>
                    <input
                      type="number"
                      value={obra.ancho_cm || ''}
                      onChange={(e) => handleUpdate('ancho_cm', e.target.value)}
                      placeholder="Ancho de la base"
                      min="1"
                      step="0.1"
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Alto (cm) * <span style={{ fontWeight: '400', color: '#6B6B6B' }}>(altura de la escultura)</span>
                  </label>
                  <input
                    type="number"
                    value={obra.alto_cm || ''}
                    onChange={(e) => handleUpdate('alto_cm', e.target.value)}
                    placeholder="Altura de la escultura"
                    min="1"
                    step="0.1"
                    className={styles.formInput}
                  />
                </div>
              </>
            ) : (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Alto (cm) *</label>
                  <input
                    type="number"
                    value={obra.alto_cm || ''}
                    onChange={(e) => handleUpdate('alto_cm', e.target.value)}
                    placeholder="Alto"
                    min="1"
                    step="0.1"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ancho (cm) *</label>
                  <input
                    type="number"
                    value={obra.ancho_cm || ''}
                    onChange={(e) => handleUpdate('ancho_cm', e.target.value)}
                    placeholder="Ancho"
                    min="1"
                    step="0.1"
                    className={styles.formInput}
                  />
                </div>
              </div>
            )}

            {/* Técnica */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Técnica *</label>
              <input
                type="text"
                value={obra.tecnica || ''}
                onChange={(e) => handleUpdate('tecnica', e.target.value)}
                placeholder="Ej: Óleo sobre lienzo, Acrílico, Acuarela, Técnica mixta..."
                className={styles.formInput}
              />
            </div>

            {/* Año */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Año de creación *</label>
              <input
                type="number"
                value={obra.anio || ''}
                onChange={(e) => handleUpdate('anio', e.target.value)}
                placeholder="Ej: 2024"
                min="1900"
                max={new Date().getFullYear()}
                className={styles.formInput}
              />
            </div>

            {/* Calculadora de Precio */}
            {(() => {
              const inputValue = obra.precio_mxn ? Number(obra.precio_mxn) : 0
              const precios = calcularPrecio(inputValue)
              const formatMoney = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

              return (
                <div style={{
                  background: 'rgba(244, 237, 228, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  border: '1px solid rgba(244, 237, 228, 0.15)'
                }}>
                  {/* Input: Tu precio */}
                  <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                    <label className={styles.formLabel}>Tu precio (MXN) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={obra.precio_mxn ? Number(obra.precio_mxn).toLocaleString('es-MX') : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '')
                        handleUpdate('precio_mxn', rawValue)
                      }}
                      placeholder="10,000"
                      className={styles.formInput}
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  {/* Desglose de precios */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderTop: '1px solid rgba(244, 237, 228, 0.15)',
                    paddingTop: '16px'
                  }}>
                    {/* Tu ganancia */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#F4EDE4', opacity: 0.8 }}>Tu ganancia (75%)</span>
                      <span style={{ fontSize: '14px', color: '#F4EDE4', fontWeight: '600' }}>
                        {precios ? formatMoney(precios.ganancia) : '—'}
                      </span>
                    </div>

                    {/* Comisión ARTE FACTO */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#F4EDE4', opacity: 0.8 }}>Comisión ARTE FACTO (25%)</span>
                      <span style={{ fontSize: '14px', color: '#F4EDE4', fontWeight: '600' }}>
                        {precios ? formatMoney(precios.comision) : '—'}
                      </span>
                    </div>

                    {/* Precio al público */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#F4EDE4', opacity: 0.8 }}>Precio al público</span>
                      <span style={{ fontSize: '14px', color: '#F4EDE4', fontWeight: '600' }}>
                        {precios ? formatMoney(precios.precioPublico) : '—'}
                      </span>
                    </div>

                    {/* Precio sugerido (destacado) */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(184, 48, 48, 0.15)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#F4EDE4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        Precio sugerido
                        {/* Tooltip trigger */}
                        <span
                          ref={tooltipTriggerRef}
                          tabIndex="0"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (showTooltip) {
                              setShowTooltip(false)
                            } else {
                              handleShowTooltip()
                            }
                          }}
                          onMouseEnter={handleShowTooltip}
                          onMouseLeave={() => setShowTooltip(false)}
                          onFocus={handleShowTooltip}
                          onBlur={() => setShowTooltip(false)}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'rgba(244, 237, 228, 0.2)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            color: '#F4EDE4',
                            cursor: 'pointer'
                          }}
                        >
                          i
                        </span>
                      </span>
                      <span style={{ fontSize: '16px', color: '#B83030', fontWeight: '700' }}>
                        {precios ? formatMoney(precios.precioSugerido) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Nota al pie */}
                  <p style={{
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(244, 237, 228, 0.1)',
                    fontSize: '11px',
                    color: '#F4EDE4',
                    opacity: 0.6,
                    margin: '14px 0 0 0',
                    lineHeight: '1.4'
                  }}>
                    *Montos sin IVA
                  </p>
                </div>
              )
            })()}

            {/* Notas de montaje */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notas de montaje (opcional)</label>
              <textarea
                value={obra.notas_montaje || ''}
                onChange={(e) => handleUpdate('notas_montaje', e.target.value)}
                placeholder="Instrucciones especiales de instalación, altura de montaje, iluminación requerida, etc."
                className={styles.formTextarea}
              />
            </div>

            {/* Botones de acción */}
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.btnGuardarMetadata}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  // Tooltip renderizado como portal separado (fuera del modal para evitar overflow)
  const tooltipPortal = showTooltip && createPortal(
    <div
      style={{
        position: 'fixed',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: 'translate(-50%, -100%)',
        background: '#141210',
        color: '#F4EDE4',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '12px',
        lineHeight: '1.5',
        width: '220px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        zIndex: 100001,
        textAlign: 'left',
        pointerEvents: 'none'
      }}
    >
      Recuerda que estos valores son referencias. Se definirán los precios al ser seleccionado, en la hoja de consigna.
    </div>,
    document.body
  )

  return (
    <>
      {createPortal(modalContent, document.body)}
      {tooltipPortal}
    </>
  )
}
