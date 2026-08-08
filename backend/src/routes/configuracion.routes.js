import { Router } from 'express'
import * as configuracionController from '../controllers/configuracion.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.get('/', configuracionController.getConfiguracion)

// Rutas protegidas (admin)
router.put('/', authenticateToken, requireAdmin, configuracionController.updateConfiguracion)

export default router
