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
      // PDFs y documentos: máximo 100MB
      if (fileSizeMB > 100) {
        const compressUrl = isPDF
          ? 'https://www.ilovepdf.com/compress_pdf'
          : 'https://www.wecompress.com'
        const fileType = isPDF ? 'PDF' : 'documento'
        alert(`${fileType} demasiado grande (${fileSizeMB.toFixed(1)}MB).\n\nLímite: 100MB\n\nPuedes comprimirlo en:\n${compressUrl}`)
        return
      }
    } else if (isImage) {
      // Imágenes: máximo 100MB entrada, se comprime a 2MB
      if (fileSizeMB > 100) {
        alert(`Imagen demasiado grande (${fileSizeMB.toFixed(1)}MB). Tamaño máximo: 100MB`)
        return
      }
    }

    let processedFile = file

    // Si es imagen y es mayor a 2MB, comprimir
    if (isImage && fileSizeMB > 2) {
      setFieldLoading(fieldName, true)
      try {
        processedFile = await compressImage(file, {
          maxWidth: 2400, // Aumentado de 1920 a 2400 para mejor calidad
          maxHeight: 2400,
          quality: 0.90, // Aumentado de 0.80 a 0.90 para mejor calidad
          maxSizeKB: 3000 // Aumentado de 1.5MB a 3MB para preservar calidad
        })
        console.log(`✅ Imagen comprimida: ${fileSizeMB.toFixed(2)}MB → ${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`)
      } catch (error) {
        console.error('Error al comprimir imagen:', error)
        setFieldLoading(fieldName, false)
        alert('Error al comprimir la imagen. Por favor, intenta con otra imagen.')
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

    // Rechazar fotos mayores a 100MB
    if (fileSizeMB > 100) {
      alert(`Foto demasiado grande (${fileSizeMB.toFixed(1)}MB). Tamaño máximo: 100MB`)
      return
    }

    // Si es mayor a 1MB, comprimir
    if (fileSizeMB > 1) {
      setFieldLoading('foto', true)
      try {
        const compressedFile = await compressImage(file, {
          maxWidth: 1600, // Aumentado de 1200 a 1600 para mejor calidad
          maxHeight: 1600,
          quality: 0.90, // Aumentado de 0.85 a 0.90 para mejor calidad
          maxSizeKB: 1500 // Aumentado de 800KB a 1.5MB para mejor calidad
        })
        console.log(`✅ Foto comprimida: ${fileSizeMB.toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`)
        setFieldLoading('foto', false)
        updateFormData({ foto: compressedFile })
      } catch (error) {
        console.error('Error al comprimir foto:', error)
        setFieldLoading('foto', false)
        alert('Error al comprimir la foto. Por favor, intenta con otra imagen.')
      }
    } else {
      updateFormData({ foto: file })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#141210' }}>
          Documentos
        </h2>
        <p style={{ color: '#F4EDE4', fontSize: '15px' }}>
          Sube tus documentos requeridos
        </p>
      </div>

      {/* Foto de Perfil */}
      <FileUpload
        label="Foto de Perfil"
        accept="image/jpeg,image/png,image/webp"
        maxSize={10}
        required
        value={formData.foto}
        onChange={handleFotoChange}
        error={errors?.foto}
        helperText="JPG, PNG o WebP. Máximo 1600x1600px. Se comprime automáticamente manteniendo alta calidad."
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
        helperText="PDF o Word. Incluye tu trayectoria, exposiciones, premios, etc."
        isLoading={loadingStates.cv}
        loadingText="Procesando CV..."
      />

      {/* Portafolio */}
      <FileUpload
        label="Portafolio (PDF)"
        accept=".pdf,application/pdf"
        maxSize={10}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Máximo 10 páginas con imágenes de tu obra más representativa"
        isLoading={loadingStates.portfolio}
        loadingText="Procesando portafolio..."
      />

      {/* Identificación Oficial */}
      <FileUpload
        label="Identificación Oficial"
        accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
        maxSize={10}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText="INE, pasaporte o documento oficial vigente"
        isLoading={loadingStates.identificacion}
        loadingText="Procesando identificación..."
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
          Todos los archivos son confidenciales y solo serán usados para el proceso de selección.
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
            Las imágenes se comprimen automáticamente preservando alta calidad (90-92%). PNG con transparencia se mantiene, otros formatos se convierten a JPEG optimizado.
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
          El portafolio debe incluir imágenes de alta calidad de tus obras más representativas. Evita incluir texto extenso.
        </p>
      </div>
    </div>
  )
}
