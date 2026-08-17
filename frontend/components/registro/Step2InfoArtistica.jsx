'use client'

import Input, { Textarea } from '@/components/ui/Input'

/**
 * Paso 2: Información Artística (ahora paso 3 después del reorden)
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - bio TEXT -- Biografía/declaración artística
 *   - redes_sociales JSONB -- {instagram, website}
 *
 * NOTA: categoria fue movido a Step1DatosPersonales
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#141210' }}>
          Información Artística
        </h2>
        <p style={{ color: '#F4EDE4', fontSize: '15px' }}>Cuéntanos sobre tu trabajo artístico</p>
      </div>

      <Textarea
        label="Semblanza"
        name="bio"
        value={formData.bio || ''}
        onChange={handleChange}
        error={errors?.bio}
        required
        rows={6}
        placeholder="Describe tu trayectoria, técnicas, temáticas y propuesta artística (máximo 150 palabras)"
      />

      <div className="text-sm flex items-center justify-between" style={{ color: 'rgba(244, 237, 228, 0.7)' }}>
        <span>Caracteres: {(formData.bio || '').length} / 950</span>
        {(formData.bio || '').length > 950 && (
          <span style={{ color: '#FEE2E2' }}>
            Máximo 950 caracteres (excede por {(formData.bio || '').length - 950})
          </span>
        )}
      </div>

      <div className="pt-6" style={{ borderTop: '1px solid rgba(244, 237, 228, 0.2)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#141210' }}>
          Redes Sociales
        </h3>

        <div className="space-y-4">
          <Input
            label="Instagram"
            name="instagram"
            value={formData.redes_sociales?.instagram || ''}
            onChange={handleRedesChange}
            placeholder="@tu_usuario o https://instagram.com/tu_usuario"
            required
          />

          <Input
            label="Sitio Web"
            name="website"
            value={formData.redes_sociales?.website || ''}
            onChange={handleRedesChange}
            placeholder="https://tuportfolio.com"
          />
        </div>
      </div>

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
          Una semblanza completa y un perfil de Instagram activo aumentan significativamente tus posibilidades de selección, ya que los curadores evaluarán tu trayectoria y consistencia artística.
        </p>
      </div>
    </div>
  )
}
