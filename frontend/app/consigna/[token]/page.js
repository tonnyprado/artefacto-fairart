'use client'

import { ConsignaPage } from '@/features/consigna'

/**
 * Página pública de consignación
 * Ruta: /consigna/[token]
 *
 * El token es único por artista y se valida en el backend.
 * Esta página es completamente pública (no requiere autenticación).
 */
export default function ConsignaTokenPage({ params }) {
  return <ConsignaPage token={params.token} />
}
