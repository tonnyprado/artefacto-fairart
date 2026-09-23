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
                    {/* Lienzo del Artista (PDF Canvas) */}
                    {postulacion.layout_canvas_url && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                          Lienzo de Diseño
                        </h3>
                        <div className="space-y-3">
                          {/* Botones de visualización */}
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Botón ver PDF (si está disponible) */}
                            {postulacion.layout_canvas_data?.pdf_url && (
                              <a
                                href={postulacion.layout_canvas_data.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Ver PDF Completo
                              </a>
                            )}

                            {/* Botón descargar */}
                            <a
                              href={postulacion.layout_canvas_data?.pdf_url || postulacion.layout_canvas_url}
                              download
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar
                            </a>
                          </div>

                          {/* Preview de la imagen del lienzo */}
                          <div className="cursor-pointer">
                            <img
                              src={postulacion.layout_canvas_url}
                              alt="Layout del lienzo"
                              className="w-full rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                              onClick={() => window.open(postulacion.layout_canvas_url, '_blank')}
                            />
                            <p className="text-xs text-gray-500 text-center mt-1">Click para ampliar</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <VisorObra
                      postulacion={postulacion}
                      obraSeleccionada={obraSeleccionada}
                      setObraSeleccionada={setObraSeleccionada}
                      fullscreen={fullscreen}
                      setFullscreen={setFullscreen}
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

function VisorObra({ postulacion, obraSeleccionada, setObraSeleccionada, fullscreen, setFullscreen }) {
  const obras = postulacion.obras || []
  const obraActual = obras[obraSeleccionada]

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
        {obraActual?.imagen ? (
          <>
            <img
              src={obraActual.imagen}
              alt={obraActual.titulo}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setFullscreen(true)}
            />
            {/* Overlay con botones */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <button
                onClick={() => setFullscreen(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-lg font-medium"
              >
                Ver en pantalla completa
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-20 h-20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Sin obra cargada</p>
            </div>
          </div>
        )}

        {/* Medidas siempre visibles */}
        {obraActual && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
            {obraActual.medida_alto && obraActual.medida_ancho ? (
              <span>
                {obraActual.medida_alto} × {obraActual.medida_ancho}
                {obraActual.medida_prof && ` × ${obraActual.medida_prof}`} cm
              </span>
            ) : (
              <span>Medidas no especificadas</span>
            )}
          </div>
        )}
      </div>

      {/* Información de la obra */}
      {obraActual && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-1">{obraActual.titulo}</h4>
          {obraActual.tecnica && (
            <p className="text-sm text-gray-600 mb-1">{obraActual.tecnica}</p>
          )}
          {obraActual.anio && (
            <p className="text-sm text-gray-500">{obraActual.anio}</p>
          )}
          {obraActual.notas && (
            <p className="text-sm text-gray-600 mt-2">{obraActual.notas}</p>
          )}
        </div>
      )}

      {/* Galería de obras (thumbnails) */}
      {obras.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {obras.map((obra, index) => (
            <button
              key={obra.id || index}
              onClick={() => setObraSeleccionada(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === obraSeleccionada
                  ? 'border-red-600 ring-2 ring-red-600 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {obra.imagen ? (
                <img
                  src={obra.imagen}
                  alt={obra.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Contador de obras */}
      {obras.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Obra {obraSeleccionada + 1} de {obras.length}
        </p>
      )}
    </div>
  )
}

function FullscreenViewer({ postulacion, obraSeleccionada, onClose }) {
  const obras = postulacion.obras || []
  const obraActual = obras[obraSeleccionada]

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

      {obraActual?.imagen && (
        <img
          src={obraActual.imagen}
          alt={obraActual.titulo}
          className="max-w-full max-h-full object-contain"
        />
      )}

      {/* Medidas */}
      {obraActual && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg">
          <p className="text-lg font-medium">
            {obraActual.medida_alto && obraActual.medida_ancho
              ? `${obraActual.medida_alto} × ${obraActual.medida_ancho}${obraActual.medida_prof ? ` × ${obraActual.medida_prof}` : ''} cm`
              : 'Medidas no especificadas'}
          </p>
        </div>
      )}
    </div>
  )
}
