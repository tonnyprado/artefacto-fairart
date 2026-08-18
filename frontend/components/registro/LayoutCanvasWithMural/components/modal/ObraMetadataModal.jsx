'use client'

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import styles from '../../styles/LayoutCanvas.module.css'

/**
 * Modal para editar metadata de una obra
 * @param {Object} obra - Obra que se está editando
 * @param {boolean} es3D - Si es paquete 3D
 * @param {Function} onUpdateMetadata - Callback para actualizar metadata
 * @param {Function} onClose - Callback al cerrar
 */
export function ObraMetadataModal({ obra, es3D, onUpdateMetadata, onClose }) {
  const modalContentRef = useRef(null)
  const [mounted, setMounted] = useState(false)

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

            {/* Precio */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Precio de venta (MXN) *</label>
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
              />
            </div>

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

  return createPortal(modalContent, document.body)
}
