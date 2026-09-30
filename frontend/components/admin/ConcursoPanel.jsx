'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import Button from '@/components/ui/Button'
import { useToast } from '@/hooks/use-toast'

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
 * Panel de Concurso - Vista Completa
 *
 * Muestra la lista de artistas inscritos en concurso con:
 * - Herramientas para aprobar/rechazar artistas
 * - Selección de obras específicas para cada artista
 */
export default function ConcursoPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [artistasConcurso, setArtistasConcurso] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState(new Set())
  const [guardandoObras, setGuardandoObras] = useState(false)

  const { fetchArtistasByFase, cambiarEstadoArtista } = useArtistasStore()
  const { fases, fetchFases } = useFasesStore()
  const { toast } = useToast()

  // Filtrar solo fases de tipo concurso
  const concursos = fases.filter(f => f.tipo === 'concurso')
  const concurso = concursos[0] // Tomar el primer concurso

  useEffect(() => {
    fetchFases()
  }, [])

  useEffect(() => {
    const cargarArtistas = async () => {
      if (concurso) {
        setIsLoading(true)
        try {
          const result = await fetchArtistasByFase(concurso.id)
          setArtistasConcurso(result?.data || [])
        } catch (error) {
          console.error('Error cargando artistas de concurso:', error)
          setArtistasConcurso([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    cargarArtistas()
  }, [concurso?.id])

  // Filtrar artistas por búsqueda
  const artistasFiltrados = artistasConcurso.filter(a => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      a.nombre?.toLowerCase().includes(term) ||
      a.apellido?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.folio?.toLowerCase().includes(term)
    )
  })

  const handleAprobar = async (artista) => {
    const result = await cambiarEstadoArtista(artista.id, 'aprobado', 'Aprobado para concurso')
    if (result.success) {
      toast({
        title: 'Artista aprobado',
        description: `${artista.nombre} ${artista.apellido} ha sido aprobado para el concurso`,
      })
      // Recargar lista
      const updatedResult = await fetchArtistasByFase(concurso.id)
      setArtistasConcurso(updatedResult?.data || [])
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo aprobar al artista',
        variant: 'destructive',
      })
    }
  }

  const handleRechazar = async (artista) => {
    const result = await cambiarEstadoArtista(artista.id, 'rechazado', 'Rechazado para concurso')
    if (result.success) {
      toast({
        title: 'Artista rechazado',
        description: `${artista.nombre} ${artista.apellido} ha sido rechazado`,
      })
      // Recargar lista
      const updatedResult = await fetchArtistasByFase(concurso.id)
      setArtistasConcurso(updatedResult?.data || [])
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo rechazar al artista',
        variant: 'destructive',
      })
    }
  }

  const handleVerObras = (artista) => {
    setArtistaSeleccionado(artista)
    setModalAbierto(true)
    // Cargar obras ya seleccionadas para este artista
    // TODO: Cargar desde API las obras previamente seleccionadas
    setObrasSeleccionadas(new Set())
  }

  const handleCerrarModal = () => {
    setModalAbierto(false)
    setArtistaSeleccionado(null)
    setObrasSeleccionadas(new Set())
  }

  const toggleObraSeleccionada = (obraId) => {
    const newSet = new Set(obrasSeleccionadas)
    if (newSet.has(obraId)) {
      newSet.delete(obraId)
    } else {
      newSet.add(obraId)
    }
    setObrasSeleccionadas(newSet)
  }

  const handleGuardarObrasSeleccionadas = async () => {
    setGuardandoObras(true)
    try {
      // TODO: Llamar API para guardar las obras seleccionadas
      // Por ahora solo simulamos
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: 'Obras guardadas',
        description: `${obrasSeleccionadas.size} obra(s) seleccionada(s) para ${artistaSeleccionado.nombre}`,
      })

      handleCerrarModal()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las obras seleccionadas',
        variant: 'destructive',
      })
    } finally {
      setGuardandoObras(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const estilos = {
      aprobado: { bg: '#10b981', text: 'Aprobado' },
      rechazado: { bg: '#ef4444', text: 'Rechazado' },
      pendiente: { bg: '#f59e0b', text: 'Pendiente' }
    }

    const config = estilos[estado] || estilos.pendiente

    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        background: config.bg,
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: FONTS.body
      }}>
        {config.text}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: `4px solid ${COLORS.creamDark}`,
          borderTop: `4px solid ${COLORS.red}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: FONTS.body, color: COLORS.gray, marginTop: '16px' }}>
          Cargando artistas de concurso...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

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
          Concurso
        </h2>
        <p style={{
          fontFamily: FONTS.body,
          fontSize: '15px',
          color: COLORS.gray,
          margin: 0
        }}>
          {concurso?.nombre || 'No hay concursos activos'} - {artistasConcurso.length} artista{artistasConcurso.length !== 1 ? 's' : ''} inscrito{artistasConcurso.length !== 1 ? 's' : ''}
        </p>
      </div>

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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: COLORS.creamDark }}>
                <th style={tableHeaderStyle}>Folio</th>
                <th style={tableHeaderStyle}>Artista</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Estado</th>
                <th style={tableHeaderStyle}>Obras</th>
                <th style={tableHeaderStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {artistasFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>
                      {searchTerm ? 'No se encontraron artistas' : 'No hay artistas inscritos en concurso'}
                    </p>
                  </td>
                </tr>
              )}
              {artistasFiltrados.map(artista => (
                <tr key={artista.id} style={{ borderBottom: `1px solid ${COLORS.creamDark}` }}>
                  <td style={tableCellStyle}>{artista.folio}</td>
                  <td style={tableCellStyle}>
                    <strong>{artista.nombre} {artista.apellido}</strong>
                  </td>
                  <td style={tableCellStyle}>{artista.email}</td>
                  <td style={tableCellStyle}>
                    {getEstadoBadge(artista.estado_registro || 'pendiente')}
                  </td>
                  <td style={tableCellStyle}>
                    {artista.obras?.length || 0} obras
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Button
                        onClick={() => handleVerObras(artista)}
                        variant="primary"
                        size="sm"
                      >
                        Ver Obras
                      </Button>
                      {artista.estado_registro !== 'aprobado' && (
                        <Button
                          onClick={() => handleAprobar(artista)}
                          variant="success"
                          size="sm"
                          style={{ background: '#10b981' }}
                        >
                          ✓ Aprobar
                        </Button>
                      )}
                      {artista.estado_registro !== 'rechazado' && (
                        <Button
                          onClick={() => handleRechazar(artista)}
                          variant="danger"
                          size="sm"
                          style={{ background: '#ef4444' }}
                        >
                          ✗ Rechazar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Obras */}
      {modalAbierto && artistaSeleccionado && (
        <div
          onClick={handleCerrarModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
            overflowY: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.cream,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            {/* Header del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontFamily: FONTS.heading,
                  fontWeight: FONTS.headingWeight,
                  fontSize: '24px',
                  color: COLORS.black,
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase'
                }}>
                  Obras de {artistaSeleccionado.nombre} {artistaSeleccionado.apellido}
                </h3>
                <p style={{
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  color: COLORS.gray,
                  margin: 0
                }}>
                  Folio: {artistaSeleccionado.folio} | {obrasSeleccionadas.size} obra(s) seleccionada(s)
                </p>
              </div>
              <button
                onClick={handleCerrarModal}
                style={{
                  background: COLORS.red,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cerrar
              </button>
            </div>

            {/* Grid de Obras */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {(!artistaSeleccionado.obras || artistaSeleccionado.obras.length === 0) && (
                <p style={{ fontFamily: FONTS.body, color: COLORS.gray }}>
                  Este artista no tiene obras registradas
                </p>
              )}
              {artistaSeleccionado.obras?.map(obra => {
                const isSelected = obrasSeleccionadas.has(obra.id)
                return (
                  <div
                    key={obra.id}
                    onClick={() => toggleObraSeleccionada(obra.id)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `3px solid ${isSelected ? COLORS.red : COLORS.creamDark}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {/* Checkbox visual */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? COLORS.red : 'white',
                      border: `2px solid ${isSelected ? COLORS.red : COLORS.gray}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}>
                      {isSelected && (
                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </div>

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
                        margin: '0 0 8px 0'
                      }}>
                        {obra.titulo || 'Sin título'}
                      </h4>
                      <div style={{
                        fontFamily: FONTS.body,
                        fontSize: '13px',
                        color: COLORS.gray
                      }}>
                        <p style={{ margin: '4px 0' }}>{obra.alto_cm} x {obra.ancho_cm} cm</p>
                        <p style={{ margin: '4px 0' }}>{obra.tecnica}</p>
                        {obra.precio_mxn && (
                          <p style={{ margin: '4px 0' }}>${obra.precio_mxn.toLocaleString()} MXN</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botón de guardar */}
            {artistaSeleccionado.obras && artistaSeleccionado.obras.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Button
                  onClick={handleGuardarObrasSeleccionadas}
                  disabled={guardandoObras || obrasSeleccionadas.size === 0}
                  variant="primary"
                  size="lg"
                >
                  {guardandoObras ? 'Guardando...' : `Guardar Selección (${obrasSeleccionadas.size})`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
