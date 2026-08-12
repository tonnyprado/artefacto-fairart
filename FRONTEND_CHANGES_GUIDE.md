# 📋 Guía de Cambios para el Frontend - Nuevos Campos

## 🎯 Cambios implementados en el backend

### 1. **Nuevos campos en Artistas**
- ✅ `nombre_artistico` (VARCHAR opcional) - "Nombre artístico"
- ✅ `folio` (VARCHAR único) - Folio de identificación (ej: ART-2027-001)
  - Se genera automáticamente con trigger de PostgreSQL
  - Formato: ART-[AÑO]-[NÚMERO]

### 2. **Nuevos campos en Obras**
- ✅ `tecnica` (VARCHAR) - Técnica artística (óleo, acrílico, etc.)
- ✅ `anio` (INTEGER) - Año de creación
- ✅ `precio_mxn` (DECIMAL) - Precio de venta en pesos
- ✅ `notas_montaje` (TEXT) - Especificaciones técnicas de montaje

---

## 🔧 Cambios que DEBES hacer en el Frontend

### 1. Agregar campo "Nombre Artístico" (Paso 1: Datos Personales)

**Ubicación**: `frontend/app/registro/page.js` - Paso 1

**Agregar después del campo "Apellido"**:

```jsx
{/* Nombre Artístico - OPCIONAL */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Nombre Artístico
    <span className="text-gray-400 text-xs ml-2">(Opcional)</span>
  </label>
  <input
    type="text"
    name="nombre_artistico"
    value={formData.nombre_artistico || ''}
    onChange={handleChange}
    placeholder="Ej: El Maestro del Color"
    className="w-full px-4 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-xs text-gray-500 mt-1">
    Si usas un nombre artístico diferente a tu nombre legal
  </p>
</div>
```

**Agregar al state inicial**:
```javascript
const [formData, setFormData] = useState({
  // ...otros campos
  nombre_artistico: '', // ← NUEVO
})
```

---

### 2. Actualizar campos de Obra (Paso 4: Tu Lienzo)

**Para CADA obra**, necesitas pedir estos campos:

```jsx
{/* Formulario de obra */}
<div className="bg-white rounded-2xl p-6 shadow">
  <h3 className="font-semibold mb-4">Obra {index + 1}</h3>

  {/* 1. Imagen (ya existe) */}
  <input type="file" accept="image/*" ... />

  {/* 2. Título (ya existe) */}
  <input
    type="text"
    placeholder="Título de la obra"
    name={`obra_lienzo_${index}_titulo`}
    ...
  />

  {/* 3. Medidas (ya existe pero AGREGAR DISCLAIMER) */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label>Alto (cm)</label>
      <input
        type="number"
        name={`obra_lienzo_${index}_alto_cm`}
        ...
      />
    </div>
    <div>
      <label>Ancho (cm)</label>
      <input
        type="number"
        name={`obra_lienzo_${index}_ancho_cm`}
        ...
      />
    </div>
  </div>
  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
    ⚠️ Las medidas deben incluir el marco si la obra lo tiene
  </p>

  {/* 4. NUEVO: Técnica */}
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">
      Técnica <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name={`obra_lienzo_${index}_tecnica`}
      placeholder="Ej: Óleo sobre lienzo, Acrílico, Acuarela, Técnica mixta..."
      value={formData.portfolio_images[index]?.tecnica || ''}
      onChange={(e) => handleObraChange(index, 'tecnica', e.target.value)}
      required
      className="w-full px-4 py-2 border rounded-2xl"
    />
  </div>

  {/* 5. NUEVO: Año */}
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">
      Año de creación <span className="text-red-500">*</span>
    </label>
    <input
      type="number"
      name={`obra_lienzo_${index}_anio`}
      placeholder="Ej: 2024"
      min="1900"
      max={new Date().getFullYear()}
      value={formData.portfolio_images[index]?.anio || ''}
      onChange={(e) => handleObraChange(index, 'anio', e.target.value)}
      required
      className="w-full px-4 py-2 border rounded-2xl"
    />
  </div>

  {/* 6. NUEVO: Precio con formato de comas */}
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">
      Precio de venta (MXN) <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name={`obra_lienzo_${index}_precio`}
      placeholder="Ej: 15,000"
      value={formData.portfolio_images[index]?.precio || ''}
      onChange={(e) => {
        // Formato automático de comas
        const value = e.target.value.replace(/,/g, '')
        if (/^\d*$/.test(value)) {
          const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          handleObraChange(index, 'precio', formatted)
        }
      }}
      required
      className="w-full px-4 py-2 border rounded-2xl"
    />
    <p className="text-xs text-gray-500 mt-1">
      El formato de comas se agrega automáticamente (ej: 15,000)
    </p>
  </div>

  {/* 7. NUEVO: Notas complementarias */}
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">
      Notas complementarias
      <span className="text-gray-400 text-xs ml-2">(Opcional)</span>
    </label>
    <textarea
      name={`obra_lienzo_${index}_notas`}
      placeholder="Ej: Requiere base de madera de 50x50cm, Obra con sistema de iluminación LED integrado..."
      value={formData.portfolio_images[index]?.notas || ''}
      onChange={(e) => handleObraChange(index, 'notas', e.target.value)}
      rows={3}
      className="w-full px-4 py-2 border rounded-2xl resize-none"
    />
    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
      💡 Si la obra requiere especificaciones técnicas de montaje, bases,
      o instalación especial, descríbelas aquí
    </p>
  </div>
</div>
```

---

### 3. Agregar Disclaimers

#### Disclaimer al INICIO del registro

**Ubicación**: Antes del primer paso

```jsx
{/* Disclaimer inicial */}
<div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
  <div className="flex items-start gap-3">
    <div className="text-2xl">ℹ️</div>
    <div>
      <h3 className="font-semibold text-blue-900 mb-2">
        Importante: Proceso de Selección
      </h3>
      <p className="text-blue-800 text-sm">
        <strong>No se te cobrará nada en este momento.</strong> Este es un proceso
        de selección para participar en ARTEFACT 2027. Una vez que seas seleccionado,
        recibirás un correo con los detalles del paquete y las instrucciones de pago.
      </p>
    </div>
  </div>
</div>
```

---

### 4. Rediseñar Página de Confirmación

**Problema actual**: Se traba, no muestra el cursor

**Solución**: Crear nueva página `app/registro/confirmacion/page.js`

```jsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Confirmacion() {
  const searchParams = useSearchParams()
  const folio = searchParams.get('folio')
  const nombre = searchParams.get('nombre')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animación de éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h1>
          <p className="text-xl text-gray-600">
            Gracias por tu interés en ARTEFACT 2027
          </p>
        </div>

        {/* Card de información */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          {/* Folio destacado */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-center">
            <p className="text-white text-sm font-medium mb-2">Tu folio de registro es:</p>
            <p className="text-white text-5xl font-bold font-mono tracking-wider">
              {folio || 'ART-2027-XXX'}
            </p>
            <p className="text-blue-100 text-xs mt-2">
              Guarda este folio para dar seguimiento a tu solicitud
            </p>
          </div>

          {/* Mensaje personalizado */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700">
              Hola <strong>{nombre || 'artista'}</strong>,
            </p>
            <p className="text-gray-600 mt-2">
              Tu solicitud ha sido recibida y está siendo revisada por nuestro equipo de curadores.
            </p>
          </div>

          {/* Pasos siguientes */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> ¿Qué sigue?
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>
                  Revisaremos tu portafolio y seleccionaremos a los artistas participantes
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>
                  Recibirás un correo electrónico con los resultados de la selección
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>
                  Si eres seleccionado, te enviaremos los detalles de pago y participación
                </span>
              </li>
            </ol>
          </div>

          {/* Recordatorio */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <span className="text-xl">⏰</span>
              <span>
                <strong>Importante:</strong> Revisa tu correo electrónico (incluyendo spam)
                en los próximos días. Te contactaremos al email: <strong>{searchParams.get('email')}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition text-center font-medium"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition text-center font-medium"
          >
            Imprimir Folio
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          ¿Tienes dudas? Contáctanos en contacto@artefact.mx
        </p>
      </div>
    </div>
  )
}
```

**Redirigir después del registro**:

```javascript
// En app/registro/page.js, después del éxito
if (response.ok) {
  const data = await response.json()
  // Redirigir a confirmación con datos
  router.push(`/registro/confirmacion?folio=${data.data.folio}&nombre=${formData.nombre}&email=${formData.email}`)
}
```

---

### 5. Actualizar Favicon

**Ya está listo**: El favicon SVG ya se copió a `public/favicon.svg`

**Agregar en `app/layout.js`**:

```jsx
import { Inter } from 'next/font/google'

export const metadata = {
  title: 'ARTEFACT - Feria de Arte',
  description: 'Registro de artistas para ARTEFACT 2027',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}
```

---

## 📊 Resumen de campos para FormData

```javascript
const [formData, setFormData] = useState({
  // Paso 1: Datos Personales
  nombre: '',
  apellido: '',
  nombre_artistico: '', // ← NUEVO
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  pais: '',
  ciudad: '',

  // Paso 2: Info Artística (sin cambios)
  categoria: '',
  bio: '',
  redes_sociales: {
    instagram: '',
    website: ''
  },

  // Paso 3: Documentos (sin cambios)
  foto: null,
  documentos: {
    cv: null,
    portfolio: null,
    identificacion: null
  },

  // Paso 4: Tu Lienzo - ACTUALIZADAS LAS OBRAS
  portfolio_images: [
    {
      file: null,
      titulo: '',
      alto_cm: '',
      ancho_cm: '',
      tecnica: '', // ← NUEVO
      anio: '', // ← NUEVO
      precio: '', // ← NUEVO (con formato de comas)
      notas: '', // ← NUEVO (opcional)
    }
  ],
})
```

---

## ✅ Checklist de Implementación

- [ ] Agregar campo `nombre_artistico` en Paso 1
- [ ] Agregar campo `tecnica` en cada obra
- [ ] Agregar campo `anio` en cada obra
- [ ] Agregar campo `precio` con formato automático de comas
- [ ] Agregar campo `notas_montaje` (opcional) en cada obra
- [ ] Agregar disclaimer sobre medidas (incluyen marco)
- [ ] Agregar disclaimer sobre especificaciones de montaje
- [ ] Agregar disclaimer inicial (no se cobra nada)
- [ ] Crear página `/registro/confirmacion`
- [ ] Mostrar folio en página de confirmación
- [ ] Agregar favicon en layout
- [ ] Probar formato automático de precio con comas
- [ ] Probar que el folio se genere automáticamente

---

## 🧪 Para probar

```bash
# 1. Ejecutar la migración en PostgreSQL
psql [DATABASE_URL] < backend/migrations/004_mejoras_obras_y_folio.sql

# 2. Reiniciar el backend
cd backend && npm run dev

# 3. Registrar un artista de prueba
# Verificar que se genere el folio automáticamente
# Verificar que los nuevos campos se guarden

# 4. Ver en admin panel
# El folio debe aparecer en la tabla
# El nombre artístico debe aparecer (si se ingresó)
```

---

¿Necesitas ayuda con alguna implementación específica del frontend?
