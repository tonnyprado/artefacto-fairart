'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

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

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const result = await login(formData.email, formData.password)

      if (!result.success) {
        // El error ya está manejado por el hook
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">A</span>
            </div>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-2">
            ARTEFACT
          </h2>
          <p className="text-red-300 text-lg">
            Panel de Administración
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center">
              Iniciar Sesión
            </h3>
            <p className="text-gray-600 text-center mt-2 text-sm">
              Solo para administradores y curadores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
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
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Credenciales de Prueba:
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-2 rounded border border-blue-200">
                      <strong>Admin:</strong>
                      <br />
                      Email: admin@artefact.com
                      <br />
                      Password: admin123
                      <button
                        onClick={() => quickLogin('admin@artefact.com', 'admin123')}
                        className="text-blue-600 hover:underline mt-1"
                      >
                        → Login rápido
                      </button>
                    </div>
                    <div className="bg-white p-2 rounded border border-blue-200">
                      <strong>Curador:</strong>
                      <br />
                      Email: sofia.martinez@artefact.com
                      <br />
                      Password: admin123
                      <button
                        onClick={() => quickLogin('sofia.martinez@artefact.com', 'admin123')}
                        className="text-blue-600 hover:underline mt-1"
                      >
                        → Login rápido
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCredentials(false)}
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400">
          Acceso restringido solo para personal autorizado
        </p>
      </div>
    </div>
  )
}
