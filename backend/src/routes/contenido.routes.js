import { Router } from 'express'
import * as contenidoController from '../controllers/contenido.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.get('/', contenidoController.getContenido) // Query: ?tipo=hero|about|convocatoria

// Rutas protegidas (admin)
router.get('/all', authenticateToken, requireAdmin, contenidoController.getAllContenidos)
router.get('/:id', authenticateToken, requireAdmin, contenidoController.getContenidoById)
router.post('/', authenticateToken, requireAdmin, contenidoController.createContenido)
router.put('/:id', authenticateToken, requireAdmin, contenidoController.updateContenido)
router.delete('/:id', authenticateToken, requireAdmin, contenidoController.deleteContenido)

export default router
