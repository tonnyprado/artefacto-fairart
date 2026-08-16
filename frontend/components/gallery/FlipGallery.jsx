'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import GalleryItem from './GalleryItem'
import GalleryDetail from './GalleryDetail'
import { COLORS, ANIMATION } from './constants'

// Registrar el plugin Flip
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip)
}

/**
 * Galería de obras con animación GSAP Flip
 * Al hacer click en una obra, se expande con animación fluida
 * mostrando la imagen y ficha técnica
 */
/**
 * @param {string} variant - 'light' (default) o 'dark' para tema oscuro
 */
export default function FlipGallery({
  obras = [],
  columns = 3,
  gap = 16,
  onDownload,
  className = '',
  variant = 'light',
}) {
  const containerRef = useRef(null)
  const detailRef = useRef(null)
  const detailContentRef = useRef(null)
  const detailImageRef = useRef(null)
  const itemRefs = useRef([])
  const overlayRef = useRef(null)

  const [activeObra, setActiveObra] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)

  // Inicializar refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, obras.length)
  }, [obras.length])

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeObra) {
        hideDetails()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeObra])

  const showDetails = useCallback((obra, index) => {
    if (activeObra) {
      hideDetails()
      return
    }

    const item = itemRefs.current[index]
    const detail = detailRef.current
    const detailContent = detailContentRef.current
    const detailImage = detailImageRef.current
    const overlay = overlayRef.current

    if (!item || !detail || !detailContent || !detailImage) return

    setActiveObra(obra)
    setActiveIndex(index)

    // Esperar a que la imagen cargue
    const onImageLoad = () => {
      // Posicionar el detalle sobre el item (escalado)
      Flip.fit(detail, item, { scale: true, fitChild: detailImage })

      // Guardar el estado
      const state = Flip.getState(detail)

      // Limpiar estilos inline y establecer estado final
      gsap.set(detail, { clearProps: true })
      gsap.set(detail, {
        xPercent: -50,
        top: '50%',
        yPercent: -50,
        visibility: 'visible',
        overflow: 'hidden',
      })

      // Animar desde el estado guardado
      Flip.from(state, {
        duration: ANIMATION.duration,
        ease: ANIMATION.ease,
        scale: true,
        onComplete: () => gsap.set(detail, { overflow: 'auto' }),
      }).to(detailContent, { yPercent: 0 }, 0.2)

      detailImage.removeEventListener('load', onImageLoad)
    }

    // Preparar contenido
    gsap.set(detailContent, { yPercent: -100 })

    // Si ya tiene imagen cargada, ejecutar directamente
    if (detailImage.complete && detailImage.src) {
      onImageLoad()
    } else {
      detailImage.addEventListener('load', onImageLoad)
    }

    // Animar otros items (fade out escalonado)
    gsap.to(itemRefs.current, {
      opacity: 0.3,
      scale: 0.95,
      stagger: {
        amount: ANIMATION.staggerAmount,
        from: index,
        grid: 'auto',
      },
    })

    // Mostrar overlay
    gsap.to(overlay, {
      opacity: 1,
      visibility: 'visible',
      duration: 0.3,
    })
  }, [activeObra])

  const hideDetails = useCallback(() => {
    const detail = detailRef.current
    const detailContent = detailContentRef.current
    const detailImage = detailImageRef.current
    const overlay = overlayRef.current

    if (!detail || !detailContent || activeIndex === null) return

    const item = itemRefs.current[activeIndex]
    if (!item) return

    gsap.set(detail, { overflow: 'hidden' })

    // Guardar estado actual
    const state = Flip.getState(detail)

    // Escalar el detalle para que coincida con el item
    Flip.fit(detail, item, { scale: true, fitChild: detailImage })

    // Timeline para animaciones paralelas
    const tl = gsap.timeline()
    tl.to(detailContent, { yPercent: -100, duration: 0.3 })
      .to(itemRefs.current, {
        opacity: 1,
        scale: 1,
        stagger: {
          amount: ANIMATION.staggerAmount,
          from: activeIndex,
          grid: 'auto',
        },
      }, '<')
      .to(overlay, { opacity: 0, duration: 0.3 }, '<')

    // Animar de vuelta al item
    Flip.from(state, {
      scale: true,
      duration: ANIMATION.duration,
      delay: 0.2,
      onInterrupt: () => tl.kill(),
    }).set(detail, { visibility: 'hidden' })

    // Ocultar overlay al final
    gsap.set(overlay, { visibility: 'hidden', delay: ANIMATION.duration + 0.3 })

    setActiveObra(null)
    setActiveIndex(null)
  }, [activeIndex])

  const handleDownload = (obra) => {
    if (onDownload) {
      onDownload(obra)
    } else {
      // Descarga por defecto
      const link = document.createElement('a')
      link.href = obra.imagen_url || obra.preview
      link.download = `obra-${obra.titulo || 'sin-titulo'}.jpg`
      link.click()
    }
  }

  // Animación de entrada
  useEffect(() => {
    if (obras.length > 0 && itemRefs.current.length > 0) {
      gsap.from(itemRefs.current.filter(Boolean), {
        autoAlpha: 0,
        y: 30,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.1,
      })
    }
  }, [obras.length])

  if (obras.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: COLORS.gray,
      }}>
        No hay obras registradas
      </div>
    )
  }

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      {/* Grid de obras */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}>
        {obras.map((obra, index) => (
          <GalleryItem
            key={obra.id || index}
            ref={(el) => (itemRefs.current[index] = el)}
            obra={obra}
            index={index}
            onClick={showDetails}
            variant={variant}
          />
        ))}
      </div>

      {/* Overlay oscuro */}
      <div
        ref={overlayRef}
        onClick={hideDetails}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 18, 16, 0.85)',
          opacity: 0,
          visibility: 'hidden',
          zIndex: 999,
          cursor: 'pointer',
        }}
      />

      {/* Panel de detalle */}
      <GalleryDetail
        ref={detailRef}
        contentRef={detailContentRef}
        imageRef={detailImageRef}
        obra={activeObra}
        onClose={hideDetails}
        onDownload={handleDownload}
      />
    </div>
  )
}
