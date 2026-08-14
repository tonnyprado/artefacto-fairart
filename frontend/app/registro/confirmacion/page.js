'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'

// Forzar renderizado dinámico (no static)
export const dynamic = 'force-dynamic'

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const folio = searchParams.get('folio')
  const nombre = searchParams.get('nombre')
  const email = searchParams.get('email')

  const [mounted, setMounted] = useState(false)
  const [canvasData, setCanvasData] = useState(null)
  const [showCanvasModal, setShowCanvasModal] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Recuperar datos del canvas si están disponibles
    try {
      const savedData = localStorage.getItem('artefacto_confirmacion_data')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setCanvasData(parsed)
        // Limpiar después de leer (opcional, para que no persista)
        // localStorage.removeItem('artefacto_confirmacion_data')
      }
    } catch (error) {
      console.error('Error leyendo datos de confirmación:', error)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #F4EDE4, white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        {/* Animación de éxito */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            background: '#DCFCE7',
            borderRadius: '50%',
            marginBottom: '24px',
            animation: 'bounce 1s infinite'
          }}>
            <svg style={{ width: '48px', height: '48px', color: '#16A34A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'ivypresto-display, Georgia, serif',
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: 'clamp(32px, 5vw, 48px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#141210',
            marginBottom: '16px'
          }}>
            ¡Registro Exitoso!
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6B6B6B',
            fontFamily: 'acumin-pro, sans-serif'
          }}>
            Gracias por tu interés en ARTEFACTO 2027
          </p>
        </div>

        {/* Card de información */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '32px',
          marginBottom: '24px'
        }}>
          {/* Folio destacado */}
          <div style={{
            background: 'linear-gradient(135deg, #3B82F6, #9333EA)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              fontFamily: 'acumin-pro, sans-serif'
            }}>
              Tu folio de registro es:
            </p>
            <p style={{
              color: 'white',
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              margin: 0
            }}>
              {folio || 'ART-2027-XXX'}
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              marginTop: '8px',
              fontFamily: 'acumin-pro, sans-serif'
            }}>
              Guarda este folio para dar seguimiento a tu solicitud
            </p>
          </div>

          {/* Mensaje personalizado */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{
              fontSize: '18px',
              color: '#141210',
              fontFamily: 'acumin-pro, sans-serif',
              marginBottom: '8px'
            }}>
              Hola <strong>{nombre || 'artista'}</strong>,
            </p>
            <p style={{
              fontSize: '16px',
              color: '#6B6B6B',
              fontFamily: 'acumin-pro, sans-serif',
              lineHeight: '1.6'
            }}>
              Tu solicitud ha sido recibida y está siendo revisada por nuestro equipo de curadores.
            </p>
          </div>

          {/* Pasos siguientes */}
          <div style={{
            background: '#F4EDE4',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{
              fontWeight: 600,
              color: '#141210',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'acumin-pro, sans-serif',
              fontSize: '16px'
            }}>
              <span>📋</span> ¿Qué sigue?
            </h3>
            <ol style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '14px',
              color: '#141210',
              fontFamily: 'acumin-pro, sans-serif',
              margin: 0,
              padding: 0,
              listStyle: 'none'
            }}>
              <li style={{ display: 'flex', gap: '12px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  background: '#3B82F6',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  1
                </span>
                <span>
                  Revisaremos tu portafolio y seleccionaremos a los artistas participantes
                </span>
              </li>
              <li style={{ display: 'flex', gap: '12px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  background: '#3B82F6',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  2
                </span>
                <span>
                  Recibirás un correo electrónico con los resultados de la selección
                </span>
              </li>
              <li style={{ display: 'flex', gap: '12px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  background: '#3B82F6',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  3
                </span>
                <span>
                  Si eres seleccionado, te enviaremos los detalles de pago y participación
                </span>
              </li>
            </ol>
          </div>

          {/* Recordatorio */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '12px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#78350F',
              display: 'flex',
              alignItems: 'start',
              gap: '8px',
              margin: 0,
              fontFamily: 'acumin-pro, sans-serif',
              lineHeight: '1.6'
            }}>
              <span style={{ fontSize: '20px' }}>⏰</span>
              <span>
                <strong>Importante:</strong> Revisa tu correo electrónico (incluyendo spam) en los próximos días. Te contactaremos al email: <strong>{email || 'tu email'}</strong>
              </span>
            </p>
          </div>

          {/* Tu Lienzo - Preview del canvas */}
          {canvasData?.layout_canvas_url && (
            <div style={{
              marginTop: '24px',
              background: '#F3E8FF',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #C084FC'
            }}>
              <h3 style={{
                fontWeight: 600,
                color: '#7C3AED',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'acumin-pro, sans-serif',
                fontSize: '16px'
              }}>
                <span>🎨</span> Tu Lienzo
                {canvasData.obras_count > 0 && (
                  <span style={{
                    fontSize: '12px',
                    background: '#7C3AED',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {canvasData.obras_count} obra{canvasData.obras_count > 1 ? 's' : ''}
                  </span>
                )}
              </h3>

              {canvasData.paquete_nombre && (
                <p style={{
                  fontSize: '14px',
                  color: '#6B21A8',
                  marginBottom: '12px',
                  fontFamily: 'acumin-pro, sans-serif'
                }}>
                  Paquete: <strong>{canvasData.paquete_nombre}</strong>
                </p>
              )}

              {/* Preview de imagen clickeable */}
              <div
                onClick={() => setShowCanvasModal(true)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #E9D5FF',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A855F7'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E9D5FF'}
              >
                <img
                  src={canvasData.layout_canvas_url}
                  alt="Tu lienzo"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    background: 'white'
                  }}
                />
              </div>

              <p style={{
                fontSize: '12px',
                color: '#7C3AED',
                marginTop: '8px',
                textAlign: 'center',
                fontFamily: 'acumin-pro, sans-serif'
              }}>
                Click en la imagen para ampliar
              </p>

              {/* Botón de descarga */}
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <a
                  href={canvasData.layout_canvas_url}
                  download="mi-lienzo-artefacto.jpg"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: '#7C3AED',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    fontFamily: 'acumin-pro, sans-serif',
                    transition: 'background 0.2s'
                  }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar mi Lienzo
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <Link
            href="/"
            style={{
              padding: '16px 32px',
              background: '#141210',
              color: 'white',
              borderRadius: '16px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '16px',
              fontFamily: 'acumin-pro, sans-serif',
              transition: 'background 0.2s'
            }}
          >
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              padding: '16px 32px',
              background: '#F4EDE4',
              color: '#141210',
              border: 'none',
              borderRadius: '16px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '16px',
              fontFamily: 'acumin-pro, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Imprimir Folio
          </button>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: '#6B6B6B',
          fontSize: '14px',
          fontFamily: 'acumin-pro, sans-serif'
        }}>
          ¿Tienes dudas? Contáctanos en <a href="mailto:contacto@artefact.mx" style={{ color: '#3B82F6', textDecoration: 'none' }}>contacto@artefact.mx</a>
        </p>
      </div>

      {/* Modal para ver el lienzo en grande */}
      {showCanvasModal && canvasData?.layout_canvas_url && (
        <div
          onClick={() => setShowCanvasModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '95vw',
              maxHeight: '95vh',
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* Header del modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: '#141210',
                fontFamily: 'acumin-pro, sans-serif'
              }}>
                Tu Lienzo - ARTEFACTO 2027
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={canvasData.layout_canvas_url}
                  download="mi-lienzo-artefacto.jpg"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    background: '#F3F4F6',
                    borderRadius: '8px',
                    color: '#374151',
                    textDecoration: 'none'
                  }}
                  title="Descargar"
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowCanvasModal(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Imagen */}
            <div style={{
              padding: '16px',
              background: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={canvasData.layout_canvas_url}
                alt="Tu lienzo"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(95vh - 100px)',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-10%);
          }
          50% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default function Confirmacion() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #F4EDE4, white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#141210',
          fontFamily: 'acumin-pro, sans-serif'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #F4EDE4',
            borderTopColor: '#141210',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Cargando...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
