'use client'

import { useRef } from 'react'
import { ObraCard } from './ObraCard'
import styles from '../../styles/LayoutCanvas.module.css'

/**
 * Componente de galería de obras del artista
 * @param {Array} obras - Todas las obras
 * @param {Array} obrasEnCanvas - Obras que están en el canvas
 * @param {number} obrasMaximas - Número máximo de obras en el paquete
 * @param {Function} onAddNewObra - Callback para agregar nueva obra
 * @param {Function} onEditObra - Callback para editar obra
 * @param {Function} onDeleteObra - Callback para eliminar obra
 * @param {Function} onDragStart - Callback al iniciar drag (mouse)
 * @param {Function} onTouchDragStart - Callback al iniciar drag táctil
 * @param {Function} hasCompleteMetadata - Función que verifica metadata completa
 */
export function ObrasGallery({
  obras,
  obrasEnCanvas,
  obrasMaximas,
  onAddNewObra,
  onEditObra,
  onDeleteObra,
  onDragStart,
  onTouchDragStart,
  hasCompleteMetadata
}) {
  const fileInputRef = useRef()

  return (
    <div className={styles.galeriaSection}>
      <div className={styles.galeriaHeader}>
        <h3 className={styles.galeriaTitle}>
          Tus Obras ({obras.length})
        </h3>
        <div className={styles.galeriaActions}>
          {obrasEnCanvas.length > 0 && (
            <span className={styles.contadorObras}>
              En Lienzo: {obrasEnCanvas.length}/{obrasMaximas}
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.btnAgregarObra}
          >
            <span>+</span> Agregar obra
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onAddNewObra}
            className={styles.fileInput}
          />
        </div>
      </div>

      {/* Lista horizontal de obras */}
      <div className={styles.obrasLista}>
        {obras.map((obra) => {
          const isInCanvas = obrasEnCanvas.some(o => o.id === obra.id)
          const hasMetadata = hasCompleteMetadata(obra)

          return (
            <ObraCard
              key={obra.id}
              obra={obra}
              isInCanvas={isInCanvas}
              hasMetadata={hasMetadata}
              onEdit={onEditObra}
              onDelete={onDeleteObra}
              onDragStart={onDragStart}
              onTouchDragStart={onTouchDragStart}
            />
          )
        })}

        {/* Estado vacío */}
        {obras.length === 0 && (
          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            border: '2px dashed #E8DED1'
          }}>
            <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '12px' }}>
              No has agregado obras. Haz clic en "+ Agregar obra" para comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
