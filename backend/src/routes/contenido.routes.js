import { Router } from 'express'
import * as contenidoController from '../controllers/contenido.controller.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.get('/', contenidoController.getContenido) // Query: ?tipo=hero|about|convocatoria

// Rutas protegidas (admin)
router.get('/all', verifyToken, isAdmin, contenidoController.getAllContenidos)
router.get('/:id', verifyToken, isAdmin, contenidoController.getContenidoById)
router.post('/', verifyToken, isAdmin, contenidoController.createContenido)
router.put('/:id', verifyToken, isAdmin, contenidoController.updateContenido)
router.delete('/:id', verifyToken, isAdmin, contenidoController.deleteContenido)

export default router
