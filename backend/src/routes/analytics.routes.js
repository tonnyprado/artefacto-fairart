/**
 * Analytics Routes
 * Rutas para tracking de eventos y dashboard de analytics
 */

import express from 'express'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'
import {
  track,
  stats,
  realtime,
  pages,
  funnel,
  distribution,
  conversions,
  errors,
} from '../controllers/analytics.controller.js'

const router = express.Router()

// =====================================================
// RUTAS PÚBLICAS
// =====================================================

/**
 * POST /api/analytics/track
 * Trackear evento de usuario
 * Público - permite tracking de usuarios anónimos
 * Si hay token válido, asocia el evento al user_id
 */
router.post('/track', (req, res, next) => {
  // Optional auth: no falla si no hay token, solo no lo asocia a usuario
  const token = req.headers.authorization?.split(' ')[1]

  if (token) {
    // Intentar verificar token, pero no fallar si es inválido
    verifyToken(req, res, (err) => {
      if (err) {
        // Token inválido o expirado, continuar sin usuario
        req.user = null
      }
      // Continuar al controller
      track(req, res)
    })
  } else {
    // Sin token, continuar sin usuario
    track(req, res)
  }
})

// =====================================================
// RUTAS PROTEGIDAS (ADMIN ONLY)
// =====================================================

/**
 * GET /api/analytics/stats
 * Estadísticas generales
 */
router.get('/stats', verifyToken, isAdmin, stats)

/**
 * GET /api/analytics/realtime
 * Datos en tiempo real (usuarios activos, eventos recientes)
 */
router.get('/realtime', verifyToken, isAdmin, realtime)

/**
 * GET /api/analytics/pages
 * Top páginas más visitadas
 */
router.get('/pages', verifyToken, isAdmin, pages)

/**
 * GET /api/analytics/funnel
 * Funnel de conversión de registro
 */
router.get('/funnel', verifyToken, isAdmin, funnel)

/**
 * GET /api/analytics/distribution
 * Distribución de eventos por tipo
 */
router.get('/distribution', verifyToken, isAdmin, distribution)

/**
 * GET /api/analytics/conversions
 * Métricas de conversión
 */
router.get('/conversions', verifyToken, isAdmin, conversions)

/**
 * GET /api/analytics/errors
 * Lista de errores detectados
 */
router.get('/errors', verifyToken, isAdmin, errors)

export default router
