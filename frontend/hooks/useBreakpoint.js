'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BREAKPOINTS,
  getCurrentBreakpoint,
  isMobile as checkIsMobile,
  isTablet as checkIsTablet,
  isDesktop as checkIsDesktop,
  isTouchDevice as checkIsTouchDevice,
  getResponsiveValue,
  RESPONSIVE_VALUES
} from '@/lib/breakpoints';

/**
 * Hook unificado para detección de breakpoints y dispositivos.
 *
 * USO:
 * const { breakpoint, isMobile, isTablet, isDesktop, isTouch, width } = useBreakpoint();
 *
 * // Valores responsive automáticos
 * const padding = useBreakpoint().getValue({ xs: 16, md: 24, lg: 32 });
 *
 * // Navbar height responsive
 * const navHeight = useBreakpoint().navbarHeight;
 */
export function useBreakpoint() {
  const [state, setState] = useState({
    breakpoint: 'lg',
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    prefersReducedMotion: false
  });

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint();

    setState({
      breakpoint,
      width,
      height,
      isMobile: checkIsMobile(),
      isTablet: checkIsTablet(),
      isDesktop: checkIsDesktop(),
      isTouch: checkIsTouchDevice(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }, []);

  useEffect(() => {
    // Actualizar inmediatamente al montar
    updateState();

    // Throttle resize para mejor performance
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        updateState();
        timeoutId = null;
      }, 100);
    };

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize, { passive: true });

    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', updateState);

    // Escuchar cambios en media queries
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');

    const handleMediaChange = () => updateState();

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMediaChange);
      pointerQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateState);
      if (timeoutId) clearTimeout(timeoutId);
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMediaChange);
        pointerQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [updateState]);

  // Helper para obtener valores responsive
  const getValue = useCallback((values) => {
    return getResponsiveValue(values);
  }, []);

  // Valores responsive precomputados
  const navbarHeight = useMemo(() => {
    return RESPONSIVE_VALUES.navbarHeight[state.breakpoint] || 80;
  }, [state.breakpoint]);

  const containerPadding = useMemo(() => {
    return RESPONSIVE_VALUES.containerPadding[state.breakpoint] || 24;
  }, [state.breakpoint]);

  const sectionGap = useMemo(() => {
    return RESPONSIVE_VALUES.sectionGap[state.breakpoint] || 80;
  }, [state.breakpoint]);

  // Helpers para comparación de breakpoints
  const isAtLeast = useCallback((bp) => {
    const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    return order.indexOf(state.breakpoint) >= order.indexOf(bp);
  }, [state.breakpoint]);

  const isAtMost = useCallback((bp) => {
    const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    return order.indexOf(state.breakpoint) <= order.indexOf(bp);
  }, [state.breakpoint]);

  const isBetween = useCallback((minBp, maxBp) => {
    return isAtLeast(minBp) && isAtMost(maxBp);
  }, [isAtLeast, isAtMost]);

  return {
    ...state,
    // Métodos
    getValue,
    isAtLeast,
    isAtMost,
    isBetween,
    // Valores precomputados
    navbarHeight,
    containerPadding,
    sectionGap,
    // Constantes
    breakpoints: BREAKPOINTS
  };
}

/**
 * Hook simplificado que solo retorna si es móvil o no.
 * Más ligero que useBreakpoint completo.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(checkIsMobile());
    check();

    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        check();
        timeoutId = null;
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
}

/**
 * Hook para detectar si el dispositivo tiene touch.
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(checkIsTouchDevice());

    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const handleChange = () => setIsTouch(checkIsTouchDevice());

    if (pointerQuery.addEventListener) {
      pointerQuery.addEventListener('change', handleChange);
    }

    return () => {
      if (pointerQuery.removeEventListener) {
        pointerQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  return isTouch;
}

export default useBreakpoint;
