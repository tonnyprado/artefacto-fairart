'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
        alert(`${fileType} ${t('registro.step3.fileTooBig')} (${fileSizeMB.toFixed(1)}MB).\n\n${t('registro.step3.limit')}\n\n${t('registro.step3.compressPDF')}\n${compressUrl}`)
        return
      }
    } else if (isImage) {
      // Imágenes: máximo 100MB entrada, se comprime a 2MB
      if (fileSizeMB > 100) {
        alert(`${t('registro.step3.imageTooBig')} (${fileSizeMB.toFixed(1)}MB). ${t('registro.step3.imageMaxSize')}`)
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
        alert(t('registro.step3.imageError'))
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
      alert(`${t('registro.step3.photoTooBig')} (${fileSizeMB.toFixed(1)}MB). ${t('registro.step3.photoMaxSize')}`)
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
        alert(t('registro.step3.photoError'))
      }
    } else {
      updateFormData({ foto: file })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#141210' }}>
          {t('registro.step3.title')}
        </h2>
        <p style={{ color: '#F4EDE4', fontSize: '15px' }}>
          {t('registro.step3.subtitle')}
        </p>
      </div>

      {/* Foto de Perfil */}
      <FileUpload
        label={t('registro.step3.photo')}
        accept="image/jpeg,image/png,image/webp"
        maxSize={10}
        required
        value={formData.foto}
        onChange={handleFotoChange}
        error={errors?.foto}
        helperText={t('registro.step3.photoHelper')}
        isLoading={loadingStates.foto}
        loadingText={t('registro.step3.photoLoading')}
      />

      {/* CV Artístico */}
      <FileUpload
        label={t('registro.step3.cv')}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        maxSize={10}
        required
        value={formData.documentos?.cv}
        onChange={(file) => handleFileChange('cv', file)}
        error={errors?.cv}
        helperText={t('registro.step3.cvHelper')}
        isLoading={loadingStates.cv}
        loadingText={t('registro.step3.cvLoading')}
      />

      {/* Portafolio */}
      <FileUpload
        label={t('registro.step3.portfolio')}
        accept=".pdf,application/pdf"
        maxSize={10}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText={t('registro.step3.portfolioHelper')}
        isLoading={loadingStates.portfolio}
        loadingText={t('registro.step3.portfolioLoading')}
      />

      {/* Identificación Oficial */}
      <FileUpload
        label={t('registro.step3.id')}
        accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
        maxSize={10}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText={t('registro.step3.idHelper')}
        isLoading={loadingStates.identificacion}
        loadingText={t('registro.step3.idLoading')}
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
          {t('registro.step3.infoText')}
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
            {t('registro.step3.compressionTitle')}
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(34, 197, 94, 0.85)',
            lineHeight: '1.7',
            margin: 0
          }}>
            {t('registro.step3.compressionText')}
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
          {t('registro.step3.portfolioInfoText')}
        </p>
      </div>
    </div>
  )
}
