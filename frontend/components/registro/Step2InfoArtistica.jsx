'use client'

import Input, { Textarea } from '@/components/ui/Input'
import Select from '@/components/ui/Select'

/**
 * Paso 2: Información Artística
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - categoria VARCHAR(100) NOT NULL -- Disciplina artística
 *   - bio TEXT -- Biografía/declaración artística
 *   - redes_sociales JSONB -- {instagram, facebook, website, behance, etc.}
 */

export default function Step2InfoArtistica({ formData, updateFormData, errors }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleRedesChange = (e) => {
    const { name, value } = e.target
    updateFormData({
      redes_sociales: {
        ...formData.redes_sociales,
        [name]: value
      }
    })
  }

  // HARDCODED: Categorías artísticas
  // En producción: vendrá de tabla "categorias" o config
  const categorias = [
    { value: 'pintura', label: 'Pintura' },
    { value: 'escultura', label: 'Escultura' },
    { value: 'fotografia', label: 'Fotografía' },
    { value: 'ilustracion', label: 'Ilustración' },
    { value: 'arte_digital', label: 'Arte Digital' },
    { value: 'grabado', label: 'Grabado' },
    { value: 'instalacion', label: 'Instalación' },
    { value: 'performance', label: 'Performance' },
    { value: 'video_arte', label: 'Video Arte' },
    { value: 'arte_textil', label: 'Arte Textil' },
    { value: 'ceramica', label: 'Cerámica' },
    { value: 'arte_mixto', label: 'Arte Mixto' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Artística
        </h2>
        <p className="text-gray-600">Cuéntanos sobre tu trabajo artístico</p>
      </div>

      <Select
        label="Disciplina Artística Principal"
        name="categoria"
        value={formData.categoria || ''}
        onChange={handleChange}
        error={errors?.categoria}
        required
        options={categorias}
        placeholder="Selecciona tu disciplina"
      />

      <Textarea
        label="Biografía / Declaración Artística"
        name="bio"
        value={formData.bio || ''}
        onChange={handleChange}
        error={errors?.bio}
        required
        rows={6}
        placeholder="Describe tu trayectoria, técnicas, temáticas y propuesta artística... (mínimo 200 caracteres)"
      />

      <div className="text-sm text-gray-500 flex items-center justify-between">
        <span>Caracteres: {(formData.bio || '').length}</span>
        {(formData.bio || '').length < 200 && (
          <span className="text-red-600">
            Mínimo 200 caracteres (faltan {200 - (formData.bio || '').length})
          </span>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Redes Sociales y Portafolio Online
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Comparte tus perfiles para que podamos conocer más de tu trabajo
          (opcional)
        </p>

        <div className="space-y-4">
          <Input
            label="Instagram"
            name="instagram"
            value={formData.redes_sociales?.instagram || ''}
            onChange={handleRedesChange}
            placeholder="@tu_usuario o https://instagram.com/tu_usuario"
          />

          <Input
            label="Facebook"
            name="facebook"
            value={formData.redes_sociales?.facebook || ''}
            onChange={handleRedesChange}
            placeholder="https://facebook.com/tu_pagina"
          />

          <Input
            label="Sitio Web Personal"
            name="website"
            value={formData.redes_sociales?.website || ''}
            onChange={handleRedesChange}
            placeholder="https://tuportfolio.com"
          />

          <Input
            label="Behance / ArtStation / Otro"
            name="portfolio"
            value={formData.redes_sociales?.portfolio || ''}
            onChange={handleRedesChange}
            placeholder="https://behance.net/tu_usuario"
          />
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg">
        <div className="flex">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Una biografía completa y redes sociales
            activas aumentan significativamente tus posibilidades de selección, ya
            que los curadores evaluarán tu trayectoria y consistencia artística.
          </p>
        </div>
      </div>
    </div>
  )
}
