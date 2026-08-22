'use client';

import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para detectar el tipo de dispositivo y optimizar rendimiento
 * Centraliza la detección de dispositivos para toda la aplicación
 *
 * @returns {Object} Configuración del dispositivo
 */
export function useDeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    pixelRatio: 1,
    isLowPowerMode: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectDevice = () => {
      const ua = navigator.userAgent;
      const width = window.innerWidth;

      // Detectar tipo de dispositivo
      const isTablet =
        /iPad|Android(?!.*Mobile)/i.test(ua) ||
        (navigator.maxTouchPoints > 1 && width >= 768 && width <= 1366);

      const isMobile =
        /iPhone|iPod|Android.*Mobile/i.test(ua) || width < 768;

      const isDesktop = !isMobile && !isTablet;

      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /iPad|iPhone|iPod|Android/i.test(ua);

      // Optimizar pixelRatio para rendimiento
      let pixelRatio = window.devicePixelRatio || 1;
      if (isTablet) {
        pixelRatio = Math.min(pixelRatio, 1.5);
      } else if (isMobile) {
        pixelRatio = Math.min(pixelRatio, 1);
      }

      // Detectar modo de bajo consumo (Safari)
      const isLowPowerMode = navigator.getBattery
        ? false // Se detectará asíncronamente
        : false;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        pixelRatio,
        isLowPowerMode,
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);

    // Detectar modo de bajo consumo si está disponible
    if ('getBattery' in navigator) {
      navigator.getBattery?.()?.then?.((battery) => {
        // Considerar bajo consumo si batería < 20% o está en modo ahorro
        const isLow = battery.level < 0.2;
        setDeviceInfo((prev) => ({ ...prev, isLowPowerMode: isLow }));
      }).catch(() => {});
    }

    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceInfo;
}

/**
 * Hook para obtener configuración de animación según el dispositivo
 * Reduce la complejidad de animaciones en dispositivos de bajo rendimiento
 *
 * @returns {Object} Configuración de animación optimizada
 */
export function useAnimationConfig() {
  const device = useDeviceDetect();

  return useMemo(() => {
    if (device.isLowPowerMode || device.isMobile) {
      return {
        frameInterval: 50, // ~20fps
        enableParallax: false,
        enableComplexEffects: false,
        enableSmoothScroll: true,
        scrollDuration: 0.6,
        scrollLerp: 0.15,
      };
    }

    if (device.isTablet) {
      return {
        frameInterval: 32, // ~30fps
        enableParallax: true,
        enableComplexEffects: false,
        enableSmoothScroll: true,
        scrollDuration: 0.8,
        scrollLerp: 0.15,
      };
    }

    // Desktop - animaciones completas
    return {
      frameInterval: 16, // ~60fps
      enableParallax: true,
      enableComplexEffects: true,
      enableSmoothScroll: true,
      scrollDuration: 1.2,
      scrollLerp: 0.1,
    };
  }, [device]);
}

/**
 * Helper estático para uso fuera de componentes React
 * Útil para configuración inicial
 */
export const getDeviceConfig = () => {
  if (typeof window === 'undefined') {
    return { isTablet: false, isMobile: false, isDesktop: true, pixelRatio: 1 };
  }

  const ua = navigator.userAgent;
  const width = window.innerWidth;

  const isTablet =
    /iPad|Android(?!.*Mobile)/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && width >= 768 && width <= 1366);

  const isMobile = /iPhone|iPod|Android.*Mobile/i.test(ua) || width < 768;
  const isDesktop = !isMobile && !isTablet;

  let pixelRatio = window.devicePixelRatio || 1;
  if (isTablet) {
    pixelRatio = Math.min(pixelRatio, 1.5);
  } else if (isMobile) {
    pixelRatio = Math.min(pixelRatio, 1);
  }

  return { isTablet, isMobile, isDesktop, pixelRatio };
};

export default useDeviceDetect;
