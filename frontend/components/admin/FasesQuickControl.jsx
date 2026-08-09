'use client'

import { useEffect } from 'react'
import { useFasesStore } from '@/stores/fasesStore'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { COLORS, FONTS } from '@/components/artefacto/theme'

/**
 * FasesQuickControl - Widget de control rápido de fases para el dashboard
 *
 * Permite al admin abrir/cerrar inscripciones y votaciones de cualquier fase
 * directamente desde el dashboard principal sin tener que ir a la pestaña de Fases.
 *
 * Features:
 * - Ver todas las fases con su estado actual
 * - Abrir/cerrar inscripciones (solo Fase 1)
 * - Abrir/cerrar votaciones de cualquier fase
 * - Vista compacta y accionable
 */

const cardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  border: `2px solid ${COLORS.creamDark}`
}

export default function FasesQuickControl() {
  const { fases, fetchFases, toggleInscripciones, toggleVotaciones } = useFasesStore()

  useEffect(() => {
    fetchFases()
  }, [])

  const handleToggleInscripciones = async (fase) => {
    const nuevoEstado = !fase.inscripciones_abiertas
    const accion = nuevoEstado ? 'abrir' : 'cerrar'

    if (window.confirm(`¿Estás seguro de ${accion} las inscripciones de ${fase.nombre}?`)) {
      const result = await toggleInscripciones(fase.id, nuevoEstado)
      if (!result.success) {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const handleToggleVotaciones = async (fase) => {
    const nuevoEstado = !fase.votaciones_abiertas
    const accion = nuevoEstado ? 'abrir' : 'cerrar'

    if (window.confirm(`¿Estás seguro de ${accion} las votaciones de ${fase.nombre}?`)) {
      const result = await toggleVotaciones(fase.id, nuevoEstado)
      if (!result.success) {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const getEstadoBadge = (fase) => {
    if (fase.finalizada) {
      return <Badge variant="gray">Finalizada</Badge>
    }
    if (fase.inscripciones_abiertas) {
      return <Badge variant="info">Inscripciones Abiertas</Badge>
    }
    if (fase.votaciones_abiertas) {
      return <Badge variant="success">Votaciones Abiertas</Badge>
    }
    return <Badge variant="gray">Inactiva</Badge>
  }

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontFamily: FONTS.subtitle,
          fontWeight: FONTS.subtitleWeight,
          fontStyle: FONTS.subtitleStyle,
          fontSize: '1.25rem',
          color: COLORS.black,
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Control Rápido de Fases
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: COLORS.gray,
          fontFamily: FONTS.body
        }}>
          Activa o desactiva inscripciones y votaciones
        </p>
      </div>

      {/* Lista de Fases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fases.map(fase => (
          <div
            key={fase.id}
            style={{
              padding: '1rem',
              background: fase.finalizada ? '#f3f4f6' : COLORS.cream + '40',
              borderRadius: '12px',
              border: `1px solid ${fase.finalizada ? '#d1d5db' : COLORS.creamDark}`
            }}
          >
            {/* Header de la Fase */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: fase.tipo === 'concurso' ? '#a855f7' : COLORS.red,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: FONTS.display,
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}>
                  {fase.tipo === 'concurso' ? '🏆' : fase.numero_fase}
                </div>
                <div>
                  <h4 style={{
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: COLORS.black,
                    margin: 0
                  }}>
                    {fase.nombre}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: COLORS.gray,
                    fontFamily: FONTS.body,
                    margin: 0
                  }}>
                    {fase.total_inscritos || 0} inscritos • {fase.total_seleccionados || 0} seleccionados
                  </p>
                </div>
              </div>
              {getEstadoBadge(fase)}
            </div>

            {/* Botones de Control */}
            {!fase.finalizada && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {/* Solo Fase 1 puede tener inscripciones */}
                {fase.tipo === 'fase' && fase.numero_fase === 1 && (
                  <Button
                    variant={fase.inscripciones_abiertas ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleInscripciones(fase)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.75rem'
                    }}
                  >
                    {fase.inscripciones_abiertas ? (
                      <>
                        <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cerrar Inscripciones
                      </>
                    ) : (
                      <>
                        <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Abrir Inscripciones
                      </>
                    )}
                  </Button>
                )}

                {/* Todas las fases pueden tener votaciones */}
                <Button
                  variant={fase.votaciones_abiertas ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleVotaciones(fase)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  {fase.votaciones_abiertas ? (
                    <>
                      <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cerrar Votaciones
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Abrir Votaciones
                    </>
                  )}
                </Button>
              </div>
            )}

            {fase.finalizada && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: COLORS.gray,
                fontFamily: FONTS.body
              }}>
                <svg style={{ width: '1rem', height: '1rem', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fase finalizada
              </div>
            )}
          </div>
        ))}
      </div>

      {fases.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: COLORS.gray,
          fontFamily: FONTS.body,
          fontSize: '0.875rem'
        }}>
          No hay fases configuradas
        </div>
      )}
    </div>
  )
}
