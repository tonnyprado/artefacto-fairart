/**
 * SISTEMA CENTRALIZADO DE BREAKPOINTS
 *
 * Usar estos valores en TODO el proyecto para consistencia.
 * Alineados con Tailwind CSS defaults.
 */

// Breakpoints en pixels - ÚNICA FUENTE DE VERDAD
export const BREAKPOINTS = {
  xs: 0,      // Mobile pequeño (< 640px)
  sm: 640,    // Mobile grande / Tablet pequeña
  md: 768,    // Tablet
  lg: 1024,   // Laptop / Desktop pequeño
  xl: 1280,   // Desktop
  '2xl': 1536 // Desktop grande
};

// Nombres amigables para los breakpoints
export const DEVICE_NAMES = {
  xs: 'mobile',
  sm: 'mobile-large',
  md: 'tablet',
  lg: 'laptop',
  xl: 'desktop',
  '2xl': 'desktop-large'
};

// Media queries para usar en CSS-in-JS
export const MEDIA_QUERIES = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  // Rangos específicos
  smOnly: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  mdOnly: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lgOnly: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  // Mobile vs Desktop
  mobile: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
  // Touch vs Pointer
  touch: '(pointer: coarse)',
  pointer: '(pointer: fine)',
  // Preferencias de usuario
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)'
};

// Helpers para obtener el breakpoint actual
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg'; // SSR default

  const width = window.innerWidth;

  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Helper para saber si es móvil (< lg)
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.lg;
};

// Helper para saber si es tablet (md - lg)
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
};

// Helper para saber si es desktop (>= lg)
export const isDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= BREAKPOINTS.lg;
};

// Helper para saber si es touch device
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
};

// Helper para safe area insets (notch, etc)
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10)
  };
};

// Valores responsive comunes
export const RESPONSIVE_VALUES = {
  // Navbar heights
  navbarHeight: {
    xs: 60,
    sm: 60,
    md: 70,
    lg: 80,
    xl: 80,
    '2xl': 80
  },
  // Container padding
  containerPadding: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64
  },
  // Section gaps
  sectionGap: {
    xs: 40,
    sm: 60,
    md: 80,
    lg: 100,
    xl: 120,
    '2xl': 140
  }
};

// Helper para obtener valor responsive basado en breakpoint actual
export const getResponsiveValue = (values) => {
  const bp = getCurrentBreakpoint();
  return values[bp] ?? values.lg ?? values.md ?? Object.values(values)[0];
};
