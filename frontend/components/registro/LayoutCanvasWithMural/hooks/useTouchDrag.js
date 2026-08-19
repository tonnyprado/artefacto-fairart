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
  const longPressTimer = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const handleTouchStart = useCallback((e, obra, dimensions) => {
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }

    // Long press para iniciar drag (300ms)
    longPressTimer.current = setTimeout(() => {
      setDraggedObra(obra)
      setPreviewSize(dimensions || { width: 100, height: 75 })
      setTouchPosition({ x: touch.clientX, y: touch.clientY })
      setIsDragging(true)

      // Vibración háptica si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 300)
  }, [])

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0]

    // Si no estamos arrastrando, verificar si se movió demasiado para cancelar el long press
    if (!isDragging && longPressTimer.current) {
      const dx = Math.abs(touch.clientX - startPos.current.x)
      const dy = Math.abs(touch.clientY - startPos.current.y)
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      return
    }

    if (isDragging) {
      e.preventDefault()
      setTouchPosition({ x: touch.clientX, y: touch.clientY })
    }
  }, [isDragging])

  const handleTouchEnd = useCallback((e) => {
    // Cancelar long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

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
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
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
