'use client'

import { useState, useEffect } from 'react'
import { useConcursoStore } from '@/stores/concursoStore'
import { useFasesStore } from '@/stores/fasesStore'
import Button from '@/components/ui/Button'

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  displayWeight: 600,
  heading: '"Inter Tight", Inter, sans-serif',
  headingWeight: 700,
  body: 'acumin-pro, sans-serif',
}

/**
 * Panel de Administración de Concursos
 *
 * Permite a los admins:
 * - Ver artistas que aceptaron participar en concursos
 * - Seleccionar obras específicas de artistas para concurso
 * - Ver obras ya seleccionadas
 * - Ver estadísticas del concurso
 */
export default function ConcursoPanel() {
  // Estados locales
  const [concursoSeleccionado, setConcursoSeleccionado] = useState(null)
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null)
  const [vistaActual, setVistaActual] = useState('lista') // 'lista' | 'obras' | 'seleccionadas'
  const [searchTerm, setSearchTerm] = useState('')

  // Store hooks
  const {
    artistasElegibles,
    obrasArtista,
    obrasSeleccionadas,
    estadisticas,
    isLoading,
    fetchArtistasElegibles,
    fetchObrasArtista,
    fetchObrasSeleccionadas,
    fetchEstadisticas,
    seleccionarObra,
    deseleccionarObra
  } = useConcursoStore()

  const { fases, fetchFases } = useFasesStore()

  // Filtrar solo fases de tipo concurso
  const concursos = fases.filter(f => f.tipo === 'concurso')

  // Cargar fases al montar
  useEffect(() => {
    fetchFases()
  }, [])

  // Cargar artistas elegibles al montar
  useEffect(() => {
    fetchArtistasElegibles()
  }, [])

  // Cargar datos del concurso seleccionado
  useEffect(() => {
    if (concursoSeleccionado) {
      fetchObrasSeleccionadas(concursoSeleccionado.id)
      fetchEstadisticas(concursoSeleccionado.id)
    }
  }, [concursoSeleccionado])

  // Handlers
  const handleSeleccionarArtista = async (artista) => {
    setArtistaSeleccionado(artista)
    setVistaActual('obras')
    await fetchObrasArtista(artista.id)
  }

  const handleSeleccionarObra = async (obra) => {
    if (!concursoSeleccionado) {
      alert('Primero selecciona un concurso')
      return
    }

    const result = await seleccionarObra(concursoSeleccionado.id, obra.id)
    if (result.success) {
      alert('✓ Obra seleccionada exitosamente')
      // Refresh obras del artista para actualizar badges
      if (artistaSeleccionado) {
        await fetchObrasArtista(artistaSeleccionado.id)
      }
    } else {
      alert('✗ Error: ' + result.error)
    }
  }

  const handleDeseleccionarObra = async (obra) => {
    if (confirm('¿Deseas deseleccionar esta obra del concurso?')) {
      const result = await deseleccionarObra(concursoSeleccionado.id, obra.obra_id)
      if (result.success) {
        alert('✓ Obra deseleccionada')
      } else {
        alert('✗ Error: ' + result.error)
      }
    }
  }

  // Filtrar artistas por búsqueda
  const artistasFiltrados = artistasElegibles.filter(a => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      a.nombre?.toLowerCase().includes(term) ||
      a.apellido?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.folio?.toLowerCase().includes(term)
    )
  })

  const stats = concursoSeleccionado ? estadisticas[concursoSeleccionado.id] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        border: `2px solid ${COLORS.creamDark}`
      }}>
        <h2 style={{
          fontFamily: FONTS.heading,
          fontWeight: FONTS.headingWeight,
          fontSize: '28px',
          color: COLORS.black,
          margin: 0,
          marginBottom: '8px',
          textTransform: 'uppercase'
        }}>
          Gestión de Concursos
        </h2>
        <p style={{
          fontFamily: FONTS.body,
          fontSize: '15px',
          color: COLORS.gray,
          margin: 0
        }}>
          Selecciona artistas y obras específicas para participar en concursos
        </p>
      </div>

      {/* Selector de Concurso */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        border: `2px solid ${COLORS.creamDark}`
      }}>
        <label style={{
          fontFamily: FONTS.body,
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.black,
          display: 'block',
          marginBottom: '8px'
        }}>
          Concurso Activo
        </label>
        <select
          value={concursoSeleccionado?.id || ''}
          onChange={(e) => {
            const fase = concursos.find(f => f.id === parseInt(e.target.value))
            setConcursoSeleccionado(fase || null)
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${COLORS.creamDark}`,
            fontFamily: FONTS.body,
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          <option value="">Selecciona un concurso...</option>
          {concursos.map(concurso => (
            <option key={concurso.id} value={concurso.id}>
              {concurso.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Estadísticas */}
      {concursoSeleccionado && stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <StatCard
            label="Artistas Seleccionados"
            value={stats.total_artistas_seleccionados}
            iconBg="rgba(184, 48, 48, 0.1)"
          />
          <StatCard
            label="Obras Seleccionadas"
            value={stats.total_obras_seleccionadas}
            iconBg="rgba(244, 237, 228, 0.3)"
          />
          <StatCard
            label="Artistas Ganadores"
            value={stats.artistas_ganadores}
            iconBg="rgba(20, 210, 120, 0.1)"
          />
        </div>
      )}

      {/* Tabs */}
      {concursoSeleccionado && (
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: `2px solid ${COLORS.creamDark}`,
          paddingBottom: '8px'
        }}>
          <TabButton
            active={vistaActual === 'lista'}
            onClick={() => {
              setVistaActual('lista')
              setArtistaSeleccionado(null)
            }}
          >
            Artistas Elegibles ({artistasElegibles.length})
          </TabButton>
          <TabButton
            active={vistaActual === 'seleccionadas'}
            onClick={() => setVistaActual('seleccionadas')}
          >
            Obras Seleccionadas ({obrasSeleccionadas[concursoSeleccionado.id]?.length || 0})
          </TabButton>
        </div>
      )}

      {/* Vista: Lista de Artistas */}
      {vistaActual === 'lista' && concursoSeleccionado && (
        <div>
          {/* Búsqueda */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, email o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${COLORS.creamDark}`,
                fontFamily: FONTS.body,
                fontSize: '15px'
              }}
            />
          </div>

          {/* Tabla de Artistas */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `2px solid ${COLORS.creamDark}`
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: COLORS.creamDark }}>
                  <th style={tableHeaderStyle}>Folio</th>
                  <th style={tableHeaderStyle}>Artista</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Total Obras</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {artistasFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                      <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>
                        No hay artistas elegibles
                      </p>
                    </td>
                  </tr>
                )}
                {artistasFiltrados.map(artista => (
                  <tr key={artista.id} style={{ borderBottom: `1px solid ${COLORS.creamDark}` }}>
                    <td style={tableCellStyle}>{artista.folio}</td>
                    <td style={tableCellStyle}>
                      {artista.nombre} {artista.apellido}
                    </td>
                    <td style={tableCellStyle}>{artista.email}</td>
                    <td style={tableCellStyle}>{artista.total_obras || 0}</td>
                    <td style={tableCellStyle}>
                      <Button
                        onClick={() => handleSeleccionarArtista(artista)}
                        variant="primary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        Ver Obras
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista: Obras del Artista */}
      {vistaActual === 'obras' && artistaSeleccionado && (
        <div>
          {/* Header con botón volver */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: `2px solid ${COLORS.creamDark}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{
                fontFamily: FONTS.heading,
                fontWeight: FONTS.headingWeight,
                fontSize: '20px',
                color: COLORS.black,
                margin: 0,
                marginBottom: '4px'
              }}>
                Obras de {artistaSeleccionado.nombre} {artistaSeleccionado.apellido}
              </h3>
              <p style={{
                fontFamily: FONTS.body,
                fontSize: '14px',
                color: COLORS.gray,
                margin: 0
              }}>
                Selecciona las obras que participarán en el concurso
              </p>
            </div>
            <Button
              onClick={() => {
                setVistaActual('lista')
                setArtistaSeleccionado(null)
              }}
              variant="secondary"
            >
              ← Volver
            </Button>
          </div>

          {/* Grid de obras */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {isLoading && <p>Cargando obras...</p>}
            {!isLoading && obrasArtista[artistaSeleccionado.id]?.length === 0 && (
              <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>
                Este artista no tiene obras
              </p>
            )}
            {obrasArtista[artistaSeleccionado.id]?.map(obra => (
              <ObraCard
                key={obra.id}
                obra={obra}
                onSeleccionar={handleSeleccionarObra}
                concursoSeleccionado={concursoSeleccionado}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vista: Obras Seleccionadas */}
      {vistaActual === 'seleccionadas' && concursoSeleccionado && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {!obrasSeleccionadas[concursoSeleccionado.id] && <p>Cargando...</p>}
            {obrasSeleccionadas[concursoSeleccionado.id]?.length === 0 && (
              <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>
                No hay obras seleccionadas para este concurso
              </p>
            )}
            {obrasSeleccionadas[concursoSeleccionado.id]?.map(obra => (
              <ObraSeleccionadaCard
                key={obra.obra_id}
                obra={obra}
                onDeseleccionar={handleDeseleccionarObra}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Componentes auxiliares
// ============================================

const StatCard = ({ label, value, iconBg }) => (
  <div style={{
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: `2px solid ${COLORS.creamDark}`
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: iconBg,
      marginBottom: '12px'
    }} />
    <p style={{
      fontFamily: FONTS.body,
      fontSize: '13px',
      color: COLORS.gray,
      margin: 0,
      marginBottom: '4px'
    }}>
      {label}
    </p>
    <p style={{
      fontFamily: FONTS.heading,
      fontWeight: FONTS.headingWeight,
      fontSize: '32px',
      color: COLORS.black,
      margin: 0
    }}>
      {value}
    </p>
  </div>
)

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: FONTS.body,
      fontSize: '15px',
      fontWeight: active ? '600' : '400',
      color: active ? COLORS.red : COLORS.gray,
      background: active ? 'rgba(184, 48, 48, 0.1)' : 'transparent',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
  >
    {children}
  </button>
)

const ObraCard = ({ obra, onSeleccionar, concursoSeleccionado }) => {
  const yaSeleccionada = obra.ya_seleccionada_en_concurso

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      border: `2px solid ${yaSeleccionada ? COLORS.red : COLORS.creamDark}`,
      position: 'relative'
    }}>
      {/* Imagen */}
      {obra.imagen_url && (
        <div style={{
          height: '200px',
          background: `url(${obra.imagen_url}) center/cover`,
          position: 'relative'
        }}>
          {yaSeleccionada && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: COLORS.red,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              fontFamily: FONTS.body,
              fontSize: '12px',
              fontWeight: '600'
            }}>
              SELECCIONADA
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '16px' }}>
        <h4 style={{
          fontFamily: FONTS.body,
          fontSize: '16px',
          fontWeight: '600',
          color: COLORS.black,
          margin: '0 0 8px 0'
        }}>
          {obra.titulo || 'Sin título'}
        </h4>
        <div style={{
          fontFamily: FONTS.body,
          fontSize: '13px',
          color: COLORS.gray,
          marginBottom: '12px'
        }}>
          <p style={{ margin: '4px 0' }}>{obra.alto_cm} x {obra.ancho_cm} cm</p>
          <p style={{ margin: '4px 0' }}>{obra.tecnica}</p>
          <p style={{ margin: '4px 0' }}>${obra.precio_mxn?.toLocaleString()} MXN</p>
        </div>

        {!yaSeleccionada ? (
          <Button
            onClick={() => onSeleccionar(obra)}
            variant="primary"
            style={{ width: '100%' }}
          >
            Seleccionar para Concurso
          </Button>
        ) : (
          <div style={{
            padding: '8px',
            background: 'rgba(184, 48, 48, 0.1)',
            borderRadius: '4px',
            textAlign: 'center',
            fontFamily: FONTS.body,
            fontSize: '13px',
            color: COLORS.red
          }}>
            Ya seleccionada en {obra.concurso_nombre || 'concurso'}
          </div>
        )}
      </div>
    </div>
  )
}

const ObraSeleccionadaCard = ({ obra, onDeseleccionar }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: `2px solid ${COLORS.red}`
  }}>
    {/* Imagen */}
    {obra.imagen_url && (
      <div style={{
        height: '200px',
        background: `url(${obra.imagen_url}) center/cover`
      }} />
    )}

    {/* Info */}
    <div style={{ padding: '16px' }}>
      <h4 style={{
        fontFamily: FONTS.body,
        fontSize: '16px',
        fontWeight: '600',
        color: COLORS.black,
        margin: '0 0 4px 0'
      }}>
        {obra.titulo || 'Sin título'}
      </h4>
      <p style={{
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.gray,
        margin: '0 0 8px 0'
      }}>
        {obra.nombre} {obra.apellido}
      </p>
      <div style={{
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: COLORS.gray,
        marginBottom: '12px'
      }}>
        <p style={{ margin: '4px 0' }}>{obra.alto_cm} x {obra.ancho_cm} cm</p>
        <p style={{ margin: '4px 0' }}>{obra.tecnica}</p>
      </div>

      <Button
        onClick={() => onDeseleccionar(obra)}
        variant="secondary"
        style={{ width: '100%' }}
      >
        Deseleccionar
      </Button>
    </div>
  </div>
)

// Estilos de tabla
const tableHeaderStyle = {
  fontFamily: FONTS.body,
  fontSize: '13px',
  fontWeight: '600',
  color: COLORS.black,
  padding: '12px 16px',
  textAlign: 'left',
  textTransform: 'uppercase'
}

const tableCellStyle = {
  fontFamily: FONTS.body,
  fontSize: '14px',
  color: COLORS.black,
  padding: '16px'
}
