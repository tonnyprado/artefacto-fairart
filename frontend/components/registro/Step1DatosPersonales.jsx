'use client'

import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Info, Palette } from 'lucide-react'

/**
 * Paso 1: Datos Personales del Artista
 *
 * CAMPOS QUE VAN A BASE DE DATOS:
 * - Tabla: artistas
 *   - nombre VARCHAR(255) NOT NULL
 *   - apellido VARCHAR(255) NOT NULL
 *   - email VARCHAR(255) UNIQUE NOT NULL
 *   - telefono VARCHAR(20)
 *   - fecha_nacimiento DATE
 *   - pais VARCHAR(100)
 *   - ciudad VARCHAR(100)
 *   - direccion TEXT
 *
 * Nota: La categoría/disciplina artística se selecciona en Step5 (Tu Lienzo)
 */

export default function Step1DatosPersonales({ formData, updateFormData, errors }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  // HARDCODED: Lista de países
  const paises = [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' },
    { value: 'ES', label: 'España' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CO', label: 'Colombia' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Perú' },
    { value: 'BR', label: 'Brasil' },
    { value: 'OTHER', label: 'Otro' },
  ]

  return (
    <div className="space-y-6">
      {/* Mensaje de enganche */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(184, 48, 48, 0.15), rgba(184, 48, 48, 0.05))',
        border: '2px solid rgba(184, 48, 48, 0.4)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Palette size={32} color="#B83030" />
          <h3 style={{
            color: '#141210',
            fontWeight: '700',
            fontSize: '20px',
            margin: 0,
            fontFamily: 'ivypresto-display, Georgia, serif',
            fontStyle: 'italic',
            letterSpacing: '0.02em'
          }}>
            LLENA TUS DATOS PERSONALES PARA ARMAR TU MURAL
          </h3>
          <Palette size={32} color="#B83030" />
        </div>
      </div>

      {/* Disclaimer inicial */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <div style={{ flexShrink: 0, paddingTop: '4px' }}>
            <Info size={28} color="#3B82F6" />
          </div>
          <div>
            <h3 style={{
              color: '#141210',
              fontWeight: '600',
              fontSize: '16px',
              marginBottom: '8px'
            }}>
              Importante: Proceso de Selección
            </h3>
            <p style={{
              color: 'rgba(20, 18, 16, 0.85)',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0
            }}>
              <strong>No se te cobrará nada en este momento.</strong> Este es un proceso de selección para participar en ARTEFACTO 2027. Una vez que seas seleccionado, recibirás un correo electrónico con los detalles del paquete y las instrucciones de pago.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#141210' }}>Datos Personales</h2>
        <p style={{ color: '#F4EDE4', fontSize: '15px' }}>
          Información básica sobre ti como artista
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre"
          name="nombre"
          value={formData.nombre || ''}
          onChange={handleChange}
          error={errors?.nombre}
          required
          placeholder="Tu nombre"
        />

        <Input
          label="Apellido"
          name="apellido"
          value={formData.apellido || ''}
          onChange={handleChange}
          error={errors?.apellido}
          required
          placeholder="Tu apellido"
        />
      </div>

      {/* Nombre Artístico - NUEVO */}
      <Input
        label="Nombre Artístico"
        name="nombre_artistico"
        value={formData.nombre_artistico || ''}
        onChange={handleChange}
        placeholder='Ej: "El Maestro del Color" (Opcional)'
        helper="Si usas un nombre artístico diferente a tu nombre legal"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors?.email}
          required
          placeholder="tu@email.com"
        />

        <Input
          label="Teléfono"
          type="tel"
          name="telefono"
          value={formData.telefono || ''}
          onChange={handleChange}
          error={errors?.telefono}
          required
          placeholder="55 1234 5678"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Fecha de Nacimiento"
          type="date"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento || ''}
          onChange={handleChange}
          error={errors?.fecha_nacimiento}
          required
        />

        <Select
          label="País"
          name="pais"
          value={formData.pais || ''}
          onChange={handleChange}
          error={errors?.pais}
          required
          options={paises}
          placeholder="Selecciona tu país"
        />
      </div>

      <Input
        label="Ciudad"
        name="ciudad"
        value={formData.ciudad || ''}
        onChange={handleChange}
        error={errors?.ciudad}
        required
        placeholder="Ciudad de México"
      />

      <div style={{
        background: 'rgba(244, 237, 228, 0.12)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '8px',
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
          lineHeight: '1.6',
          margin: 0,
          flex: 1
        }}>
          Toda tu información personal será tratada de forma confidencial y únicamente será utilizada para el proceso de selección.
        </p>
      </div>
    </div>
  )
}
