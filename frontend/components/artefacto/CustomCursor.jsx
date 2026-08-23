'use client';
import { useEffect, useRef, useState } from 'react';

// Detección robusta de dispositivos que NO deben usar cursor personalizado
const shouldDisableCustomCursor = () => {
  if (typeof window === 'undefined') return true;

  // 1. Dispositivos táctiles (móviles, tablets)
  const isTouchDevice = (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)
  );

  // 2. Media query para detectar dispositivos sin pointer fino (trackpads, mouse)
  // coarse = táctil, none = sin pointer
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasNoPointer = window.matchMedia('(pointer: none)').matches;

  // 3. Pantallas pequeñas (probablemente móvil)
  const isSmallScreen = window.innerWidth <= 1024;

  // 4. Detectar si el navegador soporta requestAnimationFrame (muy básico pero por si acaso)
  const supportsRAF = typeof window.requestAnimationFrame === 'function';

  // 5. Detectar modo reducido de movimiento (accesibilidad)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Deshabilitar si:
  // - Es dispositivo táctil
  // - Tiene pointer coarse o sin pointer
  // - Es pantalla pequeña
  // - No soporta requestAnimationFrame
  // - Usuario prefiere movimiento reducido
  if (isTouchDevice || hasCoarsePointer || hasNoPointer || isSmallScreen || !supportsRAF || prefersReducedMotion) {
    return true;
  }

  return false;
};

// Agregar/remover clase del body para activar cursor:none
const setCursorActiveClass = (active) => {
  if (typeof document === 'undefined') return;

  if (active) {
    document.body.classList.add('custom-cursor-active');
  } else {
    document.body.classList.remove('custom-cursor-active');
  }
};

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true); // Empezar deshabilitado por seguridad

  // Detectar si debemos desactivar el cursor custom
  useEffect(() => {
    const disabled = shouldDisableCustomCursor();
    setIsDisabled(disabled);

    // Solo activar la clase si NO está deshabilitado
    if (!disabled) {
      // Pequeño delay para asegurar que el cursor esté renderizado
      const timer = setTimeout(() => {
        setCursorActiveClass(true);
      }, 100);
      return () => clearTimeout(timer);
    }

    // Cleanup: remover clase cuando se desmonte o se deshabilite
    return () => {
      setCursorActiveClass(false);
    };
  }, []);

  // También remover la clase si isDisabled cambia a true
  useEffect(() => {
    if (isDisabled) {
      setCursorActiveClass(false);
    }
  }, [isDisabled]);

  // Escuchar cambios en media queries (ej: si conectan un mouse a una tablet)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      const disabled = shouldDisableCustomCursor();
      setIsDisabled(disabled);
      setCursorActiveClass(!disabled);
    };

    // Usar addEventListener moderno con fallback para navegadores antiguos
    if (pointerQuery.addEventListener) {
      pointerQuery.addEventListener('change', handleChange);
      motionQuery.addEventListener('change', handleChange);
    } else if (pointerQuery.addListener) {
      pointerQuery.addListener(handleChange);
      motionQuery.addListener(handleChange);
    }

    return () => {
      if (pointerQuery.removeEventListener) {
        pointerQuery.removeEventListener('change', handleChange);
        motionQuery.removeEventListener('change', handleChange);
      } else if (pointerQuery.removeListener) {
        pointerQuery.removeListener(handleChange);
        motionQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    // No ejecutar en dispositivos deshabilitados
    if (isDisabled) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId;
    let lastInteractiveState = false;
    let hasReceivedMouseEvent = false;

    // Smooth follow effect con delay mínimo
    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * 0.8;
      cursorY += dy * 0.8;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      rafId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Marcar que hemos recibido un evento de mouse real
      if (!hasReceivedMouseEvent) {
        hasReceivedMouseEvent = true;
        // Confirmar que el cursor personalizado funciona
        setCursorActiveClass(true);
      }

      // Asegurar que el cursor sea visible
      if (!isVisible) {
        setIsVisible(true);
      }

      // Detectar si está sobre elemento interactivo
      const target = e.target;
      const isInteractive = !!target.closest('a, button, input, textarea, select, [role="button"]');

      // Detectar si está sobre un canvas de Konva (las imágenes del lienzo)
      const isOverCanvas = target.tagName === 'CANVAS';
      const canvasContainer = target.closest('.konvajs-content');
      const isDraggableElement = isOverCanvas && canvasContainer;

      // Solo actualizar estado si cambió para evitar re-renders innecesarios
      if (isInteractive !== lastInteractiveState) {
        lastInteractiveState = isInteractive;
        setIsHovering(isInteractive);
      }

      // Actualizar estado de draggable
      setIsDraggable(isDraggableElement);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Usar window en vez de document para mejor compatibilidad
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    updateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
      // Restaurar cursor normal al desmontar
      setCursorActiveClass(false);
    };
  }, [isVisible, isDisabled]);

  // No renderizar nada en dispositivos deshabilitados
  if (isDisabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''} ${isDraggable ? 'draggable' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}
