'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook para manejar drag & drop táctil en dispositivos touch
 * @param {Function} onDrop - Callback cuando se suelta sobre el canvas
 * @param {Object} canvasRef - Ref al elemento del canvas wrapper
 */
export function useTouchDrag(onDrop, canvasRef) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedObra, setDraggedObra] = useState(null)
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 })
  const [previewSize, setPreviewSize] = useState({ width: 100, height: 75 })
  const startPos = useRef({ x: 0, y: 0 })

  // Prevenir scroll del body cuando estamos arrastrando
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isDragging])

  const handleTouchStart = useCallback((e, obra, dimensions) => {
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }

    // Iniciar drag inmediatamente (sin long press para mejor respuesta)
    setDraggedObra(obra)
    setPreviewSize(dimensions || { width: 100, height: 75 })
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
    setIsDragging(true)

    // Vibración háptica si está disponible
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return

    // Prevenir scroll y comportamientos por defecto
    e.preventDefault()
    e.stopPropagation()

    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
  }, [isDragging])

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging || !draggedObra) {
      setIsDragging(false)
      setDraggedObra(null)
      return
    }

    // Verificar si terminó sobre el canvas
    if (canvasRef?.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const { x, y } = touchPosition

      if (
        x >= canvasRect.left &&
        x <= canvasRect.right &&
        y >= canvasRect.top &&
        y <= canvasRect.bottom
      ) {
        // Calcular posición relativa al canvas
        const relativeX = x - canvasRect.left
        const relativeY = y - canvasRect.top

        onDrop(draggedObra, relativeX, relativeY)
      }
    }

    setIsDragging(false)
    setDraggedObra(null)
  }, [isDragging, draggedObra, touchPosition, canvasRef, onDrop])

  const cancelDrag = useCallback(() => {
    setIsDragging(false)
    setDraggedObra(null)
  }, [])

  return {
    isDragging,
    draggedObra,
    touchPosition,
    previewSize,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cancelDrag
  }
}
