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

  useEffect(() => {
    setMounted(true)
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
            Gracias por tu interés en ARTEFACT 2027
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
