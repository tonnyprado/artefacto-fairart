'use client';
import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
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

      // Solo actualizar estado si cambió para evitar re-renders innecesarios
      if (isInteractive !== lastInteractiveState) {
        lastInteractiveState = isInteractive;
        setIsHovering(isInteractive);
      }
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
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}
