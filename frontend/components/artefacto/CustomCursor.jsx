'use client';
import { useEffect, useRef, useState } from 'react';

// Helper para detectar dispositivos táctiles (tablets/móviles)
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)
  );
};

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Detectar si debemos desactivar el cursor custom
  useEffect(() => {
    setIsDisabled(isTouchDevice());
  }, []);

  useEffect(() => {
    // No ejecutar en dispositivos táctiles - mejora rendimiento en iPad/tablets
    if (isDisabled) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId;
    let lastInteractiveState = false;

    // Smooth follow effect con delay mínimo
    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * 0.8; // Mucho más rápido que antes (0.15 -> 0.8)
      cursorY += dy * 0.8;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      rafId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

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
    };
  }, [isVisible, isDisabled]);

  // No renderizar nada en dispositivos táctiles - mejora rendimiento significativo
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
