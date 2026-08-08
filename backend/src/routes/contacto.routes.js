import { Router } from 'express'
import * as contactoController from '../controllers/contacto.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.post('/', contactoController.enviarMensaje)

// Rutas protegidas (admin)
router.get('/', authenticateToken, requireAdmin, contactoController.getMensajes)
router.get('/estadisticas', authenticateToken, requireAdmin, contactoController.getEstadisticas)
router.get('/:id', authenticateToken, requireAdmin, contactoController.getMensajeById)
router.put('/:id/marcar-leido', authenticateToken, requireAdmin, contactoController.marcarLeido)
router.put('/:id/responder', authenticateToken, requireAdmin, contactoController.responderMensaje)
router.delete('/:id', authenticateToken, requireAdmin, contactoController.deleteMensaje)

export default router
