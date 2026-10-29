/**
 * Analytics Provider
 * Provider global para tracking automático de navegación y eventos
 *
 * Características:
 * - Auto-tracking de page views al cambiar de ruta
 * - Auto-tracking de scroll en páginas importantes
 * - Auto-tracking de tiempo en página
 * - Global error handler
 */

'use client'

import dynamic from 'next/dynamic'

// Importar el tracker de forma dinámica sin SSR para evitar errores de pre-rendering
const AnalyticsTrackerDynamic = dynamic(
  () => import('./AnalyticsTracker'),
  { ssr: false }
)

export default function AnalyticsProvider({ children }) {
  return (
    <>
      <AnalyticsTrackerDynamic />
      {children}
    </>
  )
}
