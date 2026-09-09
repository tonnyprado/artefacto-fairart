/**
 * Rutas de Pre-Registro de Artistas
 */

import express from 'express'
import {
  crearPreRegistro,
  obtenerDatosPreRegistro,
  obtenerDatosPorToken,
  getPreRegistros,
  getPreRegistroStats,
  enviarRecordatorioManual,
  enviarRecordatorioMasivo
} from '../controllers/preregistro.controller.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// ============================================
// RUTAS PÚBLICAS
// ============================================

// POST /api/preregistro - Crear o actualizar pre-registro
router.post('/', crearPreRegistro)

// GET /api/preregistro/datos?email=xxx - Obtener datos para auto-llenar (deprecado)
router.get('/datos', obtenerDatosPreRegistro)

// GET /api/preregistro/token/:token - Magic Link para continuar registro
router.get('/token/:token', obtenerDatosPorToken)

// ============================================
// RUTAS ADMIN (requieren autenticación)
// ============================================

// GET /api/preregistro/admin - Listar todos los pre-registros
router.get('/admin', verifyToken, isAdmin, getPreRegistros)

// GET /api/preregistro/admin/stats - Estadísticas
router.get('/admin/stats', verifyToken, isAdmin, getPreRegistroStats)

// POST /api/preregistro/admin/:id/recordatorio - Enviar recordatorio individual
router.post('/admin/:id/recordatorio', verifyToken, isAdmin, enviarRecordatorioManual)

// POST /api/preregistro/admin/recordatorio-masivo - Enviar a todos
router.post('/admin/recordatorio-masivo', verifyToken, isAdmin, enviarRecordatorioMasivo)

export default router
