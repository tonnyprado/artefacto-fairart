'use client'

import { forwardRef, useState } from 'react'
import { COLORS, COLORS_DARK, FONTS } from './constants'

/**
 * Item individual de la galería de obras
 * Muestra thumbnail con info básica
 * @param {string} variant - 'light' (default) o 'dark'
 */
const GalleryItem = forwardRef(function GalleryItem({ obra, index, onClick, variant = 'light' }, ref) {
  const [imageError, setImageError] = useState(false)
  const imageSrc = obra.imagen_url || obra.preview
  // Verificar que la URL no sea de blob (ya que expiran y causan errores)
  const isValidUrl = imageSrc && !imageSrc.startsWith('blob:')
  const hasImage = isValidUrl && !imageError
  const colors = variant === 'dark' ? COLORS_DARK : COLORS

  return (
    <div
      ref={ref}
      className="gallery-item"
      onClick={() => onClick(obra, index)}
      style={{
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden',
        background: variant === 'dark' ? colors.cardBg : colors.white,
        border: `1px solid ${variant === 'dark' ? colors.cardBorder : colors.creamDark}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Imagen */}
      <div style={{
        position: 'relative',
        aspectRatio: '1',
        background: variant === 'dark' ? '#fff' : colors.cream,
        overflow: 'hidden',
      }}>
        {hasImage ? (
          <img
            src={imageSrc}
            alt={obra.titulo || `Obra ${index + 1}`}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ImagePlaceholder colors={colors} />
          </div>
        )}

        {/* Overlay con número */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '24px',
          height: '24px',
          background: variant === 'dark' ? COLORS.cream : COLORS.black,
          color: variant === 'dark' ? COLORS.black : COLORS.cream,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: FONTS.body,
        }}>
          {index + 1}
        </div>
      </div>

      {/* Info básica */}
      <div style={{ padding: '12px' }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: 600,
          color: colors.black,
          fontFamily: FONTS.body,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {obra.titulo || `Obra ${index + 1}`}
        </p>

        {(obra.alto_cm || obra.ancho_cm) && (
          <p style={{
            margin: '4px 0 0',
            fontSize: '11px',
            color: colors.gray,
            fontFamily: FONTS.body,
          }}>
            {obra.ancho_cm} × {obra.alto_cm} cm
          </p>
        )}
      </div>
    </div>
  )
})

function ImagePlaceholder({ colors = COLORS }) {
  return (
    <svg
      style={{ width: '32px', height: '32px', color: colors.grayLight }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

export default GalleryItem
