'use client'

import FileUpload from '@/components/ui/FileUpload'
import { compressImage, validatePDFSize } from '@/lib/imageCompression'

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
 * 3. Frontend valida tamaño de PDFs
 * 4. Al enviar formulario, se suben a Cloudinary
 * 5. URLs de Cloudinary se guardan en BDD
 */

export default function Step3Documentos({ formData, updateFormData, errors }) {
  const handleFileChange = async (fieldName, file) => {
    if (!file) return

    // Si es PDF, validar tamaño
    if (file.type === 'application/pdf') {
      const validation = validatePDFSize(file, 2) // Máximo 2MB para PDFs
      if (!validation.valid) {
        alert(validation.message)
        return
      }
    }

    // Si es imagen, comprimir automáticamente
    let processedFile = file
    if (file.type.startsWith('image/')) {
      try {
        processedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeKB: 500 // Máximo 500KB para imágenes
        })
      } catch (error) {
        console.error('Error al comprimir imagen:', error)
        alert('Error al procesar la imagen. Por favor, intenta con otra imagen.')
        return
      }
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

    // Comprimir foto automáticamente
    try {
      const compressedFile = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        maxSizeKB: 300 // Máximo 300KB para foto de perfil
      })
      updateFormData({ foto: compressedFile })
    } catch (error) {
      console.error('Error al comprimir foto:', error)
      alert('Error al procesar la foto. Por favor, intenta con otra imagen.')
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
        maxSize={2}
        required
        value={formData.documentos?.cv}
        onChange={(file) => handleFileChange('cv', file)}
        error={errors?.cv}
        helperText="Formato: PDF, DOC, DOCX (máximo 2MB). Incluye tu trayectoria, exposiciones, premios, estudios, etc."
      />

      {/* Portafolio */}
      <FileUpload
        label="Portafolio"
        accept=".pdf"
        maxSize={2}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Formato: PDF (máximo 2MB). Sube un PDF con tu portafolio como artista. Si es muy grande, comprímelo."
      />

      {/* Identificación Oficial */}
      <FileUpload
        label="Identificación Oficial (INE o Pasaporte)"
        accept="image/*,.pdf"
        maxSize={5}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText="Formato: JPG, PNG, PDF. INE, pasaporte o cédula profesional vigente."
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
          Todos los documentos son obligatorios. Los archivos deben ser legibles y de buena calidad. Tu portafolio debe mostrar obra reciente (últimos 2-3 años). Los documentos serán revisados por el equipo de curaduría.
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
            Las imágenes se comprimen automáticamente para optimizar el tamaño sin perder calidad. Los PDFs deben tener máximo 2MB. Si tu archivo es muy grande, comprímelo antes de subirlo.
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
          Incluye variedad de obras que muestren tu estilo. Fotografías de alta calidad con buena iluminación. Ordena las obras de forma que cuenten una historia. Incluye título, dimensiones y descripción de cada obra. En la siguiente sección podrás cargar tus obras para el lienzo.
        </p>
      </div>
    </div>
  )
}
