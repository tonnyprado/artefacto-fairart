'use client'

import { useRef } from 'react'
import { Plus, Edit2, Trash2, GripVertical, Check, AlertCircle } from 'lucide-react'
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
 * ObrasSidebar - Lista de obras en sidebar izquierdo
 * Permite agregar, editar y arrastrar obras al canvas
 *
 * @param {Array} obras - Lista de obras del artista
 * @param {Array} obrasEnCanvas - Obras actualmente en el canvas
 * @param {number} obrasMaximas - Máximo de obras permitidas
 * @param {Function} onAddObra - Callback para agregar obra
 * @param {Function} onEditObra - Callback para editar obra
 * @param {Function} onDeleteObra - Callback para eliminar obra
 * @param {Function} onDragStart - Callback al iniciar drag
 * @param {Function} hasCompleteMetadata - Verifica si obra tiene metadata completa
 * @param {boolean} paqueteConfirmado - Si hay un paquete confirmado (habilita drag)
 */
export default function ObrasSidebar({
  obras = [],
  obrasEnCanvas = [],
  obrasMaximas = 5,
  onAddObra,
  onEditObra,
  onDeleteObra,
  onDragStart,
  hasCompleteMetadata,
  paqueteConfirmado = false,
}) {
  const fileInputRef = useRef()

  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) {
      onAddObra?.(e.target.files)
    }
  }

  return (
    <SidebarPanel position="left" title="Mis Obras" defaultOpen={true} width="320px">
      {/* Header con contador y botón agregar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <span style={{
          fontFamily: FONTS.body,
          fontSize: '13px',
          color: COLORS.gray,
        }}>
          {obrasEnCanvas.length}/{obrasMaximas} en lienzo
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: COLORS.black,
            color: COLORS.cream,
            border: 'none',
            borderRadius: '8px',
            fontFamily: FONTS.body,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = COLORS.red}
          onMouseLeave={(e) => e.target.style.background = COLORS.black}
        >
          <Plus size={14} />
          Agregar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Mensaje si no hay paquete confirmado */}
      {!paqueteConfirmado && obras.length > 0 && (
        <div style={{
          background: 'rgba(184, 48, 48, 0.08)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <AlertCircle size={16} color={COLORS.red} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span style={{
            fontFamily: FONTS.body,
            fontSize: '12px',
            color: COLORS.black,
            lineHeight: 1.5,
          }}>
            Selecciona un paquete primero para poder arrastrar tus obras al lienzo
          </span>
        </div>
      )}

      {/* Lista de obras */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {obras.map((obra) => {
          const isInCanvas = obrasEnCanvas.some(o => o.id === obra.id)
          const hasMetadata = hasCompleteMetadata?.(obra)
          const canDrag = paqueteConfirmado && hasMetadata && !isInCanvas

          return (
            <div
              key={obra.id}
              draggable={canDrag}
              onDragStart={(e) => canDrag && onDragStart?.(e, obra)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                background: isInCanvas ? 'rgba(184, 48, 48, 0.08)' : 'white',
                border: `1px solid ${isInCanvas ? COLORS.red : COLORS.creamDark}`,
                borderRadius: '10px',
                cursor: canDrag ? 'grab' : 'default',
                opacity: isInCanvas ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Handle de drag */}
              {canDrag && (
                <GripVertical size={16} color={COLORS.gray} style={{ flexShrink: 0 }} />
              )}

              {/* Preview */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                overflow: 'hidden',
                flexShrink: 0,
                background: COLORS.creamDark,
              }}>
                {obra.preview && (
                  <img
                    src={obra.preview}
                    alt={obra.titulo || 'Obra'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: FONTS.body,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: COLORS.black,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {obra.titulo || 'Sin título'}
                </div>
                <div style={{
                  fontFamily: FONTS.body,
                  fontSize: '11px',
                  color: COLORS.gray,
                  marginTop: '2px',
                }}>
                  {obra.ancho_cm && obra.alto_cm
                    ? `${obra.ancho_cm} × ${obra.alto_cm} cm`
                    : 'Sin medidas'}
                </div>
              </div>

              {/* Status indicators */}
              {isInCanvas ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: COLORS.red,
                  fontSize: '11px',
                  fontFamily: FONTS.body,
                }}>
                  <Check size={14} />
                </div>
              ) : !hasMetadata ? (
                <AlertCircle size={16} color={COLORS.red} title="Completa los datos" />
              ) : null}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onEditObra?.(obra)}
                  style={{
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.background = COLORS.creamDark}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  title="Editar datos"
                >
                  <Edit2 size={14} color={COLORS.gray} />
                </button>
                {!isInCanvas && (
                  <button
                    onClick={() => onDeleteObra?.(obra.id)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(184, 48, 48, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title="Eliminar"
                  >
                    <Trash2 size={14} color={COLORS.red} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Estado vacío */}
        {obras.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            background: 'white',
            borderRadius: '12px',
            border: `2px dashed ${COLORS.creamDark}`,
          }}>
            <p style={{
              fontFamily: FONTS.body,
              fontSize: '13px',
              color: COLORS.gray,
              margin: 0,
              lineHeight: 1.6,
            }}>
              No has agregado obras.<br />
              Haz clic en "Agregar" para comenzar.
            </p>
          </div>
        )}
      </div>
    </SidebarPanel>
  )
}
