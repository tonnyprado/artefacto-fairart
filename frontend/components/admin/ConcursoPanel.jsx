'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'

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
 * Panel de Concurso - Vista Simplificada
 *
 * Muestra únicamente la lista de artistas inscritos en concurso
 */
export default function ConcursoPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [artistasConcurso, setArtistasConcurso] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { fetchArtistasByFase } = useArtistasStore()
  const { fases, fetchFases } = useFasesStore()

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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.creamDark }}>
              <th style={tableHeaderStyle}>Folio</th>
              <th style={tableHeaderStyle}>Artista</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {artistasFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>
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
                  {artista.nombre} {artista.apellido}
                </td>
                <td style={tableCellStyle}>{artista.email}</td>
                <td style={tableCellStyle}>{artista.telefono || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
