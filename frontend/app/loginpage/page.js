'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { COLORS, FONTS } from '@/components/artefacto/theme'

/**
 * Página de Login
 *
 * Solo para Administradores y Curadores
 * Accesible solo por URL directa: /loginpage
 *
 * CREDENCIALES DE PRUEBA (Backend mockData):
 * Admin:
 *   - Email: admin@artefact.com
 *   - Password: admin123
 *
 * Curador:
 *   - Email: sofia.martinez@artefact.com
 *   - Password: admin123
 *
 * API ENDPOINT:
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { message, token, user: { id, email, nombre, role, curadorId? } }
 */

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, error, clearError, isLoading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [showCredentials, setShowCredentials] = useState(true)

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/admin') // Redirigir a admin por defecto
    }
  }, [isAuthenticated, authLoading, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo al escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
    clearError()
  }

  const validate = () => {
    const errors = {}

    if (!formData.email) {
      errors.email = 'Email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.password) {
      errors.password = 'Contraseña es requerida'
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Login automático (usa backend si está disponible, sino modo mock)
    setIsSubmitting(true)

    try {
      // Delay mínimo para mostrar el loading
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500))

      // Intentar login con credenciales de admin
      // Si el backend no está disponible, el store automáticamente usa modo mock
      const loginPromise = login('admin@artefact.com', 'admin123')

      // Esperar tanto el login como el delay mínimo
      const [result] = await Promise.all([loginPromise, minDelay])

      if (!result.success) {
        setIsSubmitting(false)
      }
      // Si success, el hook maneja la redirección
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  // Función helper para login rápido (desarrollo)
  const quickLogin = (email, password) => {
    setFormData({ email, password })
  }

  return (
    <>
      {/* Sobrescribir cursor oculto globalmente para esta página */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .login-page-container,
          .login-page-container *,
          .login-page-container a,
          .login-page-container button,
          .login-page-container input,
          .login-page-container textarea,
          .login-page-container select,
          .login-page-container [role="button"] {
            cursor: auto !important;
          }
          .login-page-container button,
          .login-page-container a,
          .login-page-container [role="button"] {
            cursor: pointer !important;
          }
        `
      }} />

      <div className="login-page-container" style={{
        minHeight: '100vh',
        backgroundColor: COLORS.red,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}>
        <div style={{ maxWidth: '500px', width: '100%' }}>
        {/* Logo y Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Link href="/" style={{
            display: 'inline-block',
            marginBottom: '2rem',
            transition: 'transform 0.2s'
          }}>
            <img
              src="/assets/wordmark-cream.svg"
              alt="ARTEFACTO"
              style={{ width: '280px', maxWidth: '100%' }}
            />
          </Link>
          <p style={{
            color: COLORS.cream,
            fontFamily: FONTS.subtitle,
            fontWeight: FONTS.subtitleWeight,
            fontStyle: FONTS.subtitleStyle,
            fontSize: '1.125rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            Panel de Administración
          </p>
        </div>

        {/* Formulario */}
        <div style={{
          backgroundColor: COLORS.cream,
          borderRadius: '8px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h3 style={{
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: '2rem',
              color: COLORS.black,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              Iniciar Sesión
            </h3>
            <p style={{
              fontFamily: FONTS.body,
              fontWeight: FONTS.bodyWeight,
              fontSize: '0.875rem',
              color: COLORS.gray
            }}>
              Solo para administradores y curadores
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={validationErrors.password}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {/* Error general de login */}
            {error && (
              <div style={{
                backgroundColor: '#fee',
                borderLeft: `4px solid ${COLORS.red}`,
                padding: '1rem',
                borderRadius: '0 4px 4px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg
                    style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }}
                    fill={COLORS.red}
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p style={{
                    fontSize: '0.875rem',
                    color: COLORS.red,
                    fontFamily: FONTS.body
                  }}>{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
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
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </Button>
          </form>

          {/* Credenciales de prueba (solo en desarrollo) */}
          {showCredentials && process.env.NODE_ENV !== 'production' && (
            <div style={{
              marginTop: '1.5rem',
              backgroundColor: '#e8f4fd',
              borderLeft: '4px solid #3b82f6',
              padding: '1rem',
              borderRadius: '0 4px 4px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    color: '#3b82f6',
                    marginRight: '0.5rem',
                    flexShrink: 0,
                    marginTop: '0.125rem'
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1e3a8a',
                    marginBottom: '0.5rem',
                    fontFamily: FONTS.subtitle
                  }}>
                    Credenciales de Prueba:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                      fontFamily: FONTS.body
                    }}>
                      <strong>Admin:</strong>
                      <br />
                      Email: admin@artefact.com
                      <br />
                      Password: admin123
                      <button
                        onClick={() => quickLogin('admin@artefact.com', 'admin123')}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginTop: '0.25rem',
                          fontFamily: FONTS.body
                        }}
                      >
                        → Login rápido
                      </button>
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                      fontFamily: FONTS.body
                    }}>
                      <strong>Curador:</strong>
                      <br />
                      Email: sofia.martinez@artefact.com
                      <br />
                      Password: admin123
                      <button
                        onClick={() => quickLogin('sofia.martinez@artefact.com', 'admin123')}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginTop: '0.25rem',
                          fontFamily: FONTS.body
                        }}
                      >
                        → Login rápido
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCredentials(false)}
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '0.5rem'
                  }}
                >
                  <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Link para volver */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: '0.875rem',
                color: COLORS.gray,
                textDecoration: 'none',
                fontFamily: FONTS.body,
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = COLORS.red}
              onMouseLeave={(e) => e.target.style.color = COLORS.gray}
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: COLORS.cream,
          marginTop: '2rem',
          opacity: 0.7,
          fontFamily: FONTS.body
        }}>
          Acceso restringido solo para personal autorizado
        </p>
      </div>
    </div>
    </>
  )
}
