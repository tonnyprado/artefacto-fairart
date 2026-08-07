'use client'

import FileUpload from '@/components/ui/FileUpload'

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
 * 2. Frontend guarda archivos temporalmente
 * 3. Al enviar formulario, se suben a Cloudinary
 * 4. URLs de Cloudinary se guardan en BDD
 */

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
        maxSize={10}
        required
        value={formData.documentos?.cv}
        onChange={(file) => handleFileChange('cv', file)}
        error={errors?.cv}
        helperText="Formato: PDF, DOC, DOCX. Incluye tu trayectoria, exposiciones, premios, estudios, etc."
      />

      {/* Portafolio */}
      <FileUpload
        label="Portafolio"
        accept=".pdf"
        maxSize={20}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Formato: PDF. Sube un PDF con tu portafolio como artista."
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
