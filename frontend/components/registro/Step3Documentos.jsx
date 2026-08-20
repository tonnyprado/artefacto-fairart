'use client'

import { useState } from 'react'
import FileUpload from '@/components/ui/FileUpload'
import { compressImage } from '@/lib/imageCompression'

/**
 * Paso 3: Upload de Documentos
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - documentos JSONB -- {cv_url, identificacion_url, portfolio_url}
 *   - foto VARCHAR(500) -- URL de foto de perfil
 *
 * PROCESO:
 * 1. Usuario sube archivos individuales
 * 2. Frontend comprime imágenes automáticamente
 * 3. Al enviar formulario, se suben a AWS
 * 4. URLs se guardan en BDD
 */

export default function Step3Documentos({ formData, updateFormData, errors }) {
  // Estados de carga para cada campo
  const [loadingStates, setLoadingStates] = useState({
    foto: false,
    cv: false,
    portfolio: false,
    identificacion: false,
  })

  const setFieldLoading = (field, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [field]: isLoading }))
  }
  const handleFileChange = async (fieldName, file) => {
    if (!file) return

    const fileSizeMB = file.size / (1024 * 1024)
    const isPDF = file.type === 'application/pdf'
    const isDoc = file.type === 'application/msword' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isImage = file.type.startsWith('image/')

    // Límites según tipo de archivo
    if (isPDF || isDoc) {
      // PDFs y documentos: máximo 10MB
      if (fileSizeMB > 10) {
        alert(`Tu ${isPDF ? 'PDF' : 'documento'} es muy grande (${fileSizeMB.toFixed(1)}MB).\n\nEl límite es 10MB.\n\nPuedes comprimirlo gratis en:\nhttps://www.ilovepdf.com/compress_pdf`)
        return
      }
    } else if (isImage) {
      // Imágenes: máximo 10MB entrada, se comprime a 2MB
      if (fileSizeMB > 10) {
        alert(`La imagen es muy grande (${fileSizeMB.toFixed(1)}MB). El máximo es 10MB.`)
        return
      }
    }

    let processedFile = file

    // Si es imagen y es mayor a 2MB, comprimir
    if (isImage && fileSizeMB > 2) {
      setFieldLoading(fieldName, true)
      try {
        processedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.80,
          maxSizeKB: 1500 // Comprimir a ~1.5MB
        })
        console.log(`✅ Imagen comprimida: ${fileSizeMB.toFixed(2)}MB → ${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`)
      } catch (error) {
        console.error('Error al comprimir imagen:', error)
        setFieldLoading(fieldName, false)
        alert('Error al procesar la imagen. Por favor, intenta con otra.')
        return
      }
      setFieldLoading(fieldName, false)
    }

    updateFormData({
      documentos: {
        ...formData.documentos,
        [fieldName]: processedFile
      }
    })
  }

  const handleFotoChange = async (file) => {
    if (!file) return

    const fileSizeMB = file.size / (1024 * 1024)

    // Rechazar fotos mayores a 10MB
    if (fileSizeMB > 10) {
      alert(`La foto es muy grande (${fileSizeMB.toFixed(1)}MB). El máximo es 10MB.`)
      return
    }

    // Si es mayor a 1MB, comprimir
    if (fileSizeMB > 1) {
      setFieldLoading('foto', true)
      try {
        const compressedFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          maxSizeKB: 800 // Comprimir a ~800KB
        })
        console.log(`✅ Foto comprimida: ${fileSizeMB.toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`)
        setFieldLoading('foto', false)
        updateFormData({ foto: compressedFile })
      } catch (error) {
        console.error('Error al comprimir foto:', error)
        setFieldLoading('foto', false)
        alert('Error al procesar la foto. Por favor, intenta con otra imagen.')
      }
    } else {
      updateFormData({ foto: file })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#141210' }}>
          Documentos Requeridos
        </h2>
        <p style={{ color: '#F4EDE4', fontSize: '15px' }}>
          Sube los documentos necesarios para completar tu inscripción
        </p>
      </div>

      {/* Foto de Perfil */}
      <FileUpload
        label="Foto de perfil"
        accept="image/jpeg,image/png,image/webp"
        maxSize={10}
        required
        value={formData.foto}
        onChange={handleFotoChange}
        error={errors?.foto}
        helperText="Formatos: JPG, PNG, WebP (máx 10MB, se comprime automáticamente)"
        isLoading={loadingStates.foto}
        loadingText="Comprimiendo foto..."
      />

      {/* CV Artístico */}
      <FileUpload
        label="CV Artístico"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        maxSize={10}
        required
        value={formData.documentos?.cv}
        onChange={(file) => handleFileChange('cv', file)}
        error={errors?.cv}
        helperText="Formatos: PDF, DOC, DOCX (máx 10MB)"
        isLoading={loadingStates.cv}
        loadingText="Procesando CV..."
      />

      {/* Portafolio */}
      <FileUpload
        label="Portafolio"
        accept=".pdf,application/pdf"
        maxSize={10}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Formato: PDF (máx 10MB) — Si pesa más, comprímelo en ilovepdf.com"
        isLoading={loadingStates.portfolio}
        loadingText="Procesando portafolio..."
      />

      {/* Identificación Oficial */}
      <FileUpload
        label="Identificación Oficial (INE o pasaporte)"
        accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
        maxSize={10}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText="Formatos: JPG, PNG, PDF (máx 10MB, imágenes se comprimen)"
        isLoading={loadingStates.identificacion}
        loadingText="Comprimiendo..."
      />

      <div style={{
        background: 'rgba(244, 237, 228, 0.12)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="rgba(244, 237, 228, 0.85)"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{
          fontSize: '13px',
          color: 'rgba(244, 237, 228, 0.85)',
          lineHeight: '1.7',
          margin: 0,
          flex: 1
        }}>
          Todos los documentos son obligatorios. Los archivos deben ser legibles y de buena calidad. Tu portafolio debe mostrar obra reciente (preferiblemente de los últimos 2-4 años). Los documentos serán revisados por el Comité Curatorial.
        </p>
      </div>

      <div style={{
        background: 'rgba(34, 197, 94, 0.15)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="rgba(34, 197, 94, 0.9)"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'rgba(34, 197, 94, 0.95)',
            marginBottom: '4px'
          }}>
            Compresión Automática
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(34, 197, 94, 0.85)',
            lineHeight: '1.7',
            margin: 0
          }}>
            Las imágenes se comprimen automáticamente. Límite: 10MB por archivo. PDFs grandes: comprime gratis en ilovepdf.com
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(244, 237, 228, 0.12)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="rgba(244, 237, 228, 0.85)"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{
          fontSize: '13px',
          color: 'rgba(244, 237, 228, 0.85)',
          lineHeight: '1.7',
          margin: 0,
          flex: 1
        }}>
          Sobre tu portafolio: Incluye variedad de obras que muestren tu estilo. Fotografías de alta calidad con buena iluminación. Incluye ficha técnica de cada pieza: título, técnica o materiales, dimensiones y año. Las piezas de tu portafolio no son necesariamente con las que te postularás a ARTE FACTO.
        </p>
      </div>
    </div>
  )
}
