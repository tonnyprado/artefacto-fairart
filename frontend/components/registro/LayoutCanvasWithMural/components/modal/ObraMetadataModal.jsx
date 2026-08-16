'use client'

import { useRef, useEffect } from 'react'
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
  const modalOverlayRef = useRef(null)
  const modalContentRef = useRef(null)

  // Animación de entrada del modal
  useEffect(() => {
    if (modalOverlayRef.current && modalContentRef.current) {
      gsap.fromTo(
        modalOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      gsap.fromTo(
        modalContentRef.current,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      )
    }
  }, [])

  const handleClose = () => {
    if (modalOverlayRef.current && modalContentRef.current) {
      gsap.to(modalOverlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      })
      gsap.to(modalContentRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: onClose
      })
    } else {
      onClose()
    }
  }

  const handleUpdate = (field, value) => {
    onUpdateMetadata(obra.id, field, value)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      ref={modalOverlayRef}
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalContentRef}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Metadata de la obra</h3>
          <button
            type="button"
            onClick={handleClose}
            className={styles.btnCerrarModal}
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
  )
}
