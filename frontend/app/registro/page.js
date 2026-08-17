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
import CustomCursor from '@/components/artefacto/CustomCursor'
import MobileBlocker from '@/components/registro/MobileBlocker'

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
    nombre_artistico: '', // Nuevo campo opcional
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    pais: '',
    ciudad: '',

    // Paso 2: Información Artística
    categoria: '',
    bio: '',
    redes_sociales: {
      instagram: '',
      website: ''
    },

    // Paso 3: Documentos
    foto: null,
    documentos: {
      cv: null,
      portfolio: null,
      identificacion: null
    },

    // Paso 4: Tu Lienzo
    paquete_id: null,
    portfolio_images: [], // Array de imágenes con metadata (cargadas en Tu Lienzo)
    layout_canvas_url: null,
    layout_canvas_data: {}
  })

  // Nuevo orden de etapas: Tu Lienzo pasa a ser Etapa 2
  const steps = ['Datos Personales', 'Tu Lienzo', 'Info Artística', 'Documentos', 'Confirmar']

  const updateFormData = (newData) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        ...newData
      }
      // Guardar en localStorage (excluir archivos blob)
      try {
        const dataToSave = {
          ...updated,
          // No guardar archivos blob en localStorage
          foto: null,
          documentos: {
            cv: null,
            portfolio: null,
            identificacion: null
          },
          layout_canvas_blob: null,
          obras_lienzo: updated.obras_lienzo?.map(obra => ({
            ...obra,
            file: null // No guardar archivos
          })) || []
        }
        localStorage.setItem('artefacto_registro_draft', JSON.stringify(dataToSave))
        console.log('FormData guardado en localStorage')
      } catch (error) {
        console.warn('Error guardando en localStorage:', error)
      }
      return updated
    })
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        // Datos Personales + Disciplina Artística
        if (!formData.nombre) newErrors.nombre = 'Nombre es requerido'
        if (!formData.apellido) newErrors.apellido = 'Apellido es requerido'
        if (!formData.email) newErrors.email = 'Email es requerido'
        if (!formData.telefono) newErrors.telefono = 'Teléfono es requerido'
        if (!formData.fecha_nacimiento)
          newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida'
        if (!formData.pais) newErrors.pais = 'País es requerido'
        if (!formData.ciudad) newErrors.ciudad = 'Ciudad es requerida'
        if (!formData.categoria) newErrors.categoria = 'Disciplina artística es requerida'
        break

      case 2:
        // Tu Lienzo (antes era paso 4)
        if (!formData.paquete_id) newErrors.paquete_id = 'Debes seleccionar un paquete'
        if (!formData.layout_canvas_url)
          newErrors.layout = 'Debes guardar el layout del canvas'
        break

      case 3:
        // Info Artística (antes era paso 2)
        if (!formData.bio) newErrors.bio = 'Semblanza es requerida'
        if (formData.bio && formData.bio.length > 950)
          newErrors.bio = 'La semblanza debe tener máximo 950 caracteres'
        if (!formData.redes_sociales?.instagram)
          newErrors.instagram = 'Instagram es requerido'
        break

      case 4:
        // Documentos (antes era paso 3)
        if (!formData.foto) newErrors.foto = 'Foto de perfil es requerida'
        if (!formData.documentos?.cv) newErrors.cv = 'CV artístico es requerido'
        if (!formData.documentos?.portfolio) newErrors.portfolio = 'Portafolio es requerido'
        if (!formData.documentos?.identificacion)
          newErrors.identificacion = 'Identificación es requerida'
        break

      case 5:
        // Confirmación - se maneja en el componente
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = (skipValidation = false) => {
    console.log('handleNext llamado con skipValidation:', skipValidation)
    if (skipValidation || validateStep(currentStep)) {
      console.log('Avanzando al siguiente paso...')
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.log('Validación falló, no se avanza')
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = (stepNumber) => {
    console.log('Navegando al paso:', stepNumber)
    setCurrentStep(stepNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    // Validar que se aceptaron los términos
    // Nota: La validación de checkboxes debe hacerse en el componente Step4Confirmacion
    // ya que no están en formData, están en estado local del componente

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

      // Información artística
      formDataToSend.append('categoria', formData.categoria)
      formDataToSend.append('bio', formData.bio)

      // Redes sociales
      formDataToSend.append('instagram', formData.redes_sociales?.instagram || '')
      formDataToSend.append('website', formData.redes_sociales?.website || '')

      // Archivos
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto)
      }
      if (formData.documentos?.cv) {
        formDataToSend.append('cv', formData.documentos.cv)
      }
      if (formData.documentos?.portfolio) {
        formDataToSend.append('portfolio', formData.documentos.portfolio)
      }
      if (formData.documentos?.identificacion) {
        formDataToSend.append('identificacion', formData.documentos.identificacion)
      }

      // Paso 4: Tu Lienzo - Paquetes y Layout
      if (formData.paquete_id) {
        formDataToSend.append('paquete_id', formData.paquete_id)
      }

      // Canvas PDF (blob) - PDF completo con detalle de obras
      if (formData.layout_canvas_pdf_blob) {
        formDataToSend.append('layout_canvas_pdf', formData.layout_canvas_pdf_blob, 'lienzo.pdf')
      }

      // Canvas image (blob) - JPEG comprimido para preview
      if (formData.layout_canvas_blob) {
        formDataToSend.append('layout_canvas_image', formData.layout_canvas_blob, 'lienzo.jpg')
      }

      // Layout data (JSON)
      if (formData.layout_canvas_data) {
        formDataToSend.append('layout_canvas_data', JSON.stringify(formData.layout_canvas_data))
      }

      // Obras del lienzo (las que participarán en el evento)
      if (formData.obras_lienzo && formData.obras_lienzo.length > 0) {
        formData.obras_lienzo.forEach((obra, index) => {
          // Archivo de la obra
          if (obra.file) {
            formDataToSend.append(`obra_lienzo_${index}`, obra.file)
          }
          // Metadata de la obra
          formDataToSend.append(`obra_lienzo_${index}_titulo`, obra.titulo)
          formDataToSend.append(`obra_lienzo_${index}_alto_cm`, obra.alto_cm)
          formDataToSend.append(`obra_lienzo_${index}_ancho_cm`, obra.ancho_cm)
          formDataToSend.append(`obra_lienzo_${index}_tecnica`, obra.tecnica)
          formDataToSend.append(`obra_lienzo_${index}_anio`, obra.anio)
          formDataToSend.append(`obra_lienzo_${index}_precio_mxn`, obra.precio_mxn)
          formDataToSend.append(`obra_lienzo_${index}_notas_montaje`, obra.notas_montaje || '')
        })
        formDataToSend.append('obras_lienzo_count', formData.obras_lienzo.length)
      }

      // LOG: Calcular y mostrar tamaño total de archivos
      let totalSize = 0
      const fileSizes = {}

      if (formData.foto) {
        fileSizes.foto = Math.round(formData.foto.size / 1024)
        totalSize += formData.foto.size
      }
      if (formData.documentos?.cv) {
        fileSizes.cv = Math.round(formData.documentos.cv.size / 1024)
        totalSize += formData.documentos.cv.size
      }
      if (formData.documentos?.portfolio) {
        fileSizes.portfolio = Math.round(formData.documentos.portfolio.size / 1024)
        totalSize += formData.documentos.portfolio.size
      }
      if (formData.documentos?.identificacion) {
        fileSizes.identificacion = Math.round(formData.documentos.identificacion.size / 1024)
        totalSize += formData.documentos.identificacion.size
      }
      if (formData.layout_canvas_blob) {
        fileSizes.canvas = Math.round(formData.layout_canvas_blob.size / 1024)
        totalSize += formData.layout_canvas_blob.size
      }
      if (formData.layout_canvas_pdf_blob) {
        fileSizes.canvas_pdf = Math.round(formData.layout_canvas_pdf_blob.size / 1024)
        totalSize += formData.layout_canvas_pdf_blob.size
      }
      if (formData.obras_lienzo) {
        formData.obras_lienzo.forEach((obra, i) => {
          if (obra.file) {
            fileSizes[`obra_${i}`] = Math.round(obra.file.size / 1024)
            totalSize += obra.file.size
          }
        })
      }

      console.log('=== TAMAÑOS DE ARCHIVOS ===')
      console.log('Foto:', fileSizes.foto, 'KB')
      console.log('CV:', fileSizes.cv, 'KB')
      console.log('Portfolio:', fileSizes.portfolio, 'KB')
      console.log('Identificación:', fileSizes.identificacion, 'KB')
      console.log('Canvas:', fileSizes.canvas, 'KB')
      console.log('Canvas PDF:', fileSizes.canvas_pdf, 'KB')
      Object.keys(fileSizes).filter(k => k.startsWith('obra_')).forEach(k => {
        console.log(k + ':', fileSizes[k], 'KB')
      })
      const totalMB = (totalSize / (1024 * 1024)).toFixed(2)
      console.log('TOTAL:', Math.round(totalSize / 1024), 'KB (', totalMB, 'MB )')
      console.log('LÍMITE: 4.5 MB')

      // Validar tamaño total antes de enviar
      if (totalSize > 4.5 * 1024 * 1024) {
        console.error('❌ ERROR: El tamaño total excede el límite del servidor')
        setErrors({
          submit: `El tamaño total de archivos (${totalMB}MB) excede el límite de 4.5MB. Por favor, comprime tus PDFs (CV, Portafolio, Identificación) antes de subirlos. Puedes usar herramientas gratuitas en línea como smallpdf.com o ilovepdf.com`
        })
        setIsSubmitting(false)
        return
      }

      // Enviar directamente al backend (evita límite de 4.5MB de Vercel)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      console.log('Enviando a:', `${backendUrl}/registro`)
      console.log('Tamaño total FormData:', totalMB, 'MB')

      // Timeout de 3 minutos para upload de archivos grandes
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.error('❌ Timeout: La solicitud tardó más de 3 minutos')
      }, 180000) // 3 minutos

      let response
      try {
        response = await fetch(`${backendUrl}/registro`, {
          method: 'POST',
          body: formDataToSend,
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error('Error al procesar la respuesta del servidor')
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al enviar el registro')
      }

      console.log('Registro exitoso:', result)
      // Guardar datos del canvas para la página de confirmación
      // Incluir URL del PDF que viene del backend (subido a S3)
      const confirmacionData = {
        layout_canvas_url: formData.layout_canvas_url || formData.layout_canvas_preview_url,
        // URL del PDF desde el backend (guardado en layout_canvas_data.pdf_url)
        layout_canvas_pdf_url: result.data?.layout_canvas_data?.pdf_url || null,
        paquete_nombre: formData.layout_canvas_data?.paquete_nombre,
        obras_count: formData.obras_lienzo?.length || 0
      }
      localStorage.setItem('artefacto_confirmacion_data', JSON.stringify(confirmacionData))

      // Limpiar localStorage después de envío exitoso
      localStorage.removeItem('artefacto_registro_draft')

      // Redirigir a página de confirmación con datos
      const folio = result.data?.folio || result.folio || 'ART-2027-XXX'
      router.push(`/registro/confirmacion?folio=${encodeURIComponent(folio)}&nombre=${encodeURIComponent(formData.nombre)}&email=${encodeURIComponent(formData.email)}`)
    } catch (error) {
      console.error('Error al enviar registro:', error)
      setErrors({
        submit: error.message || 'Hubo un error al enviar tu registro. Por favor intenta de nuevo.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Refs para animaciones (TODOS los refs deben estar antes de cualquier return)
  const successContainerRef = useRef(null)
  const successLetterRefs = useRef([])
  const formCardRef = useRef(null)
  const prevStepRef = useRef(currentStep)

  // Efecto para animar SuccessScreen
  useEffect(() => {
    if (!submitSuccess || !successContainerRef.current) return

    const letters = successLetterRefs.current.filter(Boolean)

    // Animación de entrada
    gsap.fromTo(
      successContainerRef.current,
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
  }, [submitSuccess])

  // Cargar datos desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('artefacto_registro_draft')
      if (saved) {
        const parsedData = JSON.parse(saved)
        console.log('Datos cargados desde localStorage:', parsedData)

        // Limpiar datos problemáticos que pueden contener blobs inválidos
        const cleanedData = {
          ...parsedData,
          // No cargar portfolio_images desde localStorage (pueden tener blobs revocados)
          portfolio_images: [],
          // No cargar layout canvas (puede tener datos obsoletos)
          layout_canvas_url: null,
          layout_canvas_data: {},
          layout_canvas_blob: null,
          obras_lienzo: []
        }

        setFormData(prev => ({
          ...prev,
          ...cleanedData
        }))
      }
    } catch (error) {
      console.warn('Error cargando desde localStorage:', error)
    }
  }, [])

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

  // Forzar bordes redondeados cuando se monta el componente
  useEffect(() => {
    const styleId = 'registro-border-radius-fix'

    // Crear y agregar el style tag
    const style = document.createElement('style')
    style.id = styleId
    style.innerHTML = `
      /* REGLA GLOBAL: Todos los elementos con borde o background tienen esquinas super redondeadas */

      /* Todos los inputs y controles de formulario */
      input,
      textarea,
      select,
      button {
        border-radius: 16px !important;
      }

      /* Todos los divs, sections, articles, etc. */
      div,
      section,
      article,
      aside,
      main,
      nav,
      header,
      footer,
      form,
      fieldset,
      legend {
        border-radius: 16px !important;
      }

      /* Cards, containers, wrappers */
      [class*="card"],
      [class*="container"],
      [class*="wrapper"],
      [class*="box"] {
        border-radius: 16px !important;
      }

      /* Labels y spans con background */
      label[class*="bg-"],
      span[class*="bg-"],
      p[class*="bg-"] {
        border-radius: 16px !important;
      }

      /* EXCEPCIONES: Elementos que deben mantener sus formas específicas */

      /* Checkboxes y radios pequeños */
      input[type="checkbox"],
      input[type="radio"] {
        border-radius: 4px !important;
      }

      /* Círculos y elementos redondos */
      [class*="rounded-full"],
      svg circle,
      [style*="border-radius: 50%"],
      [style*="borderRadius: 50%"] {
        border-radius: 50% !important;
      }

      /* Progreso y barras */
      progress,
      meter {
        border-radius: 16px !important;
      }
    `
    document.head.appendChild(style)

    // Limpiar cuando se desmonta
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  // Pantalla de éxito animada
  const SuccessScreen = () => {
    // Reset letter refs array
    successLetterRefs.current = []
    const contentRef = useRef(null)
    const infoRef = useRef(null)
    const buttonRef = useRef(null)

    const artistName = formData.nombre || 'artista'
    const message = `¡GRACIAS POR INSCRIBIRTE, ${artistName.toUpperCase()}!`
    const words = message.split(' ')

    useEffect(() => {
      // Animar contenido después de las letras
      const timeline = gsap.timeline({ delay: 2.2 })

      if (contentRef.current) {
        timeline.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        )
      }

      if (infoRef.current) {
        timeline.fromTo(
          infoRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.5'
        )
      }

      if (buttonRef.current) {
        timeline.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        )
      }
    }, [])

    return (
      <div
        ref={successContainerRef}
        style={{
          minHeight: '100vh',
          background: COLORS.red,
          display: 'flex',
          flexDirection: 'column',
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

        {/* Container principal centrado */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 1100,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '56px',
          padding: '40px 20px'
        }}>
          {/* Título animado con letras individuales - CENTRADO */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 20px',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px'
          }}>
            {words.map((word, wordIndex) => (
              <div key={wordIndex} style={{ display: 'flex', gap: 6 }}>
                {word.split('').map((char, charIndex) => (
                  <span
                    key={`${wordIndex}-${charIndex}`}
                    ref={(el) => el && successLetterRefs.current.push(el)}
                    style={{
                      fontFamily: FONTS.display,
                      fontWeight: FONTS.displayWeight,
                      fontStyle: FONTS.displayStyle,
                      fontSize: 'clamp(36px, 7vw, 80px)',
                      color: COLORS.cream,
                      display: 'inline-block',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Contenido - SIN CARD, solo texto limpio */}
          <div ref={contentRef} style={{
            opacity: 0,
            maxWidth: 700,
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              lineHeight: 1.7,
              color: COLORS.cream,
              fontFamily: FONTS.body,
              fontWeight: 400,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              Tu inscripción ha sido recibida exitosamente. Recibirás un email de confirmación con los siguientes pasos.
            </p>
          </div>

          {/* Info adicional - SIN CARD */}
          <div ref={infoRef} style={{
            opacity: 0,
            maxWidth: 650,
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.8,
              color: 'rgba(244,237,228,0.95)',
              fontFamily: FONTS.body,
              fontWeight: 400,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <strong style={{ color: COLORS.cream, fontWeight: 700, fontSize: 'clamp(17px, 2.2vw, 22px)' }}>
                ¿Qué sigue?
              </strong>
              <br />
              Tu información será revisada por nuestro equipo de curaduría. Los resultados de la votación se notificarán por email al cierre de la fase actual.
            </p>
          </div>

          {/* Botón - VOLVER A INICIO */}
          <button
            ref={buttonRef}
            onClick={() => transition.navigateTo('/', { color: COLORS.cream })}
            style={{
              opacity: 0,
              display: 'inline-block',
              background: COLORS.cream,
              color: COLORS.black,
              padding: '20px 48px',
              border: 'none',
              borderRadius: '16px',
              fontFamily: FONTS.body,
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = COLORS.creamDark
              e.target.style.transform = 'scale(1.05) translateY(-2px)'
              e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = COLORS.cream
              e.target.style.transform = 'scale(1) translateY(0)'
              e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'
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


  return (
    <MobileBlocker>
      <CustomCursor />
      <div style={{
        minHeight: '100vh',
        background: COLORS.cream,
        padding: '80px 24px 60px',
      }}>
        <div style={{ maxWidth: currentStep === 4 ? 1950 : 900, margin: '0 auto', transition: 'max-width 0.3s ease' }}>
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
          <ProgressBar steps={steps} currentStep={currentStep} onStepClick={goToStep} />
        </div>

        {/* Form Card */}
        <div
          ref={formCardRef}
          style={{
            background: COLORS.red,
            padding: '48px',
            marginBottom: 32,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            borderRadius: '24px',
          }}
        >
          {/* Steps - Nuevo orden: Datos Personales → Tu Lienzo → Info Artística → Documentos → Confirmar */}
          {currentStep === 1 && (
            <Step1DatosPersonales
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <Step5Paquetes
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              onContinue={handleNext}
            />
          )}
          {currentStep === 3 && (
            <Step2InfoArtistica
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <Step3Documentos
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          {currentStep === 5 && (
            <Step4Confirmacion
              formData={formData}
              errors={errors}
              onEdit={goToStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Navigation Buttons - Ocultos en step 5 (confirmación) y step 2 (Tu Lienzo tiene su propia navegación) */}
          {currentStep !== 5 && currentStep !== 2 && (
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
                  borderRadius: '16px',
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
            {/* Botón Siguiente - visible en pasos 1, 3, 4 (paso 2 y 5 tienen su propia navegación) */}
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
                borderRadius: '16px',
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
          </div>
          )}

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
    </MobileBlocker>
  )
}
