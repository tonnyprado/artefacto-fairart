import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.middleware.js'
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'
import * as inscripcionesController from '../controllers/inscripciones.controller.js'

const router = Router()

// Rutas públicas
router.post('/',
  [
    body('artista_id').isInt().withMessage('ID de artista inválido'),
    body('evento_id').isInt().withMessage('ID de evento inválido'),
    body('paquete_id').isInt().withMessage('ID de paquete inválido'),
    validate
  ],
  inscripcionesController.createInscripcion
)

// Rutas protegidas (admin)
router.get('/',
  verifyToken,
  isAdmin,
  inscripcionesController.getInscripciones
)

router.get('/:id',
  verifyToken,
  isAdmin,
  inscripcionesController.getInscripcionById
)

router.put('/:id/estado',
  verifyToken,
  isAdmin,
  [
    body('estado').isIn(['pendiente', 'aprobada', 'rechazada']).withMessage('Estado inválido'),
    validate
  ],
  inscripcionesController.updateEstadoInscripcion
)

router.delete('/:id',
  verifyToken,
  isAdmin,
  inscripcionesController.deleteInscripcion
)

export default router
