'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'

/**
 * Paso 5: Confirmación y Términos
 *
 * Muestra resumen de la información capturada incluyendo el layout del mural
 * y solicita aceptación de términos y condiciones
 */

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
  body: 'acumin-pro, sans-serif',
  bodyWeight: 400,
}

export default function Step4Confirmacion({ formData, errors, onEdit, onSubmit, isSubmitting }) {
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [errorTerminos, setErrorTerminos] = useState('')

  // Refs para animaciones GSAP
  const containerRef = useRef(null)
  const sectionRefs = useRef([])

  useEffect(() => {
    // Animar entrada de secciones con GSAP
    if (sectionRefs.current.length > 0) {
      gsap.fromTo(
        sectionRefs.current.filter(Boolean),
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        }
      )
    }
  }, [])

  const handleDownloadPDF = () => {
    // Descargar la imagen del canvas como archivo
    if (formData.layout_canvas_url) {
      const link = document.createElement('a')
      link.href = formData.layout_canvas_url
      link.download = `lienzo-${formData.nombre || 'artista'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleTerminosChange = (e) => {
    setAceptaTerminos(e.target.checked)
    if (e.target.checked && aceptaPrivacidad) {
      setErrorTerminos('')
    }
  }

  const handlePrivacidadChange = (e) => {
    setAceptaPrivacidad(e.target.checked)
    if (e.target.checked && aceptaTerminos) {
      setErrorTerminos('')
    }
  }

  const handleSubmitClick = () => {
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setErrorTerminos('Debes aceptar los términos y condiciones y el aviso de privacidad')
      return
    }
    if (onSubmit) {
      onSubmit()
    }
  }

  const EditButton = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        background: 'transparent',
        color: COLORS.red,
        border: `2px solid ${COLORS.red}`,
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: FONTS.body,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = COLORS.red
        e.target.style.color = COLORS.cream
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'transparent'
        e.target.style.color = COLORS.red
      }}
    >
      Editar
    </button>
  )

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div
        ref={(el) => (sectionRefs.current[0] = el)}
        style={{ textAlign: 'center', paddingTop: '20px' }}
      >
        <h2 style={{
          fontFamily: FONTS.display,
          fontWeight: FONTS.displayWeight,
          fontStyle: FONTS.displayStyle,
          fontSize: 'clamp(32px, 5vw, 52px)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: COLORS.cream,
          marginBottom: '12px',
          lineHeight: 1.2
        }}>
          CONFIRMA TU REGISTRO
        </h2>
        <p style={{
          color: COLORS.cream,
          opacity: 0.9,
          fontFamily: FONTS.body,
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Revisa que toda tu información sea correcta antes de enviar
        </p>
      </div>

      {/* Datos Personales */}
      <div ref={(el) => (sectionRefs.current[1] = el)} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: COLORS.cream,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Datos Personales
          </h3>
          <EditButton onClick={() => onEdit(1)} />
        </div>
        <div style={{
          background: 'rgba(244, 237, 228, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '16px',
          border: `1px solid rgba(244, 237, 228, 0.2)`
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            fontFamily: FONTS.body,
            fontSize: '15px'
          }}>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px', fontSize: '13px' }}>Nombre Completo</span>
              <span style={{ fontWeight: '600', color: COLORS.cream, fontSize: '16px' }}>
                {formData.nombre} {formData.apellido}
              </span>
            </div>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px', fontSize: '13px' }}>Email</span>
              <span style={{ fontWeight: '600', color: COLORS.cream, fontSize: '16px' }}>{formData.email}</span>
            </div>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px', fontSize: '13px' }}>Teléfono</span>
              <span style={{ fontWeight: '600', color: COLORS.cream, fontSize: '16px' }}>{formData.telefono}</span>
            </div>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px', fontSize: '13px' }}>Fecha de Nacimiento</span>
              <span style={{ fontWeight: '600', color: COLORS.cream, fontSize: '16px' }}>{formData.fecha_nacimiento}</span>
            </div>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px', fontSize: '13px' }}>Ubicación</span>
              <span style={{ fontWeight: '600', color: COLORS.cream, fontSize: '16px' }}>
                {formData.ciudad}, {formData.pais}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información Artística */}
      <div ref={(el) => (sectionRefs.current[2] = el)} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: COLORS.cream,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Información Artística
          </h3>
          <EditButton onClick={() => onEdit(2)} />
        </div>
        <div style={{
          background: 'rgba(244, 237, 228, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '16px',
          border: `1px solid rgba(244, 237, 228, 0.2)`
        }}>
          <div style={{
            fontFamily: FONTS.body,
            fontSize: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px', fontSize: '13px' }}>Categoría</span>
              <span style={{ fontWeight: '600', color: COLORS.cream, textTransform: 'capitalize', fontSize: '16px' }}>
                {formData.categoria?.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '12px', fontSize: '13px' }}>Semblanza Artística</span>
              <p style={{
                color: COLORS.cream,
                lineHeight: '1.8',
                margin: 0,
                padding: '20px',
                background: 'rgba(20, 18, 16, 0.3)',
                borderRadius: '12px',
                fontSize: '15px',
                border: `1px solid rgba(244, 237, 228, 0.15)`
              }}>
                {formData.bio}
              </p>
            </div>
            {formData.redes_sociales && (
              <div>
                <span style={{ color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '12px', fontSize: '13px' }}>Redes Sociales</span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {formData.redes_sociales.instagram && (
                    <span style={{
                      background: 'rgba(244, 237, 228, 0.15)',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: COLORS.cream,
                      border: `1px solid rgba(244, 237, 228, 0.2)`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      @{formData.redes_sociales.instagram}
                    </span>
                  )}
                  {formData.redes_sociales.sitio_web && (
                    <span style={{
                      background: 'rgba(244, 237, 228, 0.15)',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: COLORS.cream,
                      border: `1px solid rgba(244, 237, 228, 0.2)`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      {formData.redes_sociales.sitio_web}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div ref={(el) => (sectionRefs.current[3] = el)} style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: COLORS.cream,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Documentos
          </h3>
          <EditButton onClick={() => onEdit(3)} />
        </div>
        <div style={{
          background: 'rgba(244, 237, 228, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '16px',
          border: `1px solid rgba(244, 237, 228, 0.2)`
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontFamily: FONTS.body,
            fontSize: '15px'
          }}>
            {/* Foto de Perfil */}
            <div style={{
              background: 'rgba(20, 18, 16, 0.3)',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid rgba(244, 237, 228, 0.15)`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: formData.foto ? COLORS.red : 'rgba(244, 237, 228, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {formData.foto && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span style={{ color: COLORS.cream, fontWeight: '600', fontSize: '14px' }}>
                  Foto de Perfil
                </span>
              </div>
              {formData.foto && (
                <span style={{ color: COLORS.cream, opacity: 0.7, fontSize: '13px', display: 'block', paddingLeft: '36px' }}>
                  {typeof formData.foto === 'string' ? 'Archivo cargado' : formData.foto.name || 'foto-perfil.jpg'}
                </span>
              )}
            </div>

            {/* CV Artístico */}
            <div style={{
              background: 'rgba(20, 18, 16, 0.3)',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid rgba(244, 237, 228, 0.15)`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: formData.documentos?.cv ? COLORS.red : 'rgba(244, 237, 228, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {formData.documentos?.cv && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span style={{ color: COLORS.cream, fontWeight: '600', fontSize: '14px' }}>
                  CV Artístico
                </span>
              </div>
              {formData.documentos?.cv && (
                <span style={{ color: COLORS.cream, opacity: 0.7, fontSize: '13px', display: 'block', paddingLeft: '36px' }}>
                  {typeof formData.documentos.cv === 'string' ? 'Archivo cargado' : formData.documentos.cv.name || 'cv.pdf'}
                </span>
              )}
            </div>

            {/* Portafolio */}
            <div style={{
              background: 'rgba(20, 18, 16, 0.3)',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid rgba(244, 237, 228, 0.15)`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: formData.documentos?.portfolio ? COLORS.red : 'rgba(244, 237, 228, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {formData.documentos?.portfolio && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span style={{ color: COLORS.cream, fontWeight: '600', fontSize: '14px' }}>
                  Portafolio
                </span>
              </div>
              {formData.documentos?.portfolio && (
                <span style={{ color: COLORS.cream, opacity: 0.7, fontSize: '13px', display: 'block', paddingLeft: '36px' }}>
                  {typeof formData.documentos.portfolio === 'string' ? 'Archivo cargado' : formData.documentos.portfolio.name || 'portafolio.pdf'}
                </span>
              )}
            </div>

            {/* Identificación Oficial */}
            <div style={{
              background: 'rgba(20, 18, 16, 0.3)',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid rgba(244, 237, 228, 0.15)`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: formData.documentos?.identificacion ? COLORS.red : 'rgba(244, 237, 228, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {formData.documentos?.identificacion && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span style={{ color: COLORS.cream, fontWeight: '600', fontSize: '14px' }}>
                  Identificación Oficial
                </span>
              </div>
              {formData.documentos?.identificacion && (
                <span style={{ color: COLORS.cream, opacity: 0.7, fontSize: '13px', display: 'block', paddingLeft: '36px' }}>
                  {typeof formData.documentos.identificacion === 'string' ? 'Archivo cargado' : formData.documentos.identificacion.name || 'identificacion.pdf'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tu Lienzo */}
      {formData.layout_canvas_url && (
        <div ref={(el) => (sectionRefs.current[4] = el)} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h3 style={{
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(24px, 3vw, 32px)',
              color: COLORS.cream,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              Tu Lienzo
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleDownloadPDF}
                style={{
                  padding: '10px 20px',
                  background: COLORS.cream,
                  color: COLORS.black,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: FONTS.body,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.creamDark
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = COLORS.cream
                }}
              >
                Descargar
              </button>
              <EditButton onClick={() => onEdit(4)} />
            </div>
          </div>

          {/* Preview del canvas */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <img
              src={formData.layout_canvas_url}
              alt="Preview de tu lienzo"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          {/* Info del paquete y obras */}
          {formData.layout_canvas_data && (
            <div style={{
              background: 'rgba(244, 237, 228, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid rgba(244, 237, 228, 0.2)`
            }}>
              <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                marginBottom: formData.layout_canvas_data.obras?.length > 0 ? '24px' : '0'
              }}>
                <div style={{
                  flex: '1',
                  minWidth: '200px'
                }}>
                  <span style={{ fontSize: '13px', color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px' }}>
                    Paquete Seleccionado
                  </span>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: COLORS.cream,
                    fontFamily: FONTS.display,
                    fontStyle: FONTS.displayStyle,
                    textTransform: 'uppercase'
                  }}>
                    {formData.layout_canvas_data.paquete_nombre || 'N/A'}
                  </span>
                </div>
                <div style={{
                  flex: '1',
                  minWidth: '200px'
                }}>
                  <span style={{ fontSize: '13px', color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px' }}>
                    Metros Lineales
                  </span>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: COLORS.cream,
                    fontFamily: FONTS.display,
                    fontStyle: FONTS.displayStyle
                  }}>
                    {formData.layout_canvas_data.metros_lineales || 'N/A'}m
                  </span>
                </div>
                <div style={{
                  flex: '1',
                  minWidth: '200px'
                }}>
                  <span style={{ fontSize: '13px', color: COLORS.cream, opacity: 0.7, display: 'block', marginBottom: '4px' }}>
                    Obras Registradas
                  </span>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: COLORS.cream,
                    fontFamily: FONTS.display,
                    fontStyle: FONTS.displayStyle
                  }}>
                    {formData.layout_canvas_data.obras?.length || 0}
                  </span>
                </div>
              </div>

              {/* Lista de obras */}
              {formData.layout_canvas_data.obras && formData.layout_canvas_data.obras.length > 0 && (
                <div>
                  <span style={{
                    fontSize: '14px',
                    color: COLORS.cream,
                    opacity: 0.7,
                    display: 'block',
                    marginBottom: '16px',
                    fontFamily: FONTS.body
                  }}>
                    Obras en tu lienzo:
                  </span>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '16px'
                  }}>
                    {formData.layout_canvas_data.obras.map((obra, index) => (
                      <div
                        key={obra.id || index}
                        style={{
                          background: 'rgba(20, 18, 16, 0.4)',
                          padding: '12px',
                          borderRadius: '12px',
                          border: `1px solid rgba(244, 237, 228, 0.15)`,
                          textAlign: 'center'
                        }}
                      >
                        {obra.preview && (
                          <div style={{
                            width: '100%',
                            height: '120px',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            background: '#fff'
                          }}>
                            <img
                              src={obra.preview}
                              alt={obra.titulo || `Obra ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}
                        <p style={{
                          color: COLORS.cream,
                          fontSize: '13px',
                          fontWeight: '600',
                          margin: '0 0 4px 0',
                          fontFamily: FONTS.body
                        }}>
                          {obra.titulo || `Obra ${index + 1}`}
                        </p>
                        <p style={{
                          color: COLORS.cream,
                          opacity: 0.6,
                          fontSize: '12px',
                          margin: '0 0 4px 0',
                          fontFamily: FONTS.body
                        }}>
                          {obra.alto_cm} × {obra.ancho_cm} cm
                        </p>
                        {obra.precio_mxn && (
                          <p style={{
                            color: COLORS.cream,
                            fontSize: '13px',
                            fontWeight: '700',
                            margin: 0,
                            fontFamily: FONTS.body
                          }}>
                            ${parseFloat(obra.precio_mxn).toLocaleString('es-MX')} MXN
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Términos y Condiciones */}
      <div ref={(el) => (sectionRefs.current[5] = el)} style={{
        background: 'rgba(244, 237, 228, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '32px',
        borderRadius: '16px',
        border: `1px solid rgba(244, 237, 228, 0.2)`
      }}>
        <h3 style={{
          fontFamily: FONTS.display,
          fontWeight: FONTS.displayWeight,
          fontStyle: FONTS.displayStyle,
          fontSize: 'clamp(20px, 3vw, 28px)',
          color: COLORS.cream,
          marginBottom: '24px',
          textTransform: 'uppercase',
          letterSpacing: '0.03em'
        }}>
          Términos y Condiciones
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
            fontFamily: FONTS.body,
            fontSize: '15px',
            color: COLORS.cream
          }}>
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={handleTerminosChange}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: COLORS.red
              }}
            />
            <span style={{ flex: 1, lineHeight: '1.6' }}>
              He leído y acepto los{' '}
              <a
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: COLORS.cream,
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Términos y Condiciones
              </a>{' '}
              de ARTE FACTO
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
            fontFamily: FONTS.body,
            fontSize: '15px',
            color: COLORS.cream
          }}>
            <input
              type="checkbox"
              checked={aceptaPrivacidad}
              onChange={handlePrivacidadChange}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: COLORS.red
              }}
            />
            <span style={{ flex: 1, lineHeight: '1.6' }}>
              He leído y acepto el{' '}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: COLORS.cream,
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Aviso de Privacidad
              </a>
            </span>
          </label>
        </div>

        {errorTerminos && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.2)',
            border: `1px solid rgba(220, 38, 38, 0.5)`,
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{
              color: '#FEE2E2',
              fontSize: '14px',
              margin: 0,
              fontFamily: FONTS.body,
              fontWeight: '600'
            }}>
              {errorTerminos}
            </p>
          </div>
        )}

        {/* Botón de Enviar Inscripción */}
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={isSubmitting || !aceptaTerminos || !aceptaPrivacidad}
          style={{
            width: '100%',
            padding: '20px 40px',
            background: (aceptaTerminos && aceptaPrivacidad) ? COLORS.red : COLORS.gray,
            color: COLORS.cream,
            border: 'none',
            borderRadius: '16px',
            cursor: (aceptaTerminos && aceptaPrivacidad && !isSubmitting) ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: FONTS.body,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            opacity: (aceptaTerminos && aceptaPrivacidad && !isSubmitting) ? 1 : 0.6
          }}
          onMouseEnter={(e) => {
            if (aceptaTerminos && aceptaPrivacidad && !isSubmitting) {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.boxShadow = '0 8px 24px rgba(184, 48, 48, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (aceptaTerminos && aceptaPrivacidad && !isSubmitting) {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = 'none'
            }
          }}
        >
          {isSubmitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid rgba(244, 237, 228, 0.3)',
                borderTopColor: COLORS.cream,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></span>
              ENVIANDO INSCRIPCIÓN...
            </span>
          ) : (
            'ENVIAR INSCRIPCIÓN'
          )}
        </button>

        {errors?.submit && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.2)',
            border: `1px solid rgba(220, 38, 38, 0.5)`,
            padding: '12px 16px',
            borderRadius: '12px',
            marginTop: '16px'
          }}>
            <p style={{
              color: '#FEE2E2',
              fontSize: '14px',
              margin: 0,
              fontFamily: FONTS.body
            }}>
              {errors.submit}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
