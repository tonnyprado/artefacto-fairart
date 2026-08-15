'use client'

import { COLORS, FONTS } from './constants'

/**
 * Modal para ver imágenes en pantalla completa
 */
export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 18, 16, 0.95)',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '95vw',
          maxHeight: '95vh',
          background: COLORS.white,
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <ModalHeader imageUrl={imageUrl} onClose={onClose} />
        <ModalContent imageUrl={imageUrl} />
      </div>
    </div>
  )
}

function ModalHeader({ imageUrl, onClose }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: `1px solid ${COLORS.creamDark}`,
    }}>
      <h3 style={{
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: COLORS.black,
        fontFamily: FONTS.body,
      }}>
        Tu Lienzo - ARTEFACTO 2027
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconButton
          href={imageUrl}
          download="mi-lienzo-artefacto.jpg"
          as="a"
          title="Descargar"
        >
          <DownloadIcon />
        </IconButton>

        <IconButton onClick={onClose} title="Cerrar">
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  )
}

function ModalContent({ imageUrl }) {
  return (
    <div style={{
      padding: '16px',
      background: COLORS.cream,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img
        src={imageUrl}
        alt="Tu lienzo"
        style={{
          maxWidth: '100%',
          maxHeight: 'calc(95vh - 100px)',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

function IconButton({ children, as = 'button', ...props }) {
  const Component = as

  return (
    <Component
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        background: COLORS.cream,
        borderRadius: '8px',
        color: COLORS.black,
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

function DownloadIcon() {
  return (
    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
