'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Componente FileUpload
 */

export default function FileUpload({
  label,
  error,
  accept = '*',
  maxSize = 10, // MB
  required = false,
  onChange,
  value,
  helperText,
  isLoading = false,
  loadingText = 'Comprimiendo...',
  ...props
}) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Validar tamaño
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSize) {
      alert(`El archivo es muy grande. Tamaño máximo: ${maxSize}MB`)
      return
    }

    // Preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    if (onChange) {
      onChange(file)
    }
  }

  const fileName = value?.name || null

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: '#F4EDE4' }}>
          {label}
          {required && <span style={{ color: '#FEE2E2', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <div
        style={{
          borderRadius: '16px',
          borderColor: isLoading ? '#F59E0B' : dragActive ? '#B83030' : error ? '#B83030' : 'rgba(255,255,255,0.4)',
          background: isLoading ? 'rgba(245,158,11,0.1)' : dragActive ? 'rgba(184,48,48,0.1)' : 'transparent',
          position: 'relative',
          overflow: 'hidden',
        }}
        className={cn(
          'relative border-2 border-dashed p-6 transition-all'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={isLoading ? undefined : handleDrop}
      >
        {/* Overlay de carga */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(20, 18, 16, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '14px',
          }}>
            {/* Spinner animado usando Tailwind */}
            <div
              className="animate-spin"
              style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(245, 158, 11, 0.2)',
                borderTopColor: '#F59E0B',
                borderRadius: '50%',
                marginBottom: '12px',
              }}
            />
            <p style={{
              color: '#F59E0B',
              fontSize: '14px',
              fontWeight: 600,
              margin: 0,
            }}>
              {loadingText}
            </p>
            <p style={{
              color: 'rgba(244, 237, 228, 0.6)',
              fontSize: '12px',
              marginTop: '4px',
            }}>
              Esto puede tomar unos segundos...
            </p>
          </div>
        )}

        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={accept}
          onChange={handleChange}
          disabled={isLoading}
          style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
          {...props}
        />

        <div className="text-center">
          {preview ? (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                style={{ borderRadius: '16px' }}
                className="max-h-40 mx-auto"
              />
            </div>
          ) : fileName ? (
            <div className="mb-4">
              <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.15)' }} className="inline-flex items-center px-4 py-2">
                <svg
                  className="w-5 h-5 mr-2"
                  style={{ color: 'white' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm" style={{ color: 'white' }}>{fileName}</span>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <p className="text-sm mb-1" style={{ color: 'white' }}>
            <span className="font-semibold" style={{ color: '#B83030' }}>Haz clic</span> o arrastra
            el archivo aquí
          </p>
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Tamaño máximo: {maxSize}MB
          </p>
          {helperText && (
            <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{helperText}</p>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
