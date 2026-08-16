'use client'

import styles from '../../styles/LayoutCanvas.module.css'

/**
 * Tarjeta de obra individual en la galería
 * @param {Object} obra - Datos de la obra
 * @param {boolean} isInCanvas - Si la obra está en el canvas
 * @param {boolean} hasMetadata - Si la obra tiene metadata completa
 * @param {Function} onEdit - Callback al editar
 * @param {Function} onDelete - Callback al eliminar
 * @param {Function} onDragStart - Callback al iniciar drag
 */
export function ObraCard({
  obra,
  isInCanvas,
  hasMetadata,
  onEdit,
  onDelete,
  onDragStart
}) {
  return (
    <div className={styles.obraCard}>
      <img
        src={obra.preview}
        alt={obra.titulo || 'Sin título'}
        draggable={!isInCanvas && hasMetadata}
        onDragStart={(e) => !isInCanvas && hasMetadata && onDragStart(e, obra)}
        className={styles.obraCardImage}
        style={{
          cursor: !isInCanvas && hasMetadata ? 'grab' : 'default'
        }}
      />

      {/* Indicador de metadata incompleta */}
      {!hasMetadata && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(244, 237, 228, 0.5)',
          border: '1px solid #E8DED1'
        }} />
      )}

      {/* Indicador de obra en canvas */}
      {isInCanvas && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#141210'
        }} />
      )}

      <div className={styles.obraCardInfo}>
        <p className={styles.obraCardTitle}>
          {obra.titulo || 'Sin título'}
        </p>
        <p className={styles.obraCardDimensions}>
          {obra.alto_cm && obra.ancho_cm
            ? `${obra.alto_cm} x ${obra.ancho_cm} cm`
            : 'Sin dimensiones'}
        </p>

        {obra.precio_mxn ? (
          <p style={{
            fontSize: '12px',
            color: '#B83030',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            ${parseFloat(obra.precio_mxn).toLocaleString('es-MX')} MXN
          </p>
        ) : (
          <p style={{
            fontSize: '11px',
            color: '#EAB308',
            marginBottom: '8px'
          }}>
            Sin precio
          </p>
        )}
      </div>

      <div className={styles.obraActions}>
        <button
          type="button"
          onClick={() => onEdit(obra)}
          className={styles.btnEditar}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(obra.id)}
          className={styles.btnEliminar}
        >
          ×
        </button>
      </div>
    </div>
  )
}
