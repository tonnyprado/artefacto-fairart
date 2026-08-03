'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Step1DatosPersonales from '@/components/registro/Step1DatosPersonales'
import Step2InfoArtistica from '@/components/registro/Step2InfoArtistica'
import Step3Documentos from '@/components/registro/Step3Documentos'
import Step4Confirmacion from '@/components/registro/Step4Confirmacion'
import Step5Paquetes from '@/components/registro/Step5Paquetes'
import { usePageTransition } from '@/components/artefacto/TransitionLink'

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  displayWeight: 600,
  displayStyle: 'italic',
  subtitle: 'ivypresto-display, Georgia, serif',
  subtitleWeight: 600,
  subtitleStyle: 'italic',
  body: 'acumin-pro, sans-serif',
  bodyWeight: 400,
}

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
  const transition = usePageTransition()
  const [currentStep, setCurrentStep] = useState(1)

  const handleVolver = () => {
    transition.navigateTo('/#convocatoria', {
      color: '#B83030', // COLORS.red
    })
  }
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
    portfolio_images: [], // Array de imágenes con metadata
    documentos: {
      cv: null,
      identificacion: null
    },

    // Paso 5: Paquetes
    paquete_id: null,
    layout_canvas_url: null,
    layout_canvas_data: {}
  })

  const steps = ['Datos Personales', 'Info Artística', 'Documentos', 'Paquetes', 'Confirmar']

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

        // Validar portfolio_images (múltiples imágenes con metadata)
        if (!formData.portfolio_images || formData.portfolio_images.length < 5) {
          newErrors.portfolio_images = 'Debes subir al menos 5 imágenes de obras'
        } else if (formData.portfolio_images.length > 15) {
          newErrors.portfolio_images = 'Máximo 15 imágenes permitidas'
        } else {
          // Validar que todas las imágenes tengan metadata completa
          const sinMetadataCompleta = formData.portfolio_images.filter(
            img => !img.titulo || !img.alto_cm || !img.ancho_cm
          )
          if (sinMetadataCompleta.length > 0) {
            newErrors.portfolio_images = `${sinMetadataCompleta.length} imagen(es) sin título o dimensiones completas`
          }
        }

        if (!formData.documentos?.identificacion)
          newErrors.identificacion = 'Identificación es requerida'
        break

      case 4:
        if (!formData.paquete_id) newErrors.paquete_id = 'Debes seleccionar un paquete'
        if (!formData.layout_canvas_url)
          newErrors.layout = 'Debes guardar el layout del canvas'
        break

      case 5:
        // Validar términos (esto se maneja en el paso 5)
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
      // Crear FormData para enviar a la API
      const formDataToSend = new FormData()

      // Datos personales
      formDataToSend.append('nombre', formData.nombre)
      formDataToSend.append('apellido', formData.apellido)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('telefono', formData.telefono)
      formDataToSend.append('fecha_nacimiento', formData.fecha_nacimiento)
      formDataToSend.append('pais', formData.pais)
      formDataToSend.append('ciudad', formData.ciudad)
      formDataToSend.append('codigo_postal', formData.codigo_postal || '')
      formDataToSend.append('direccion', formData.direccion)

      // Información artística
      formDataToSend.append('categoria', formData.categoria)
      formDataToSend.append('bio', formData.bio)

      // Redes sociales
      formDataToSend.append('instagram', formData.redes_sociales?.instagram || '')
      formDataToSend.append('facebook', formData.redes_sociales?.facebook || '')
      formDataToSend.append('website', formData.redes_sociales?.website || '')
      formDataToSend.append('portfolio_web', formData.redes_sociales?.portfolio || '')

      // Archivos
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto)
      }
      if (formData.documentos?.cv) {
        formDataToSend.append('cv', formData.documentos.cv)
      }
      if (formData.documentos?.identificacion) {
        formDataToSend.append('identificacion', formData.documentos.identificacion)
      }

      // Portfolio images (múltiples imágenes con metadata)
      if (formData.portfolio_images && formData.portfolio_images.length > 0) {
        formData.portfolio_images.forEach((img, index) => {
          formDataToSend.append(`portfolio_image_${index}`, img.file)
          formDataToSend.append(`portfolio_image_${index}_titulo`, img.titulo)
          formDataToSend.append(`portfolio_image_${index}_alto_cm`, img.alto_cm)
          formDataToSend.append(`portfolio_image_${index}_ancho_cm`, img.ancho_cm)
        })
        formDataToSend.append('portfolio_images_count', formData.portfolio_images.length)
      }

      // Paso 5: Paquetes y Layout
      if (formData.paquete_id) {
        formDataToSend.append('paquete_id', formData.paquete_id)
      }
      if (formData.layout_canvas_url) {
        formDataToSend.append('layout_canvas_url', formData.layout_canvas_url)
      }
      if (formData.layout_canvas_data) {
        formDataToSend.append('layout_canvas_data', JSON.stringify(formData.layout_canvas_data))
      }

      // Enviar a la API
      const response = await fetch('/api/artistas', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar el registro')
      }

      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error al enviar registro:', error)
      setErrors({ submit: error.message || 'Hubo un error al enviar tu registro. Intenta de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pantalla de éxito animada
  const SuccessScreen = () => {
    const containerRef = useRef(null)
    const titleRef = useRef(null)
    const letterRefs = useRef([])

    useEffect(() => {
      if (!containerRef.current) return

      const letters = letterRefs.current.filter(Boolean)

      // Animación de entrada
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' }
      )

      // Animación de las letras con efecto de rebote
      gsap.fromTo(
        letters,
        {
          y: -100,
          opacity: 0,
          rotation: -15,
          scale: 0
        },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.3
        }
      )

      // Animación flotante continua de las letras
      letters.forEach((letter, index) => {
        gsap.to(letter, {
          y: '+=15',
          rotation: '+=5',
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: index * 0.1
        })
      })
    }, [])

    const message = "¡GRACIAS POR INSCRIBIRTE!"
    const words = message.split(' ')

    return (
      <div
        ref={containerRef}
        style={{
          minHeight: '100vh',
          background: COLORS.red,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decoración de fondo */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 100,
          height: 100,
          opacity: 0.1,
        }}>
          <img src="/assets/glyph-x-white.svg" alt="" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 120,
          height: 120,
          opacity: 0.1,
        }}>
          <img src="/assets/glyph-e-white.svg" alt="" style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{
          maxWidth: 900,
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Título animado con letras individuales */}
          <div style={{
            marginBottom: 48,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 16px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {words.map((word, wordIndex) => (
              <div key={wordIndex} style={{ display: 'flex', gap: 4 }}>
                {word.split('').map((char, charIndex) => (
                  <span
                    key={`${wordIndex}-${charIndex}`}
                    ref={(el) => letterRefs.current.push(el)}
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: FONTS.displayWeight,
                      fontStyle: FONTS.displayStyle,
                      fontSize: 'clamp(32px, 6vw, 72px)',
                      color: COLORS.cream,
                      display: 'inline-block',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Contenido */}
          <div style={{
            background: COLORS.black,
            padding: '40px 48px',
            maxWidth: 600,
            margin: '0 auto 32px',
          }}>
            <p style={{
              margin: '0 0 24px',
              fontSize: 18,
              lineHeight: 1.7,
              color: COLORS.cream,
              fontFamily: FONTS.body,
            }}>
              Tu inscripción ha sido recibida exitosamente. Recibirás un email de confirmación con los siguientes pasos.
            </p>
            <div style={{
              background: 'rgba(244,237,228,0.1)',
              padding: '24px',
              borderLeft: `4px solid ${COLORS.red}`
            }}>
              <p style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.6,
                color: 'rgba(244,237,228,0.9)',
                fontFamily: FONTS.body,
              }}>
                <strong style={{ color: COLORS.cream, fontWeight: 700 }}>¿Qué sigue?</strong><br />
                Tu información será revisada por nuestro equipo de curaduría. Los resultados de la votación se notificarán por email al cierre de la fase actual.
              </p>
            </div>
          </div>

          {/* Botón */}
          <button
            onClick={() => transition.navigateTo('/', { color: COLORS.cream })}
            style={{
              display: 'inline-block',
              background: COLORS.cream,
              color: COLORS.black,
              padding: '18px 40px',
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = COLORS.creamDark
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = COLORS.cream
              e.target.style.transform = 'scale(1)'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return <SuccessScreen />
  }

  // Refs para animaciones
  const formCardRef = useRef(null)
  const prevStepRef = useRef(currentStep)

  // Animar transición entre pasos
  useEffect(() => {
    if (formCardRef.current && prevStepRef.current !== currentStep) {
      // Animación de salida y entrada
      gsap.fromTo(
        formCardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        }
      )
      prevStepRef.current = currentStep
    }
  }, [currentStep])

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      padding: '80px 24px 60px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <button
            onClick={handleVolver}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: COLORS.red,
              marginBottom: 24,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: FONTS.body,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateX(-4px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
          >
            <svg
              style={{ width: 20, height: 20, marginRight: 8 }}
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
            Volver a Convocatoria
          </button>

          <h1 style={{
            margin: '0 0 12px',
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(32px, 5vw, 48px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: COLORS.black,
          }}>
            Registro de Artistas
          </h1>
          <p style={{
            margin: 0,
            fontSize: 18,
            color: COLORS.gray,
            fontFamily: FONTS.body,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            ARTE FACTO 2027
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 40 }}>
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <div
          ref={formCardRef}
          style={{
            background: COLORS.red,
            padding: '48px',
            marginBottom: 32,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
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
            <Step5Paquetes
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 5 && (
            <Step4Confirmacion formData={formData} errors={errors} />
          )}

          {/* Navigation Buttons */}
          <div style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                style={{
                  background: 'transparent',
                  color: COLORS.cream,
                  border: `2px solid ${COLORS.cream}`,
                  padding: '16px 32px',
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.cream
                  e.target.style.color = COLORS.black
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.color = COLORS.cream
                }}
              >
                <svg
                  style={{ width: 20, height: 20 }}
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
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                style={{
                  marginLeft: 'auto',
                  background: COLORS.black,
                  color: COLORS.cream,
                  border: 'none',
                  padding: '16px 32px',
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.cream
                  e.target.style.color = COLORS.black
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = COLORS.black
                  e.target.style.color = COLORS.cream
                }}
              >
                Siguiente
                <svg
                  style={{ width: 20, height: 20 }}
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
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  marginLeft: 'auto',
                  background: COLORS.black,
                  color: COLORS.cream,
                  border: 'none',
                  padding: '16px 32px',
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = COLORS.cream
                    e.target.style.color = COLORS.black
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = COLORS.black
                    e.target.style.color = COLORS.cream
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      style={{
                        width: 20,
                        height: 20,
                        animation: 'spin 1s linear infinite'
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: 0.25 }}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        style={{ opacity: 0.75 }}
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
                      style={{ width: 20, height: 20 }}
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
              </button>
            )}
          </div>

          {errors.submit && (
            <p style={{
              marginTop: 24,
              fontSize: 14,
              color: COLORS.cream,
              textAlign: 'center',
              fontFamily: FONTS.body,
            }}>
              {errors.submit}
            </p>
          )}
        </div>

        {/* Help Box */}
        <div style={{
          background: COLORS.black,
          padding: '24px 32px',
          textAlign: 'center',
        }}>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: COLORS.cream,
            fontFamily: FONTS.body,
          }}>
            ¿Tienes dudas?{' '}
            <button
              onClick={() => transition.navigateTo('/#contacto', { color: COLORS.black })}
              style={{
                color: COLORS.red,
                textDecoration: 'underline',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: FONTS.body,
                fontSize: 14,
                padding: 0,
              }}
            >
              Contáctanos
            </button>
          </p>
        </div>
      </div>

      {/* CSS para animación de spin */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
