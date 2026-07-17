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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all',
          dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300',
          error ? 'border-red-500' : ''
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={accept}
          onChange={handleChange}
          {...props}
        />

        <div className="text-center">
          {preview ? (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 mx-auto rounded-lg"
              />
            </div>
          ) : fileName ? (
            <div className="mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-gray-600 mr-2"
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
                <span className="text-sm text-gray-700">{fileName}</span>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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

          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-red-600">Haz clic</span> o arrastra
            el archivo aquí
          </p>
          <p className="text-xs text-gray-500">
            Tamaño máximo: {maxSize}MB
          </p>
          {helperText && (
            <p className="text-xs text-gray-500 mt-2">{helperText}</p>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
