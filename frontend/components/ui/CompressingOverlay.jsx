'use client'

/**
 * Overlay de compresión de imágenes
 * Reutiliza el estilo de FileUpload para mostrar estado de compresión
 */

export default function CompressingOverlay({
  isCompressing = false,
  filesCount = 1,
  currentFile = 1,
  message = "Comprimiendo imágenes..."
}) {
  if (!isCompressing) return null

  const progress = filesCount > 1 ? `${currentFile}/${filesCount}` : null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(20, 18, 16, 0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* Spinner animado */}
      <div
        className="animate-spin"
        style={{
          width: '64px',
          height: '64px',
          border: '4px solid rgba(245, 158, 11, 0.2)',
          borderTopColor: '#F59E0B',
          borderRadius: '50%',
          marginBottom: '20px',
        }}
      />

      {/* Mensaje principal */}
      <p style={{
        color: '#F59E0B',
        fontSize: '18px',
        fontWeight: 700,
        margin: 0,
        marginBottom: '8px',
        fontFamily: 'acumin-pro, sans-serif',
        letterSpacing: '0.02em',
      }}>
        {message}
      </p>

      {/* Progreso si hay múltiples archivos */}
      {progress && (
        <p style={{
          color: '#F59E0B',
          fontSize: '14px',
          fontWeight: 600,
          margin: '0 0 12px 0',
          fontFamily: 'acumin-pro, sans-serif',
        }}>
          Archivo {progress}
        </p>
      )}

      {/* Texto secundario */}
      <p style={{
        color: 'rgba(244, 237, 228, 0.7)',
        fontSize: '14px',
        marginTop: '4px',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: '1.6',
        fontFamily: 'acumin-pro, sans-serif',
      }}>
        Optimizando calidad de imagen...
        <br />
        Esto puede tomar unos segundos
      </p>

      {/* Indicador adicional de calidad */}
      <div style={{
        marginTop: '24px',
        padding: '12px 24px',
        background: 'rgba(245, 158, 11, 0.15)',
        borderRadius: '12px',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}>
        <p style={{
          color: 'rgba(244, 237, 228, 0.9)',
          fontSize: '12px',
          margin: 0,
          fontFamily: 'acumin-pro, sans-serif',
        }}>
          ✨ Preservando alta calidad • Reduciendo tamaño ~87%
          <br />
          🎨 PNG con transparencia se mantiene, otros formatos → JPEG
        </p>
      </div>
    </div>
  )
}
