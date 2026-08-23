/**
 * Constantes de configuración del canvas
 * Todas las medidas y escalas para el canvas de obras
 */

// ========== PLANTILLAS ==========
export const PLANTILLA_2D_URL = '/plantilla-base2.svg'
export const PLANTILLA_3D_URL = '/PLANTILLA_3D.svg'
export const NOTA_AREA_CONSIDERACION_2D_URL = '/nota-area-consideracion-2d.svg'
export const NOTA_AREA_NO_DISPONIBLE_3D_URL = '/nota-area-no-disponible-3d.svg'

// ========== DIMENSIONES DEL CANVAS ==========
// Canvas 2D (mural horizontal)
export const CANVAS_2D_WIDTH = 1420
export const CANVAS_2D_HEIGHT = 437

// Canvas 3D (área cuadrada para esculturas)
export const CANVAS_3D_WIDTH = 431
export const CANVAS_3D_HEIGHT = 429

// ========== ÁREAS LIBRES ==========
// Área libre para 2D (mural horizontal)
export const FREE_AREA_2D = {
  x: 2,
  y: 2,
  width: 1416,
  height: 433
}

// Área libre para 3D (cuadrado central del SVG)
export const FREE_AREA_3D = {
  x: 3,
  y: 3,
  width: 425,
  height: 423
}

// ========== CONVERSIÓN Y ESCALA ==========
// Factor de conversión: metros a píxeles en el canvas
// IMPORTANTE: Usamos la misma escala para ANCHO y ALTO para mantener proporciones reales
// Escala base: 10 metros = 1416 píxeles
export const METROS_A_PIXELES = 141.6 // 141.6 píxeles por metro
export const METROS_LINEALES_MAX = 10 // Máximo de metros lineales que caben
export const ALTURA_MAXIMA_METROS = FREE_AREA_2D.height / METROS_A_PIXELES // ~3.06 metros

// Configuración de escala de obras
// IMPORTANTE: La escala de las obras debe ser consistente con la escala del lienzo
// 1 metro = 141.6 píxeles, por lo tanto: 1 cm = 1.416 píxeles
export const SCALE_FACTOR = METROS_A_PIXELES / 100 // 1.416 píxeles por centímetro
export const COLLISION_MARGIN_CM = 2.5 // Separación mínima entre obras en cm
export const COLLISION_MARGIN = COLLISION_MARGIN_CM * SCALE_FACTOR // Separación en píxeles (~3.54 px)

// ========== CONFIGURACIÓN DE REGLAS ==========
export const RULER_SIZE = 30 // Tamaño de las reglas en píxeles
export const RULER_BG_COLOR = '#2C2C2C' // Color de fondo de las reglas
export const RULER_TEXT_COLOR = '#E8E8E8' // Color del texto
export const RULER_LINE_COLOR = '#E8E8E8' // Color de las líneas
export const GUIDE_LINE_COLOR = '#00BFFF' // Color cian para las líneas guía

// ========== CONFIGURACIÓN SVG LÍNEA DELIMITANTE ==========
// El SVG de la línea delimitante no está centrado
// Análisis del SVG: la línea está en x=1054.73 con transform matrix
// Posición final de la línea: (1054.73 * 4.166667 - 4281.978333) ≈ 111.91 de 231
export const SVG_LINEA_ASPECT_RATIO = 231 / 1981
export const SVG_LINEA_POSITION_RATIO = 0.4845 // Posición proporcional de la línea dentro del viewBox

// ========== LÍMITES DE ARCHIVOS ==========
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_COMPRESSED_SIZE_KB = 400 // 400KB después de compresión

// ========== CONFIGURACIÓN DE COMPRESIÓN ==========
export const IMAGE_COMPRESSION_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeKB: MAX_COMPRESSED_SIZE_KB
}

// ========== CONFIGURACIÓN DE EXPORTACIÓN ==========
export const EXPORT_CONFIG = {
  pixelRatio: 0.5,
  quality: 0.6,
  format: 'image/jpeg'
}

// ========== CURSOR PERSONALIZADO PARA ARRASTRAR ==========
// SVG 32x32 con círculo rojo y flechas blancas - data URL base64
const CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="%23B83030" stroke="%23fff" stroke-width="1.5"/><g fill="none" stroke="%23fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="8" x2="16" y2="24"/><polyline points="12 12 16 8 20 12"/><polyline points="12 20 16 24 20 20"/><line x1="8" y1="16" x2="24" y2="16"/><polyline points="12 12 8 16 12 20"/><polyline points="20 12 24 16 20 20"/></g></svg>`
export const CURSOR_DRAG = `url("data:image/svg+xml,${CURSOR_SVG}") 16 16, move`
export const CURSOR_DRAGGING = `url("data:image/svg+xml,${CURSOR_SVG}") 16 16, move`
