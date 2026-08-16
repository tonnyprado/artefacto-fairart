/**
 * LayoutCanvasWithMural
 * Componente refactorizado aplicando principios SOLID
 *
 * Este archivo mantiene la compatibilidad con imports existentes.
 * El componente original de 2550 líneas ha sido refactorizado en:
 * - 5 hooks custom para lógica reutilizable
 * - 12+ componentes separados por responsabilidad
 * - 3 archivos de utilidades
 * - 2 archivos de constantes
 * - 1 archivo CSS module
 *
 * Estructura SOLID aplicada:
 * - Single Responsibility: Cada componente tiene una única responsabilidad
 * - Open/Closed: Componentes extensibles sin modificar el código existente
 * - Liskov Substitution: Obra2D y Obra3D comparten interfaz común
 * - Interface Segregation: Props específicas agrupadas por contexto
 * - Dependency Inversion: Hooks inyectables y servicios desacoplados
 */

import LayoutCanvasWithMural from './LayoutCanvasWithMural/index.jsx'

export default LayoutCanvasWithMural
