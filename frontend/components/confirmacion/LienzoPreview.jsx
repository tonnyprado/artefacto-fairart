'use client'

import { useState } from 'react'
import { COLORS, FONTS } from './constants'

/**
 * Componente para mostrar el preview del lienzo con opciones de descarga
 */
export default function LienzoPreview({ canvasData, onImageClick }) {
  if (!canvasData?.layout_canvas_pdf_url && !canvasData?.layout_canvas_url) {
    return null
  }

  const hasPdf = !!canvasData.layout_canvas_pdf_url
  const hasImage = !!canvasData.layout_canvas_url

  return (
    <div style={{
      marginTop: '24px',
      background: COLORS.white,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${COLORS.creamDark}`,
    }}>
      <LienzoHeader
        paqueteName={canvasData.paquete_nombre}
        obrasCount={canvasData.obras_count}
      />

      <LienzoContent
        hasPdf={hasPdf}
        pdfUrl={canvasData.layout_canvas_pdf_url}
        imageUrl={canvasData.layout_canvas_url}
        onImageClick={onImageClick}
      />

      <DownloadButtons
        hasPdf={hasPdf}
        hasImage={hasImage}
        pdfUrl={canvasData.layout_canvas_pdf_url}
        imageUrl={canvasData.layout_canvas_url}
      />
    </div>
  )
}

function LienzoHeader({ paqueteName, obrasCount }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    }}>
      <h3 style={{
        fontWeight: 600,
        color: COLORS.black,
        fontFamily: FONTS.body,
        fontSize: '14px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        Tu Lienzo
      </h3>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {paqueteName && (
          <span style={{
            fontSize: '12px',
            color: COLORS.gray,
            fontFamily: FONTS.body,
          }}>
            {paqueteName}
          </span>
        )}
        {obrasCount > 0 && (
          <span style={{
            fontSize: '11px',
            background: COLORS.black,
            color: COLORS.cream,
            padding: '4px 10px',
            borderRadius: '12px',
            fontFamily: FONTS.body,
            fontWeight: 500,
          }}>
            {obrasCount} obra{obrasCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

function LienzoContent({ hasPdf, pdfUrl, imageUrl, onImageClick }) {
  if (hasPdf) {
    return (
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${COLORS.creamDark}`,
        background: COLORS.cream,
      }}>
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '350px',
            border: 'none',
          }}
          title="Tu lienzo PDF"
        />
      </div>
    )
  }

  if (imageUrl) {
    return (
      <div
        onClick={() => onImageClick?.(imageUrl)}
        style={{
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${COLORS.creamDark}`,
          transition: 'border-color 0.2s',
        }}
      >
        <img
          src={imageUrl}
          alt="Tu lienzo"
          style={{
            width: '100%',
            maxHeight: '250px',
            objectFit: 'contain',
            background: COLORS.cream,
          }}
        />
      </div>
    )
  }

  return null
}

function DownloadButtons({ hasPdf, hasImage, pdfUrl, imageUrl }) {
  return (
    <div style={{
      marginTop: '16px',
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}>
      {hasPdf && (
        <DownloadButton
          href={pdfUrl}
          filename="mi-lienzo-artefacto.pdf"
          variant="primary"
          icon={<DownloadIcon />}
        >
          Descargar PDF
        </DownloadButton>
      )}

      {hasImage && (
        <DownloadButton
          href={imageUrl}
          filename="mi-lienzo-artefacto.jpg"
          variant={hasPdf ? 'secondary' : 'primary'}
          icon={<ImageIcon />}
        >
          {hasPdf ? 'Ver Imagen' : 'Descargar Imagen'}
        </DownloadButton>
      )}
    </div>
  )
}

function DownloadButton({ href, filename, variant, icon, children }) {
  const isPrimary = variant === 'primary'

  return (
    <a
      href={href}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: isPrimary ? COLORS.black : COLORS.cream,
        color: isPrimary ? COLORS.cream : COLORS.black,
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '13px',
        fontFamily: FONTS.body,
        transition: 'all 0.2s',
        border: isPrimary ? 'none' : `1px solid ${COLORS.creamDark}`,
      }}
    >
      {icon}
      {children}
    </a>
  )
}

function DownloadIcon() {
  return (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
