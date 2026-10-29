/**
 * Events Documentation Modal
 * Modal que explica qué significa cada evento de analytics
 * Para el equipo de marketing y análisis
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EVENTS_CATALOG, EVENT_CATEGORIES, getEventsByCategory } from '@/lib/eventsCatalog'
import Badge from '@/components/ui/Badge'

export default function EventsDocModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(EVENT_CATEGORIES.CONVERSION)

  const categories = Object.values(EVENT_CATEGORIES)
  const eventsInCategory = getEventsByCategory(activeCategory)

  const categoryColors = {
    [EVENT_CATEGORIES.CONVERSION]: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    [EVENT_CATEGORIES.NAVIGATION]: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    [EVENT_CATEGORIES.INTERACTION]: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    [EVENT_CATEGORIES.FORM]: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    [EVENT_CATEGORIES.ERROR]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    [EVENT_CATEGORIES.ENGAGEMENT]: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    [EVENT_CATEGORIES.PERFORMANCE]: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
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
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Catálogo de Eventos</h2>
                  <p className="text-red-100">Guía completa para el equipo de marketing</p>
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

              {/* Category Tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      activeCategory === category
                        ? 'bg-white text-red-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {eventsInCategory.map((event) => {
                  const colors = categoryColors[event.category]
                  return (
                    <motion.div
                      key={event.type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border-2 rounded-xl p-5 ${colors.border} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                            <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                              {event.type}
                            </code>
                          </div>
                          <p className="text-gray-600">{event.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Meta Pixel */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 7H7v6h6V7z" />
                              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                            </svg>
                            Meta Pixel
                          </p>
                          {event.meta_pixel ? (
                            <Badge variant="success" size="md">{event.meta_pixel}</Badge>
                          ) : (
                            <span className="text-sm text-gray-400">No se envía a Meta Pixel</span>
                          )}
                        </div>

                        {/* Valor */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Valor para Marketing
                          </p>
                          <p className="text-sm font-medium text-gray-900">{event.value}</p>
                        </div>
                      </div>

                      {/* Marketing Use */}
                      <div className={`mt-4 p-4 rounded-lg ${colors.bg}`}>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                          </svg>
                          Uso en Marketing
                        </p>
                        <p className={`text-sm ${colors.text}`}>{event.marketing_use}</p>
                      </div>

                      {/* Example Metadata */}
                      {event.example_metadata && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Ver ejemplo de metadata
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(event.example_metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Info Footer */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Información Importante
                </h4>
                <ul className="space-y-2 text-sm text-blue-900">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Los eventos de <strong>Conversión</strong> son los más importantes para optimizar campañas de Meta Ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Los eventos de <strong>Formularios</strong> te ayudan a identificar puntos de abandono en el funnel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Usa los eventos con Meta Pixel para crear <strong>Custom Audiences</strong> y <strong>Lookalike Audiences</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Exporta reportes en PDF o Excel para compartir con el equipo y analizar tendencias</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
