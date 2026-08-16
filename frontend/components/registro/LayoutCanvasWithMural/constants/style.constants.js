/**
 * Constantes de estilos reutilizables
 * Colores, tipografía y espaciados del componente
 */

// ========== COLORES ==========
export const COLORS = {
  // Beige/Crema
  beigeLight: '#F4EDE4',
  beigeDark: '#E8DED1',

  // Negro/Gris
  black: '#141210',
  grayDark: '#6B6B6B',
  grayMedium: '#9CA3AF',
  grayLight: '#6B7280',
  grayLightest: '#E5E7EB',

  // Rojo
  redPrimary: '#B83030',
  redBright: '#FF4444',
  redDark: '#DC2626',
  redLight: '#FEE2E2',

  // Cyan/Azul
  cyanBright: '#00BFFF',

  // Blanco
  white: '#ffffff',

  // Fondos transparentes
  whiteTransparent: 'rgba(255, 255, 255, 0.9)',
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  redTransparent: 'rgba(184, 48, 48, 0.95)',
  cyanTransparent: 'rgba(0, 191, 255, 0.15)',
  redBrightTransparent: 'rgba(255, 68, 68, 0.2)'
}

// ========== TIPOGRAFÍA ==========
export const TYPOGRAPHY = {
  // Tamaños de fuente
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: '12px',
    md: '13px',
    lg: '14px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '20px',
    '4xl': '22px'
  },

  // Pesos de fuente
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: 'bold'
  }
}

// ========== ESPACIADO ==========
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px'
}

// ========== BORDER RADIUS ==========
export const BORDER_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '12px',
  xl: '15px',
  '2xl': '16px',
  '3xl': '24px',
  full: '50%'
}

// ========== SOMBRAS ==========
export const SHADOWS = {
  small: {
    blur: 5,
    opacity: 0.3
  },
  medium: {
    blur: 8,
    opacity: 0.7
  },
  large: {
    blur: 10,
    opacity: 0.3
  },
  selected: {
    blur: 15,
    opacity: 0.7
  }
}

// ========== DIMENSIONES DE COMPONENTES ==========
export const COMPONENT_SIZES = {
  // Tarjeta de obra
  obraCard: {
    minWidth: '200px',
    imageWidth: '200px',
    imageHeight: '150px'
  },

  // Botón de eliminar
  deleteButton: {
    width: 30,
    height: 30,
    fontSize: '22px'
  },

  // Badge de número (3D)
  numberBadge: {
    width: 32,
    height: 32,
    fontSize: '18px'
  },

  // Etiquetas
  label: {
    width: 70,
    height: 20,
    fontSize: '12px'
  }
}

// ========== Z-INDEX ==========
export const Z_INDEX = {
  canvas: 0,
  guides: 10,
  modal: 1000,
  overlay: 999
}
