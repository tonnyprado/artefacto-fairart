/**
 * Errors Modal
 * Modal que muestra la lista detallada de errores detectados
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Badge from '@/components/ui/Badge'

export default function ErrorsModal({ isOpen, onClose, dateRange }) {
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedError, setSelectedError] = useState(null)

  // Fetch errors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchErrors()
    }
  }, [isOpen, dateRange])

  const fetchErrors = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

    if (!token) {
      console.error('No token found')
      setIsLoading(false)
      return
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const queries = new URLSearchParams({
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      })

      const response = await fetch(`${API_URL}/analytics/errors?${queries}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setErrors(data.data.errors || [])
      }
    } catch (error) {
      console.error('Error fetching errors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Errores Detectados</h2>
                  <p className="text-red-100">
                    {errors.length} {errors.length === 1 ? 'error encontrado' : 'errores encontrados'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : errors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No hay errores</h3>
                  <p className="text-gray-600">No se han detectado errores en el periodo seleccionado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {errors.map((error, index) => (
                    <motion.div
                      key={error.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-2 border-red-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-red-300 bg-gradient-to-r from-red-50 to-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">
                              {error.event_name || 'Error sin nombre'}
                            </h3>
                            <Badge variant="danger" size="sm">
                              Error
                            </Badge>
                          </div>

                          <div className="space-y-2 mt-3">
                            {/* Page URL */}
                            {error.page_url && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 mb-0.5">Página</p>
                                  <p className="text-sm text-gray-900 truncate">{error.page_title || 'Sin título'}</p>
                                  <p className="text-xs text-gray-500 truncate">{error.page_url}</p>
                                </div>
                              </div>
                            )}

                            {/* Element Info */}
                            {(error.element_id || error.element_text) && (
                              <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 mb-0.5">Elemento</p>
                                  {error.element_id && (
                                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700 inline-block">
                                      #{error.element_id}
                                    </code>
                                  )}
                                  {error.element_text && (
                                    <p className="text-sm text-gray-900 mt-1">&quot;{error.element_text}&quot;</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Timestamp */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {new Date(error.created_at).toLocaleString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => setSelectedError(selectedError === error.id ? null : error.id)}
                          className="ml-4 p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                        >
                          <svg
                            className={`w-5 h-5 text-red-600 transition-transform ${
                              selectedError === error.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {selectedError === error.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-red-200"
                        >
                          {/* Session & User Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Session ID</p>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">
                                {error.session_id}
                              </code>
                            </div>
                            {error.user_id && (
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">User ID</p>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                  {error.user_id}
                                </code>
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          {error.metadata && Object.keys(error.metadata).length > 0 && (
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <p className="text-xs text-gray-400 mb-2">Metadata</p>
                              <pre className="text-xs text-green-400 font-mono">
                                {JSON.stringify(error.metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Value */}
                          {error.value !== null && error.value !== undefined && (
                            <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Valor</p>
                              <p className="text-sm font-mono text-gray-900">{error.value}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isLoading && errors.length > 0 && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total de errores: <strong>{errors.length}</strong>
                  </p>
                  <button
                    onClick={fetchErrors}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Actualizar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
