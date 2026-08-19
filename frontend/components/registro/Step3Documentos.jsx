'use client'

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
 * 3. Frontend valida tamaño de PDFs
 * 4. Al enviar formulario, se suben a Cloudinary
 * 5. URLs de Cloudinary se guardan en BDD
 */

export default function Step3Documentos({ formData, updateFormData, errors }) {
  const handleFileChange = async (fieldName, file) => {
    if (!file) return

    const fileSizeMB = file.size / (1024 * 1024)

    // Rechazar archivos mayores a 10MB
    if (fileSizeMB > 10) {
      alert(`El archivo es muy grande (${fileSizeMB.toFixed(2)}MB). El tamaño máximo es 10MB.`)
      return
    }

    let processedFile = file

    // Si es imagen y es mayor a 5MB, comprimir
    if (file.type.startsWith('image/') && fileSizeMB > 5) {
      try {
        processedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.80,
          maxSizeKB: 2000 // Comprimir a menos de 2MB
        })
        console.log(`Imagen comprimida de ${fileSizeMB.toFixed(2)}MB a ${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`)
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

    const fileSizeMB = file.size / (1024 * 1024)

    // Rechazar archivos mayores a 10MB
    if (fileSizeMB > 10) {
      alert(`El archivo es muy grande (${fileSizeMB.toFixed(2)}MB). El tamaño máximo es 10MB.`)
      return
    }

    // Si es mayor a 5MB, comprimir
    if (fileSizeMB > 5) {
      try {
        const compressedFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.80,
          maxSizeKB: 2000 // Comprimir a menos de 2MB
        })
        console.log(`Foto comprimida de ${fileSizeMB.toFixed(2)}MB a ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`)
        updateFormData({ foto: compressedFile })
      } catch (error) {
        console.error('Error al comprimir foto:', error)
        alert('Error al procesar la foto. Por favor, intenta con otra imagen.')
      }
    } else {
      // Menos de 5MB, no comprimir
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
        accept="image/*"
        maxSize={10}
        required
        value={formData.foto}
        onChange={handleFotoChange}
        error={errors?.foto}
        helperText="Nombrar archivo: Foto_NombreArtista/Colectivo"
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
        helperText="Nombrar archivo: CV_NombreArtista/Colectivo"
      />

      {/* Portafolio */}
      <FileUpload
        label="Portafolio"
        accept=".pdf"
        maxSize={10}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Nombrar archivo: Portafolio_NombreArtista/Colectivo — Con este documento queremos conocer tu trayectoria, no es necesariamente la obra con la que te postularás a ARTE FACTO."
      />

      {/* Identificación Oficial */}
      <FileUpload
        label="Identificación Oficial (INE o pasaporte)"
        accept="image/*,.pdf"
        maxSize={10}
        required
        value={formData.documentos?.identificacion}
        onChange={(file) => handleFileChange('identificacion', file)}
        error={errors?.identificacion}
        helperText="Nombrar archivo: ID_NombreArtista/Colectivo"
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
            Las imágenes se comprimen automáticamente para optimizar el tamaño sin perder calidad. Los archivos por encima de los 10 MB no son aceptados, archivos por encima de 5 MB y debajo de 10 MB se comprimirán. Los archivos menores a 5 MB no serán comprimidos.
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
