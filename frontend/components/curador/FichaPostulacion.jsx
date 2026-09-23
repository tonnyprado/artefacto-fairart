'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import ControlVotoRondas from './ControlVotoRondas'

export default function FichaPostulacion({ postulacion, ronda, onClose, onVotoGuardado }) {
  const [obraSeleccionada, setObraSeleccionada] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  if (!postulacion) return null

  return (
    <>
      {/* Modal custom sin usar componente Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-7xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-[90vh]">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {postulacion.nombre} {postulacion.apellido}
                    </h2>
                    <p className="text-gray-600">{postulacion.disciplina}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Badge variant={postulacion.tipo === '2d' ? 'primary' : 'secondary'}>
                      {postulacion.tipo.toUpperCase()}
                    </Badge>
                    {postulacion.es_carryover && (
                      <Badge variant="warning">Carryover</Badge>
                    )}
                    {postulacion.ya_votado && (
                      <Badge variant="success">Ya votado</Badge>
                    )}
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  {/* Columna izquierda: Canvas/Lienzo y Visor de obra */}
                  <div className="space-y-6">
                    {/* Lienzo del Artista */}
                    {postulacion.layout_canvas_url && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Lienzo de Diseño</h3>
                        <div className="space-y-3">
                          {/* Botones */}
                          <div className="flex flex-wrap items-center gap-3">
                            {postulacion.layout_canvas_data?.pdf_url && (
                              <a
                                href={postulacion.layout_canvas_data.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Ver PDF Completo
                              </a>
                            )}
                            <a
                              href={postulacion.layout_canvas_data?.pdf_url || postulacion.layout_canvas_url}
                              download
                              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:underline"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar
                            </a>
                          </div>

                          {/* Preview thumbnail del lienzo */}
                          <div className="cursor-pointer" onClick={() => window.open(postulacion.layout_canvas_url, '_blank')}>
                            <img
                              src={postulacion.layout_canvas_url}
                              alt="Layout del lienzo"
                              className="w-full rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                            <p className="text-xs text-gray-500 text-center mt-1">Click para ampliar</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Obras del artista */}
                    <GaleriaObras
                      postulacion={postulacion}
                      onObraClick={(obra, index) => {
                        setObraSeleccionada(index)
                        setFullscreen(true)
                      }}
                    />
                  </div>

                  {/* Columna derecha: Info y votación */}
                  <div className="space-y-6">
                    {/* Información del artista */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Información del Artista
                      </h3>

                      {/* Email */}
                      {postulacion.artista_email && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900">{postulacion.artista_email}</p>
                        </div>
                      )}

                      {/* Biografía */}
                      {postulacion.bio && (
                        <div className="prose prose-sm max-w-none text-gray-600 mb-4">
                          <p>{postulacion.bio}</p>
                        </div>
                      )}

                      {/* Redes sociales */}
                      {postulacion.redes_sociales && Object.keys(postulacion.redes_sociales).length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-4">
                          {postulacion.redes_sociales.instagram && (
                            <a
                              href={postulacion.redes_sociales.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-red-600 hover:text-red-700 underline"
                            >
                              Instagram
                            </a>
                          )}
                          {postulacion.redes_sociales.website && (
                            <a
                              href={postulacion.redes_sociales.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-red-600 hover:text-red-700 underline"
                            >
                              Sitio web
                            </a>
                          )}
                        </div>
                      )}

                      {/* Documentos */}
                      {(postulacion.cv_url || postulacion.portfolio_url || postulacion.identificacion_url) && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Documentos</h4>
                          <div className="flex flex-col gap-2">
                            {postulacion.cv_url && (
                              <a
                                href={postulacion.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Ver CV
                              </a>
                            )}
                            {postulacion.portfolio_url && (
                              <a
                                href={postulacion.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Ver Portfolio
                              </a>
                            )}
                            {postulacion.identificacion_url && (
                              <a
                                href={postulacion.identificacion_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                Ver Identificación
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Control de votación */}
                    <div className="border-t border-gray-200 pt-6">
                      <ControlVotoRondas
                        postulacion={postulacion}
                        ronda={ronda}
                        onVotoGuardado={() => {
                          onVotoGuardado()
                          onClose()
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con nota */}
              <div className="border-t border-gray-200 px-6 py-4 bg-amber-50">
                <p className="text-sm text-amber-800 text-center">
                  Se evalúa la obra, no la calidad de la fotografía
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal fullscreen para obra */}
      {fullscreen && (
        <FullscreenViewer
          postulacion={postulacion}
          obraSeleccionada={obraSeleccionada}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  )
}

function GaleriaObras({ postulacion, onObraClick }) {
  const obras = postulacion.obras || []

  if (obras.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No hay obras registradas</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Obras para Exhibición ({obras.length})
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {obras.map((obra, index) => {
          const imagenUrl = obra.imagen || obra.imagen_url
          return (
            <div
              key={obra.id || index}
              onClick={() => onObraClick(obra, index)}
              className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
            >
              {imagenUrl ? (
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                  <img
                    src={imagenUrl}
                    alt={obra.titulo || `Obra ${index + 1}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  {/* Overlay icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-lg mb-2 bg-gray-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {obra.titulo || `Obra ${index + 1}`}
                </h4>
                {obra.tecnica && (
                  <p className="text-xs text-gray-600 mb-1 truncate">{obra.tecnica}</p>
                )}
                {obra.anio && (
                  <p className="text-xs text-gray-500 mb-1">{obra.anio}</p>
                )}
                {(obra.medida_alto && obra.medida_ancho) ? (
                  <p className="text-xs text-gray-500">
                    {obra.medida_alto} × {obra.medida_ancho}
                    {obra.medida_prof && ` × ${obra.medida_prof}`} cm
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">Sin medidas</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FullscreenViewer({ postulacion, obraSeleccionada, onClose }) {
  const obras = postulacion.obras || []
  const obraActual = obras[obraSeleccionada]
  const imagenUrl = obraActual?.imagen || obraActual?.imagen_url

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {imagenUrl && (
        <img
          src={imagenUrl}
          alt={obraActual.titulo || 'Obra'}
          className="max-w-full max-h-full object-contain"
        />
      )}

      {/* Información de la obra */}
      {obraActual && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg text-center max-w-2xl">
          <h3 className="text-lg font-bold mb-1">{obraActual.titulo || 'Sin título'}</h3>
          {obraActual.tecnica && (
            <p className="text-sm text-gray-300 mb-1">{obraActual.tecnica}</p>
          )}
          {obraActual.anio && (
            <p className="text-sm text-gray-300 mb-1">{obraActual.anio}</p>
          )}
          <p className="text-sm">
            {obraActual.medida_alto && obraActual.medida_ancho
              ? `${obraActual.medida_alto} × ${obraActual.medida_ancho}${obraActual.medida_prof ? ` × ${obraActual.medida_prof}` : ''} cm`
              : 'Medidas no especificadas'}
          </p>
        </div>
      )}
    </div>
  )
}
