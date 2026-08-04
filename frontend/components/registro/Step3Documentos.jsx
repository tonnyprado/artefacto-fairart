'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/ui/FileUpload'

/**
 * Paso 3: Upload de Documentos
 *
 * CAMBIO IMPORTANTE: Portfolio ahora acepta MÚLTIPLES IMÁGENES individuales con metadata
 * en lugar de un solo PDF.
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - documentos JSONB -- {cv_url, identificacion_url, portfolio_images: []}
 *   - foto VARCHAR(500) -- URL de foto de perfil
 *
 * PROCESO:
 * 1. Usuario sube archivos individuales
 * 2. Frontend guarda archivos temporalmente con metadata
 * 3. Al enviar formulario, se suben a Cloudinary
 * 4. URLs de Cloudinary se guardan en BDD
 */

/**
 * Componente para subir múltiples imágenes del portfolio con metadata
 */
function PortfolioImageUpload({ images, onChange, error }) {
  const [currentImages, setCurrentImages] = useState(images || [])

  useEffect(() => {
    setCurrentImages(images || [])
  }, [images])

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const MAX_IMAGES = 15

    // Validar límite de imágenes
    if (currentImages.length >= MAX_IMAGES) {
      alert(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes`)
      return
    }

    const remainingSlots = MAX_IMAGES - currentImages.length
    const filesToProcess = files.slice(0, remainingSlots)

    if (files.length > remainingSlots) {
      alert(`Solo puedes agregar ${remainingSlots} imagen(es) más. Máximo ${MAX_IMAGES} imágenes permitidas.`)
    }

    const validFiles = filesToProcess.filter(file => {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} excede el límite de 5MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`)
        return false
      }
      return true
    })

    const newImages = validFiles.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      titulo: '',
      alto_cm: '',
      ancho_cm: ''
    }))

    const updated = [...currentImages, ...newImages]
    setCurrentImages(updated)
    onChange(updated)
  }

  const handleRemoveImage = (id) => {
    const imageToRemove = currentImages.find(img => img.id === id)
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview)
    }

    const updated = currentImages.filter(img => img.id !== id)
    setCurrentImages(updated)
    onChange(updated)
  }

  const handleUpdateMetadata = (id, field, value) => {
    const updated = currentImages.map(img =>
      img.id === id ? { ...img, [field]: value } : img
    )
    setCurrentImages(updated)
    onChange(updated)
  }

  // Cleanup: Liberar URLs de blob cuando el componente se desmonte
  useEffect(() => {
    return () => {
      currentImages.forEach(img => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview)
        }
      })
    }
  }, [currentImages])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Portfolio de Obras *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Sube hasta 15 imágenes de tus obras. Incluye las dimensiones reales de cada pieza.
        </p>

        {/* Botón de upload */}
        <label style={{ borderRadius: '16px' }} className={`inline-flex items-center px-6 py-3 text-white transition-all ${
          currentImages.length >= 15
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gray-900 cursor-pointer hover:bg-gray-700'
        }`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {currentImages.length >= 15 ? 'Límite Alcanzado' : 'Agregar Imágenes'}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImage}
            disabled={currentImages.length >= 15}
            className="hidden"
          />
        </label>

        <p className="text-xs text-gray-500 mt-2">
          {currentImages.length} de 15 imágenes • Formatos: JPG, PNG • Máximo 5MB por imagen
        </p>
      </div>

      {/* Grid de imágenes */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentImages.map((img) => (
            <div key={img.id} style={{ borderRadius: '16px' }} className="bg-gray-50 p-4 border border-gray-200">
              <div className="relative mb-3">
                <img
                  src={img.preview}
                  alt="Preview"
                  style={{ borderRadius: '16px' }}
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  style={{ borderRadius: '50%' }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 hover:bg-red-700 transition-colors"
                  title="Eliminar imagen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={img.titulo}
                  onChange={(e) => handleUpdateMetadata(img.id, 'titulo', e.target.value)}
                  placeholder="Título de la obra *"
                  style={{ borderRadius: '16px' }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      value={img.alto_cm}
                      onChange={(e) => handleUpdateMetadata(img.id, 'alto_cm', e.target.value)}
                      placeholder="Alto (cm) *"
                      min="1"
                      step="0.1"
                      style={{ borderRadius: '16px' }}
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={img.ancho_cm}
                      onChange={(e) => handleUpdateMetadata(img.id, 'ancho_cm', e.target.value)}
                      placeholder="Ancho (cm) *"
                      min="1"
                      step="0.1"
                      style={{ borderRadius: '16px' }}
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>

                {/* Validación visual */}
                {(!img.titulo || !img.alto_cm || !img.ancho_cm) && (
                  <p className="text-xs text-red-600">
                    * Completa todos los campos
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default function Step3Documentos({ formData, updateFormData, errors }) {
  const handleFileChange = (fieldName, file) => {
    updateFormData({
      documentos: {
        ...formData.documentos,
        [fieldName]: file
      }
    })
  }

  const handleFotoChange = (file) => {
    updateFormData({ foto: file })
  }

  const handlePortfolioImagesChange = (images) => {
    updateFormData({ portfolio_images: images })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Documentos Requeridos
        </h2>
        <p className="text-gray-600">
          Sube los documentos necesarios para completar tu inscripción
        </p>
      </div>

      {/* Foto de Perfil */}
      <FileUpload
        label="Foto de Perfil"
        accept="image/*"
        maxSize={5}
        required
        value={formData.foto}
        onChange={handleFotoChange}
        error={errors?.foto}
        helperText="Formato: JPG, PNG. Una foto profesional de tu rostro."
      />

      {/* CV Artístico */}
      <FileUpload
        label="CV Artístico"
        accept=".pdf,.doc,.docx"
        maxSize={10}
        required
        value={formData.documentos?.cv}
        onChange={(file) => handleFileChange('cv', file)}
        error={errors?.cv}
        helperText="Formato: PDF, DOC, DOCX. Incluye tu trayectoria, exposiciones, premios, estudios, etc."
      />

      {/* Portfolio de Obras (MÚLTIPLES IMÁGENES) */}
      <PortfolioImageUpload
        images={formData.portfolio_images || []}
        onChange={handlePortfolioImagesChange}
        error={errors?.portfolio_images}
      />

      {/* Identificación Oficial */}
      <FileUpload
        label="Identificación Oficial"
        accept="image/*,.pdf"
        maxSize={5}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText="Formato: JPG, PNG, PDF. INE, pasaporte o cédula profesional vigente."
      />

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
        <div className="flex">
          <svg
            className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Todos los documentos son obligatorios</li>
              <li>Los archivos deben ser legibles y de buena calidad</li>
              <li>
                Tu portfolio debe mostrar obra reciente (últimos 2-3 años)
              </li>
              <li>
                Las dimensiones de las obras son necesarias para el Paso 5 (diseño de layout)
              </li>
              <li>
                Los documentos serán revisados por el equipo de curaduría
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-2xl">
        <div className="flex">
          <svg
            className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">Consejos para tu portfolio:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Incluye variedad de obras que muestren tu estilo</li>
              <li>Fotografías de alta calidad con buena iluminación</li>
              <li>Incluye el título y dimensiones exactas de cada obra</li>
              <li>Ordena las obras de forma que cuenten una historia</li>
              <li>Las dimensiones serán usadas para diseñar tu espacio en la feria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
