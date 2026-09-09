'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { COLORS, FONTS } from '@/components/artefacto/theme'

/**
 * PreRegistrosTable - Tabla de gestión de pre-registros
 *
 * Features:
 * - Listado de pre-registros (usuarios que completaron solo Step 1)
 * - Ver estadísticas de conversión
 * - Enviar recordatorio individual
 * - Enviar recordatorio masivo
 *
 * API:
 * - GET /api/preregistro/admin - Listar pre-registros
 * - GET /api/preregistro/admin/stats - Estadísticas
 * - POST /api/preregistro/admin/:id/recordatorio - Enviar recordatorio
 * - POST /api/preregistro/admin/recordatorio-masivo - Enviar a todos
 */

export default function PreRegistrosTable() {
  const [preRegistros, setPreRegistros] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showMasivoModal, setShowMasivoModal] = useState(false)
  const [sendingRecordatorio, setSendingRecordatorio] = useState(null)
  const [sendingMasivo, setSendingMasivo] = useState(false)
  const [message, setMessage] = useState(null)

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  // Obtener token de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Cargar pre-registros
  const fetchPreRegistros = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${backendUrl}/preregistro/admin?search=${encodeURIComponent(search)}`,
        { headers: getAuthHeaders() }
      )
      const result = await response.json()

      if (result.success) {
        setPreRegistros(result.data || [])
      }
    } catch (error) {
      console.error('Error cargando pre-registros:', error)
    } finally {
      setIsLoading(false)
    }
  }, [backendUrl, search])

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${backendUrl}/preregistro/admin/stats`,
        { headers: getAuthHeaders() }
      )
      const result = await response.json()

      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }, [backendUrl])

  useEffect(() => {
    fetchPreRegistros()
    fetchStats()
  }, [fetchPreRegistros, fetchStats])

  // Enviar recordatorio individual
  const enviarRecordatorio = async (id) => {
    try {
      setSendingRecordatorio(id)
      const response = await fetch(
        `${backendUrl}/preregistro/admin/${id}/recordatorio`,
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      )
      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        fetchPreRegistros() // Refrescar lista
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error enviando recordatorio' })
    } finally {
      setSendingRecordatorio(null)
    }
  }

  // Enviar recordatorio masivo
  const enviarRecordatorioMasivo = async () => {
    try {
      setSendingMasivo(true)
      const response = await fetch(
        `${backendUrl}/preregistro/admin/recordatorio-masivo`,
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      )
      const result = await response.json()

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Enviados: ${result.enviados}, Errores: ${result.errores}`
        })
        setShowMasivoModal(false)
        fetchPreRegistros() // Refrescar lista
        fetchStats() // Refrescar stats
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error en envío masivo' })
    } finally {
      setSendingMasivo(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Formatear días desde registro
  const formatDias = (dias) => {
    if (!dias || dias < 1) return 'Hoy'
    if (dias === 1) return '1 día'
    return `${Math.floor(dias)} días`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Mensaje de feedback */}
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontFamily: FONTS.body,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'inherit'
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '16px',
            border: `2px solid ${COLORS.creamDark}`
          }}>
            <p style={{ fontSize: '0.75rem', color: COLORS.gray, fontFamily: FONTS.body, marginBottom: '0.25rem' }}>
              Total Pre-Registros
            </p>
            <p style={{
              fontSize: '2rem',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              color: COLORS.red
            }}>
              {stats.totalPreRegistros}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '16px',
            border: `2px solid ${COLORS.creamDark}`
          }}>
            <p style={{ fontSize: '0.75rem', color: COLORS.gray, fontFamily: FONTS.body, marginBottom: '0.25rem' }}>
              Sin Recordatorio
            </p>
            <p style={{
              fontSize: '2rem',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              color: '#f59e0b'
            }}>
              {stats.sinRecordatorio}
            </p>
          </div>

        </div>
      )}

      {/* Header con búsqueda y botón masivo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <h2 style={{
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: '1.5rem',
            color: COLORS.black,
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            Pre-Registros
          </h2>

          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              border: `2px solid ${COLORS.creamDark}`,
              fontFamily: FONTS.body,
              fontSize: '0.875rem',
              minWidth: '200px',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchPreRegistros()
              }
            }}
          />
        </div>

        <Button
          onClick={() => setShowMasivoModal(true)}
          disabled={!stats || stats.totalPreRegistros === 0}
        >
          <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Recordatorio Masivo
        </Button>
      </div>

      {/* Tabla de pre-registros */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: `2px solid ${COLORS.creamDark}`,
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>Cargando...</p>
          </div>
        ) : preRegistros.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>No hay pre-registros</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nombre</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Teléfono</TableHeader>
                <TableHeader>Ubicación</TableHeader>
                <TableHeader>Registrado</TableHeader>
                <TableHeader>Días</TableHeader>
                <TableHeader>Recordatorios</TableHeader>
                <TableHeader>Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {preRegistros.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>
                    <span style={{ fontWeight: 600 }}>
                      {pr.nombre} {pr.apellido}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${pr.email}`}
                      style={{ color: COLORS.red, textDecoration: 'none' }}
                    >
                      {pr.email}
                    </a>
                  </TableCell>
                  <TableCell>{pr.telefono || '-'}</TableCell>
                  <TableCell>{pr.ciudad}, {pr.pais}</TableCell>
                  <TableCell>{formatDate(pr.fecha_pre_registro)}</TableCell>
                  <TableCell>
                    <Badge variant={pr.dias_desde_registro > 7 ? 'error' : pr.dias_desde_registro > 3 ? 'warning' : 'default'}>
                      {formatDias(pr.dias_desde_registro)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pr.recordatorios_enviados >= 5 ? 'error' : pr.recordatorios_enviados > 0 ? 'warning' : 'success'}>
                      {pr.recordatorios_enviados}/5
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => enviarRecordatorio(pr.id)}
                      disabled={sendingRecordatorio === pr.id || pr.recordatorios_enviados >= 5}
                    >
                      {sendingRecordatorio === pr.id ? (
                        'Enviando...'
                      ) : pr.recordatorios_enviados >= 5 ? (
                        'Máx. alcanzado'
                      ) : (
                        <>
                          <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Recordar
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal de confirmación de envío masivo */}
      <Modal
        isOpen={showMasivoModal}
        onClose={() => setShowMasivoModal(false)}
        title="Enviar Recordatorio Masivo"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>
            Se enviará un recordatorio a todos los pre-registrados que:
          </p>
          <ul style={{
            fontFamily: FONTS.body,
            color: COLORS.black,
            paddingLeft: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <li>No hayan completado su registro</li>
            <li>Tengan menos de 5 recordatorios enviados</li>
            <li>Cumplan con el tiempo mínimo desde el último recordatorio</li>
          </ul>

          {stats && (
            <div style={{
              backgroundColor: COLORS.cream,
              padding: '1rem',
              borderRadius: '12px'
            }}>
              <p style={{ fontFamily: FONTS.body, fontSize: '0.875rem' }}>
                <strong>Estimado:</strong> {stats.totalPreRegistros - stats.maxRecordatorios} usuarios recibirán el recordatorio
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="secondary"
              onClick={() => setShowMasivoModal(false)}
              disabled={sendingMasivo}
            >
              Cancelar
            </Button>
            <Button
              onClick={enviarRecordatorioMasivo}
              disabled={sendingMasivo}
            >
              {sendingMasivo ? 'Enviando...' : 'Enviar a Todos'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
