'use client'

import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Info, Palette, Shield } from 'lucide-react'

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

  // Lista completa de países (ordenados alfabéticamente, México primero)
  const paises = [
    { value: 'MX', label: 'México' },
    { value: 'AF', label: 'Afganistán' },
    { value: 'AL', label: 'Albania' },
    { value: 'DE', label: 'Alemania' },
    { value: 'AD', label: 'Andorra' },
    { value: 'AO', label: 'Angola' },
    { value: 'AG', label: 'Antigua y Barbuda' },
    { value: 'SA', label: 'Arabia Saudita' },
    { value: 'DZ', label: 'Argelia' },
    { value: 'AR', label: 'Argentina' },
    { value: 'AM', label: 'Armenia' },
    { value: 'AU', label: 'Australia' },
    { value: 'AT', label: 'Austria' },
    { value: 'AZ', label: 'Azerbaiyán' },
    { value: 'BS', label: 'Bahamas' },
    { value: 'BD', label: 'Bangladés' },
    { value: 'BB', label: 'Barbados' },
    { value: 'BH', label: 'Baréin' },
    { value: 'BE', label: 'Bélgica' },
    { value: 'BZ', label: 'Belice' },
    { value: 'BJ', label: 'Benín' },
    { value: 'BY', label: 'Bielorrusia' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'BA', label: 'Bosnia y Herzegovina' },
    { value: 'BW', label: 'Botsuana' },
    { value: 'BR', label: 'Brasil' },
    { value: 'BN', label: 'Brunéi' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'BF', label: 'Burkina Faso' },
    { value: 'BI', label: 'Burundi' },
    { value: 'BT', label: 'Bután' },
    { value: 'CV', label: 'Cabo Verde' },
    { value: 'KH', label: 'Camboya' },
    { value: 'CM', label: 'Camerún' },
    { value: 'CA', label: 'Canadá' },
    { value: 'QA', label: 'Catar' },
    { value: 'TD', label: 'Chad' },
    { value: 'CL', label: 'Chile' },
    { value: 'CN', label: 'China' },
    { value: 'CY', label: 'Chipre' },
    { value: 'CO', label: 'Colombia' },
    { value: 'KM', label: 'Comoras' },
    { value: 'KP', label: 'Corea del Norte' },
    { value: 'KR', label: 'Corea del Sur' },
    { value: 'CI', label: 'Costa de Marfil' },
    { value: 'CR', label: 'Costa Rica' },
    { value: 'HR', label: 'Croacia' },
    { value: 'CU', label: 'Cuba' },
    { value: 'DK', label: 'Dinamarca' },
    { value: 'DM', label: 'Dominica' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'EG', label: 'Egipto' },
    { value: 'SV', label: 'El Salvador' },
    { value: 'AE', label: 'Emiratos Árabes Unidos' },
    { value: 'ER', label: 'Eritrea' },
    { value: 'SK', label: 'Eslovaquia' },
    { value: 'SI', label: 'Eslovenia' },
    { value: 'ES', label: 'España' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'EE', label: 'Estonia' },
    { value: 'ET', label: 'Etiopía' },
    { value: 'PH', label: 'Filipinas' },
    { value: 'FI', label: 'Finlandia' },
    { value: 'FJ', label: 'Fiyi' },
    { value: 'FR', label: 'Francia' },
    { value: 'GA', label: 'Gabón' },
    { value: 'GM', label: 'Gambia' },
    { value: 'GE', label: 'Georgia' },
    { value: 'GH', label: 'Ghana' },
    { value: 'GD', label: 'Granada' },
    { value: 'GR', label: 'Grecia' },
    { value: 'GT', label: 'Guatemala' },
    { value: 'GN', label: 'Guinea' },
    { value: 'GQ', label: 'Guinea Ecuatorial' },
    { value: 'GW', label: 'Guinea-Bisáu' },
    { value: 'GY', label: 'Guyana' },
    { value: 'HT', label: 'Haití' },
    { value: 'HN', label: 'Honduras' },
    { value: 'HU', label: 'Hungría' },
    { value: 'IN', label: 'India' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'IQ', label: 'Irak' },
    { value: 'IR', label: 'Irán' },
    { value: 'IE', label: 'Irlanda' },
    { value: 'IS', label: 'Islandia' },
    { value: 'IL', label: 'Israel' },
    { value: 'IT', label: 'Italia' },
    { value: 'JM', label: 'Jamaica' },
    { value: 'JP', label: 'Japón' },
    { value: 'JO', label: 'Jordania' },
    { value: 'KZ', label: 'Kazajistán' },
    { value: 'KE', label: 'Kenia' },
    { value: 'KG', label: 'Kirguistán' },
    { value: 'KI', label: 'Kiribati' },
    { value: 'KW', label: 'Kuwait' },
    { value: 'LA', label: 'Laos' },
    { value: 'LS', label: 'Lesoto' },
    { value: 'LV', label: 'Letonia' },
    { value: 'LB', label: 'Líbano' },
    { value: 'LR', label: 'Liberia' },
    { value: 'LY', label: 'Libia' },
    { value: 'LI', label: 'Liechtenstein' },
    { value: 'LT', label: 'Lituania' },
    { value: 'LU', label: 'Luxemburgo' },
    { value: 'MK', label: 'Macedonia del Norte' },
    { value: 'MG', label: 'Madagascar' },
    { value: 'MY', label: 'Malasia' },
    { value: 'MW', label: 'Malaui' },
    { value: 'MV', label: 'Maldivas' },
    { value: 'ML', label: 'Malí' },
    { value: 'MT', label: 'Malta' },
    { value: 'MA', label: 'Marruecos' },
    { value: 'MU', label: 'Mauricio' },
    { value: 'MR', label: 'Mauritania' },
    { value: 'FM', label: 'Micronesia' },
    { value: 'MD', label: 'Moldavia' },
    { value: 'MC', label: 'Mónaco' },
    { value: 'MN', label: 'Mongolia' },
    { value: 'ME', label: 'Montenegro' },
    { value: 'MZ', label: 'Mozambique' },
    { value: 'MM', label: 'Myanmar' },
    { value: 'NA', label: 'Namibia' },
    { value: 'NR', label: 'Nauru' },
    { value: 'NP', label: 'Nepal' },
    { value: 'NI', label: 'Nicaragua' },
    { value: 'NE', label: 'Níger' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'NO', label: 'Noruega' },
    { value: 'NZ', label: 'Nueva Zelanda' },
    { value: 'OM', label: 'Omán' },
    { value: 'NL', label: 'Países Bajos' },
    { value: 'PK', label: 'Pakistán' },
    { value: 'PW', label: 'Palaos' },
    { value: 'PA', label: 'Panamá' },
    { value: 'PG', label: 'Papúa Nueva Guinea' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'PE', label: 'Perú' },
    { value: 'PL', label: 'Polonia' },
    { value: 'PT', label: 'Portugal' },
    { value: 'PR', label: 'Puerto Rico' },
    { value: 'GB', label: 'Reino Unido' },
    { value: 'CF', label: 'República Centroafricana' },
    { value: 'CZ', label: 'República Checa' },
    { value: 'CG', label: 'República del Congo' },
    { value: 'CD', label: 'República Democrática del Congo' },
    { value: 'DO', label: 'República Dominicana' },
    { value: 'RW', label: 'Ruanda' },
    { value: 'RO', label: 'Rumania' },
    { value: 'RU', label: 'Rusia' },
    { value: 'WS', label: 'Samoa' },
    { value: 'KN', label: 'San Cristóbal y Nieves' },
    { value: 'SM', label: 'San Marino' },
    { value: 'VC', label: 'San Vicente y las Granadinas' },
    { value: 'LC', label: 'Santa Lucía' },
    { value: 'ST', label: 'Santo Tomé y Príncipe' },
    { value: 'SN', label: 'Senegal' },
    { value: 'RS', label: 'Serbia' },
    { value: 'SC', label: 'Seychelles' },
    { value: 'SL', label: 'Sierra Leona' },
    { value: 'SG', label: 'Singapur' },
    { value: 'SY', label: 'Siria' },
    { value: 'SO', label: 'Somalia' },
    { value: 'LK', label: 'Sri Lanka' },
    { value: 'SZ', label: 'Suazilandia' },
    { value: 'ZA', label: 'Sudáfrica' },
    { value: 'SD', label: 'Sudán' },
    { value: 'SS', label: 'Sudán del Sur' },
    { value: 'SE', label: 'Suecia' },
    { value: 'CH', label: 'Suiza' },
    { value: 'SR', label: 'Surinam' },
    { value: 'TH', label: 'Tailandia' },
    { value: 'TW', label: 'Taiwán' },
    { value: 'TZ', label: 'Tanzania' },
    { value: 'TJ', label: 'Tayikistán' },
    { value: 'TL', label: 'Timor Oriental' },
    { value: 'TG', label: 'Togo' },
    { value: 'TO', label: 'Tonga' },
    { value: 'TT', label: 'Trinidad y Tobago' },
    { value: 'TN', label: 'Túnez' },
    { value: 'TM', label: 'Turkmenistán' },
    { value: 'TR', label: 'Turquía' },
    { value: 'TV', label: 'Tuvalu' },
    { value: 'UA', label: 'Ucrania' },
    { value: 'UG', label: 'Uganda' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'UZ', label: 'Uzbekistán' },
    { value: 'VU', label: 'Vanuatu' },
    { value: 'VA', label: 'Vaticano' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'VN', label: 'Vietnam' },
    { value: 'YE', label: 'Yemen' },
    { value: 'DJ', label: 'Yibuti' },
    { value: 'ZM', label: 'Zambia' },
    { value: 'ZW', label: 'Zimbabue' },
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
            fontSize: '22px',
            margin: 0,
            fontFamily: '"Inter Tight", Inter, sans-serif',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            LLENA TUS DATOS PERSONALES PARA ARMAR TU MURAL
          </h3>
          <Palette size={32} color="#B83030" />
        </div>
      </div>

      {/* Aviso de Privacidad destacado */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(184, 48, 48, 0.12), rgba(184, 48, 48, 0.06))',
        border: '2px solid rgba(184, 48, 48, 0.5)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} color="#B83030" style={{ flexShrink: 0 }} />
          <p style={{
            color: '#F4EDE4',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0
          }}>
            Tus datos están protegidos. Consulta nuestro{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#B83030',
                fontWeight: '700',
                textDecoration: 'underline'
              }}
            >
              Aviso de Privacidad
            </a>
          </p>
        </div>
      </div>

      {/* Disclaimer inicial */}
      <div style={{
        background: 'rgba(244, 237, 228, 0.15)',
        border: '2px solid rgba(244, 237, 228, 0.4)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <div style={{ flexShrink: 0, paddingTop: '4px' }}>
            <Info size={28} color="#F4EDE4" />
          </div>
          <div>
            <h3 style={{
              color: '#F4EDE4',
              fontWeight: '600',
              fontSize: '16px',
              marginBottom: '8px'
            }}>
              Importante: Proceso de Selección
            </h3>
            <p style={{
              color: 'rgba(244, 237, 228, 0.85)',
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
