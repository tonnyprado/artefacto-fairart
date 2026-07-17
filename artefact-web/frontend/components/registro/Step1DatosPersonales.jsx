'use client'

import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos Personales</h2>
        <p className="text-gray-600">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Ciudad"
          name="ciudad"
          value={formData.ciudad || ''}
          onChange={handleChange}
          error={errors?.ciudad}
          required
          placeholder="Ciudad de México"
        />

        <Input
          label="Código Postal"
          name="codigo_postal"
          value={formData.codigo_postal || ''}
          onChange={handleChange}
          error={errors?.codigo_postal}
          placeholder="06600"
        />
      </div>

      <Input
        label="Dirección Completa"
        name="direccion"
        value={formData.direccion || ''}
        onChange={handleChange}
        error={errors?.direccion}
        required
        placeholder="Calle, número, colonia"
      />

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
        <div className="flex">
          <svg
            className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-blue-800">
            Toda tu información personal será tratada de forma confidencial y
            únicamente será utilizada para el proceso de selección.
          </p>
        </div>
      </div>
    </div>
  )
}
