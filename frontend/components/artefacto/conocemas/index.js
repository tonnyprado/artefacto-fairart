/**
 * CONOCE MÁS - Índice de componentes
 *
 * Exporta todos los componentes de la sección CONOCE MÁS para uso externo.
 *
 * COMPONENTES DISPONIBLES:
 *
 * LAYOUTS:
 * - ConoceMasDesktop: Grid 5×10 para pantallas >1200px
 * - ConoceMasMobile: Composición vertical para pantallas ≤1200px
 *
 * TARJETAS REUTILIZABLES:
 * - Foto: Tarjeta de imagen con object-cover
 * - DeskFase: Tarjeta de fase para desktop (I, II, III)
 * - MobFase: Tarjeta de fase para móvil
 * - FormOpinion: Formulario "¿Qué es arte para ti?"
 *
 * UTILIDADES:
 * - g: Helper para posicionamiento en CSS Grid
 */

// Layouts
export { default as ConoceMasDesktop } from './ConoceMasDesktop';
export { default as ConoceMasMobile } from './ConoceMasMobile';

// Tarjetas reutilizables
export { default as Foto } from './Foto';
export { default as DeskFase } from './DeskFase';
export { default as MobFase } from './MobFase';
export { default as FormOpinion } from './FormOpinion';
export { default as CardTestimonio, CardTestimonioMobile } from './CardTestimonio';

// Utilidades
export { g } from './gridHelper';
