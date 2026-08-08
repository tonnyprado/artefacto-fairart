import { Router } from 'express'
import * as contactoController from '../controllers/contacto.controller.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.post('/', contactoController.enviarMensaje)

// Rutas protegidas (admin)
router.get('/', verifyToken, isAdmin, contactoController.getMensajes)
router.get('/estadisticas', verifyToken, isAdmin, contactoController.getEstadisticas)
router.get('/:id', verifyToken, isAdmin, contactoController.getMensajeById)
router.put('/:id/marcar-leido', verifyToken, isAdmin, contactoController.marcarLeido)
router.put('/:id/responder', verifyToken, isAdmin, contactoController.responderMensaje)
router.delete('/:id', verifyToken, isAdmin, contactoController.deleteMensaje)

export default router
