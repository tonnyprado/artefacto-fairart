'use client'

import { forwardRef, useState } from 'react'
import { COLORS, FONTS } from './constants'

/**
 * Panel de detalle de obra con imagen y ficha técnica
 * Se anima con GSAP Flip desde el item de la galería
 */
const GalleryDetail = forwardRef(function GalleryDetail({
  obra,
  onClose,
  onDownload,
  onUploadFoto,
  isAdmin = false,
  contentRef,
  imageRef,
}, ref) {
  const [imageError, setImageError] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!obra) return null

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadFoto) return

    setUploading(true)
    try {
      await onUploadFoto(file, obra.id)
    } catch (error) {
      console.error('Error al subir foto:', error)
    } finally {
      setUploading(false)
    }
  }

  const imageSrc = obra.imagen_url || obra.preview
  // Permitir blob URLs (son válidas mientras la sesión esté activa)
  const hasImage = imageSrc && !imageError

  return (
    <div
      ref={ref}
      className="gallery-detail"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '900px',
        maxHeight: '85vh',
        background: COLORS.white,
        borderRadius: '20px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
        visibility: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Imagen (lado izquierdo) */}
      <div style={{
        flex: '1 1 55%',
        background: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        {hasImage ? (
          <img
            ref={imageRef}
            src={imageSrc}
            alt={obra.titulo}
            onError={() => setImageError(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Contenido/Ficha técnica (lado derecho) */}
      <div
        ref={contentRef}
        className="gallery-detail-content"
        style={{
          flex: '1 1 45%',
          padding: '32px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header con botón cerrar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: COLORS.black,
            fontFamily: FONTS.display,
            fontStyle: 'italic',
            lineHeight: 1.3,
            flex: 1,
            paddingRight: '16px',
          }}>
            {obra.titulo || 'Sin título'}
          </h2>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: COLORS.cream,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Ficha técnica */}
        <div style={{ flex: 1 }}>
          <FichaItem label="Dimensiones" value={`${obra.ancho_cm} × ${obra.alto_cm} cm`} />
          <FichaItem label="Técnica" value={obra.tecnica} />
          <FichaItem label="Año" value={obra.anio} />
          <FichaItem
            label="Precio"
            value={obra.precio_mxn ? `$${Number(obra.precio_mxn).toLocaleString('es-MX')} MXN` : null}
            highlight
          />

          {obra.notas_montaje && (
            <div style={{ marginTop: '20px' }}>
              <p style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: COLORS.gray,
                fontFamily: FONTS.body,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Notas de montaje
              </p>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: COLORS.black,
                fontFamily: FONTS.body,
                lineHeight: 1.6,
              }}>
                {obra.notas_montaje}
              </p>
            </div>
          )}

          {/* Fotos de detalle */}
          {obra.fotos_detalle_urls && obra.fotos_detalle_urls.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p style={{
                margin: '0 0 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: COLORS.gray,
                fontFamily: FONTS.body,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Fotos de detalle ({obra.fotos_detalle_urls.length})
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}>
                {obra.fotos_detalle_urls.map((fotoUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => window.open(fotoUrl, '_blank')}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      background: COLORS.cream,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <img
                      src={fotoUrl}
                      alt={`Detalle ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón de subir foto (solo admin) */}
        {isAdmin && onUploadFoto && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
              id={`upload-foto-${obra.id}`}
            />
            <label
              htmlFor={`upload-foto-${obra.id}`}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '14px',
                background: uploading ? COLORS.gray : '#3B82F6',
                color: COLORS.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: FONTS.body,
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {uploading ? (
                <>
                  <LoadingIcon />
                  Subiendo...
                </>
              ) : (
                <>
                  <UploadIcon />
                  {hasImage ? 'Cambiar foto' : 'Agregar foto'}
                </>
              )}
            </label>
          </>
        )}

        {/* Botón de descarga */}
        {onDownload && hasImage && (
          <button
            onClick={() => onDownload(obra)}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '14px',
              background: COLORS.black,
              color: COLORS.cream,
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: FONTS.body,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <DownloadIcon />
            Descargar imagen
          </button>
        )}
      </div>
    </div>
  )
})

function FichaItem({ label, value, highlight = false }) {
  if (!value) return null

  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: '11px',
        fontWeight: 600,
        color: COLORS.gray,
        fontFamily: FONTS.body,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: highlight ? '18px' : '15px',
        fontWeight: highlight ? 600 : 400,
        color: highlight ? COLORS.red : COLORS.black,
        fontFamily: FONTS.body,
      }}>
        {value}
      </p>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg style={{ width: '18px', height: '18px', color: COLORS.black }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function ImagePlaceholder() {
  return (
    <svg style={{ width: '64px', height: '64px', color: COLORS.grayLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

export default GalleryDetail
