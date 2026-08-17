'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Palette, Box } from 'lucide-react'
import SidebarPanel from './SidebarPanel'

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  body: 'acumin-pro, sans-serif',
}

/**
 * PaquetesSidebar - Lista de paquetes en sidebar derecho
 * Muestra paquetes filtrados por tipo (2D/3D)
 *
 * @param {Array} paquetes - Lista de paquetes disponibles
 * @param {boolean} es3D - Si el artista es de escultura (3D)
 * @param {Object} selectedPaquete - Paquete actualmente seleccionado
 * @param {Object} confirmedPaquete - Paquete confirmado (dibuja limitantes)
 * @param {Function} onSelectPaquete - Callback al seleccionar paquete para preview
 * @param {Function} onConfirmPaquete - Callback al confirmar paquete
 * @param {boolean} isLoading - Estado de carga
 */
export default function PaquetesSidebar({
  paquetes = [],
  es3D = false,
  selectedPaquete,
  confirmedPaquete,
  onSelectPaquete,
  onConfirmPaquete,
  isLoading = false,
}) {
  const [expandedId, setExpandedId] = useState(null)

  // Filtrar paquetes según tipo de artista
  const paquetesFiltrados = paquetes.filter(paquete => {
    if (es3D) return paquete.tipo === '3D'
    return paquete.tipo === '2D'
  })

  const handleToggleExpand = (paqueteId) => {
    if (expandedId === paqueteId) {
      setExpandedId(null)
    } else {
      setExpandedId(paqueteId)
      onSelectPaquete?.(paquetes.find(p => p.id === paqueteId))
    }
  }

  const handleConfirm = (paquete) => {
    onConfirmPaquete?.(paquete)
    setExpandedId(null)
  }

  if (isLoading) {
    return (
      <SidebarPanel position="right" title="Paquetes" defaultOpen={true}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p style={{ color: COLORS.gray, marginTop: '12px', fontFamily: FONTS.body }}>
            Cargando paquetes...
          </p>
        </div>
      </SidebarPanel>
    )
  }

  return (
    <SidebarPanel position="right" title="Paquetes" defaultOpen={true} width="350px">
      {/* Info del tipo de paquete */}
      <div style={{
        background: 'rgba(184, 48, 48, 0.08)',
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {es3D ? <Box size={18} color={COLORS.red} /> : <Palette size={18} color={COLORS.red} />}
        <span style={{
          fontFamily: FONTS.body,
          fontSize: '13px',
          color: COLORS.black,
          lineHeight: 1.4,
        }}>
          {es3D
            ? 'Paquetes 3D (espacio de base)'
            : 'Paquetes 2D (espacio de pared)'}
        </span>
      </div>

      {/* Lista de paquetes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paquetesFiltrados.map((paquete) => {
          const isExpanded = expandedId === paquete.id
          const isConfirmed = confirmedPaquete?.id === paquete.id

          return (
            <div
              key={paquete.id}
              style={{
                background: isConfirmed ? 'rgba(184, 48, 48, 0.1)' : 'white',
                border: isConfirmed
                  ? `2px solid ${COLORS.red}`
                  : `1px solid ${COLORS.creamDark}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header del paquete */}
              <button
                onClick={() => handleToggleExpand(paquete.id)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isConfirmed && <Check size={18} color={COLORS.red} />}
                  <span style={{
                    fontFamily: FONTS.display,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '16px',
                    color: COLORS.black,
                  }}>
                    {paquete.nombre}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp size={20} color={COLORS.gray} />
                ) : (
                  <ChevronDown size={20} color={COLORS.gray} />
                )}
              </button>

              {/* Contenido expandido */}
              {isExpanded && (
                <div style={{
                  padding: '0 16px 16px',
                  borderTop: `1px solid ${COLORS.creamDark}`,
                }}>
                  <p style={{
                    fontFamily: FONTS.body,
                    fontSize: '14px',
                    color: COLORS.gray,
                    lineHeight: 1.6,
                    margin: '12px 0',
                  }}>
                    {paquete.descripcion}
                  </p>

                  {/* Specs */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '14px',
                  }}>
                    <span style={{
                      background: 'rgba(184, 48, 48, 0.1)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontFamily: FONTS.body,
                      fontSize: '12px',
                      color: COLORS.black,
                    }}>
                      {es3D
                        ? `${paquete.metros_cuadrados}m²`
                        : `${paquete.metros_lineales}m lineales`}
                    </span>
                    <span style={{
                      background: 'rgba(184, 48, 48, 0.1)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontFamily: FONTS.body,
                      fontSize: '12px',
                      color: COLORS.black,
                    }}>
                      ${paquete.precio} MXN
                    </span>
                  </div>

                  {/* Botón confirmar */}
                  {!isConfirmed ? (
                    <button
                      onClick={() => handleConfirm(paquete)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: COLORS.black,
                        color: COLORS.cream,
                        border: 'none',
                        borderRadius: '10px',
                        fontFamily: FONTS.body,
                        fontWeight: 600,
                        fontSize: '13px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.background = COLORS.red}
                      onMouseLeave={(e) => e.target.style.background = COLORS.black}
                    >
                      Seleccionar Paquete
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: COLORS.red,
                      color: COLORS.cream,
                      borderRadius: '10px',
                      fontFamily: FONTS.body,
                      fontWeight: 600,
                      fontSize: '13px',
                    }}>
                      <Check size={16} />
                      Paquete Seleccionado
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {paquetesFiltrados.length === 0 && (
        <p style={{
          textAlign: 'center',
          color: COLORS.gray,
          fontFamily: FONTS.body,
          fontSize: '14px',
          padding: '24px',
        }}>
          No hay paquetes disponibles para tu disciplina
        </p>
      )}
    </SidebarPanel>
  )
}
