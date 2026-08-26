'use client'

import { useState, useEffect } from 'react'
import { COLORS, FONTS } from '@/components/artefacto/theme'
import Button from '@/components/ui/Button'

/**
 * Componente de bandeja de entrada de mensajes de contacto
 *
 * Permite al admin:
 * - Ver todos los mensajes recibidos desde el formulario de contacto
 * - Filtrar por estado (leído/no leído, respondido/pendiente)
 * - Marcar mensajes como leídos
 * - Responder mensajes directamente (con Brevo)
 * - Eliminar mensajes
 */

// URL base del API (usar variable de entorno o fallback a localhost)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const cardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.2s',
  border: `2px solid ${COLORS.creamDark}`
}

export default function MensajesContacto() {
  const [mensajes, setMensajes] = useState([])
  const [filtro, setFiltro] = useState('todos') // todos, no_leidos, pendientes, respondidos
  const [loading, setLoading] = useState(true)
  const [selectedMensaje, setSelectedMensaje] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [respuestaText, setRespuestaText] = useState('')
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false)

  // Cargar mensajes del backend
  useEffect(() => {
    fetchMensajes()
  }, [])

  const fetchMensajes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/contacto`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al cargar mensajes')

      const data = await response.json()
      setMensajes(data.data || [])
    } catch (error) {
      console.error('Error al cargar mensajes:', error)
      alert('Error al cargar los mensajes')
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeido = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/contacto/${id}/marcar-leido`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al marcar como leído')

      // Actualizar en el estado local
      setMensajes(mensajes.map(m =>
        m.id === id ? { ...m, leido: true } : m
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const responderMensaje = async () => {
    if (!respuestaText.trim()) {
      alert('Por favor escribe una respuesta')
      return
    }

    try {
      setEnviandoRespuesta(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/contacto/${selectedMensaje.id}/responder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          respuesta: respuestaText
        })
      })

      if (!response.ok) throw new Error('Error al enviar respuesta')

      const result = await response.json()

      // Mostrar mensaje según si se envió el email o no
      if (result.email_enviado) {
        alert('Respuesta enviada por email correctamente')
      } else {
        alert('Respuesta guardada (email no configurado)')
      }

      setShowResponseModal(false)
      setRespuestaText('')
      fetchMensajes() // Recargar mensajes
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar la respuesta')
    } finally {
      setEnviandoRespuesta(false)
    }
  }

  const eliminarMensaje = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/contacto/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al eliminar mensaje')

      setMensajes(mensajes.filter(m => m.id !== id))
      setShowDetailModal(false)
      setSelectedMensaje(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el mensaje')
    }
  }

  // Filtrar mensajes
  const mensajesFiltrados = mensajes.filter(mensaje => {
    // Filtro por estado
    if (filtro === 'no_leidos' && mensaje.leido) return false
    if (filtro === 'pendientes' && mensaje.respondido) return false
    if (filtro === 'respondidos' && !mensaje.respondido) return false

    // Búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        mensaje.nombre.toLowerCase().includes(search) ||
        mensaje.email.toLowerCase().includes(search) ||
        mensaje.asunto.toLowerCase().includes(search)
      )
    }

    return true
  })

  // Estadísticas
  const stats = {
    total: mensajes.length,
    no_leidos: mensajes.filter(m => !m.leido).length,
    pendientes: mensajes.filter(m => !m.respondido).length,
    respondidos: mensajes.filter(m => m.respondido).length
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>Cargando mensajes...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          ...cardStyle,
          backgroundColor: filtro === 'todos' ? COLORS.red + '10' : 'white',
          cursor: 'pointer'
        }} onClick={() => setFiltro('todos')}>
          <p style={{ fontSize: '0.875rem', color: COLORS.gray, marginBottom: '0.5rem', fontFamily: FONTS.body }}>
            Total Mensajes
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.black, fontFamily: FONTS.display }}>
            {stats.total}
          </p>
        </div>

        <div style={{
          ...cardStyle,
          backgroundColor: filtro === 'no_leidos' ? COLORS.red + '10' : 'white',
          cursor: 'pointer'
        }} onClick={() => setFiltro('no_leidos')}>
          <p style={{ fontSize: '0.875rem', color: COLORS.gray, marginBottom: '0.5rem', fontFamily: FONTS.body }}>
            No Leídos
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', fontFamily: FONTS.display }}>
            {stats.no_leidos}
          </p>
        </div>

        <div style={{
          ...cardStyle,
          backgroundColor: filtro === 'pendientes' ? COLORS.red + '10' : 'white',
          cursor: 'pointer'
        }} onClick={() => setFiltro('pendientes')}>
          <p style={{ fontSize: '0.875rem', color: COLORS.gray, marginBottom: '0.5rem', fontFamily: FONTS.body }}>
            Pendientes
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.red, fontFamily: FONTS.display }}>
            {stats.pendientes}
          </p>
        </div>

        <div style={{
          ...cardStyle,
          backgroundColor: filtro === 'respondidos' ? COLORS.red + '10' : 'white',
          cursor: 'pointer'
        }} onClick={() => setFiltro('respondidos')}>
          <p style={{ fontSize: '0.875rem', color: COLORS.gray, marginBottom: '0.5rem', fontFamily: FONTS.body }}>
            Respondidos
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', fontFamily: FONTS.display }}>
            {stats.respondidos}
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div style={cardStyle}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o asunto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: `2px solid ${COLORS.creamDark}`,
            fontFamily: FONTS.body,
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
      </div>

      {/* Tabla de mensajes */}
      <div style={cardStyle}>
        <h3 style={{
          fontFamily: FONTS.subtitle,
          fontWeight: FONTS.subtitleWeight,
          fontSize: '1.125rem',
          color: COLORS.black,
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Mensajes ({mensajesFiltrados.length})
        </h3>

        {mensajesFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: COLORS.gray, padding: '2rem', fontFamily: FONTS.body }}>
            No hay mensajes {filtro !== 'todos' && `filtrados por "${filtro}"`}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.creamDark}` }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontFamily: FONTS.body, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', color: COLORS.gray }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontFamily: FONTS.body, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', color: COLORS.gray }}>De</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontFamily: FONTS.body, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', color: COLORS.gray }}>Asunto</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontFamily: FONTS.body, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', color: COLORS.gray }}>Fecha</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontFamily: FONTS.body, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', color: COLORS.gray }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mensajesFiltrados.map(mensaje => (
                  <tr
                    key={mensaje.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.creamDark}`,
                      backgroundColor: mensaje.leido ? 'transparent' : COLORS.cream,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.creamDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mensaje.leido ? 'transparent' : COLORS.cream}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!mensaje.leido && (
                          <span style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.625rem',
                            fontFamily: FONTS.body,
                            fontWeight: '600'
                          }}>NUEVO</span>
                        )}
                        {mensaje.respondido ? (
                          <span style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.625rem',
                            fontFamily: FONTS.body,
                            fontWeight: '600'
                          }}>✓ RESPONDIDO</span>
                        ) : (
                          <span style={{
                            backgroundColor: COLORS.red,
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.625rem',
                            fontFamily: FONTS.body,
                            fontWeight: '600'
                          }}>PENDIENTE</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontFamily: FONTS.body, fontWeight: '600', color: COLORS.black, marginBottom: '0.25rem' }}>
                        {mensaje.nombre}
                      </p>
                      <p style={{ fontFamily: FONTS.body, fontSize: '0.75rem', color: COLORS.gray }}>
                        {mensaje.email}
                      </p>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: FONTS.body, color: COLORS.black }}>
                      {mensaje.asunto}
                    </td>
                    <td style={{ padding: '1rem', fontFamily: FONTS.body, fontSize: '0.875rem', color: COLORS.gray }}>
                      {new Date(mensaje.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setSelectedMensaje(mensaje)
                            setShowDetailModal(true)
                            if (!mensaje.leido) {
                              marcarComoLeido(mensaje.id)
                            }
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `2px solid ${COLORS.black}`,
                            backgroundColor: 'white',
                            color: COLORS.black,
                            fontFamily: FONTS.body,
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Ver
                        </button>
                        {!mensaje.respondido && (
                          <button
                            onClick={() => {
                              setSelectedMensaje(mensaje)
                              setShowResponseModal(true)
                            }}
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: COLORS.red,
                              color: 'white',
                              fontFamily: FONTS.body,
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Responder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedMensaje && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setShowDetailModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{
                fontFamily: FONTS.subtitle,
                fontWeight: FONTS.subtitleWeight,
                fontSize: '1.5rem',
                color: COLORS.black,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Detalle del Mensaje</h3>
              <button onClick={() => setShowDetailModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: COLORS.gray
              }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontFamily: FONTS.body, color: COLORS.gray, marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>De</p>
                <p style={{ fontFamily: FONTS.body, color: COLORS.black }}>{selectedMensaje.nombre}</p>
                <p style={{ fontFamily: FONTS.body, fontSize: '0.875rem', color: COLORS.gray }}>{selectedMensaje.email}</p>
                {selectedMensaje.telefono && (
                  <p style={{ fontFamily: FONTS.body, fontSize: '0.875rem', color: COLORS.gray }}>{selectedMensaje.telefono}</p>
                )}
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontFamily: FONTS.body, color: COLORS.gray, marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>Asunto</p>
                <p style={{ fontFamily: FONTS.body, color: COLORS.black }}>{selectedMensaje.asunto}</p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontFamily: FONTS.body, color: COLORS.gray, marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>Mensaje</p>
                <p style={{ fontFamily: FONTS.body, color: COLORS.black, lineHeight: '1.6' }}>{selectedMensaje.mensaje}</p>
              </div>

              {selectedMensaje.respondido && selectedMensaje.respuesta && (
                <div style={{
                  backgroundColor: COLORS.cream,
                  padding: '1rem',
                  borderRadius: '12px',
                  borderLeft: `4px solid #10b981`
                }}>
                  <p style={{ fontSize: '0.75rem', fontFamily: FONTS.body, color: COLORS.gray, marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>Tu Respuesta</p>
                  <p style={{ fontFamily: FONTS.body, color: COLORS.black, lineHeight: '1.6' }}>{selectedMensaje.respuesta}</p>
                  <p style={{ fontSize: '0.75rem', fontFamily: FONTS.body, color: COLORS.gray, marginTop: '0.5rem' }}>
                    {new Date(selectedMensaje.fecha_respuesta).toLocaleString('es-MX')}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {!selectedMensaje.respondido && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailModal(false)
                      setShowResponseModal(true)
                    }}
                  >
                    Responder
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => eliminarMensaje(selectedMensaje.id)}
                >
                  Eliminar
                </Button>
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de respuesta */}
      {showResponseModal && selectedMensaje && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setShowResponseModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{
                fontFamily: FONTS.subtitle,
                fontWeight: FONTS.subtitleWeight,
                fontSize: '1.5rem',
                color: COLORS.black,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Responder a {selectedMensaje.nombre}</h3>
              <button onClick={() => setShowResponseModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: COLORS.gray
              }}>×</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', fontFamily: FONTS.body, color: COLORS.gray, marginBottom: '0.5rem' }}>
                Mensaje original:
              </p>
              <div style={{
                backgroundColor: COLORS.cream,
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <p style={{ fontFamily: FONTS.body, color: COLORS.black, fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {selectedMensaje.mensaje}
                </p>
              </div>

              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontFamily: FONTS.body,
                color: COLORS.black,
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Tu respuesta:
              </label>
              <textarea
                value={respuestaText}
                onChange={(e) => setRespuestaText(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.creamDark}`,
                  fontFamily: FONTS.body,
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="primary"
                onClick={responderMensaje}
                disabled={enviandoRespuesta || !respuestaText.trim()}
              >
                {enviandoRespuesta ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
              <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
