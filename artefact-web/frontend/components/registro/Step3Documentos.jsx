'use client'

import FileUpload from '@/components/ui/FileUpload'

/**
 * Paso 3: Upload de Documentos
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - documentos JSONB -- {cv_url, portfolio_url, identificacion_url, foto_url}
 *   - foto VARCHAR(500) -- URL de foto de perfil
 *
 * PROCESO:
 * 1. Usuario sube archivo
 * 2. Frontend guarda archivo temporalmente
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

      {/* Portfolio Digital */}
      <FileUpload
        label="Portfolio Digital"
        accept=".pdf,image/*"
        maxSize={20}
        required
        value={formData.documentos?.portfolio}
        onChange={(file) => handleFileChange('portfolio', file)}
        error={errors?.portfolio}
        helperText="Formato: PDF o imágenes. Mínimo 5 obras representativas de tu trabajo. Si son varias imágenes, súbelas en un PDF."
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

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
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
                Los documentos serán revisados por el equipo de curaduría
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
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
              <li>Incluye título, técnica, dimensiones y año de cada obra</li>
              <li>Ordena las obras de forma que cuenten una historia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
