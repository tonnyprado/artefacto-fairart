'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Step1DatosPersonales from '@/components/registro/Step1DatosPersonales'
import Step2InfoArtistica from '@/components/registro/Step2InfoArtistica'
import Step3Documentos from '@/components/registro/Step3Documentos'
import Step4Confirmacion from '@/components/registro/Step4Confirmacion'

/**
 * Página de Registro de Artistas
 *
 * Formulario multi-step para registro de artistas a la feria
 *
 * DATOS QUE SE ENVÍAN A BASE DE DATOS:
 * - Tabla: artistas
 *   Ver comentarios en cada Step component para campos específicos
 *
 * - Tabla: inscripciones_fases (automático)
 *   - artista_id (del artista creado)
 *   - fase_id (fase activa actual)
 *   - estado: 'pendiente'
 *
 * PROCESO:
 * 1. Usuario completa 4 pasos
 * 2. Al enviar:
 *    a) Archivos se suben a Cloudinary
 *    b) Se crea registro en tabla 'artistas'
 *    c) Se inscribe automáticamente a fase activa
 *    d) Se envía email de confirmación
 *    e) Admin recibe notificación en tiempo real
 */

export default function RegistroPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    // Paso 1: Datos Personales
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    pais: '',
    ciudad: '',
    codigo_postal: '',
    direccion: '',

    // Paso 2: Información Artística
    categoria: '',
    bio: '',
    redes_sociales: {
      instagram: '',
      facebook: '',
      website: '',
      portfolio: ''
    },

    // Paso 3: Documentos
    foto: null,
    documentos: {
      cv: null,
      portfolio: null,
      identificacion: null
    }
  })

  const steps = ['Datos Personales', 'Info Artística', 'Documentos', 'Confirmar']

  const updateFormData = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.nombre) newErrors.nombre = 'Nombre es requerido'
        if (!formData.apellido) newErrors.apellido = 'Apellido es requerido'
        if (!formData.email) newErrors.email = 'Email es requerido'
        if (!formData.telefono) newErrors.telefono = 'Teléfono es requerido'
        if (!formData.fecha_nacimiento)
          newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida'
        if (!formData.pais) newErrors.pais = 'País es requerido'
        if (!formData.ciudad) newErrors.ciudad = 'Ciudad es requerida'
        if (!formData.direccion) newErrors.direccion = 'Dirección es requerida'
        break

      case 2:
        if (!formData.categoria) newErrors.categoria = 'Categoría es requerida'
        if (!formData.bio) newErrors.bio = 'Biografía es requerida'
        if (formData.bio && formData.bio.length < 200)
          newErrors.bio = 'La biografía debe tener al menos 200 caracteres'
        break

      case 3:
        if (!formData.foto) newErrors.foto = 'Foto de perfil es requerida'
        if (!formData.documentos?.cv) newErrors.cv = 'CV artístico es requerido'
        if (!formData.documentos?.portfolio)
          newErrors.portfolio = 'Portfolio es requerido'
        if (!formData.documentos?.identificacion)
          newErrors.identificacion = 'Identificación es requerida'
        break

      case 4:
        // Validar términos (esto se maneja en el paso 4)
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setIsSubmitting(true)

    try {
      // HARDCODED: Simulación del envío
      // En producción:
      // 1. Upload archivos a Cloudinary
      // 2. POST a /api/artistas con data + URLs de archivos
      // 3. Backend crea artista e inscribe a fase activa
      // 4. Envía email de confirmación

      console.log('Enviando registro:', formData)

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Implementar llamada real a API
      // const formDataToSend = new FormData()
      // formDataToSend.append('nombre', formData.nombre)
      // ... resto de campos
      // formDataToSend.append('foto', formData.foto)
      // formDataToSend.append('cv', formData.documentos.cv)
      // etc.
      //
      // const response = await fetch('/api/artistas', {
      //   method: 'POST',
      //   body: formDataToSend
      // })

      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error al enviar registro:', error)
      setErrors({ submit: 'Hubo un error al enviar tu registro. Intenta de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pantalla de éxito
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu inscripción ha sido recibida. Recibirás un email de confirmación
              con los siguientes pasos.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                <strong>¿Qué sigue?</strong><br />
                Tu información será revisada por nuestro equipo de curaduría.
                Los resultados de la votación se notificarán por email al cierre
                de la fase actual.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full">Volver al Inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Registro de Artistas
          </h1>
          <p className="text-lg text-gray-600">ARTEFACT 2027</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* Steps */}
          {currentStep === 1 && (
            <Step1DatosPersonales
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <Step2InfoArtistica
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <Step3Documentos
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <Step4Confirmacion formData={formData} errors={errors} />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center">
            {currentStep > 1 && (
              <Button variant="ghost" onClick={handleBack}>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Anterior
              </Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={handleNext} className="ml-auto">
                Siguiente
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Inscripción
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                )}
              </Button>
            )}
          </div>

          {errors.submit && (
            <p className="mt-4 text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </div>

        {/* Help Box */}
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes dudas?{' '}
            <Link href="/#contacto" className="text-red-600 hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
