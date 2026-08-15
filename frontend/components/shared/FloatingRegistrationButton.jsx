'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useFasesStore } from '@/stores/fasesStore'
import { COLORS } from '../artefacto/theme'

const STORAGE_KEY = 'floating-btn-position'
const DEFAULT_POSITION = { x: null, y: null } // null = usar posición por defecto (esquina inferior derecha)

/**
 * FloatingRegistrationButton - Botón flotante de registro
 *
 * - Aparece en toda la plataforma excepto en admin y registro
 * - Solo se muestra cuando hay una fase con inscripciones abiertas
 * - Diseño similar a botones de chatbot
 * - Fixed position en la esquina inferior derecha
 * - DRAGGABLE en móvil: el usuario puede moverlo con el dedo
 * - Guarda la posición en localStorage para persistencia
 */
export default function FloatingRegistrationButton() {
  const pathname = usePathname()
  const { fases, fetchFases, getFaseConInscripcionesAbiertas } = useFasesStore()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Estados para drag
  const [position, setPosition] = useState(DEFAULT_POSITION)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionStartRef = useRef({ x: 0, y: 0 })
  const buttonRef = useRef(null)
  const hasMoved = useRef(false) // Para distinguir tap de drag

  // Cargar posición guardada y detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Cargar posición guardada
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validar que la posición esté dentro de la pantalla
        if (parsed.x !== null && parsed.y !== null) {
          const maxX = window.innerWidth - 80 // Tamaño aproximado del botón
          const maxY = window.innerHeight - 80
          setPosition({
            x: Math.min(Math.max(0, parsed.x), maxX),
            y: Math.min(Math.max(0, parsed.y), maxY),
          })
        }
      }
    } catch (e) {
      // Ignorar errores de localStorage
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch fases on mount
  useEffect(() => {
    fetchFases()
  }, [fetchFases])

  // Determinar si mostrar el botón
  useEffect(() => {
    const isAdminPage = pathname?.startsWith('/admin')
    const isRegistroPage = pathname?.startsWith('/registro')
    const isCuradorPage = pathname?.startsWith('/curador')
    const faseActiva = getFaseConInscripcionesAbiertas()
    setIsVisible(!isAdminPage && !isRegistroPage && !isCuradorPage && !!faseActiva)
  }, [pathname, fases, getFaseConInscripcionesAbiertas])

  // Guardar posición en localStorage
  const savePosition = useCallback((pos) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }, [])

  // Handlers de drag
  const handleDragStart = useCallback((clientX, clientY) => {
    if (!isMobile) return
    setIsDragging(true)
    hasMoved.current = false
    dragStartRef.current = { x: clientX, y: clientY }

    // Calcular posición actual del botón
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      positionStartRef.current = { x: rect.left, y: rect.top }
    }
  }, [isMobile])

  const handleDragMove = useCallback((clientX, clientY) => {
    if (!isDragging || !isMobile) return

    const deltaX = clientX - dragStartRef.current.x
    const deltaY = clientY - dragStartRef.current.y

    // Si se movió más de 10px, es un drag, no un tap
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      hasMoved.current = true
    }

    // Calcular nueva posición
    let newX = positionStartRef.current.x + deltaX
    let newY = positionStartRef.current.y + deltaY

    // Limitar a los bordes de la pantalla
    const buttonSize = 80 // Tamaño aproximado del botón
    const padding = 16
    newX = Math.max(padding, Math.min(newX, window.innerWidth - buttonSize - padding))
    newY = Math.max(padding, Math.min(newY, window.innerHeight - buttonSize - padding))

    setPosition({ x: newX, y: newY })
  }, [isDragging, isMobile])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    // Guardar posición si se movió
    if (hasMoved.current && position.x !== null && position.y !== null) {
      savePosition(position)
    }
  }, [isDragging, position, savePosition])

  // Event handlers para touch
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }, [isMobile, handleDragStart])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
    // Prevenir scroll mientras arrastramos
    if (hasMoved.current) {
      e.preventDefault()
    }
  }, [isDragging, handleDragMove])

  const handleTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Handler de click - solo navegar si no fue un drag
  const handleClick = useCallback((e) => {
    if (hasMoved.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  if (!isVisible) return null

  const faseActiva = getFaseConInscripcionesAbiertas()

  // Calcular estilos de posición
  const positionStyle = (position.x !== null && position.y !== null)
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : {
        bottom: isHovered ? '28px' : '24px',
        right: isHovered ? '28px' : '24px',
      }

  return (
    <div
      ref={buttonRef}
      className="fixed z-50 transition-all ease-out"
      style={{
        ...positionStyle,
        transitionDuration: isDragging ? '0ms' : '300ms',
        touchAction: isMobile ? 'none' : 'auto', // Deshabilitar gestos del navegador en móvil
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <a
        href="/registro"
        onClick={handleClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className="group flex items-center gap-3 shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: COLORS.red,
          borderRadius: '50px',
          padding: isHovered ? '16px 24px' : '16px',
          transform: isHovered ? 'scale(1.05)' : isDragging ? 'scale(0.95)' : 'scale(1)',
          cursor: isDragging ? 'grabbing' : (isMobile ? 'grab' : 'pointer'),
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Icono de registro */}
        <div
          className="flex items-center justify-center transition-all duration-300"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'white',
            borderRadius: '50%',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.red}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300"
            style={{
              transform: isHovered ? 'rotate(0deg)' : 'rotate(-10deg)',
            }}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        {/* Texto expandible en hover (solo desktop) */}
        {!isMobile && (
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxWidth: isHovered ? '200px' : '0px',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <div className="whitespace-nowrap" style={{ color: COLORS.cream }}>
              <p className="font-bold text-lg leading-tight">¡Regístrate!</p>
              <p className="text-xs font-medium opacity-90">
                {faseActiva?.nombre || 'Inscripciones abiertas'}
              </p>
            </div>
          </div>
        )}

        {/* Indicador de pulso (solo cuando no está arrastrando) */}
        {!isDragging && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: COLORS.red,
              opacity: 0.3,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}
      </a>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.15;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
